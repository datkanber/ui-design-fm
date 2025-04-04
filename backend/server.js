// server.js
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const extract = require('extract-zip');
const mongoose = require("mongoose");

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, '../public')));

// Request logger middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// MongoDB Models
const performanceSchema = new mongoose.Schema({
  route_id: String,
  vehicle_id: String,
  timestamp: Date,
  location: { lat: Number, lon: Number },
  elevation: Number,
  speed_kmh: Number,
  gradient: Number,
  direction: Number,
  distance_traveled_km: Number,
  status: String,
});
const PerformanceData = mongoose.model("PerformanceData", performanceSchema, "anlikPerformansRota");

const routeSchema = new mongoose.Schema({
  route_id: String,
  name: String,
  description: String,
  start_point: { lat: Number, lon: Number, name: String },
  end_point: { lat: Number, lon: Number, name: String },
  waypoints: [{ lat: Number, lon: Number, name: String, order: Number }],
  distance_km: Number,
  estimated_duration_min: Number,
  created_at: { type: Date, default: Date.now },
  updated_at: Date,
  status: String,
});
const Route = mongoose.model("Route", routeSchema, "rotalar");

const route4VehicleSchema = new mongoose.Schema({
  assignment_id: String,
  route_id: String,
  vehicle_id: String,
  driver_id: String,
  start_time: Date,
  end_time: Date,
  status: String,
  notes: String,
});
const Route4Vehicle = mongoose.model("Route4Vehicle", route4VehicleSchema, "aracRotaIliskileri");

// API Routes
app.get("/api/performance", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const performanceData = await PerformanceData.find().sort({ timestamp: -1 }).limit(limit);
    res.json(performanceData);
  } catch (error) {
    res.status(500).json({ error: "Veriler alınırken hata oluştu." });
  }
});

app.get("/api/performance/:routeId", async (req, res) => {
  try {
    const { routeId } = req.params;
    const limit = parseInt(req.query.limit) || 10;
    const performanceData = await PerformanceData.find({ route_id: routeId }).sort({ timestamp: -1 }).limit(limit);
    res.json(performanceData);
  } catch (error) {
    res.status(500).json({ error: "Veriler alınırken hata oluştu." });
  }
});

app.get("/api/routes", async (req, res) => {
  try {
    const routes = await Route.find();
    res.json(routes);
  } catch (error) {
    res.status(500).json({ error: "Rotalar alınırken hata oluştu." });
  }
});

app.get("/api/routes/:routeId", async (req, res) => {
  try {
    const route = await Route.findOne({ route_id: req.params.routeId });
    if (!route) return res.status(404).json({ error: "Rota bulunamadı." });
    res.json(route);
  } catch (error) {
    res.status(500).json({ error: "Rota alınırken hata oluştu." });
  }
});

app.get("/api/route4vehicle", async (req, res) => {
  try {
    const route4Vehicles = await Route4Vehicle.find();
    res.json(route4Vehicles);
  } catch (error) {
    res.status(500).json({ error: "Araç-rota ilişkileri alınırken hata oluştu." });
  }
});

app.get("/api/route4vehicle/vehicle/:vehicleId", async (req, res) => {
  try {
    const route4Vehicles = await Route4Vehicle.find({ vehicle_id: req.params.vehicleId });
    res.json(route4Vehicles);
  } catch (error) {
    res.status(500).json({ error: "Araç için rotalar alınırken hata oluştu." });
  }
});

app.get("/api/route4vehicle/route/:routeId", async (req, res) => {
  try {
    const route4Vehicles = await Route44Vehicle.find({ route_id: req.params.routeId });
    res.json(route4Vehicles);
  } catch (error) {
    res.status(500).json({ error: "Rota için araçlar alınırken hata oluştu." });
  }
});

// File upload and extraction setup
const outputDir = path.join(__dirname, "../frontend/public/output");
fs.mkdirSync(outputDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, outputDir),
  filename: (req, file, cb) => cb(null, file.originalname),
});
const upload = multer({ storage });

app.post('/clear-output', (req, res) => {
  try {
    fs.ensureDirSync(outputDir);
    fs.emptyDirSync(outputDir);
    res.status(200).json({ message: 'Output directory cleared successfully' });
  } catch (error) {
    res.status(500).json({ error: `Failed to clear output directory: ${error.message}` });
  }
});

app.post('/save-file', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).send("No file uploaded");
  res.json({ success: true, path: `/output/${req.file.filename}`, filename: req.file.filename });
});

app.post('/save-files', upload.array('files'), (req, res) => {
  if (!req.files?.length) return res.status(400).send("No files uploaded");
  const savedFiles = req.files.map(file => ({ path: `/output/${file.filename}`, filename: file.filename }));
  res.json({ success: true, files: savedFiles });
});

app.post('/save-zip', upload.single('zipFile'), async (req, res) => {
  if (!req.file) return res.status(400).send("No zip file uploaded");
  try {
    await extract(req.file.path, { dir: outputDir });
    res.json({ success: true, zipPath: `/output/${req.file.filename}`, extractedTo: "/output/" });
  } catch (err) {
    res.status(500).send("Error extracting zip file");
  }
});

app.get('/list-extracted-files', (req, res) => {
  try {
    const listFilesRecursively = (dir, baseDir = '') => {
      let results = [];
      if (!fs.existsSync(dir)) return results;
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const filePath = path.join(dir, file);
        const relativePath = path.join(baseDir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
          results = results.concat(listFilesRecursively(filePath, relativePath));
        } else {
          results.push('/output/' + relativePath.replace(/\\/g, '/'));
        }
      }
      return results;
    };
    const fileList = listFilesRecursively(outputDir);
    res.json({ files: fileList });
  } catch (error) {
    res.status(500).json({ error: 'Failed to list files in output directory' });
  }
});

app.get('/check-file', (req, res) => {
  const filePath = req.query.path;
  if (!filePath) return res.status(400).json({ error: 'No file path provided' });
  const normalizedPath = path.normalize(filePath).replace(/^(\.\\|\.)+(\\|\/)?/, '');
  const fullPath = path.join(__dirname, '../frontend/public', normalizedPath);
  if (fs.existsSync(fullPath)) {
    const stats = fs.statSync(fullPath);
    res.json({ exists: true, isFile: stats.isFile(), isDirectory: stats.isDirectory(), size: stats.size, lastModified: stats.mtime });
  } else {
    res.json({ exists: false });
  }
});

// MongoDB bağlantısı
const mongoURI = "mongodb+srv://burak2kanber:ploW4nuSpzwXakhM@cluster0.on8m7.mongodb.net/RouteManagementDB?retryWrites=true&w=majority";
mongoose.connect(mongoURI)
  .then(() => console.log("MongoDB Atlas bağlantısı başarılı!"))
  .catch(err => console.error("MongoDB bağlantı hatası:", err));

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
