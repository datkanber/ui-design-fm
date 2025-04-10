import React, { useState, useEffect } from "react";
import "../assets/styles/global.css";
import "leaflet/dist/leaflet.css";
import { IconButton, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, Select, MenuItem, InputLabel } from "@mui/material";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PersonIcon from "@mui/icons-material/Person";
import CloseIcon from "@mui/icons-material/Close";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import FleetMonitoringMap from "../components/FleetMonitoring/FleetMonitoringMap";
import FleetMonitoringPerformanceMap from "../components/FleetMonitoring/FleetMonitoringPerformanceMap";
import Alert from "../components/FleetMonitoring/FM_AlertPanel"; // Import Alert component
import { vehicles } from "../data/vehicles";
import { chargingStations } from "../data/chargingStations";
import SimulationStatus from '../components/FleetMonitoring/SimulationStatus';
import { orders } from "../data/orders";
import { routes } from "../data/routes";
import { drivers } from "../data/drivers";
import { routess } from "../data/routess"; // Import the new routess data
import EnergyPredictor from "../components/test";
import OrderStatusPieChart from "../components/FleetMonitoring/OrderStatusPieChart";
import RouteEnergyConsumptionChart from "../components/FleetMonitoring/RouteEnergyConsumptionChart";
// Example of different types of alerts
const handleButtonClick = () => {
    // Button click handler

};

const API_URL = "http://localhost:3001/api/alerts";
const API_PERFORMANCE = "http://localhost:3001/api/performance";
const API_PREDICT = "http://localhost:5002/predict";



// New OrderStatusPieChart Component Definition
  export default function FleetMonitoring() {
    const [alerts, setAlerts] = useState([]);
    const [isPerformanceMode, setIsPerformanceMode] = useState(false); // **Performance toggle için state**
    const [activeTab, setActiveTab] = useState("Rota"); // Başlangıçta Rota sekmesi aktif
    const [selectedId, setSelectedId] = useState(null);
    const [showInfo, setShowInfo] = useState(true); // Info göster/gizle
    const [showWarning, setShowWarning] = useState(true); // Warning göster/gizle
    const [selectedAlert, setSelectedAlert] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedRoute, setSelectedRoute] = useState("route1"); // Default route selection
    const [isSimulationRunning, setIsSimulationRunning] = useState(false);
    const [simulationStatus, setSimulationStatus] = useState("");
    const [routeOptions, setRouteOptions] = useState([]);
    const [performanceData, setPerformanceData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [showDetailDialog, setShowDetailDialog] = useState(false);
    const [shapContributions, setShapContributions] = useState([]);
    const [shapLabels, setShapLabels] = useState([]);
    const [shapPrediction, setShapPrediction] = useState(null);
    
      
      

    // **MongoDB'den Uyarıları Çek**
    // useEffect(() => {
    //   fetch(API_URL)
    //     .then((response) => response.json())
    //     .then((data) => setAlerts(data))
    //     .catch((error) => console.error("Hata:", error));
    // }, []);

    useEffect(() => {
      fetch(API_URL)
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


    // **Uyarıyı Çöz**
    const handleResolve = async (id) => {
      try {
        const response = await fetch(`${API_URL}/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resolved: true }),
        });
  
        if (!response.ok) throw new Error("Sunucu hatası");
  
        await response.json();
  
        // Uyarıyı "Success" yapma, sadece resolved: true olarak işaretle
        setAlerts((prevAlerts) =>
          prevAlerts.map((alert) =>
            alert._id === id ? { ...alert, resolved: true } : alert
          )
        );
      } catch (error) {
        console.error("Çözümleme hatası:", error);
      }
    };
  
    // **Uyarıyı Sil**
    const handleDelete = async (id) => {
      try {
        const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  
        if (!response.ok) {
          throw new Error(`Sunucu hatası: ${response.status}`);
        }
  
        setAlerts((prevAlerts) => prevAlerts.filter((alert) => alert._id !== id));
        setSelectedAlert(null);
      } catch (error) {
        console.error("Silme hatası:", error);
      }
    };

    // Start SUMO simulation
  const startSumoSimulation = async () => {
    setSimulationStatus("Starting simulation...");
    
    try {
      const response = await fetch('http://localhost:3001/api/start-simulation', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.text();
      setIsSimulationRunning(true);
      setSimulationStatus("Simulation running");
      console.log(data);
    } catch (error) {
      setSimulationStatus(`Error starting simulation: ${error.message}`);
      console.error("Error starting SUMO simulation:", error);
    }
  };
  
    // **Uyarıları Kategoriye Göre Grupla**
    const categorizedAlerts = alerts.reduce((acc, alert) => {
      acc[alert.type] = acc[alert.type] ? [...acc[alert.type], alert] : [alert];
      return acc;
    }, {});
  
    const renderAlertsByCategory = (type) => {
      if (type === "Info" && !showInfo) return null;
      if (type === "Warning" && !showWarning) return null;
      const alertsOfType = categorizedAlerts[type] || [];
      return alertsOfType.map((alert) => (
        <Alert
          key={alert._id}
          detail={alert.detail}
          type={alert.type}
          message={alert.message}
          source={alert.source}
          timestamp={alert.timestamp}
          resolved={alert.resolved} // **Yeni props**
          onResolve={() => handleResolve(alert._id)}
          onDelete={() => handleDelete(alert._id)}
        />
      ));    
    };
  
    // **Performans izleme**
    // const renderPerformanceContent = () => {
    //   switch (activeTab) {
    //     case "Rota":
    //       return (
    //         <div style={{ height: "200px", backgroundColor: "#e0f7fa", padding: "16px", borderRadius: "8px", overflowY: "auto" }}>
    //           {/* Route chart */}
    //           <TaskCompletionChart routes={routess["Simulated Annealing"] || []} />
    //         </div>
    //       );
    //     case "Sipariş":
    //       return (
    //         <div style={{ height: "200px", backgroundColor: "#fce4ec", padding: "16px", borderRadius: "8px", overflowY: "auto" }}>
    //           {/* Order status pie chart */}
    //           <OrderStatusPieChart orders={orders} />
    //         </div>
    //       );
    //     default:
    //       return null;
    //   }
    // };
  
    const routeColors = {
      "Simulated Annealing": "blue",
      "Tabu Search": "green",
      "OR-Tools": "red",
      "Completed": "green",
    };
  
    const handleSelect = (id) => {
      setSelectedId(id);
    };
  
    const getCardStyle = (id) => ({
      padding: "10px",
      margin: "10px 0",
      backgroundColor: selectedId === id ? "#007BFF" : "#f0f0f0",
      color: selectedId === id ? "#fff" : "#000",
      borderRadius: "8px",
      cursor: "pointer",
    });
  
    const handleRouteChange = (event) => {
      setSelectedRoute(event.target.value);
    };
  
    const plannedRoutes = routes["Simulated Annealing"]?.map((r) => ({ positions: r.path || [] })) || [];
    const completedRoutes = routes["Completed"]?.map((r) => ({ positions: r.path || [] })) || [];
  
    return (
      <div style={{ display: "flex", height: "100vh" }}>
        <div style={{ flex: 1, padding: "16px", backgroundColor: "#f0f0f0", height: "100vh" }}>
          <div style={{ height: "50%", overflowY: "auto", scrollbarWidth: "none", msOverflowStyle: "none", marginBottom: "16px", backgroundColor: "#fff", padding: "8px", borderRadius: "8px" }}>
            <h2>Uyarılar</h2>
    
            <div>
              <label>
                <input type="checkbox" checked={showInfo} onChange={() => setShowInfo(!showInfo)} />
                Info
              </label>
              <label>
                <input type="checkbox" checked={showWarning} onChange={() => setShowWarning(!showWarning)} />
                Warning
              </label>
            </div>
    
            <div>
              <h3>Error</h3>
              {renderAlertsByCategory("Error")}
            </div>
    
            {showWarning && (
              <div>
                <h3>Warning</h3>
                {renderAlertsByCategory("Warning")}
              </div>
            )}
    
            {showInfo && (
              <div>
                <h3>Info</h3>
                {renderAlertsByCategory("Info")}
              </div>
            )}
          </div>
    
          {/* <div>
            <EnergyPredictor />
          </div> */}
    
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
    
          <div style={{ height: "23%", backgroundColor: "#fff", padding: "8px", borderRadius: "8px", display: "flex", flexDirection: "column", overflowY: "auto" }}>
            <div>
              <h2>Simulation Control</h2>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <button
                onClick={startSumoSimulation}
                disabled={isSimulationRunning}
                style={{
                  padding: "10px",
                  backgroundColor: isSimulationRunning ? "#cccccc" : "#2196F3",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: isSimulationRunning ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px"
                }}
              >
                {isSimulationRunning ? "Simülasyon Başladı" : "Simülasyonu Başlat"}
              </button>
            </div>
          </div>
        </div>
    
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
    );}