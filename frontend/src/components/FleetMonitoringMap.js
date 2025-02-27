// src/components/FleetMonitoringMap.js
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayerGroup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function FleetMonitoringMap({ vehicles }) {
  const vehicleIcon = new L.Icon({
    iconUrl: require('../assets/icons/vehicle.png'),
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });

  return (
    <MapContainer center={[51.505, -0.09]} zoom={13} style={{ height: '600px', width: '100%', borderRadius: '12px', overflow: 'hidden' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <LayerGroup>
        {vehicles.map((vehicle) => (
          <Marker key={vehicle.id} position={vehicle.position} icon={vehicleIcon}>
            <Popup>{vehicle.name} - SoC: {vehicle.soc}%</Popup>
          </Marker>
        ))}
      </LayerGroup>
    </MapContainer>
  );
}
