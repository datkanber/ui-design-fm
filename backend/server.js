const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const bodyParser = require('body-parser');
const extract = require('extract-zip'); // ZIP dosyalarını açmak için eklenti
const mongoose = require("mongoose"); // Mongoose eklendi

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

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});