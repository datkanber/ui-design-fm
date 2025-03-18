import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, LayersControl, LayerGroup, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { LeafletTrackingMarker } from "react-leaflet-tracking-marker";
import "../assets/styles/global.css";
import stationIconImg from "../assets/icons/station.png";
import orderIconImg from "../assets/icons/order.png";
import ordercanceled from "../assets/icons/order2.png";
import orderdelivered from "../assets/icons/order3.png";
import orderontheway from "../assets/icons/order4.png";
import orderrequested from "../assets/icons/order7.png";
import truck from "../assets/icons/arrow_up.png";
import check from "../assets/icons/check.png";
import cancel from "../assets/icons/cancel.png";
import waiting from "../assets/icons/waiting.png";
import stationRed from "../assets/icons/station_red.png";
import stopsData from "../data/stops.js";
import "../assets/styles/RouteInfoPanel.css";

export default function FleetMonitoringMap({ vehicles, chargingStations, orders, plannedRoutes, completedRoutes, routeColors, height = 900 }) {
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isRouteVisible, setIsRouteVisible] = useState(false);
  
  const intervalRef = useRef(null);
  
  // Initialize vehicle positions
  const [vehiclePositions, setVehiclePositions] = useState(
    vehicles.map((vehicle, index) => {
      const route = plannedRoutes[index];
      const initialPosition = route && route.positions && route.positions.length > 0 
        ? route.positions[0] 
        : vehicle.position;
        
      return {
        id: vehicle.id,
        position: initialPosition,
        prevPosition: initialPosition,
        angle: 0,
        routeIndex: 0,
        routeProgress: 0,
        speed: vehicle.velocity || 20,
        active: true
      };
    })
  );

  // Calculate bearing between two points in degrees
  const calculateBearing = (start, end) => {
    if (!start || !end || 
        (start[0] === end[0] && start[1] === end[1])) {
      return 0;
    }
    
    // Convert from degrees to radians
    const startLat = start[0] * Math.PI / 180;
    const startLng = start[1] * Math.PI / 180;
    const endLat = end[0] * Math.PI / 180;
    const endLng = end[1] * Math.PI / 180;
    
    // Calculate bearing
    const y = Math.sin(endLng - startLng) * Math.cos(endLat);
    const x = Math.cos(startLat) * Math.sin(endLat) -
              Math.sin(startLat) * Math.cos(endLat) * Math.cos(endLng - startLng);
    
    const bearingRad = Math.atan2(y, x);
    const bearingDeg = (bearingRad * 180 / Math.PI + 360) % 360; // Convert to degrees
    
    return bearingDeg;
  };

  // Move vehicles along their routes
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(() => {
      setVehiclePositions(prevPositions => {
        return prevPositions.map((vehicleData, vehicleIndex) => {
          if (!vehicleData.active) {
            return vehicleData;
          }
          
          const route = plannedRoutes[vehicleIndex];
          
          if (!route || !route.positions || route.positions.length < 2) {
            return { ...vehicleData, active: false };
          }
          
          const currentRouteIndex = Math.floor(vehicleData.routeIndex);
          const nextRouteIndex = currentRouteIndex + 1;
          
          if (nextRouteIndex >= route.positions.length) {
            return { ...vehicleData, active: false };
          }
          
          const currentPosition = route.positions[currentRouteIndex];
          const nextPosition = route.positions[nextRouteIndex];
          
          const segmentDistance = calculateDistance(currentPosition, nextPosition);
          const updateIntervalInHours = 1 / (60 * 60);
          const distanceTraveledInKm = vehicleData.speed * updateIntervalInHours;
          const distanceTraveledInMeters = distanceTraveledInKm * 1000;
          
          const segmentProgress = vehicleData.routeIndex - currentRouteIndex;
          const additionalProgress = segmentDistance > 0 ? distanceTraveledInMeters / segmentDistance : 0;
          let newRouteIndex = currentRouteIndex + segmentProgress + additionalProgress;
          let newActive = true;
          
          if (newRouteIndex >= nextRouteIndex) {
            if (nextRouteIndex >= route.positions.length - 1) {
              newRouteIndex = route.positions.length - 1;
              newActive = false;
            }
          }
          
          const newPosition = interpolatePosition(
            route.positions[Math.floor(newRouteIndex)],
            route.positions[Math.min(Math.floor(newRouteIndex) + 1, route.positions.length - 1)],
            newRouteIndex - Math.floor(newRouteIndex)
          );
          
          // Calculate bearing between current and next position for correct rotation
          const bearing = calculateBearing(vehicleData.position, newPosition);
          
          return {
            ...vehicleData,
            prevPosition: vehicleData.position,
            position: newPosition,
            angle: bearing,
            routeIndex: newRouteIndex,
            routeProgress: route.positions.length > 1 ? newRouteIndex / (route.positions.length - 1) : 1,
            active: newActive
          };
        });
      });
    }, 1000);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [plannedRoutes]);

  // Interpolate between two positions
  const interpolatePosition = (pos1, pos2, ratio) => {
    if (!pos1 || !pos2) return pos1 || [0, 0];
    return [
      pos1[0] + (pos2[0] - pos1[0]) * ratio,
      pos1[1] + (pos2[1] - pos1[1]) * ratio
    ];
  };

  // Calculate distance between two points
  const calculateDistance = (pos1, pos2) => {
    if (!pos1 || !pos2) return 0;
    
    const R = 6371e3; // Earth's radius in meters
    const φ1 = pos1[0] * Math.PI / 180;
    const φ2 = pos2[0] * Math.PI / 180;
    const Δφ = (pos2[0] - pos1[0]) * Math.PI / 180;
    const Δλ = (pos2[1] - pos1[1]) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return distance;
  };

  // Change vehicle speed
  const changeVehicleSpeed = (vehicleId, newSpeed) => {
    setVehiclePositions(prevPositions => 
      prevPositions.map(vehicle => 
        vehicle.id === vehicleId ? {...vehicle, speed: newSpeed} : vehicle
      )
    );
  };

  // Reset vehicle progress
  const resetVehicleProgress = (vehicleId) => {
    setVehiclePositions(prevPositions => 
      prevPositions.map(vehicle => 
        vehicle.id === vehicleId ? {
          ...vehicle, 
          routeIndex: 0, 
          position: plannedRoutes[prevPositions.findIndex(v => v.id === vehicleId)]?.positions[0] || vehicle.position,
          prevPosition: plannedRoutes[prevPositions.findIndex(v => v.id === vehicleId)]?.positions[0] || vehicle.position,
          active: true
        } : vehicle
      )
    );
  };

  const handleRouteClick = (route, vehicle) => {
    setSelectedRoute({
      vehicle: vehicle.name || "Bilinmiyor",
      stops: route.stops || [],
    });
    setIsPanelOpen(true);
    setIsRouteVisible(true);
  };
  
  const handleStopContainerClose = () => {
    setIsRouteVisible(false);
  };
  
  const getStatusIcon = (status) => {
    if (status === "DELIVERED") {
      return <img src={check} alt="Delivered" style={{ width: '20px', height: '20px' }} />;
    } else if (status === "ON THE WAY") {
      return <img src={waiting} alt="Now" style={{ width: '20px', height: '20px' }} />;
    } else if (status === "CANCELLED") {
      return <img src={cancel} alt="Now" style={{ width: '20px', height: '20px' }} />;
    } else if (status === "NOW") {
      return <img src={truck} alt="Now" style={{ width: '20px', height: '20px' }} />;
    }
    return null;
  };

  const getBorderColor = (status) => {
    switch (status) {
      case "DELIVERED":
        return "green";
      case "NOW":
        return "Orange";
      case "ON THE WAY":
        return "orange";
      case "CANCELLED":
        return "red";
      default:
        return "gray";
    }
  };

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
              {vehiclePositions.map((vehicle) => (
                <LeafletTrackingMarker
                  key={vehicle.id}
                  position={vehicle.position}
                  previousPosition={vehicle.prevPosition}
                  duration={1000}
                  rotationAngle={vehicle.angle}
                  icon={L.divIcon({
                    className: "custom-icon",
                    html: `<div style="display: flex; justify-content: center; align-items: center; width: 28px; height: 28px;">
                              <img src="${truck}" style="width: 28px; height: 28px;" />
                           </div>`,
                    iconSize: [28, 28],
                    iconAnchor: [14, 14], // Center the icon
                  })}
                >
                  <Popup>
                    <div>
                      <p><strong>Araç:</strong> {vehicle.id}</p>
                      <p><strong>Hız:</strong> {vehicle.speed} km/h</p>
                      <p><strong>Konum:</strong> {vehicle.position.map(p => p.toFixed(5)).join(', ')}</p>
                      <p><strong>Rota İlerlemesi:</strong> {Math.min(100, Math.round(vehicle.routeProgress * 100))}%</p>
                      <p><strong>Durum:</strong> {vehicle.active ? "Aktif" : "Duruyor"}</p>
                      
                      <div style={{ marginTop: '10px' }}>
                        <button 
                          onClick={() => changeVehicleSpeed(vehicle.id, vehicle.speed + 10)}
                          style={{ marginRight: '5px', padding: '3px 8px', fontSize: '12px' }}
                        >
                          Hız +10
                        </button>
                        <button 
                          onClick={() => changeVehicleSpeed(vehicle.id, Math.max(10, vehicle.speed - 10))}
                          style={{ marginRight: '5px', padding: '3px 8px', fontSize: '12px' }}
                        >
                          Hız -10
                        </button>
                        <button 
                          onClick={() => resetVehicleProgress(vehicle.id)}
                          style={{ padding: '3px 8px', fontSize: '12px' }}
                        >
                          Yeniden Başlat
                        </button>
                      </div>
                    </div>
                  </Popup>
                </LeafletTrackingMarker>
              ))}
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
      
      {/* Araç Durumu Denetim Paneli */}
      <div style={{ 
        position: 'absolute', 
        top: '10px', 
        right: '10px', 
        zIndex: 1000, 
        backgroundColor: 'white', 
        padding: '10px', 
        borderRadius: '5px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
      }}>
        <h4 style={{ margin: '0 0 10px 0' }}>Araç Kontrolü</h4>
        {vehiclePositions.map((vehicle) => (
          <div key={vehicle.id} style={{ marginBottom: '10px' }}>
            <strong>Araç {vehicle.id}</strong>: {vehicle.active ? "Hareket Ediyor" : "Duruyor"} - %{Math.min(100, Math.round(vehicle.routeProgress * 100))}
            <div>
              <button 
                onClick={() => resetVehicleProgress(vehicle.id)}
                style={{ marginRight: '5px', padding: '2px 5px', fontSize: '12px' }}
              >
                Yeniden Başlat
              </button>
              <button 
                onClick={() => changeVehicleSpeed(vehicle.id, vehicle.speed + 10)}
                style={{ marginRight: '5px', padding: '2px 5px', fontSize: '12px' }}
              >
                Hız +10
              </button>
              <button 
                onClick={() => changeVehicleSpeed(vehicle.id, Math.max(10, vehicle.speed - 10))}
                style={{ padding: '2px 5px', fontSize: '12px' }}
              >
                Hız -10
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {isRouteVisible && (
        <div
          className="overlay-container"
          style={{
            position: "absolute",
            bottom: "65px", 
            left: "63%",
            transform: "translateX(-50%)",
            zIndex: 1000,
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
            maxWidth: "70%",
            overflowX: "scroll",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: "20px",
            }}
          >
            {stopsData[0].stops.map((stop, index) => (
              <div
                key={index}
                className="stop-card"
                style={{
                  flex: "0 0 auto",
                  padding: "10px",
                  backgroundColor: "#f4f4f4",
                  borderRadius: "8px",
                  minWidth: "200px",
                  border: `2px solid ${getBorderColor(stop.status)}`,
                }}
              >
                <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '40px' }}>
                  {getStatusIcon(stop.status)} 
                </div>
                <h4>{stop.title}</h4>
                <p>{stop.address}</p>
                <p>{stop.timeWindow}</p>
                <p>{stop.amount} items</p>
                <p>{stop.clientName}</p>
              </div>
            ))}
          </div>
          <button onClick={handleStopContainerClose} style={{ marginRight: "20px", padding: "10px" }}>
            Kapat
          </button>
        </div>
      )}
    </div>
  );
}