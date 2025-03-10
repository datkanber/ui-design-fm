const express = require('express');
const router = express.Router();
const RoutePlan = require('../models/RoutePlan');

// 📌 Tüm rota planlarını getir
router.get('/', async (req, res) => {
  try {
    const routePlans = await RoutePlan.find({}).lean();
    res.json(routePlans);
  } catch (error) {
    res.status(500).json({ error: error.message || "Rota planları alınırken hata oluştu" });
  }
});

// 📌 Belirli bir rota planını getir
router.get('/:id', async (req, res) => {
  try {
    const routePlan = await RoutePlan.findById(req.params.id).lean();
    if (!routePlan) return res.status(404).json({ error: "Rota bulunamadı" });
    res.json(routePlan);
  } catch (error) {
    res.status(500).json({ error: error.message || "Rota verisi getirilemedi" });
  }
});

module.exports = router;
