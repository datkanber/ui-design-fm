// RouteOptimization.js
import React, { useState } from 'react';
import OptimizationForm from '../components/OptimizationForm';
import RouteOptimizationMap from '../components/RouteOptimizationMap';
import CustomerPool from '../components/CustomerPool';
import { vehicles as staticVehicles } from '../data/vehicles';
import { chargingStations as staticChargingStations } from '../data/chargingStations';
import { orders as staticOrders } from '../data/orders';
import { routes as staticRoutes } from '../data/routes';
import { customers as staticCustomers } from '../data/customers';
import '../assets/styles/global.css';
import 'leaflet/dist/leaflet.css';

export default function RouteOptimization() {
  const [algorithm, setAlgorithm] = useState('Simulated Annealing');
  const [iterationNumber, setIterationNumber] = useState(100);
  const [initialTemperature, setInitialTemperature] = useState(1000);
  const [alpha, setAlpha] = useState(0.95);
  const [selectedVehicles, setSelectedVehicles] = useState([]);

  const routeColors = {
    'Simulated Annealing': 'blue',
    'Tabu Search': 'green',
    'OR-Tools': 'red'
  };

  const plannedRoutes = (staticRoutes[algorithm] || []).map(r => ({ positions: r.path || [] }));
  const completedRoutes = (staticRoutes['Completed'] || []).map(r => ({ positions: r.path || [] }));
  const traffic = (staticRoutes['Traffic'] || []).map(r => ({ positions: r.path || [] }));

  return (
    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'stretch' }}>
        <div style={{ flex: 1, minWidth: '300px' }}>
          <OptimizationForm
            algorithm={algorithm}
            setAlgorithm={setAlgorithm}
            iterationNumber={iterationNumber}
            setIterationNumber={setIterationNumber}
            initialTemperature={initialTemperature}
            setInitialTemperature={setInitialTemperature}
            alpha={alpha}
            setAlpha={setAlpha}
            vehicles={staticVehicles}
            selectedVehicles={selectedVehicles}
            setSelectedVehicles={setSelectedVehicles}
          />
        </div>
        <div style={{ flex: 3}}>
          <RouteOptimizationMap
            vehicles={staticVehicles}
            chargingStations={staticChargingStations}
            routeColors={routeColors}
            orders={staticOrders}
            plannedRoutes={plannedRoutes}
            completedRoutes={completedRoutes}
            traffic={traffic}
          />
        </div>
        <div style={{ flex: 1, minWidth: '250px' }}>
          <CustomerPool customers={staticCustomers} />
        </div>
      </div>
    </div>
  );
}