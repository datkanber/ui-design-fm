import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, LayersControl, LayerGroup, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../../assets/styles/global.css";
import arrowRight from "../../assets/icons/arrow_right.png";
import arrowLeft from "../../assets/icons/arrow_left.png";
import arrowUp from "../../assets/icons/arrow_up.png";
import arrowDown from "../../assets/icons/arrow_down.png";
import stationIconImg from "../../assets/icons/station.png";
import orderIconImg from "../../assets/icons/order.png";
import ordercanceled from "../../assets/icons/order2.png";
import orderdelivered from "../../assets/icons/order3.png";
import orderontheway from "../../assets/icons/order4.png";
import orderrequested from "../../assets/icons/order7.png";
import truck from "../../assets/icons/vehicle.png";
import check from "../../assets/icons/check.png";
import cancel from "../../assets/icons/cancel.png";
import waiting from "../../assets/icons/waiting.png";
import stationRed from "../../assets/icons/station_red.png";
import "../../assets/styles/RouteInfoPanel.css";
import RouteDetailPanel from "./FM_RouteDetailPanel.js"; 


export default function FleetMonitoringPerformanceMap({ vehicles, chargingStations, orders, plannedRoutes, completedRoutes, routeColors, height = 900 }) {
  const [selectedRoute, setSelectedRoute] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [isRouteVisible, setIsRouteVisible] = useState(false); // Yeni state

  const handleRouteClick = (route, vehicle) => {
    setSelectedRoute({
      vehicle: vehicle.name || "Bilinmiyor",
      stops: route.stops || [],
    });
    setIsPanelOpen(true);
    setIsRouteVisible(true);  // Rota tıklandığında görünür yapıyoruz
  };
  // eslint-disable-next-line no-unused-vars
  const handleStopContainerClose = () => {
    setIsRouteVisible(false);  // Stop container'ını gizlemek için state'i false yapıyoruz
  };
  
  const calculateBearing = (start, end) => {
    if (!start || !end) return 0;
    const lat1 = (start[0] * Math.PI) / 180;
    const lon1 = (start[1] * Math.PI) / 180;
    const lat2 = (end[0] * Math.PI) / 180;
    const lon2 = (end[1] * Math.PI) / 180;
    const dLon = lon2 - lon1;
    const y = Math.sin(dLon) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
    const bearing = (Math.atan2(y, x) * 180) / Math.PI;
    return (bearing + 360) % 360;
  };

  const getArrowIcon = (angle) => {
    let arrowImg = arrowRight;
    if (angle >= 45 && angle < 135) arrowImg = arrowUp;
    else if (angle >= 135 && angle < 225) arrowImg = arrowLeft;
    else if (angle >= 225 && angle < 315) arrowImg = arrowDown;

    return new L.divIcon({
      html: `<img src='${arrowImg}' style='width: 32px; height: 32px;' />`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      className: "arrow-icon",
    });
  };
  // eslint-disable-next-line no-unused-vars
    const getStatusIcon = (status) => {
    if (status === "DELIVERED") {
      return <img src={check} alt="Delivered" style={{ width: '20px', height: '20px' }} />;
    } else if (status === "ON THE WAY") {
      return <img src={waiting} alt="Now" style={{ width: '20px', height: '20px' }} />;
    }else if (status === "CANCELLED") {
      return <img src={cancel} alt="Now" style={{ width: '20px', height: '20px' }} />;
    } else if (status === "NOW") {
      return <img src={truck} alt="Now" style={{ width: '20px', height: '20px' }} />;
    } else if (status === "ON THE WAY") {
      return <img src={waiting} alt="Now" style={{ width: '20px', height: '20px' }} />;
    }
    return null; // Default case for when the status does not match any condition
  };
// eslint-disable-next-line no-unused-vars
  const getBorderColor = (status) => {
    switch (status) {
      case "DELIVERED":
        return "green";  // Delivered status için yeşil
      case "NOW":
        return "Orange";  // Now status için mavi
      case "ON THE WAY":
        return "orange";  // On the way status için turuncu
      case "CANCELLED":
        return "red";  // Cancelled status için kırmızı
      default:
        return "gray";  // Diğer tüm durumlar için gri
    }
  };

  return (
    <div>
    <MapContainer center={[39.750745, 30.482254]} zoom={16} style={{ height: `${height}px`, borderRadius: "12px", overflow: "hidden" }}>
      <LayersControl position="topright">
        <LayersControl.BaseLayer checked name="OpenStreetMap">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        </LayersControl.BaseLayer>

        
        <LayersControl.Overlay name="Araçlar">
          <LayerGroup>
            {vehicles.map((vehicle, index) => {
              const nextPos = plannedRoutes[index]?.positions[1] || vehicle.position;
              const angle = calculateBearing(vehicle.position, nextPos);
              return (
                <Marker key={vehicle.id} position={vehicle.position} icon={getArrowIcon(angle)}>
                  <Popup>
                    <p><strong>Araç:</strong> {vehicle.name}</p>
                    <p><strong>Kalan Enerji:</strong> {vehicle.soc} km/h</p>
                    <p><strong>--Son 10m'de Harcanan enerji Dağılımı---</strong></p>
                    <p><strong>Eğim</strong> %{vehicle.slope}</p>
                    <p><strong>Trafik:</strong> %{vehicle.traffic} </p>
                    <p><strong>Sürücü Karakteristiği:</strong> %{vehicle.driverCharacter}</p>
                  </Popup>
                </Marker>
              );
            })}
          </LayerGroup>
        </LayersControl.Overlay>

        <LayersControl.Overlay name="Şarj İstasyonları">
          <LayerGroup>
            {chargingStations.map((station) => {
              let iconUrl = stationIconImg; // Default icon
              
              // Change icon and color based on the station's status
              if (station.status === "occupied") {
                iconUrl = stationRed;
              }

              // Use the color/icon in the marker
              return (
                <Marker
                  key={station.id}
                  position={station.position}
                  icon={new L.Icon({ iconUrl, iconSize: [24, 24], iconAnchor: [12, 12] })}
                >
                  <Popup>
                    <p><strong>İstasyon:</strong> {station.id}</p>
                    <p><strong>Kullanım sıklığı:</strong> %20</p>
                    <p><strong>Şarj hızı </strong> 200 w/s </p>
                  </Popup>
                </Marker>
              );
            })}
          </LayerGroup>
        </LayersControl.Overlay>

        <LayersControl.Overlay name="All Orders">
          <LayerGroup>
            {orders.map((order) => {
              let orderIconImg = order; // Default icon for unrecognized statuses

              // Assign specific icons based on the order's status
              if (order.status === "Pending") {
                orderIconImg = "path/to/pending_icon.png"; // Replace with your Pending icon
              } else if (order.status === "Requested") {
                orderIconImg = orderrequested; // Replace with your Requested icon
              } else if (order.status === "On the way") {
                orderIconImg = orderontheway; // Replace with your On the way icon
              } else if (order.status === "Cancelled") {
                orderIconImg = ordercanceled; // Replace with your Cancelled icon
              } else if (order.status === "Delivered") {
                orderIconImg = orderdelivered; // Replace with your Delivered icon
              }else{
                orderIconImg = orderdelivered;
              }

              return (
                <Marker
                  key={order.id}
                  position={order.position}
                  icon={new L.Icon({ iconUrl: orderIconImg, iconSize: [28, 28] })}
                >
                  <Popup>
                    <p><strong>Order ID:</strong> {order.id}</p>
                    <p><strong>Status:</strong> {order.status}</p>
                    <p><strong>Vehicle ID:</strong> {order.vehicleId}</p>
                  </Popup>
                </Marker>
              );
            })}
          </LayerGroup>
        </LayersControl.Overlay>


        <LayersControl.Overlay name="Bekleyen Talepler">
          <LayerGroup>
            {orders.filter((order) => order.status === "Pending").map((order) => (
              <Marker key={order.id} position={order.position} icon={new L.Icon({ iconUrl: orderIconImg, iconSize: [28, 28] })}>
                <Popup>Talep ID: {order.id} - Bekliyor</Popup>
              </Marker>
            ))}
          </LayerGroup>
        </LayersControl.Overlay>

        
        <LayersControl.Overlay name="Planlanmış Rotalar">
            <LayerGroup>
              {plannedRoutes.map((route, index) => (
                <Polyline
                  key={index}
                  positions={route.positions}
                  color={routeColors[index] || "blue"}
                  weight={4}
                  smoothFactor={2}
                  opacity={0.9}
                  lineCap="round"
                  lineJoin="round"
                  eventHandlers={{ click: () => handleRouteClick(route, vehicles[index]) }}
                />
              ))}
            </LayerGroup>
          </LayersControl.Overlay>

          <LayersControl.Overlay name="Gezilmiş Rotalar">
            <LayerGroup>
              {completedRoutes.map((route, index) => (
                <Polyline
                key={index}
                positions={route.positions}
                color={routeColors[index] || "blue"}
                weight={4}
                smoothFactor={2}
                opacity={0.9}
                lineCap="round"
                lineJoin="round"
                eventHandlers={{
                    click: () => handleRouteClick(route, vehicles[index]),
                }}
            />            
              ))}
            </LayerGroup>
          </LayersControl.Overlay>

        </LayersControl>
      </MapContainer>

      <RouteDetailPanel selectedRoute={selectedRoute} open={Boolean(selectedRoute)} onClose={() => setSelectedRoute(null)} />
    </div>
  );
}