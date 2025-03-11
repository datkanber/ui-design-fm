const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const extract = require("extract-zip");

const app = express();
app.use(cors({ origin: "http://localhost:3001" }));
app.use(express.json({ limit: '50mb' }));

// Create output directory if it doesn't exist
const outputDir = path.join(__dirname, "../frontend/public/output");
console.log("Output directory:", outputDir);
fs.mkdirSync(outputDir, { recursive: true });

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, outputDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

// Endpoint to save a single file
app.post("/save-file", upload.single("file"), (req, res) => {
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
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });
// Endpoint to save multiple files
app.post("/save-files", upload.array("files"), (req, res) => {
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

// Endpoint to save and extract zip file
app.post("/save-zip", upload.single("zipFile"), async (req, res) => {
  console.log("Received file:", req.file);
  process.stdout.write(""); // Buffer'ı zorla boşalt

  if (!req.file) {
    return res.status(400).send("No zip file uploaded");
  }
  const zipPath = req.file.path;
  try {
    // Extract zip file
    await extract(zipPath, { dir: outputDir });
    // (Opsiyonel) Zip dosyasını silmek için: fs.unlinkSync(zipPath);
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

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`running on ${PORT}`);
});
