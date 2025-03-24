const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const bodyParser = require('body-parser');
const extract = require('extract-zip'); // ZIP dosyalarını açmak için eklenti
const mongoose = require("mongoose"); // Mongoose eklendi
const { exec } = require('child_process');
const mariadb = require('mariadb'); // MariaDB for vehicle tracking
const { safeJSONStringify } = require('./utils/serialization');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, '../public')));

// Request logger middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// MariaDB connection pool - Using credentials from sumo_func.py
const pool = mariadb.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: '123456',
  database: 'fleetmanagementdb',
  connectionLimit: 100, // Bağlantı havuzu boyutunu artırın
  acquireTimeout: 10000, // Bağlantı edinme zaman aşımı (ms)
  idleTimeout: 30000,
});

// Test MariaDB connection
async function testMariaDbConnection() {
  let conn;
  try {
    conn = await pool.getConnection();
    console.log('MariaDB bağlantısı başarılı!');
    
    // Make sure the vehicle_tracking table exists
    await conn.query(`
      CREATE TABLE IF NOT EXISTS vehicle_tracking (
        vehicle_id VARCHAR(50) PRIMARY KEY,
        latitude FLOAT,
        longitude FLOAT,
        speed FLOAT,
        state_of_charge FLOAT,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // Create simulation_runs table if it doesn't exist
    await conn.query(`
      CREATE TABLE IF NOT EXISTS simulation_runs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        start_time TIMESTAMP,
        end_time TIMESTAMP NULL,
        status VARCHAR(20),
        parameters JSON
      )
    `);
    
  } catch (err) {
    console.error('MariaDB bağlantı hatası:', err);
  } finally {
    if (conn) conn.release();
  }
}

// Run the test connection
testMariaDbConnection();

// Create output directory if it doesn't exist
const outputDir = path.join(__dirname, "../frontend/public/output");
console.log("Output directory:", outputDir);
fs.mkdirSync(outputDir, { recursive: true });

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // saveFiles.js kullandığı outputDir'i kullanalım
    cb(null, outputDir);
  },
  filename: function (req, file, cb) {
    // Orijinal dosya adını koruyalım
    cb(null, file.originalname);
  }
});
const upload = multer({ storage: storage });

// Endpoint to clear output directory
app.post('/clear-output', (req, res) => {
  console.log('Attempting to clear output directory at:', outputDir);
  
  try {
    // Ensure directory exists (creates if not)
    fs.ensureDirSync(outputDir);
    
    // Empty the directory
    fs.emptyDirSync(outputDir);
    console.log('Output directory cleared successfully');
    res.status(200).json({ message: 'Output directory cleared successfully' });
  } catch (error) {
    console.error('Error clearing output directory:', error, error.stack);
    res.status(500).json({ error: `Failed to clear output directory: ${error.message}` });
  }
});

// Endpoint to save a single file - saveFiles.js'den alındı
app.post('/save-file', upload.single('file'), (req, res) => {
  console.log("Received file:", req.file);
  if (!req.file) {
    return res.status(400).send("No file uploaded");
  }
  res.json({
    success: true,
    path: `/output/${req.file.filename}`,
    filename: req.file.filename,
  });
});

// Endpoint to save multiple files - saveFiles.js'den alındı
app.post('/save-files', upload.array('files'), (req, res) => {
  console.log("Received files:", req.files);
  if (!req.files || req.files.length === 0) {
    return res.status(400).send("No files uploaded");
  }
  const savedFiles = req.files.map((file) => ({
    path: `/output/${file.filename}`,
    filename: file.filename,
  }));
  res.json({ success: true, files: savedFiles });
});

// Endpoint to save and extract zip file - saveFiles.js'den alındı
app.post('/save-zip', upload.single('zipFile'), async (req, res) => {
  console.log("Received zip file:", req.file);
  
  if (!req.file) {
    return res.status(400).send("No zip file uploaded");
  }
  
  const zipPath = req.file.path;
  try {
    // Extract zip file
    await extract(zipPath, { dir: outputDir });
    
    // Optionally delete the zip file after extraction
    // fs.unlinkSync(zipPath);
    
    res.json({
      success: true,
      zipPath: `/output/${req.file.filename}`,
      extractedTo: "/output/",
    });
  } catch (err) {
    console.error("Error extracting zip:", err);
    res.status(500).send("Error extracting zip file");
  }
});

// Endpoint to list files in output directory
app.get('/list-extracted-files', (req, res) => {
  const outputDir = path.resolve(__dirname, '../frontend/public/output');
  
  console.log('Listing files in:', outputDir);
  
  try {
    // Function to recursively list all files in a directory
    const listFilesRecursively = (dir, baseDir = '') => {
      let results = [];
      if (!fs.existsSync(dir)) {
        return results;
      }
      
      const files = fs.readdirSync(dir);
      
      for (const file of files) {
        const filePath = path.join(dir, file);
        const relativePath = path.join(baseDir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          // Recursively list files in subdirectories
          results = results.concat(listFilesRecursively(filePath, relativePath));
        } else {
          // Add file path relative to output directory
          results.push('/output/' + relativePath.replace(/\\/g, '/'));
        }
      }
      
      return results;
    };
    
    const fileList = listFilesRecursively(outputDir);
    console.log('Found files:', fileList);
    
    res.json({ files: fileList });
  } catch (error) {
    console.error('Error listing files in output directory:', error);
    res.status(500).json({ error: 'Failed to list files in output directory' });
  }
});

// Endpoint to check if a specific file exists (useful for debugging)
app.get('/check-file', (req, res) => {
  const filePath = req.query.path;
  if (!filePath) {
    return res.status(400).json({ error: 'No file path provided' });
  }

  // Normalize the path to prevent directory traversal attacks
  const normalizedPath = path.normalize(filePath).replace(/^(\.\.(\/|\\|$))+/, '');
  const fullPath = path.join(__dirname, '../frontend/public', normalizedPath);

  console.log('Checking if file exists:', fullPath);
  
  if (fs.existsSync(fullPath)) {
    const stats = fs.statSync(fullPath);
    res.json({
      exists: true,
      isFile: stats.isFile(),
      isDirectory: stats.isDirectory(),
      size: stats.size,
      lastModified: stats.mtime
    });
  } else {
    res.json({ exists: false });
  }
});

// Special route to handle Route4Vehicle.json directly
app.get('/get-route4vehicle', (req, res) => {
  const route4VehiclePath = path.join(__dirname, '../frontend/public/output/RML/newesoguv32-c05-ds1_Route4Vehicle.json');
  
  console.log('Attempting to read Route4Vehicle.json from:', route4VehiclePath);
  
  if (fs.existsSync(route4VehiclePath)) {
    try {
      const fileContent = fs.readFileSync(route4VehiclePath, 'utf8');
      res.json(JSON.parse(fileContent));
    } catch (error) {
      console.error('Error reading Route4Vehicle.json:', error);
      res.status(500).json({ error: `Failed to read Route4Vehicle.json: ${error.message}` });
    }
  } else {
    console.log('Route4Vehicle.json not found');
    res.status(404).json({ error: 'Route4Vehicle.json not found' });
  }
});

// MongoDB Atlas bağlantısı
const mongoURI = "mongodb+srv://burak2kanber:ploW4nuSpzwXakhM@cluster0.on8m7.mongodb.net/RouteManagementDB?retryWrites=true&w=majority";

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB Atlas bağlantısı başarılı!"))
.catch(err => console.error("MongoDB bağlantı hatası:", err));

// Alert Schema ve Model
const alertSchema = new mongoose.Schema({
    type: String,
    message: String,
    source: String,
    timestamp: { type: Date, default: Date.now },
    detail: String,
    resolved: { type: Boolean, default: false } // Yeni alan eklendi
  });
  

const Alert = mongoose.model("Alert", alertSchema);

// **Tüm Uyarıları Getir**
app.get("/api/alerts", async (req, res) => {
    try {
      const alerts = await Alert.find(); // MongoDB'den tüm uyarıları çek
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ error: "Veriler alınırken hata oluştu." });
    }
  });
  

// **Yeni Uyarı Ekle**
app.post("/api/alerts", async (req, res) => {
  try {
    const newAlert = new Alert(req.body);
    await newAlert.save();
    res.status(201).json(newAlert);
  } catch (error) {
    res.status(400).json({ error: "Uyarı eklenirken hata oluştu." });
  }
});

// **Uyarıyı Çözümle**
app.patch("/api/alerts/:id", async (req, res) => {
    try {
      const updatedAlert = await Alert.findByIdAndUpdate(
        req.params.id,
        { $set: req.body }, // Değerleri güvenli bir şekilde güncelle
        { new: true, runValidators: true } // Yeni veriyi döndür ve doğrulama yap
      );
  
      if (!updatedAlert) {
        return res.status(404).json({ error: "Uyarı bulunamadı" });
      }
  
      res.json(updatedAlert);
    } catch (error) {
      console.error("Uyarı güncelleme hatası:", error);
      res.status(400).json({ error: "Uyarı güncellenirken hata oluştu." });
    }
  });
  

app.put("/api/alerts/:id/resolve", async (req, res) => {
    try {
      const updatedAlert = await Alert.findByIdAndUpdate(
        req.params.id, 
        { $set: { resolved: true } }, 
        { new: true, runValidators: true }
      );
        
      if (!updatedAlert) {
        return res.status(404).json({ error: "Uyarı bulunamadı" });
      }
        
      res.json(updatedAlert);
    } catch (error) {
      console.error("Uyarı çözümleme hatası:", error);
      res.status(500).json({ error: "Güncelleme sırasında hata oluştu." });
    }
  });
  
  

// **Uyarıyı Sil**
app.delete("/api/alerts/:id", async (req, res) => {
  try {
    await Alert.findByIdAndDelete(req.params.id);
    res.json({ message: "Uyarı silindi" });
  } catch (error) {
    res.status(400).json({ error: "Uyarı silinirken hata oluştu." });
  }
});

// SUMO Simulation API Endpoints
let sumoProcess = null;
let simulationRunning = false;
let simulationStartTime = null;
let simulationId = null;

// Araç bilgilerini almak için API
app.get('/vehicles', (req, res) => {
  const query = 'SELECT * FROM vehicle_tracking ORDER BY last_updated DESC LIMIT 100'; // Son 100 güncel veriyi al
  db.query(query, (err, results) => {
      if (err) {
          console.error('Veri alma hatası:', err);
          res.status(500).send('Veri alma hatası');
          return;
      }
      res.json(results);
  });
});

app.get("/api/sumo/vehicles/all", async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    
    // SQL Sorgusu: Her araç için en son iki konumu almak
    const rows = await conn.query(
      `SELECT vehicle_id, tracking_id, latitude, longitude, timestamp, rn
      FROM (
        SELECT 
          vehicle_id,
          tracking_id,
          latitude,
          longitude,
          timestamp,
          ROW_NUMBER() OVER (PARTITION BY vehicle_id ORDER BY timestamp DESC) AS rn
        FROM vehicle_tracking
      ) AS ranked
      WHERE rn <= 2
      ORDER BY vehicle_id, rn;`
    );

    if (!Array.isArray(rows)) {
      return res.status(500).json({ error: "Unexpected response format" });
    }

    if (rows.length === 0) {
      return res.json({});
    }

    const vehicleData = {};

    rows.forEach(row => {
      if (!vehicleData[row.vehicle_id]) {
        vehicleData[row.vehicle_id] = {
          currentPosition: null,
          previousPosition: null
        };
      }

      // Konum objesi oluştur
      const position = {
        lat: parseFloat(row.latitude),
        lng: parseFloat(row.longitude),
        timestamp: row.timestamp
      };

      //console.log("Vehicle ID:", row.vehicle_id, "Position:", position);
      // Eğer rn == 1, bu en güncel konum (currentPosition)
      if (row.rn == 1) {
        vehicleData[row.vehicle_id].currentPosition = position;
      }

      // Eğer rn == 2, bu bir önceki konum (previousPosition)
      if (row.rn == 2) {
        vehicleData[row.vehicle_id].previousPosition = position;
      }
    });

    //console.log("Vehicle data to be sent:", vehicleData); // Verileri loglayın
    res.json(vehicleData);
  } catch (err) {
    console.error("Error fetching vehicle data:", err);
    res.status(500).json({ error: "Database error" });
  } finally {
    if (conn) conn.release();
  }
});



// Get SUMO vehicle tracking data from MariaDB - Fix BigInt issue
app.get("/api/sumo/vehicles", async (req, res) => {
  try {
    let conn;
    try {
      conn = await pool.getConnection();
      
      // Query to get all vehicles from vehicle_tracking table
      const vehicles = await conn.query(`
        SELECT vehicle_id as id, latitude, longitude, last_updated
        FROM vehicle_tracking
        WHERE last_updated = (
          SELECT MAX(last_updated)
          FROM vehicle_tracking
          WHERE vehicle_id = vehicle_tracking.vehicle_id
        )
      `);
      
      //const vehicles = await conn.query(
        //"SELECT vehicle_id as id, speed, latitude, longitude, state_of_charge as battery, last_updated FROM vehicle_tracking"
        
      //);
      
      // Format data for frontend and use imported safeJSONStringify
      const formattedVehicles = vehicles.map(vehicle => ({
        id: vehicle.id,
        speed: parseFloat(vehicle.speed),
        position: [parseFloat(vehicle.latitude), parseFloat(vehicle.longitude)],
        battery: parseFloat(vehicle.battery),
        lastUpdated: vehicle.last_updated instanceof Date ? vehicle.last_updated.toISOString() : vehicle.last_updated
      }));
      
      const runTime = simulationRunning ? 
        Math.floor((new Date() - simulationStartTime) / 1000) : 0;
      
      // Use the imported safeJSONStringify function
      res.setHeader('Content-Type', 'application/json');
      res.send(safeJSONStringify({ 
        vehicles: formattedVehicles,
        simulationTime: runTime,
        simulationRunning: simulationRunning,
        timestamp: new Date().toISOString()
      }));
      
    } catch (err) {
      console.error("Database error:", err);
      throw new Error(`Database error: ${err.message}`);
    } finally {
      if (conn) conn.release();
    }
  } catch (error) {
    console.error("SUMO araç verisi alma hatası:", error);
    res.status(500).json({ error: error.message });
  }
});

// Start SUMO simulation
app.post("/api/start-simulation", async (req, res) => {
  try {
    if (simulationRunning) {
      return res.status(400).json({ error: "Simülasyon zaten çalışıyor" });
    }

    console.log("SUMO simülasyonu başlatılıyor...");
    
    // Set path to SUMO python script - first check if the file exists
    const pythonPath = "python"; // python command
    const sumoScriptPath = path.join(__dirname, "../Sumo/sumo_func.py");
    
    if (!fs.existsSync(sumoScriptPath)) {
      console.error(`SUMO script not found at: ${sumoScriptPath}`);
      return res.status(500).json({ error: `SUMO script not found at: ${sumoScriptPath}` });
    }
    
    console.log(`Starting SUMO with script: ${sumoScriptPath}`);
    
  
    
    // Start SUMO simulation as a child process - use sumo_func.py directly
    sumoProcess = exec(`${pythonPath} "${sumoScriptPath}"`, (error, stdout, stderr) => {
      if (error) {
        console.error(`SUMO execution error: ${error.message}`);
        console.error(`Command: ${pythonPath} "${sumoScriptPath}"`);
        simulationRunning = false;
        return;
      }
      
      if (stderr) {
        console.error(`SUMO stderr: ${stderr}`);
      }
      
      console.log(`SUMO stdout: ${stdout}`);
    });
    
    simulationRunning = true;
    simulationStartTime = new Date();
    
    // Add record to the database - using try/catch to prevent failure if DB error
    try {
      const conn = await pool.getConnection();
      try {
        // Use MariaDB parameter binding instead of directly inserting values
        const result = await conn.query(
          "INSERT INTO simulation_runs (start_time, status) VALUES (NOW(), ?)",
          ["running"]
        );
        simulationId = result.insertId ? Number(result.insertId) : null; // Handle BigInt
      } catch (dbErr) {
        console.warn("Could not record simulation start:", dbErr.message);
      } finally {
        conn.release();
      }
    } catch (connErr) {
      console.error("Database connection error:", connErr.message);
      // Continue even if DB connection fails
    }
    
    // FIX: Avoid BigInt serialization issues by using primitive types
    const responseData = { 
      message: "SUMO simülasyonu başlatıldı", 
      simulationId: simulationId ? Number(simulationId) : null,
      startTime: simulationStartTime.toISOString() // Convert Date to string
    };
    
    // FIX: Use res.json() instead of res.send() for proper serialization
    return res.status(200).json(responseData);
  } catch (error) {
    console.error("SUMO simülasyon başlatma hatası:", error);
    simulationRunning = false;
    return res.status(500).json({ error: error.message });
  }
});

// Stop SUMO simulation
app.post("/api/stop-simulation", async (req, res) => {
  try {
    if (!simulationRunning) {
      return res.status(400).json({ error: "Simülasyon çalışmıyor" });
    }
    
    // Kill the SUMO process
    if (sumoProcess) {
      sumoProcess.kill('SIGTERM');
      sumoProcess = null;
    }
    
    simulationRunning = false;
    
    // Update simulation run record in database
    try {
      const conn = await pool.getConnection();
      try {
        await conn.query(
          "UPDATE simulation_runs SET end_time = NOW(), status = 'completed' WHERE id = ?",
          [simulationId]
        );
      } finally {
        conn.release();
      }
    } catch (dbError) {
      console.error("Database error:", dbError);
      // Continue even if DB logging fails
    }
    
    res.status(200).json({ message: "SUMO simülasyonu durduruldu" });
  } catch (error) {
    console.error("SUMO simülasyon durdurma hatası:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get simulation status
app.get("/api/simulation-status", (req, res) => {
  res.status(200).json({ 
    running: simulationRunning,
    startTime: simulationStartTime,
    runTimeSeconds: simulationRunning ? Math.floor((new Date() - simulationStartTime) / 1000) : 0,
    simulationId: simulationId
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});