import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, LayersControl, LayerGroup, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../assets/styles/global.css";
import arrowRight from "../assets/icons/arrow_right.png";  
import arrowLeft from "../assets/icons/arrow_left.png";    
import arrowUp from "../assets/icons/arrow_up.png";        
import arrowDown from "../assets/icons/arrow_down.png";    
import stationIconImg from "../assets/icons/station.png";  
import orderIconImg from "../assets/icons/order.png";      
import RouteDetailPanel from "./RouteDetailPanel"; 

export default function RouteOptimizationMap({ vehicles, chargingStations, routeColors, orders, plannedRoutes, completedRoutes, height }) {
  const [selectedRoute, setSelectedRoute] = useState(null);

  // Aracın yönünü hesaplayan fonksiyon
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

  // Yönüne göre doğru oku seçen fonksiyon
  const getArrowIcon = (angle) => {
    let arrowImg = arrowRight;
    if (angle >= 45 && angle < 135) {
      arrowImg = arrowUp;
    } else if (angle >= 135 && angle < 225) {
      arrowImg = arrowLeft;
    } else if (angle >= 225 && angle < 315) {
      arrowImg = arrowDown;
    }

    return new L.divIcon({
      html: `<img src='${arrowImg}' style='width: 32px; height: 32px;' />`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      className: "arrow-icon",
    });
  };

  const handleRouteClick = (route, vehicle) => {
    setSelectedRoute({
      distance: "4.5 km",
      time: "13 dk",
      vehicle: vehicle.name,
    });
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
                      <div>
                        <p><strong>Araç ID:</strong> {vehicle.name}</p>
                        <p><strong>Hız:</strong> {vehicle.velocity} km/h</p>
                        <p><strong>Şarj:</strong> %{vehicle.soc}</p>
                        <p><strong>Yük:</strong> {vehicle.payload} kg</p>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </LayerGroup>
          </LayersControl.Overlay>

          <LayersControl.Overlay name="Şarj İstasyonları">
            <LayerGroup>
              {chargingStations.map((station) => (
                <Marker key={station.id} position={station.position} icon={new L.Icon({ iconUrl: stationIconImg, iconSize: [24, 24] })}>
                  <Popup>Şarj İstasyonu</Popup>
                </Marker>
              ))}
            </LayerGroup>
          </LayersControl.Overlay>

          <LayersControl.Overlay name="Bekleyen Talepler">
            <LayerGroup>
              {orders.filter(order => order.status === 'Pending').map((order) => (
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
