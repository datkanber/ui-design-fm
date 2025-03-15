import React, { useState } from "react";
import FleetMonitoringMap from "../components/FleetMonitoringMap";
import FleetMonitoringPerformanceMap from "../components/FleetMonitoringPerformanceMap";
import { vehicles } from "../data/vehicles";
import { chargingStations } from "../data/chargingStations";
import { orders } from "../data/orders";
import { routes } from "../data/routes";
import { drivers } from "../data/drivers";
import Alert from "../components/FM_AlertPanel"; // Import Alert component
import "../assets/styles/global.css";
import "leaflet/dist/leaflet.css";



// Example of different types of alerts
const handleButtonClick = () => {
    
};
const initialAlertData = [
  { id: 1, type: "Error", message: "Araçta beklenmedik bir duraklama tespit edildi.", source: "Vehicle", timestamp: new Date().toISOString() },
  { id: 2, type: "Warning", message: "Yüksek hız seviyesine çıkıldı.", source: "Driver", timestamp: new Date().toISOString() },
  { id: 3, type: "Error", message: "Rotadan sapma tespit edildi.", source: "Route", timestamp: new Date().toISOString() },
  { id: 4, type: "Info", message: "Fazla CPU kullanımı tespit edildi.", source: "System", timestamp: new Date().toISOString() },
  { id: 5, type: "Warning", message: "Teslimat gecikti.", source: "Delivery", timestamp: new Date().toISOString() },
  { id: 6, type: "Info", message: "İşin tamamlanma yüzdesi eşik değerin altında.", source: "Performance", timestamp: new Date().toISOString() },
  { id: 7, type: "Error", message: "Rotadan sapma tespit edildi.", source: "Route", timestamp: new Date().toISOString() },
];

export default function FleetMonitoring() {
  const [alerts, setAlerts] = useState(initialAlertData);
  const [isPerformanceMode, setIsPerformanceMode] = useState(false); // **Performance toggle için state**
  const [activeTab, setActiveTab] = useState("Driver"); // Başlangıçta Sürücü sekmesi aktif
  const [selectedId, setSelectedId] = useState(null);
  const [showInfo, setShowInfo] = useState(true); // Info göster/gizle
  const [showWarning, setShowWarning] = useState(true); // Warning göster/gizle
  const [selectedAlert, setSelectedAlert] = useState(null);

  // Handle alert resolution
  const handleResolve = (id) => {
    alert(`Uyarı çözüldü: ID ${id}`);
    setSelectedAlert(null); // Detay görünümünü kapat
  };

  // Handle alert deletion
  const handleDelete = (id) => {
    setAlerts(alerts.filter((alert) => alert.id !== id));
    setSelectedAlert(null); // Detay görünümünü kapat
  };

  // Categorize alerts based on their type
  const categorizedAlerts = alerts.reduce((acc, alert) => {
    acc[alert.type] = acc[alert.type] ? [...acc[alert.type], alert] : [alert];
    return acc;
  }, {});

  // Render alerts by category (Info, Warning, etc.)
  const renderAlertsByCategory = (type) => {
    if (type === "Info" && !showInfo) return null;
    if (type === "Warning" && !showWarning) return null;

    const alertsOfType = categorizedAlerts[type] || [];
    return alertsOfType.map((alert) => (
      <Alert
        key={alert.id}
        type={alert.type}
        message={alert.message}
        source={alert.source}
        timestamp={alert.timestamp}
        onResolve={() => handleResolve(alert.id)}
        onDelete={() => handleDelete(alert.id)}
      />
    ));
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

  const renderPerformanceContent = () => {
    switch (activeTab) {
      case "Rota":
        return (
          <div>
            <h3>Rota Performansı</h3>
            {plannedRoutes.map((route) => (
              <div key={route.id} onClick={() => handleSelect(route.id)} style={getCardStyle(route.id)}>
                <p><strong>Rota:</strong> {route.name}</p>
                <ul>
                  <li>Planlanan Mesafe: 120 km / Gerçekleşen: 130 km</li>
                  <li>Planlanan Süre: 2 saat / Gerçek: 2 saat 15 dakika</li>
                  <li>Gecikme: 15 dakika</li>
                </ul>
              </div>
            ))}
          </div>
        );
      case "Araç":
        return (
          <div>
            <h3>Araç Performansı</h3>
            {vehicles.map((vehicle) => (
              <div key={vehicle.id} onClick={() => handleSelect(vehicle.id)} style={getCardStyle(vehicle.id)}>
                <p><strong>Araç:</strong> {vehicle.name}</p>
                <ul>
                  <li>Yakıt Tüketimi: {vehicle.estimatedFuel} L / Gerçek: {vehicle.actualFuel} L</li>
                  <li>Ortalama Hız: {vehicle.estimatedSpeed} km/h / Gerçek: {vehicle.actualSpeed} km/h</li>
                </ul>
              </div>
            ))}
          </div>
        );
      case "Sürücü":
        return (
          <div>
            <h3>Sürücü Performansı</h3>
            {drivers.map((driver) => (
              <div key={driver.id} onClick={() => handleSelect(driver.id)} style={getCardStyle(driver.id)}>
                <p><strong>Sürücü:</strong> {driver.name}</p>
                <ul>
                  <li>Ani Frenleme: {driver.hardBrakes}</li>
                  <li>Hız Aşımı: {driver.speedViolations}</li>
                  <li>Duraklama: {driver.stops} kez</li>
                </ul>
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
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
        <div style={{ height: "50%", marginBottom: "16px", backgroundColor: "#fff", padding: "8px", borderRadius: "8px" }}>
          <h2>Uyarılar ve İkazlar</h2>

          <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
            <label>
              <input type="checkbox" checked={showInfo} onChange={() => setShowInfo(!showInfo)} />
              Info
            </label>
            <label>
              <input type="checkbox" checked={showWarning} onChange={() => setShowWarning(!showWarning)} />
              Warning
            </label>
          </div>

          <div style={{ maxHeight: "82%", overflowY: "auto", scrollbarWidth: "none", msOverflowStyle: "none" }}>
            {/* Error her zaman gösterilir */}
            <div style={{ backgroundColor: "#fff", padding: "8px", borderRadius: "8px", marginBottom: "12px" }}>
              <h3>Error</h3>
              {renderAlertsByCategory("Error")}
            </div>

            {/* Warning sadece kullanıcı isterse gösterilir */}
            {showWarning && (
              <div style={{ backgroundColor: "#fff", padding: "8px", borderRadius: "8px", marginBottom: "12px" }}>
                <h3>Warning</h3>
                {renderAlertsByCategory("Warning")}
              </div>
            )}

            {/* Info sadece kullanıcı isterse gösterilir */}
            {showInfo && (
              <div style={{ backgroundColor: "#fff", padding: "8px", borderRadius: "8px" }}>
                <h3>Info</h3>
                {renderAlertsByCategory("Info")}
              </div>
            )}

            {/* Seçilen Uyarının Detayları */}
            {selectedAlert && (
              <div style={{ position: "fixed", bottom: "16px", left: "50%", transform: "translateX(-50%)", backgroundColor: "#fff", padding: "20px", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", width: "300px" }}>
                <h3>{selectedAlert.type} Detayları</h3>
                <p><strong>Mesaj:</strong> {selectedAlert.message}</p>
                <p><strong>Kaynak:</strong> {selectedAlert.source}</p>
                <p><strong>Zaman:</strong> {new Date(selectedAlert.timestamp).toLocaleString()}</p>
                
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "16px" }}>
                  <button onClick={() => handleResolve(selectedAlert.id)} style={{ padding: "8px 16px", backgroundColor: "green", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                    Çözüldü
                  </button>
                  <button onClick={() => handleDelete(selectedAlert.id)} style={{ padding: "8px 16px", backgroundColor: "red", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                    Sil
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>


        <div style={{ height: "50%", marginBottom: "16px", backgroundColor: "#fff", padding: "8px", borderRadius: "8px" }}>
          <h2 style={{ marginBottom: "12px" }}>Performans İzleme</h2>
          <div style={{ maxHeight: "80%", overflowY: "auto", scrollbarWidth: "none", msOverflowStyle: "none" }}>
            {/* Hiding scrollbar in Webkit-based browsers (Chrome, Safari) */}
            <style>
              {`
                .scrollable-div::-webkit-scrollbar {
                  display: none;
                }
              `}
            </style>
            <label style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <input type="checkbox" checked={isPerformanceMode} onChange={() => setIsPerformanceMode(!isPerformanceMode)} />
              Performans Modu
            </label>

          {isPerformanceMode && (
            <>
              <div style={{ display: "flex", justifyContent: "space-around", margin: "16px 0" }}>
                {["Rota", "Araç", "Sipariş", "Sürücü"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      padding: "8px 16px",
                      cursor: "pointer",
                      backgroundColor: activeTab === tab ? "#007BFF" : "#ccc",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px",
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div>{renderPerformanceContent()}</div>
            </>
          )}{!isPerformanceMode && (
            <>
              <div style={{ display: "flex", justifyContent: "space-around", margin: "16px 0" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                Route 1: Rotadaki işin % 70'i tamamlandı.
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                Route 2: Rotadaki işin % 100'ü tamamlandı.
                </label>
              </div>

              <div>{renderPerformanceContent()}</div>
            </>
          )}
          </div>
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
