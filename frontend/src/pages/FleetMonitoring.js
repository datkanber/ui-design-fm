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
  InputLabel,
} from "@mui/material";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import FleetMonitoringMap from "../components/FleetMonitoring/FleetMonitoringMap";
import FleetMonitoringPerformanceMap from "../components/FleetMonitoring/FleetMonitoringPerformanceMap";
import Alert from "../components/FleetMonitoring/FM_AlertPanel";
import OrderStatusPieChart from "../components/FleetMonitoring/OrderStatusPieChart";
import RouteEnergyConsumptionChart from "../components/FleetMonitoring/RouteEnergyConsumptionChart";
import { vehicles } from "../data/vehicles";
import { chargingStations } from "../data/chargingStations";
import SimulationStatus from "../components/FleetMonitoring/SimulationStatus";
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
          const uniqueRoutes = Array.from(
            new Set(data.map((item) => item.route_id))
          );
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

  const filteredData = performanceData.filter(
    (item) => item.route_id === selectedRoute
  );

  const scores = {
    gradient: 0,
    segmentLength: 0,
    speed_kmh: 0,
    acceleration: 0,
    weight_kg: 0,
  };

  filteredData.forEach((item) => {
    scores.gradient += Math.abs(Number(item.gradient) || 0);
    scores.segmentLength += Number(item.distance_traveled_km) / 10 || 0;
    scores.speed_kmh += Number(item.speed_kmh) / 100 || 0;
    scores.acceleration += Math.abs(Number(item.acceleration) || 0) * 10;
    scores.weight_kg += Number(item.weight_kg) / 1000 || 0;
  });

  const total = Object.values(scores).reduce((sum, val) => sum + val, 0);

  const pieData = [
    { name: "Eğim", value: scores.gradient * 10, color: "#4CAF50" },
    {
      name: "Segment Uzunluğu",
      value: scores.segmentLength * 10,
      color: "#2196F3",
    },
    {
      name: "Ortalama Araç Hızı",
      value: scores.speed_kmh * 10,
      color: "#FF9800",
    },
    {
      name: "Ortalama İvmelenme",
      value: scores.acceleration,
      color: "#9C27B0",
    },
    {
      name: "Ortalama Total Ağırlık",
      value: scores.weight_kg * 10,
      color: "#F44336",
    },
  ];

  const plannedRoutes =
    routes["Simulated Annealing"]?.map((r) => ({ positions: r.path || [] })) ||
    [];
  const completedRoutes =
    routes["Completed"]?.map((r) => ({ positions: r.path || [] })) || [];

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div style={{ flex: 1, padding: 16, backgroundColor: "#f0f0f0" }}>
        <div
          style={{
            height: "50%",
            overflowY: "auto",
            marginBottom: 16,
            backgroundColor: "#fff",
            padding: 8,
            borderRadius: 8,
          }}
        >
          <h2>Uyarılar</h2>
          {alerts.map((alert) => (
            <Alert
              key={alert._id}
              {...alert}
              onResolve={() => {}}
              onDelete={() => {}}
            />
          ))}
        </div>

        <div
          style={{
            height: "50%",
            backgroundColor: "#fff",
            padding: 16,
            borderRadius: 8,
          }}
        >
          <h2>Performans İzleme</h2>
          <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
            <Button
              variant={activeTab === "rota" ? "contained" : "outlined"}
              startIcon={<DirectionsCarIcon />}
              onClick={() => setActiveTab("rota")}
            >
              ROTA
            </Button>
            <Button
              variant={activeTab === "siparis" ? "contained" : "outlined"}
              startIcon={<ShoppingCartIcon />}
              onClick={() => setActiveTab("siparis")}
            >
              SİPARİŞ
            </Button>
          </div>

          <div
            style={{
              height: "50%",
              marginBottom: "16px",
              backgroundColor: "#fff",
              padding: "16px",
              borderRadius: "8px",
            }}
          >
            <h2 style={{ marginBottom: "12px" }}>Performans İzleme</h2>
            <div
              style={{
                maxHeight: "80%",
                overflowY: "auto",
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              <style>
                {`
                  .scrollable-div::-webkit-scrollbar {
                    display: none;
                  }
                `}
              </style>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-around",
                  padding: "12px",
                  background: "#f4f4f4",
                  borderRadius: "8px",
                }}
              >
                {[
                  { name: "Rota", icon: <DirectionsCarIcon /> },
                  { name: "Sipariş", icon: <ShoppingCartIcon /> },
                ].map((tab) => (
                  <div
                    key={tab.name}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      cursor: "pointer",
                    }}
                    onClick={() => setActiveTab(tab.name)}
                  >
                    <IconButton
                      color={activeTab === tab.name ? "primary" : "default"}
                    >
                      {tab.icon}
                    </IconButton>
                    <Typography
                      variant="caption"
                      style={{
                        fontSize: "12px",
                        color: activeTab === tab.name ? "#007BFF" : "#555",
                      }}
                    >
                      {tab.name}
                    </Typography>
                    <Button
                      variant="contained"
                      size="small"
                      color="primary"
                      style={{ marginTop: "8px" }}
                      onClick={() => setOpenDialog(true)}
                    >
                      Detay
                    </Button>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: "16px" }}>
                {renderPerformanceContent()}
              </div>
            </div>

            {/* Pop-up Dialog */}
            <Dialog
              open={openDialog}
              onClose={() => setOpenDialog(false)}
              maxWidth="md"
              fullWidth
            >
              <DialogTitle
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="h6">Detay Bilgisi</Typography>
                <IconButton onClick={() => setOpenDialog(false)} size="small">
                  <CloseIcon />
                </IconButton>
              </DialogTitle>
              <DialogContent>
                {activeTab === "Rota" ? (
                  <div style={{ padding: "20px" }}>
                    <h3>Rota Performans Detayları</h3>

                    {/* Route selection dropdown */}
                    <FormControl
                      variant="outlined"
                      size="small"
                      style={{ marginBottom: "20px", minWidth: "200px" }}
                    >
                      <InputLabel id="route-select-label">
                        Rota Seçin
                      </InputLabel>
                      <Select
                        labelId="route-select-label"
                        id="route-select"
                        value={selectedRoute}
                        onChange={handleRouteChange}
                        label="Rota Seçin"
                      >
                        <MenuItem value="route1">Rota 1 </MenuItem>
                        <MenuItem value="route2">Rota 2 </MenuItem>
                      </Select>
                    </FormControl>

                    <div style={{ display: "flex", flexWrap: "wrap" }}>
                      {/* Left column */}

                      {/* Right column - Energy Consumption Chart */}
                      <div style={{ flex: "1 1 50%", minWidth: "300px" }}>
                        <RouteEnergyConsumptionChart routeId={selectedRoute} />
                      </div>
                    </div>

                    <div style={{ marginTop: "20px" }}>
                      <h4>
                        Rota Bilgileri -{" "}
                        {selectedRoute === "route1" ? "Rota 1 " : "Rota 2 "}
                      </h4>
                      <div style={{ display: "flex", flexWrap: "wrap" }}>
                        <div style={{ flex: "1 1 50%", minWidth: "250px" }}>
                          <ul>
                            <li>
                              Toplam Mesafe:{" "}
                              {selectedRoute === "route1"
                                ? "108.5 km"
                                : "453.2 km"}
                            </li>
                            <li>
                              Tahmini Süre:{" "}
                              {selectedRoute === "route1"
                                ? "1 saat 25 dakika"
                                : "5 saat 10 dakika"}
                            </li>
                            <li>
                              Ortalama Hız:{" "}
                              {selectedRoute === "route1"
                                ? "75 km/s"
                                : "85 km/s"}
                            </li>
                            <li>
                              Toplam Durak:{" "}
                              {selectedRoute === "route1" ? "4" : "7"}
                            </li>
                          </ul>
                        </div>
                        <div style={{ flex: "1 1 50%", minWidth: "250px" }}>
                          <ul>
                            <li>
                              Trafik Yoğunluğu:{" "}
                              {selectedRoute === "route1" ? "Orta" : "Yüksek"}
                            </li>
                            <li>
                              Eğim Profili:{" "}
                              {selectedRoute === "route1"
                                ? "Dalgalı"
                                : "Düz ve Dağlık"}
                            </li>
                            <li>
                              Enerji Verimlilik Puanı:{" "}
                              {selectedRoute === "route1" ? "85/100" : "72/100"}
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : activeTab === "Sipariş" ? (
                  <div style={{ padding: "20px" }}>
                    <h3>Sipariş Durumu Detayları</h3>
                    <div
                      style={{
                        width: "100%",
                        height: "300px",
                        display: "flex",
                        justifyContent: "center",
                      }}
                    >
                      <OrderStatusPieChart orders={orders} />
                    </div>
                    <div style={{ marginTop: "20px" }}>
                      <h4>Sipariş İstatistikleri</h4>
                      <ul>
                        <li>Toplam sipariş sayısı: {orders.length}</li>
                        <li>Ortalama teslimat süresi: 45 dakika</li>
                        <li>İptal oranı: 8.0%</li>
                        <li>Zamanında teslimat oranı: 92.5%</li>
                        <li>Bu ayki toplam sipariş: 1,458</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <Typography>Detay bilgisi bulunamadı.</Typography>
                )}
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpenDialog(false)} color="primary">
                  Kapat
                </Button>
              </DialogActions>
            </Dialog>
          </div>

          {/* New Statistics Section */}
          <div
            style={{
              height: "23%",
              backgroundColor: "#fff",
              padding: "8px",
              borderRadius: "8px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div>
              <h2>Diğer</h2>
            </div>
            <button
              onClick={handleButtonClick}
              style={{
                padding: "10px",
                backgroundColor: "#4caf50",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                marginTop: "12px",
              }}
            >
              Details
            </button>
          </div>
        </div>

        {/* Map Section */}
        <div style={{ flex: 3 }}>
          {isPerformanceMode ? (
            <FleetMonitoringPerformanceMap
              vehicles={vehicles}
              chargingStations={chargingStations}
              orders={orders}
              plannedRoutes={plannedRoutes}
              completedRoutes={completedRoutes}
              routeColors={routeColors}
            />
          ) : (
            <FleetMonitoringMap
              vehicles={vehicles}
              chargingStations={chargingStations}
              orders={orders}
              plannedRoutes={plannedRoutes}
              completedRoutes={completedRoutes}
              routeColors={routeColors}
            />
          )}
        </div>
      </div>
    </div>
  );
}
