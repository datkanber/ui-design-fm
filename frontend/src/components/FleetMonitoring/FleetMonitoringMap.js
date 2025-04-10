import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  LayersControl,
  LayerGroup,
  Polyline,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { LeafletTrackingMarker } from "react-leaflet-tracking-marker";
import "../../assets/styles/global.css";

// import FMRouteDetailPanel from "./FM_RouteDetailPanel.js"; 

import stationIconImg from "../../assets/icons/station.png";
import orderIconImg from "../../assets/icons/order.png";
import ordercanceled from "../../assets/icons/order2.png";
import orderdelivered from "../../assets/icons/order3.png";
import orderontheway from "../../assets/icons/order4.png";
import orderrequested from "../../assets/icons/order7.png";
import truck from "../../assets/icons/car.png";
// import check from "../../assets/icons/check.png";
// import cancel from "../../assets/icons/cancel.png";
// import waiting from "../../assets/icons/waiting.png";
import stationRed from "../../assets/icons/station_red.png";
import "../../assets/styles/RouteInfoPanel.css";
import FM_RouteDetailPanel from "./FM_RouteDetailPanel.js";

export default function FleetMonitoringMap({
  vehicles,
  chargingStations,
  orders,
  plannedRoutes,
  completedRoutes,
  routeColors,
  height = 900,
}) {
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [setIsPanelOpen] = useState(false);
  const [setIsRouteVisible] = useState(false);
  const [vehiclePositions, setVehiclePositions] = useState({});
  const truckIcon = new L.Icon({
    iconUrl: truck, // truck.png'yi doğru yolda olduğundan emin olun
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
  
  const calculateBearing = (start, end) => {
    if (
      !start ||
      !end ||
      (start.lat === end.lat && start.lng === end.lng)
    ) {
      return 0;
    }

    const startLat = (start.lat * Math.PI) / 180;
    const startLng = (start.lng * Math.PI) / 180;
    const endLat = (end.lat * Math.PI) / 180;
    const endLng = (end.lng * Math.PI) / 180;

    const y = Math.sin(endLng - startLng) * Math.cos(endLat);
    const x =
      Math.cos(startLat) * Math.sin(endLat) -
      Math.sin(startLat) * Math.cos(endLat) * Math.cos(endLng - startLng);

    const bearingRad = Math.atan2(y, x);
    const bearingDeg = ((bearingRad * 180) / Math.PI + 360) % 360;

    return bearingDeg;
  };

  useEffect(() => {
    const fetchAllVehicles = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/sumo/vehicles/all");
        if (!res.ok) {
          throw new Error(
            `Network response was not ok: ${res.status} ${res.statusText}`
          );
        }
        const data = await res.json();
        console.log("Fetched vehicles:", data);
        setVehiclePositions(data);
      } catch (error) {
        console.error("Failed to fetch vehicles:", error);
      }
    };

    const interval = setInterval(fetchAllVehicles, 1000);
    return () => clearInterval(interval);
  }, []);

  const changeVehicleSpeed = (vehicleId, newSpeed) => {
    setVehiclePositions((prev) => {
      const updatedPositions = { ...prev };
      if (updatedPositions[vehicleId]) {
        updatedPositions[vehicleId] = {
          ...updatedPositions[vehicleId],
          speed: newSpeed || 20,
        };
      }
      return updatedPositions;
    });
  };

  const handleRouteClick = (route, vehicle) => {
    setSelectedRoute({
      vehicle: vehicle.name || "Bilinmiyor",
      stops: route.stops || [],
    });
    setIsPanelOpen(true);
    setIsRouteVisible(true);
  };

  // const handleStopContainerClose = () => {
  //   setIsRouteVisible(false);
  // };

  // const getStatusIcon = (status) => {
  //   switch (status) {
  //     case "DELIVERED":
  //       return <img src={check} alt="Delivered" style={{ width: 20, height: 20 }} />;
  //     case "ON THE WAY":
  //       return <img src={waiting} alt="Now" style={{ width: 20, height: 20 }} />;
  //     case "CANCELLED":
  //       return <img src={cancel} alt="Cancelled" style={{ width: 20, height: 20 }} />;
  //     case "NOW":
  //       return <img src={truck} alt="Now" style={{ width: 20, height: 20 }} />;
  //     default:
  //       return null;
  //   }
  // };

  // const getBorderColor = (status) => {
  //   switch (status) {
  //     case "DELIVERED":
  //       return "green";
  //     case "NOW":
  //       return "orange";
  //     case "ON THE WAY":
  //       return "orange";
  //     case "CANCELLED":
  //       return "red";
  //     default:
  //       return "gray";
  //   }
  // };

  return (
    <div>
      <MapContainer
        center={[39.750745, 30.482254]}
        zoom={16}
        style={{ height: `${height}px`, borderRadius: "12px", overflow: "hidden" }}
      >
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="OpenStreetMap">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          </LayersControl.BaseLayer>

          <LayersControl.Overlay checked name="Araçlar">
            <LayerGroup>
              {Object.entries(vehiclePositions).map(([vehicleId, vehicleData]) => {
                if (!vehicleData.currentPosition || !vehicleData.previousPosition) {
                  return null;
                }

                console.log("Vehicle data:", vehicleData);

                const bearing = calculateBearing(
                  vehicleData.previousPosition,
                  vehicleData.currentPosition
                );

                const position = [
                  vehicleData.currentPosition.lat,
                  vehicleData.currentPosition.lng,
                ];
                const prevPosition = [
                  vehicleData.previousPosition.lat,
                  vehicleData.previousPosition.lng,
                ];
                console.log(prevPosition);


                return (
                  <LeafletTrackingMarker
                    key={vehicleId}
                    position={position}
                    previousPosition={prevPosition}
                    duration={100}
                    rotationAngle={bearing}
                    icon={truckIcon}
                  >
                    <Popup>
                      <div>
                        <p><strong>Araç:</strong> {vehicleId}</p>
                        <p><strong>Hız:</strong> {vehicleData.speed || 20} km/h</p>
                        <p><strong>Konum:</strong> {position.map((p) => p.toFixed(5)).join(", ")}</p>
                        <p><strong>Zaman:</strong> {new Date(vehicleData.currentPosition.timestamp).toLocaleTimeString()}</p>

                        <div style={{ marginTop: "10px" }}>
                          <button
                            onClick={() =>
                              changeVehicleSpeed(vehicleId, (vehicleData.speed || 20) + 10)
                            }
                            style={{ marginRight: "5px", padding: "3px 8px", fontSize: "12px" }}
                          >
                            Hız +10
                          </button>
                          <button
                            onClick={() =>
                              changeVehicleSpeed(vehicleId, Math.max(10, (vehicleData.speed || 20) - 10))
                            }
                            style={{ marginRight: "5px", padding: "3px 8px", fontSize: "12px" }}
                          >
                            Hız -10
                          </button>
                        </div>
                      </div>
                    </Popup>
                  </LeafletTrackingMarker>
                );
              })}
            </LayerGroup>
          </LayersControl.Overlay>

          <LayersControl.Overlay name="Şarj İstasyonları">
            <LayerGroup>
              {chargingStations.map((station) => {
                let iconUrl = station.status === "occupied" ? stationRed : stationIconImg;

                return (
                  <Marker
                    key={station.id}
                    position={station.position}
                    icon={new L.Icon({ iconUrl, iconSize: [24, 24], iconAnchor: [12, 12] })}
                  >
                    <Popup>
                      <p><strong>İstasyon:</strong> {station.id}</p>
                      <p><strong>Durum:</strong> {station.status}</p>
                      <p><strong>Şarj Tipi:</strong> {station.chargingType}</p>
                    </Popup>
                  </Marker>
                );
              })}
            </LayerGroup>
          </LayersControl.Overlay>
          <LayersControl.Overlay name="Şarj İstasyonları">
                      <LayerGroup>
                        {chargingStations.map((station) => {
                          let iconUrl = stationIconImg;
                          
                          if (station.status === "occupied") {
                            iconUrl = stationRed;
                          }
          
                          return (
                            <Marker
                              key={station.id}
                              position={station.position}
                              icon={new L.Icon({ iconUrl, iconSize: [24, 24], iconAnchor: [12, 12] })}
                            >
                              <Popup>
                                <p><strong>İstasyon:</strong> {station.id}</p>
                                <p><strong>Durum:</strong> {station.status}</p>
                                <p><strong>Şarj Tipi:</strong> {station.chargingType}</p>
                              </Popup>
                            </Marker>
                          );
                        })}
                      </LayerGroup>
                    </LayersControl.Overlay>
          
                    <LayersControl.Overlay name="All Orders">
                      <LayerGroup>
                        {orders.map((order) => {
                          let orderIcon = orderIconImg;
          
                          if (order.status === "Pending") {
                            orderIcon = orderIconImg;
                          } else if (order.status === "Requested") {
                            orderIcon = orderrequested;
                          } else if (order.status === "On the way") {
                            orderIcon = orderontheway;
                          } else if (order.status === "Cancelled") {
                            orderIcon = ordercanceled;
                          } else if (order.status === "Delivered") {
                            orderIcon = orderdelivered;
                          }
          
                          return (
                            <Marker
                              key={order.id}
                              position={order.position}
                              icon={new L.Icon({ iconUrl: orderIcon, iconSize: [28, 28] })}
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
          
                    <LayersControl.Overlay checked name="Planlanmış Rotalar">
                      <LayerGroup>
                        {plannedRoutes.map((route, index) => (
                          <Polyline
                            key={index}
                            positions={route.positions}
                            color={routeColors[index] || "blue"}
                            weight={4}
                            eventHandlers={{ click: () => handleRouteClick(route, vehicles[index]) }}
                          />
                        ))}
                      </LayerGroup>
                    </LayersControl.Overlay>
          
                    <LayersControl.Overlay name="Tamamlanmış Rotalar">
                      <LayerGroup>
                        {completedRoutes.map((route, index) => (
                          <Polyline
                            key={index}
                            positions={route.positions}
                            color={routeColors[index] || "green"}
                            weight={4}
                            opacity={0.7}
                          />
                        ))}
                      </LayerGroup>
                    </LayersControl.Overlay>

        </LayersControl>
      </MapContainer>
      <FM_RouteDetailPanel selectedRoute={selectedRoute} open={Boolean(selectedRoute)} onClose={() => setSelectedRoute(null)} />

    </div>
  );
}
 