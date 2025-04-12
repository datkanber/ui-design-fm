import React, { useState } from 'react';
import { vehicles as staticVehicles } from '../data/vehicles';
import { chargingStations as staticChargingStations } from '../data/chargingStations';
import { orders as staticOrders } from '../data/orders';
import { routes as staticRoutes } from '../data/routes';
import '../assets/styles/global.css';
import 'leaflet/dist/leaflet.css';

import Layout from "../components/RouteOptimization/Layout"; // 🔥 Sadece gerekli bileşeni import ediyoruz.
import { customers as staticCustomers } from "../data/customers";

export default function RouteOptimization() {
  const [algorithm, setAlgorithm] = useState("Simulated Annealing");
  const [comparisonResults, setComparisonResults] = useState([]);
  const [openComparison, setOpenComparison] = useState(false);
  const [openOptimization, setOpenOptimization] = useState(false);

  const routeColors = {
    "Simulated Annealing": "blue",
    "Tabu Search": "green",
    "OR-Tools": "red",
  };

  const plannedRoutes = staticRoutes[algorithm] ? staticRoutes[algorithm].map(r => ({ positions: r.path || [] })) : [];
  const completedRoutes = staticRoutes["Completed"] ? staticRoutes["Completed"].map(r => ({ positions: r.path || [] })) : [];
  const traffic = staticRoutes["Traffic"] ? staticRoutes["Traffic"].map(r => ({ positions: r.path || [] })) : [];

  const runComparison = () => {
    const results = [
      { algorithm: "Simulated Annealing", time: Math.floor(Math.random() * 1000), cost: Math.floor(Math.random() * 500) },
      { algorithm: "Tabu Search", time: Math.floor(Math.random() * 1000), cost: Math.floor(Math.random() * 500) },
      { algorithm: "OR-Tools", time: Math.floor(Math.random() * 1000), cost: Math.floor(Math.random() * 500) },
    ];
    setComparisonResults(results);
    setOpenComparison(true);
  };

  const handleSaveParameters = () => {
    setOpenOptimization(false);
  };

  return (
    <Layout
      customers={staticCustomers}
      vehicles={staticVehicles}
      chargingStations={staticChargingStations}
      orders={staticOrders}
      routeColors={routeColors}
      plannedRoutes={plannedRoutes}
      completedRoutes={completedRoutes}
      traffic={traffic}
      openComparison={openComparison}
      setOpenComparison={setOpenComparison}
      comparisonResults={comparisonResults}
      runComparison={runComparison}
      openOptimization={openOptimization}
      setOpenOptimization={setOpenOptimization}
      algorithm={algorithm}
      setAlgorithm={setAlgorithm}
      handleSaveParameters={handleSaveParameters}
    />
  );
}