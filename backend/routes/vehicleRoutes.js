const express = require("express");
const router = express.Router();
const vehicleService = require("../services/vehicleService");

// 📌 Tüm araçları getir
router.get("/", async (req, res) => {
  try {
    const vehicles = await vehicleService.getAllVehicles();
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ error: error.message || "Veri çekilirken hata oluştu" });
  }
});

// 📌 Belirli bir aracı getir
router.get("/:id", async (req, res) => {
  try {
    const vehicle = await vehicleService.getVehicleById(req.params.id);
    if (!vehicle) return res.status(404).json({ error: "Araç bulunamadı" });
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ error: error.message || "Veri alınamadı" });
  }
});

module.exports = router;
