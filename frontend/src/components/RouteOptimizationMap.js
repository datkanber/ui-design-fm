import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayersControl, LayerGroup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';

import vehicleIconImg from '../assets/icons/vehicle.png';
import stationIconImg from '../assets/icons/station.png';
import orderPendingIconImg from '../assets/icons/order_pending.png';
import orderCompletedIconImg from '../assets/icons/order_completed.png';

export default function RouteOptimizationMap({ height }) {
  const [routeData, setRouteData] = useState(null);
  const [waypointData, setWaypointData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [routeResponse, waypointResponse] = await Promise.all([
          axios.get('http://localhost:5000/api/routes'),
          axios.get('http://localhost:5000/api/vehicles') // Waypoints burada çekiliyor!
        ]);

        if (routeResponse.data.length > 0 && routeResponse.data[0].Routes) {
          setRouteData(routeResponse.data[0]); 
        } else {
          setError("Rota verisi eksik.");
        }

        if (waypointResponse.data.length > 0) {
          setWaypointData(waypointResponse.data);
        }
      } catch (error) {
        console.error('API Fetch Error:', error);
        setError('Veri alınamadı.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const vehicleIcon = new L.Icon({ iconUrl: vehicleIconImg, iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32] });
  const stationIcon = new L.Icon({ iconUrl: stationIconImg, iconSize: [24, 24], iconAnchor: [12, 24], popupAnchor: [0, -24] });
  const orderPendingIcon = new L.Icon({ iconUrl: orderPendingIconImg, iconSize: [28, 28], iconAnchor: [14, 28], popupAnchor: [0, -28] });
  const orderCompletedIcon = new L.Icon({ iconUrl: orderCompletedIconImg, iconSize: [28, 28], iconAnchor: [14, 28], popupAnchor: [0, -28] });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (!routeData || !routeData.Routes) return <p>Veri bulunamadı.</p>;

  return (
    <MapContainer center={[39.750745, 30.482254]} zoom={16} style={{ height: `${height}px`, borderRadius: '12px', overflow: 'hidden' }}>
      <LayersControl position="topright">
        <LayersControl.BaseLayer checked name="OpenStreetMap">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
        </LayersControl.BaseLayer>

        {/* 🔹 Araçları Haritada Göster */}
        <LayersControl.Overlay name="Araçlar">
          <LayerGroup>
            {routeData.Routes.filter(route => route.Nodes?.length > 0).map(route => (
              <Marker key={route.VehicleId} position={[
                parseFloat(route.Nodes[0].Location.Latitude), 
                parseFloat(route.Nodes[0].Location.Longitude)
              ]} icon={vehicleIcon}>
                <Popup>
                  <div>
                    <p>Araç ID: {route.VehicleId}</p>
                    <p>Sürücü: {route.DriverId}</p>
                    <p>Mesafe: {route.PerformanceMeasure.RouteDistance} m</p>
                    <p>Süre: {route.PerformanceMeasure.RouteDuration} sn</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </LayerGroup>
        </LayersControl.Overlay>

        {/* 🔹 Rotaları Haritada Göster */}
        <LayersControl.Overlay name="Rotalar">
          <LayerGroup>
            {routeData.Routes.filter(route => route.Nodes?.length > 1).map((route, index) => {
              let sortedPositions = route.Nodes.map(node => [
                parseFloat(node.Location.Latitude), 
                parseFloat(node.Location.Longitude)
              ]).filter(pos => !isNaN(pos[0]) && !isNaN(pos[1])); 

              // **Waypoints ekleniyor (EndPoint kullanılmadan!)**
              const routeWaypoints = waypointData?.find(wp => wp.name === route.Name);
              if (routeWaypoints?.startPoint?.waypoints) {
                const waypoints = routeWaypoints.startPoint.waypoints.map(wp => [
                  parseFloat(wp.location.latitude?.$numberDouble) || 0,
                  parseFloat(wp.location.longitude?.$numberDouble) || 0
                ]);
                sortedPositions = [...sortedPositions, ...waypoints]; // Waypoints ekleniyor
              }

              return (
                <Polyline
                  key={index}
                  positions={sortedPositions}
                  color={index % 2 === 0 ? 'blue' : 'green'}
                  weight={4}
                  smoothFactor={2}
                  opacity={0.9}
                  lineCap="round"
                  lineJoin="round"
                />
              );
            })}
          </LayerGroup>
        </LayersControl.Overlay>

        {/* 🔹 Şarj İstasyonlarını Haritada Göster */}
        <LayersControl.Overlay name="Şarj İstasyonları">
          <LayerGroup>
            {routeData.Routes.flatMap(route => route.Nodes || [])
              .filter(node => node.$?.NodeType === "Depot")
              .map((station, index) => (
                <Marker key={index} position={[
                  parseFloat(station.Location.Latitude), 
                  parseFloat(station.Location.Longitude)
                ]} icon={stationIcon}>
                  <Popup>Şarj İstasyonu {station.$?.NodeId}</Popup>
                </Marker>
              ))}
          </LayerGroup>
        </LayersControl.Overlay>

        {/* 🔹 Siparişleri Haritada Göster */}
        <LayersControl.Overlay name="Siparişler">
          <LayerGroup>
            {routeData.Routes.flatMap(route => route.Nodes || [])
              .filter(node => node.$?.NodeType === "Customer")
              .map((order, index) => (
                <Marker key={index} position={[
                  parseFloat(order.Location.Latitude), 
                  parseFloat(order.Location.Longitude)
                ]} 
                  icon={order.ServiceInformation.ArrivalTime > 0 ? orderCompletedIcon : orderPendingIcon}>
                  <Popup>
                    <p>Sipariş ID: {order.$?.NodeId}</p>
                    <p>Durum: {order.ServiceInformation.ArrivalTime > 0 ? "Tamamlandı" : "Beklemede"}</p>
                  </Popup>
                </Marker>
              ))}
          </LayerGroup>
        </LayersControl.Overlay>
      </LayersControl>
    </MapContainer>
  );
}
