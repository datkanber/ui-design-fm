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
import FleetMonitoringMap from "../components/FleetMonitoring/FleetMonitoringMap";
import Alert from "../components/FleetMonitoring/FM_AlertPanel";
import FleetMonitoringPerformanceMap from "../components/FleetMonitoring/FleetMonitoringPerformanceMap";
import { vehicles } from "../data/vehicles";
import { chargingStations } from "../data/chargingStations";
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { orders } from "../data/orders";
import { routes } from "../data/routes";

const API_ALERTS = "http://localhost:3001/api/alerts";
const API_PERFORMANCE = "http://localhost:3001/api/performance";
const API_URL = "http://localhost:3001/api/alerts";

// TaskCompletionChart Component Definition
const TaskCompletionChart = ({ routes }) => {
  if (!routes || routes.length === 0) {
    console.error("TaskCompletionChart: routes prop is undefined or empty");
    return <p>Veri bulunamadı</p>;
  }
  const data = routes.map((route) => {
  const taskList = route.tasks || []; // fallback boş array
  const totalTasks = taskList.length;
  const completedTasks = taskList.filter((task) => task.status === "completed").length;
  const completionRate = totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100;
  return { name: route.name || "Bilinmeyen Rota", completion: completionRate };
});


  // Create simple bar chart visualization
  return (
    <div style={{ padding: "10px" }}>
      <h3>Görev Tamamlanma Oranları</h3>
      {data.map(item => (
        <div key={item.name} style={{ marginBottom: "15px" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ width: "80px", marginRight: "10px" }}>{item.name}:</div>
            <div style={{ flex: 1, backgroundColor: "#e0e0e0", height: "24px", borderRadius: "4px", overflow: "hidden" }}>
              <div 
                style={{ 
                  width: `${item.completion}%`, 
                  height: "100%", 
                  backgroundColor: item.completion > 75 ? "#4caf50" : item.completion > 50 ? "#ff9800" : "#f44336",
                  transition: "width 0.5s ease-in-out"
                }}
              />
            </div>
            <div style={{ marginLeft: "10px", width: "60px", textAlign: "right" }}>
              {item.completion.toFixed(1)}%
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// New RouteEnergyConsumptionChart Component
const RouteEnergyConsumptionChart = ({ routeId }) => {
  // Different energy consumption factors based on route selection
  const routeEnergyData = {
    "route1": [
      { name: "Eğim", value: 35, color: "#4CAF50" },
      { name: "Segment Uzunluğu", value: 25, color: "#2196F3" },
      { name: "Ortalama Araç Hızı", value: 20, color: "#FF9800" },
      { name: "Ortalama İvmelenme", value: 15, color: "#9C27B0" },
      { name: "Ortalama Total Ağırlık", value: 5, color: "#F44336" }
    ],
    "route2": [
      { name: "Eğim", value: 15, color: "#4CAF50" },
      { name: "Segment Uzunluğu", value: 40, color: "#2196F3" },
      { name: "Ortalama Araç Hızı", value: 30, color: "#FF9800" },
      { name: "Ortalama İvmelenme", value: 10, color: "#9C27B0" },
      { name: "Ortalama Total Ağırlık", value: 15, color: "#F44336" }
    ]
  };

  const selectedData = routeEnergyData[routeId] || routeEnergyData.route1;
  const total = selectedData.reduce((sum, item) => sum + item.value, 0);
  
  // Calculate segments for pie chart
  const segments = [];
  let cumulativeAngle = 0;

  selectedData.forEach(item => {
    const percentage = (item.value / total) * 100;
    const angle = (percentage / 100) * 360;
    
    segments.push({
      ...item,
      percentage,
      startAngle: cumulativeAngle,
      endAngle: cumulativeAngle + angle
    });
    
    cumulativeAngle += angle;
  });

  return (
    <div style={{ padding: "10px" }}>
      <h3>Enerji Tüketimini Etkileyen Faktörler</h3>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div style={{ position: "relative", width: "150px", height: "150px" }}>
          {segments.map((segment, index) => {
            const startAngle = segment.startAngle * Math.PI / 180;
            const endAngle = segment.endAngle * Math.PI / 180;
            
            // Calculate path for pie segment
            const x1 = 75 + 75 * Math.cos(startAngle);
            const y1 = 75 + 75 * Math.sin(startAngle);
            const x2 = 75 + 75 * Math.cos(endAngle);
            const y2 = 75 + 75 * Math.sin(endAngle);
            
            const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;
            
            const pathData = [
              `M 75 75`,
              `L ${x1} ${y1}`,
              `A 75 75 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              `Z`
            ].join(' ');
            
            return (
              <svg key={index} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}>
                <path d={pathData} fill={segment.color} />
              </svg>
            );
          })}
        </div>
        
        <div style={{ marginLeft: "20px", flex: 1 }}>
          {segments.map((item, index) => (
            <div key={index} style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
              <div 
                style={{ 
                  width: "14px", 
                  height: "14px", 
                  backgroundColor: item.color, 
                  marginRight: "8px",
                  borderRadius: "2px"
                }}
              />
              <div style={{ marginRight: "8px" }}>{item.name}:</div>
              <div style={{ fontWeight: "bold" }}>
                {item.percentage.toFixed(1)}% ({item.value})
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div style={{ marginTop: "20px" }}>
        <div style={{ fontWeight: "bold", marginBottom: "8px" }}>Enerji Tüketimi Özeti:</div>
        <div>Ortalama Enerji Tüketimi: {routeId === "route1" ? "0.25 kWh/km" : "0.31 kWh/km"}</div>
        <div>Toplam Tahmini Enerji: {routeId === "route1" ? "18.7 kWh" : "24.2 kWh"}</div>
        <div>Menzil Etkisi: {routeId === "route1" ? "-15%" : "-22%"}</div>
      </div>
    </div>
  );
};

// New OrderStatusPieChart Component Definition
const OrderStatusPieChart = ({ orders }) => {
  if (!orders || orders.length === 0) {
    return <p>Sipariş verisi bulunamadı</p>;
  }

  // Define status categories
  const statusCategories = {
    delivered: {
      label: "Teslim Edildi",
      color: "#4CAF50",  // Green
      count: 0
    },
    inTransit: {
      label: "Yolda",
      color: "#2196F3",  // Blue
      count: 0
    },
    canceled: {
      label: "İptal Edildi",
      color: "#F44336",  // Red
      count: 0
    },
    pending: {
      label: "Beklemede",
      color: "#FF9800",  // Orange
      count: 0
    },
    unassigned: {
      label: "İptal edildi",
      color: "#FA1B1B",  // Gray
      count: 0
    }
  };


  // Count orders by status (this would use real data in production)
  // For demo purposes, we'll generate random counts
  const totalOrders = orders.length;
  
  // Using a fixed distribution for demonstration
  statusCategories.delivered.count = Math.floor(totalOrders * 0.65);
    statusCategories.inTransit.count = Math.floor(totalOrders * 0.15);
    statusCategories.canceled.count = Math.floor(totalOrders * 0.08);
    statusCategories.pending.count = Math.floor(totalOrders * 0.07);
    statusCategories.unassigned.count = totalOrders - statusCategories.delivered.count - 
                                       statusCategories.inTransit.count - 
                                       statusCategories.canceled.count - 
                                       statusCategories.pending.count;
  
    // Prepare data for pie chart
    const statusData = Object.values(statusCategories).filter(category => category.count > 0);
    const total = statusData.reduce((sum, item) => sum + item.count, 0);
  
    // Calculate percentages and angles
    const segments = [];
    let cumulativeAngle = 0;
  
    statusData.forEach(item => {
      const percentage = (item.count / total) * 100;
      const angle = (percentage / 100) * 360;
      
      segments.push({
        ...item,
        percentage,
        startAngle: cumulativeAngle,
        endAngle: cumulativeAngle + angle
      });
      
      cumulativeAngle += angle;
    });
  
    // Render the pie chart
    return (
      <div style={{ padding: "10px" }}>
        <h3>Sipariş Durumu Dağılımı</h3>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div style={{ position: "relative", width: "150px", height: "150px" }}>
            {segments.map((segment, index) => {
              const startAngle = segment.startAngle * Math.PI / 180;
              const endAngle = segment.endAngle * Math.PI / 180;
              
              // Calculate path for pie segment
              const x1 = 75 + 75 * Math.cos(startAngle);
              const y1 = 75 + 75 * Math.sin(startAngle);
              const x2 = 75 + 75 * Math.cos(endAngle);
              const y2 = 75 + 75 * Math.sin(endAngle);
              
              const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;
              
              const pathData = [
                `M 75 75`,
                `L ${x1} ${y1}`,
                `A 75 75 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                `Z`
              ].join(' ');
              
              return (
                <svg key={index} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}>
                  <path d={pathData} fill={segment.color} />
                </svg>
              );
            })}
          </div>
          
          <div style={{ marginLeft: "20px", flex: 1 }}>
            {segments.map((item, index) => (
              <div key={index} style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
                <div 
                  style={{ 
                    width: "14px", 
                    height: "14px", 
                    backgroundColor: item.color, 
                    marginRight: "8px",
                    borderRadius: "2px"
                  }}
                />
                <div style={{ marginRight: "8px" }}>{item.label}:</div>
                <div style={{ fontWeight: "bold" }}>
                  {item.percentage.toFixed(1)}% ({item.count})
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

const handleButtonClick = () => {
  // Handle button click event
}

export default function FleetMonitoring() {
    const [alerts, setAlerts] = useState([]);
    const [isPerformanceMode, setIsPerformanceMode] = useState(false); // **Performance toggle için state**
    const [activeTab, setActiveTab] = useState("Rota"); // Başlangıçta Rota sekmesi aktif
    const [selectedId, setSelectedId] = useState(null);
    const [showInfo, setShowInfo] = useState(true); // Info göster/gizle
    const [showWarning, setShowWarning] = useState(true); // Warning göster/gizle
    const [routeOptions, setRouteOptions] = useState([]);
    const [performanceData, setPerformanceData] = useState([]);
    const [selectedAlert, setSelectedAlert] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedRoute, setSelectedRoute] = useState("route1"); // Default route selection
    const [isSimulationRunning, setIsSimulationRunning] = useState(false);
    const [simulationStatus, setSimulationStatus] = useState("");

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
  const renderPerformanceContent = () => {
    switch (activeTab) {
      case "Rota":
        return (
          <div style={{ height: "200px", backgroundColor: "#e0f7fa", padding: "16px", borderRadius: "8px", overflowY: "auto" }}>
            {/* Route chart */}
            <TaskCompletionChart routes={routes["Simulated Annealing"] || []} />
          </div>
        );
      case "Sipariş":
        return (
          <div style={{ height: "200px", backgroundColor: "#fce4ec", padding: "16px", borderRadius: "8px", overflowY: "auto" }}>
            {/* Order status pie chart */}
            <OrderStatusPieChart orders={orders} />
          </div>
        );
      default:
        return null;
    }
  };

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
