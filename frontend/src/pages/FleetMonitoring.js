import React, { useState, useEffect } from "react";
import "../assets/styles/global.css";
import "leaflet/dist/leaflet.css";
import { IconButton, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PersonIcon from "@mui/icons-material/Person";
import CloseIcon from "@mui/icons-material/Close";
import FleetMonitoringMap from "../components/FleetMonitoringMap";
import FleetMonitoringPerformanceMap from "../components/FleetMonitoringPerformanceMap";
import Alert from "../components/FM_AlertPanel"; // Import Alert component
import { vehicles } from "../data/vehicles";
import { chargingStations } from "../data/chargingStations";
import { orders } from "../data/orders";
import { routes } from "../data/routes";
import { drivers } from "../data/drivers";
import { routess } from "../data/routess"; // Import the new routess data

// Example of different types of alerts
const handleButtonClick = () => {
    // Button click handler
};
const API_URL = "http://localhost:5001/api/alerts";

// TaskCompletionChart Component Definition
const TaskCompletionChart = ({ routes }) => {
  if (!routes || routes.length === 0) {
    console.error("TaskCompletionChart: routes prop is undefined or empty");
    return <p>Veri bulunamadı</p>;
  }

  console.log("TaskCompletionChart Data:", routes);

  // Rota bazında tamamlanma yüzdelerini hesapla
  const data = routes.map((route) => {
    const totalTasks = route.tasks.length;
    const completedTasks = route.tasks.filter((task) => task.status === "completed").length;
    const completionRate = (completedTasks / totalTasks) * 100;
    return { name: route.name, completion: completionRate };
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

// New DriverColumnChart Component Definition
const DriverColumnChart = ({ drivers }) => {
  if (!drivers || drivers.length === 0) {
    return <p>Sürücü verisi bulunamadı</p>;
  }

  // Generate hourly delivery data (simulated)
  // In a real implementation, you would use actual data from your backend
  const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8am to 7pm
  const hourlyData = hours.map(hour => {
    // Generate a random count between 5-30 deliveries per hour
    // This is just for demonstration
    const count = 5 + Math.floor(Math.random() * 25);
    return {
      hour: `${hour}:00`,
      count: count
    };
  });

  // Find the maximum count for scaling
  const maxCount = Math.max(...hourlyData.map(item => item.count));
  
  // Set chart dimensions
  const chartHeight = 150;
  const barWidth = 20;
  const chartWidth = hourlyData.length * (barWidth + 10); // bar width + gap
  const maxBarHeight = chartHeight - 30; // Leave space for labels

  return (
    <div style={{ padding: "10px" }}>
      <h3>Saatlere Göre Teslim Edilen Sipariş Sayısı</h3>
      <div style={{ 
        position: "relative", 
        height: `${chartHeight}px`, 
        width: "100%", 
        marginTop: "20px",
        marginBottom: "30px"
      }}>
        {/* Y-axis line */}
        <div style={{ 
          position: "absolute", 
          left: "30px", 
          top: "0", 
          width: "1px", 
          height: `${chartHeight}px`, 
          backgroundColor: "#ccc" 
        }}></div>
        
        {/* Y-axis labels */}
        <div style={{ 
          position: "absolute", 
          left: "0", 
          top: "0", 
          width: "30px", 
          height: `${chartHeight}px` 
        }}>
          <div style={{ 
            position: "absolute", 
            top: "0", 
            right: "5px", 
            fontSize: "10px" 
          }}>{maxCount}</div>
          <div style={{ 
            position: "absolute", 
            top: "50%", 
            right: "5px", 
            fontSize: "10px" 
          }}>{Math.floor(maxCount/2)}</div>
          <div style={{ 
            position: "absolute", 
            bottom: "15px", 
            right: "5px", 
            fontSize: "10px" 
          }}>0</div>
        </div>
        
        {/* X-axis line */}
        <div style={{ 
          position: "absolute", 
          left: "30px", 
          bottom: "15px", 
          width: `${chartWidth}px`, 
          height: "1px", 
          backgroundColor: "#ccc" 
        }}></div>
        
        {/* Bars */}
        <div style={{ 
          position: "absolute", 
          left: "40px", 
          bottom: "15px", 
          display: "flex", 
          alignItems: "flex-end", 
          height: `${maxBarHeight}px`
        }}>
          {hourlyData.map((data, index) => {
            const barHeight = (data.count / maxCount) * maxBarHeight;
            return (
              <div key={index} style={{ marginRight: "10px" }}>
                <div style={{ 
                  width: `${barWidth}px`, 
                  height: `${barHeight}px`, 
                  backgroundColor: "#2196F3", 
                  borderTopLeftRadius: "3px",
                  borderTopRightRadius: "3px",
                  position: "relative",
                  transition: "height 0.5s ease-in-out"
                }}>
                  <div style={{
                    position: "absolute",
                    top: "-20px",
                    width: "100%",
                    textAlign: "center",
                    fontSize: "12px"
                  }}>
                    {data.count}
                  </div>
                </div>
                <div style={{ 
                  textAlign: "center", 
                  marginTop: "5px", 
                  fontSize: "10px",
                  width: `${barWidth}px`,
                  transform: "rotate(-45deg)",
                  transformOrigin: "left top",
                  position: "absolute",
                  left: `${barWidth/2}px`,
                  bottom: "-20px"
                }}>
                  {data.hour}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div style={{ marginTop: "30px" }}>
        <div style={{ fontWeight: "bold", marginBottom: "8px" }}>İstatistikler:</div>
        <div>Toplam Teslimat: {hourlyData.reduce((sum, item) => sum + item.count, 0)}</div>
        <div>En Yoğun Saat: {hourlyData.reduce((max, item) => item.count > max.count ? item : max, { count: 0 }).hour}</div>
        <div>Ortalama Saatlik Teslimat: {(hourlyData.reduce((sum, item) => sum + item.count, 0) / hourlyData.length).toFixed(1)}</div>
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
      label: "Atanmamış",
      color: "#9E9E9E",  // Gray
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

export default function FleetMonitoring() {
  const [alerts, setAlerts] = useState([]);
  const [isPerformanceMode, setIsPerformanceMode] = useState(false); // **Performance toggle için state**
  const [activeTab, setActiveTab] = useState("Rota"); // Başlangıçta Sürücü sekmesi aktif
  const [selectedId, setSelectedId] = useState(null);
  const [showInfo, setShowInfo] = useState(true); // Info göster/gizle
  const [showWarning, setShowWarning] = useState(true); // Warning göster/gizle
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  

  // **MongoDB'den Uyarıları Çek**
  useEffect(() => {
    fetch(API_URL)
      .then((response) => response.json())
      .then((data) => setAlerts(data))
      .catch((error) => console.error("Hata:", error));
  }, []);

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
            <TaskCompletionChart routes={routess["Simulated Annealing"] || []} />
          </div>
        );
      case "Sipariş":
        return (
          <div style={{ height: "200px", backgroundColor: "#fce4ec", padding: "16px", borderRadius: "8px", overflowY: "auto" }}>
            {/* Order status pie chart */}
            <OrderStatusPieChart orders={orders} />
          </div>
        );
      case "Sürücü":
        return (
          <div style={{ height: "200px", backgroundColor: "#ede7f6", padding: "16px", borderRadius: "8px", overflowY: "auto" }}>
            {/* Driver column chart - UPDATED */}
            <DriverColumnChart drivers={drivers} />
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

        <div style={{ height: "50%", marginBottom: "16px", backgroundColor: "#fff", padding: "16px", borderRadius: "8px" }}>
          <h2 style={{ marginBottom: "12px" }}>Performans İzleme</h2>
          <div style={{ maxHeight: "80%", overflowY: "auto", scrollbarWidth: "none", msOverflowStyle: "none" }}>
            <style>
              {`
                .scrollable-div::-webkit-scrollbar {
                  display: none;
                }
              `}
            </style>

            <div style={{ display: "flex", justifyContent: "space-around", padding: "12px", background: "#f4f4f4", borderRadius: "8px" }}>
              {[{ name: "Rota", icon: <DirectionsCarIcon /> }, { name: "Sipariş", icon: <ShoppingCartIcon /> }, { name: "Sürücü", icon: <PersonIcon /> }].map((tab) => (
                <div key={tab.name} style={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer" }} onClick={() => setActiveTab(tab.name)}>
                  <IconButton color={activeTab === tab.name ? "primary" : "default"}>{tab.icon}</IconButton>
                  <Typography variant="caption" style={{ fontSize: "12px", color: activeTab === tab.name ? "#007BFF" : "#555" }}>{tab.name}</Typography>
                  <Button variant="contained" size="small" color="primary" style={{ marginTop: "8px" }} onClick={() => setOpenDialog(true)}>Detay</Button>
                </div>
              ))}
            </div>

            <div style={{ marginTop: "16px" }}>{renderPerformanceContent()}</div>
          </div>

          {/* Pop-up Dialog */}
          <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
            <DialogTitle style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="h6">Detay Bilgisi</Typography>
              <IconButton onClick={() => setOpenDialog(false)} size="small">
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              {activeTab === "Sürücü" ? (
                <div style={{ padding: "20px" }}>
                  <h3>Sürücü Teslimat Detayları</h3>
                  <div style={{ width: "100%", height: "300px", display: "flex", justifyContent: "center" }}>
                    {/* Updated to use column chart */}
                    <DriverColumnChart drivers={drivers} />
                  </div>
                  <div style={{ marginTop: "20px" }}>
                    <h4>Teslimat İstatistikleri</h4>
                    <ul>
                      <li>Toplam tamamlanan teslimat: 247</li>
                      <li>Ortalama teslimat süresi: 32 dakika</li>
                      <li>En yoğun teslimat saati: 12:00 - 13:00</li>
                      <li>Öğleden sonra teslimat oranı: 62%</li>
                    </ul>
                  </div>
                </div>
              ) : activeTab === "Rota" ? (
                <div>
                  <h3>Rota Performans Detayları</h3>
                  <TaskCompletionChart routes={routess["Simulated Annealing"] || []} />
                </div>
              ) : activeTab === "Sipariş" ? (
                <div style={{ padding: "20px" }}>
                  <h3>Sipariş Durumu Detayları</h3>
                  <div style={{ width: "100%", height: "300px", display: "flex", justifyContent: "center" }}>
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
              <Button onClick={() => setOpenDialog(false)} color="primary">Kapat</Button>
            </DialogActions>
          </Dialog>
        </div>
      
        {/* New Statistics Section */}
        <div style={{ height: "23%", backgroundColor: "#fff", padding: "8px", borderRadius: "8px", display: "flex", flexDirection: "column" }}>
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
  );
  }