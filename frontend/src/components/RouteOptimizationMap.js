// RouteOptimizationMap.js
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayersControl, LayerGroup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import vehicleIconImg from '../assets/icons/vehicle.png';
import stationIconImg from '../assets/icons/station.png';
import orderIconImg from '../assets/icons/order.png';

export default function RouteOptimizationMap({ vehicles, chargingStations, routeColors, orders, plannedRoutes, completedRoutes, traffic, height }) {
  const vehicleIcon = new L.Icon({ iconUrl: vehicleIconImg, iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32] });
  const stationIcon = new L.Icon({ iconUrl: stationIconImg, iconSize: [24, 24], iconAnchor: [12, 24], popupAnchor: [0, -24] });
  const orderIcon = new L.Icon({ iconUrl: orderIconImg, iconSize: [28, 28], iconAnchor: [14, 28], popupAnchor: [0, -28] });

  return (
    <MapContainer center={[39.750745, 30.482254]} zoom={16} style={{ height: `${height}px`, borderRadius: '12px', overflow: 'hidden' }}>
      <LayersControl position="topright">
        <LayersControl.BaseLayer checked name="OpenStreetMap">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        </LayersControl.BaseLayer>

        <LayersControl.Overlay name="Araçlar">
          <LayerGroup>
            {vehicles.map((vehicle) => (
              <Marker key={vehicle.id} position={vehicle.position} icon={vehicleIcon}>
                <Popup>
                  <div>
                    <p>Araç ID: {vehicle.name}</p>
                    <p>Velocity: {vehicle.velocity} km/h</p>
                    <p>Charge: %{vehicle.soc}</p>
                    <p>Payload: {vehicle.payload} kg</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </LayerGroup>
        </LayersControl.Overlay>

        <LayersControl.Overlay name="Şarj İstasyonları">
          <LayerGroup>
            {chargingStations.map((station) => (
              <Marker key={station.id} position={station.position} icon={stationIcon}>
                <Popup>Charging Station {station.id}</Popup>
              </Marker>
            ))}
          </LayerGroup>
        </LayersControl.Overlay>

        <LayersControl.Overlay name="Bekleyen Aktif Talepler (Planlanmamış)">
          <LayerGroup>
            {orders.filter(order => order.status === 'Pending').map((order) => (
              <Marker key={order.id} position={order.position} icon={orderIcon}>
                <Popup>Order ID: {order.id} - Bekliyor</Popup>
              </Marker>
            ))}
          </LayerGroup>
        </LayersControl.Overlay>

        <LayersControl.Overlay name="Dağıtım Bekleyen Talepler (Atama Yapılmış)">
          <LayerGroup>
            {orders.filter(order => order.status === 'Planned').map((order) => (
              <Marker key={order.id} position={order.position} icon={orderIcon}>
                <Popup>Order ID: {order.id} - Dağıtım Bekliyor</Popup>
              </Marker>
            ))}
          </LayerGroup>
        </LayersControl.Overlay>

        <LayersControl.Overlay name="Planlanmış Araç Rotaları (Kalan Rota)">
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
              />
            ))}
          </LayerGroup>
        </LayersControl.Overlay>

        <LayersControl.Overlay name="Gezilmiş Rotalar (Tamamlanan)">
          <LayerGroup>
            {completedRoutes.map((route, index) => (
              <Polyline
                key={index}
                positions={route.positions}
                color="green"
                weight={4}
                smoothFactor={2}
                opacity={0.9}
                lineCap="round"
                lineJoin="round"
                dashArray="5,5"
              />
            ))}
          </LayerGroup>
        </LayersControl.Overlay>

        <LayersControl.Overlay name="Trafik Yoğunluğu (Etki Alanı)">
          <LayerGroup>
            {traffic.map((route, index) => (
              <Polyline
                key={index}
                positions={route.positions}
                color="red"
                weight={3}
                smoothFactor={2}
                opacity={0.7}
                lineCap="round"
                lineJoin="round"
                dashArray="10,10"
              />
            ))}
          </LayerGroup>
        </LayersControl.Overlay>
      </LayersControl>
    </MapContainer>
  );
}
