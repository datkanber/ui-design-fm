// src/pages/FleetMonitoring.js
import React from 'react';
import FleetMonitoringMap from '../components/FleetMonitoringMap';
import { vehicles } from '../data/vehicles';
import '../assets/styles/global.css';
import 'leaflet/dist/leaflet.css';

export default function FleetMonitoring() {
  return (
    <div style={{ padding: '16px' }}>
      <h1>Fleet Monitoring</h1>
      <FleetMonitoringMap vehicles={vehicles} />
    </div>
  );
}
