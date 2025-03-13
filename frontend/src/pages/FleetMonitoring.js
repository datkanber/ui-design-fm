import React, { useState } from "react";
import FleetMonitoringMap from "../components/FleetMonitoring/FleetMonitoringMap";
import FleetMonitoringPerformanceMap from "../components/FleetMonitoring/FleetMonitoringPerformanceMap";
import { vehicles } from "../data/vehicles";
import { chargingStations } from "../data/chargingStations";
import { orders } from "../data/orders";
import { routes } from "../data/routes";
import { drivers } from "../data/drivers";
import Alert from "../components/FleetMonitoring/FM_AlertPanel"; // Import Alert component
import "../assets/styles/global.css";
import "leaflet/dist/leaflet.css";



// Example of different types of alerts
const initialAlertData = [
  {
    id: 1,
    type: "Critical Failure",
    message: "Araçta beklenmedik bir duraklama tespit edildi.",
    details: "Araç, beklenmedik bir duraklama yaptı. Lütfen kontrol edin.",
    source: "Vehicle", // Example of Vehicle Related error
    timestamp: new Date().toISOString(), // Current timestamp
  },
  {
    id: 2,
    type: "Error",
    message: "Yüksek hız seviyesine çıkıldı.",
    details: "Araç hızı 120 km/s. Araç belirlenen hız limitini aştı. Lütfen sürücüyü uyarın.",
    source: "Driver", // Example of Driver Related error
    timestamp: new Date().toISOString(),
  },
  {
    id: 3,
    type: "Critical Failure",
    message: "Rotadan sapma tespit edildi.",
    details: "Araç, belirlenen rota dışına çıktı. Lütfen sürücüyü bilgilendirin.",
    source: "Route", // Example of Route Related alert
    timestamp: new Date().toISOString(),
  },
  {
    id: 4,
    type: "Alert",
    message: "Fazla CPU kullanımı tespit edildi.",
    details: "Sistem, belirlenen CPU kullanım limitini aştı. Sistem performansını izleyin.",
    source: "System", // Example of System alert
    timestamp: new Date().toISOString(),
  },
  {
    id: 5,
    type: "Error",
    message: "Teslimat gecikti.",
    details: "Teslimat, belirlenen süreden fazla gecikti. Lütfen müşteri ile iletişime geçin.",
    source: "Delivery", // Example of Delivery issue
    timestamp: new Date().toISOString(),
  },
  {
    id: 6,
    type: "Alert",
    message: "İşin tamamlanma yüzdesi eşik değerin altında.",
    details: "Tamamlanan iş yüzdesi, %5 oranda eşik değerin altına düştü.",
    source: "Performance", // Example of Performance alert
    timestamp: new Date().toISOString(),
  },
];

export default function FleetMonitoring() {
  const [alerts, setAlerts] = useState(initialAlertData);
  const [isPerformanceMode, setIsPerformanceMode] = useState(false); // **Performance toggle için state**
  const [activeTab, setActiveTab] = useState("Driver"); // Başlangıçta Sürücü sekmesi aktif
  const [selectedId, setSelectedId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleButtonClick = () => {
    
  };

  // Function to mark an alert as solved
  const resolveAlert = (id) => {
    setAlerts((prevAlerts) => prevAlerts.filter((alert) => alert.id !== id));
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
      {/* Right Side - Sidebar */}
      <div style={{ flex: 1, padding: "16px", backgroundColor: "#f0f0f0", height: "100vh" }}>
        {/* Alerts Section */}
        <div style={{ height: "50%", marginBottom: "16px", backgroundColor: "#fff", padding: "8px", borderRadius: "8px" }}>
          <h2 style={{ marginBottom: "12px" }}>Uyarılar ve İkazlar</h2>
          <div style={{ maxHeight: "80%", overflowY: "auto", scrollbarWidth: "none", msOverflowStyle: "none" }}>
            {/* Hiding scrollbar in Webkit-based browsers (Chrome, Safari) */}
            <style>
              {`
                .scrollable-div::-webkit-scrollbar {
                  display: none;
                }
              `}
            </style>
            {/* Rendering alerts */}
            {alerts.map((alert) => (
              <div key={alert.id}>
                <Alert
                  type={alert.type}
                  message={alert.message}
                  details={alert.details}
                  source={alert.source} // Passing the source prop to Alert component
                  timestamp={alert.timestamp} // Passing the timestamp prop
                />
              </div>
            ))}
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
