const express = require("express");
const router = express.Router();
const RoutePlan = require("../models/RoutePlan");

router.get("/", async (req, res) => {
  try {
    const routePlans = await RoutePlan.find({}).lean();

    if (!routePlans || routePlans.length === 0) {
      return res.status(404).json({ error: "Hiç müşteri bulunamadı" });
    }

    let customers = [];

    routePlans.forEach(plan => {
      plan.Routes?.forEach(route => {
        route.Nodes?.forEach(node => {
          if (node?.$?.NodeType === "Customer") {
            customers.push({
              id: node.$.NodeId || "Unknown",
              name: `Müşteri ${node.$.NodeId || "Bilinmiyor"}`,
              latitude: node.Location?.Latitude || "0",
              longitude: node.Location?.Longitude || "0",
              demand: parseFloat(node.LoadInformation?.Weight) || 0,
              orderDate: new Date().toISOString().split("T")[0],
              startTime: parseInt(node.ServiceInformation?.ReadyTime) || 0,
              endTime: parseInt(node.ServiceInformation?.DueDate) || 0,
              status: "Requested"
            });
          }
        });
      });
    });

    if (customers.length === 0) {
      return res.status(404).json({ error: "Hiç müşteri bulunamadı" });
    }

    res.json(customers);
  } catch (error) {
    console.error("Müşteri verisi alınırken hata:", error);
    res.status(500).json({ error: "Müşteri verisi çekilemedi", details: error.message });
  }
});

module.exports = router;
