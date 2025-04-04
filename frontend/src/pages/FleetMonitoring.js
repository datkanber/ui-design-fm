import React, { useState, useEffect } from "react";
import "../assets/styles/global.css";
import "leaflet/dist/leaflet.css";
import {
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  Select,
  MenuItem,
  InputLabel
} from "@mui/material";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import FleetMonitoringMap from "../components/FleetMonitoring/FleetMonitoringMap";
import FleetMonitoringPerformanceMap from "../components/FleetMonitoring/FleetMonitoringPerformanceMap";
import Alert from "../components/FleetMonitoring/FM_AlertPanel";
import OrderStatusPieChart from "../components/FleetMonitoring/OrderStatusPieChart";
import RouteEnergyConsumptionChart from "../components/FleetMonitoring/RouteEnergyConsumptionChart";
import { vehicles } from "../data/vehicles";
import { chargingStations } from "../data/chargingStations";
import { orders } from "../data/orders";
import { routes } from "../data/routes";

const API_ALERTS = "http://localhost:3001/api/alerts";
const API_PERFORMANCE = "http://localhost:3001/api/performance";

export default function FleetMonitoring() {
  const [alerts, setAlerts] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState("");
  const [routeOptions, setRouteOptions] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [activeTab, setActiveTab] = useState("rota");
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  useEffect(() => {
    fetch(API_ALERTS)
      .then((res) => res.json())
      .then((data) => setAlerts(data))
      .catch((err) => console.error(err));

    const fetchData = () => {
      fetch(API_PERFORMANCE)
        .then((res) => res.json())
        .then((data) => {
          setPerformanceData(data);
          const uniqueRoutes = Array.from(new Set(data.map(item => item.route_id)));
          setRouteOptions(uniqueRoutes);
          if (!selectedRoute && uniqueRoutes.length > 0) {
            setSelectedRoute(uniqueRoutes[0]);
          }
        })
        .catch((err) => console.error(err));
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [selectedRoute]);

  const filteredData = performanceData.filter(item => item.route_id === selectedRoute);

  const scores = {
    gradient: 0,
    segmentLength: 0,
    speed_kmh: 0,
    acceleration: 0,
    weight_kg: 0
  };

  filteredData.forEach(item => {
    scores.gradient += Math.abs(Number(item.gradient) || 0);
    scores.segmentLength += Number(item.distance_traveled_km) / 10 || 0;
    scores.speed_kmh += Number(item.speed_kmh) / 100 || 0;
    scores.acceleration += Math.abs(Number(item.acceleration) || 0) * 10;
    scores.weight_kg += Number(item.weight_kg) / 1000 || 0;
  });

  const total = Object.values(scores).reduce((sum, val) => sum + val, 0);

  const pieData = [
    { name: "Eğim", value: scores.gradient * 10, color: "#4CAF50" },
    { name: "Segment Uzunluğu", value: scores.segmentLength * 10, color: "#2196F3" },
    { name: "Ortalama Araç Hızı", value: scores.speed_kmh * 10, color: "#FF9800" },
    { name: "Ortalama İvmelenme", value: scores.acceleration, color: "#9C27B0" },
    { name: "Ortalama Total Ağırlık", value: scores.weight_kg * 10, color: "#F44336" },
  ];

  const plannedRoutes = routes["Simulated Annealing"]?.map(r => ({ positions: r.path || [] })) || [];
  const completedRoutes = routes["Completed"]?.map(r => ({ positions: r.path || [] })) || [];

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div style={{ flex: 1, padding: 16, backgroundColor: "#f0f0f0" }}>
        <div style={{ height: "50%", overflowY: "auto", marginBottom: 16, backgroundColor: "#fff", padding: 8, borderRadius: 8 }}>
          <h2>Uyarılar</h2>
          {alerts.map((alert) => (
            <Alert key={alert._id} {...alert} onResolve={() => {}} onDelete={() => {}} />
          ))}
        </div>

        <div style={{ height: "50%", backgroundColor: "#fff", padding: 16, borderRadius: 8 }}>
          <h2>Performans İzleme</h2>
          <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
            <Button variant={activeTab === "rota" ? "contained" : "outlined"} startIcon={<DirectionsCarIcon />} onClick={() => setActiveTab("rota")}>ROTA</Button>
            <Button variant={activeTab === "siparis" ? "contained" : "outlined"} startIcon={<ShoppingCartIcon />} onClick={() => setActiveTab("siparis")}>SİPARİŞ</Button>
          </div>

          {activeTab === "rota" && (
            <div>
              <FormControl fullWidth size="small" style={{ marginBottom: 12 }}>
                <InputLabel>Rota Seç</InputLabel>
                <Select value={selectedRoute} onChange={(e) => setSelectedRoute(e.target.value)} label="Rota Seç">
                  {routeOptions.map((route) => (
                    <MenuItem key={route} value={route}>{route}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <RouteEnergyConsumptionChart data={pieData} />

              <Button variant="outlined" onClick={() => setShowDetailDialog(true)} style={{ marginTop: 12 }}>Detayları Göster</Button>

              <Dialog open={showDetailDialog} onClose={() => setShowDetailDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Rota Detayları</DialogTitle>
                <DialogContent>
                  <FormControl fullWidth size="small" style={{ marginBottom: 12 }}>
                    <InputLabel>Rota Seç</InputLabel>
                    <Select value={selectedRoute} onChange={(e) => setSelectedRoute(e.target.value)} label="Rota Seç">
                      {routeOptions.map((route) => (
                        <MenuItem key={route} value={route}>{route}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <RouteEnergyConsumptionChart data={pieData} />

                  {filteredData.length > 0 ? (
                    <>
                      <Typography variant="body2">Ortalama Enerji Tüketimi: {filteredData.at(-1).avg_energy_consumption_kwh_km} kWh/km</Typography>
                      <Typography variant="body2">Toplam Tahmini Enerji: {filteredData.at(-1).estimated_total_energy_kwh} kWh</Typography>
                      <Typography variant="body2">Menzil Etkisi: {filteredData.at(-1).range_effect_percent}%</Typography>

                      <Typography variant="subtitle1" style={{ marginTop: 8, fontWeight: "bold" }}>Rota Bilgileri</Typography>
                      <Typography variant="body2">Toplam Mesafe: {filteredData.at(-1).total_distance_km} km</Typography>
                      <Typography variant="body2">Tahmini Süre: {Math.floor(filteredData.at(-1).estimated_duration_min / 60)} saat {filteredData.at(-1).estimated_duration_min % 60} dakika</Typography>
                      <Typography variant="body2">Ortalama Hız: {filteredData.at(-1).speed_kmh} km/s</Typography>
                      <Typography variant="body2">Toplam Durak: {filteredData.at(-1).stop_count}</Typography>
                      <Typography variant="body2">Trafik Yoğunluğu: {filteredData.at(-1).traffic_level}</Typography>
                      <Typography variant="body2">Eğim Profili: {filteredData.at(-1).slope_profile}</Typography>
                      <Typography variant="body2">Enerji Verimlilik Puanı: {filteredData.at(-1).efficiency_score}/100</Typography>
                    </>
                  ) : (
                    <Typography>Veri bulunamadı.</Typography>
                  )}
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setShowDetailDialog(false)}>Kapat</Button>
                </DialogActions>
              </Dialog>
            </div>
          )}

          {activeTab === "siparis" && (
            <div>
              <OrderStatusPieChart orders={orders} />
            </div>
          )}
        </div>
      </div>

      <div style={{ flex: 3 }}>
        <FleetMonitoringMap
          vehicles={vehicles}
          chargingStations={chargingStations}
          orders={orders}
          plannedRoutes={plannedRoutes}
          completedRoutes={completedRoutes}
          routeColors={{ "Simulated Annealing": "blue", "Tabu Search": "green", "OR-Tools": "red", "Completed": "green" }}
        />
      </div>
    </div>
  );
}
