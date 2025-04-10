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
const API_PREDICT = "http://localhost:5002/predict";


export default function FleetMonitoring() {
  const [alerts, setAlerts] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState("");
  const [routeOptions, setRouteOptions] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [activeTab, setActiveTab] = useState("rota");
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [shapContributions, setShapContributions] = useState([]);
  const [shapLabels, setShapLabels] = useState([]);
  const [shapPrediction, setShapPrediction] = useState(null);

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

  useEffect(() => {
    const filtered = performanceData.filter(item => item.route_id === selectedRoute);
    setFilteredData(filtered);
  }, [performanceData, selectedRoute]);

  const fetchSHAP = async () => {
    if (filteredData.length === 0) return;
  
    const latest = filteredData.at(-1);
  
    const inputData = {
      slope: latest?.slope || 0,
      avg_vehicle_speed: latest?.avg_vehicle_speed || 0,
      avg_Acceleration: latest?.avg_Acceleration || 0,
      avg_Total_Mass: latest?.avg_Total_Mass || 0,
      timestamp: latest?.timestamp
    };
  
    try {
      const response = await fetch(API_PREDICT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inputData),
      });
  
      const data = await response.json();
      if (response.ok) {
        setShapContributions([...data.shap_values]);
        setShapLabels(["slope", "avg_vehicle_speed", "avg_Acceleration", "avg_Total_Mass"]);
        setShapPrediction(data.prediction);
      }
    } catch (error) {
      console.error("SHAP verisi alınamadı:", error);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      fetchSHAP(); // Her 5 saniyede SHAP hesapla
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchSHAP();
  }, [selectedRoute, performanceData]);

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

              {shapPrediction !== null && (
                <Typography style={{ fontWeight: "bold", marginBottom: 8 }}>
                  Tahmin Edilen Enerji Tüketimi: {shapPrediction.toFixed(2)} kWh
                </Typography>
              )}

              <RouteEnergyConsumptionChart shapData={shapContributions} labels={shapLabels} />

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

                  <RouteEnergyConsumptionChart shapData={shapContributions} labels={shapLabels} />

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
