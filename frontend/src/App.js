// src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import RouteOptimization from './pages/RouteOptimization';
import BpmnProcess from "./pages/BpmnProcess";
import FleetMonitoring from './pages/FleetMonitoring';
import Maintenance from './pages/Maintenance';
import EVCharging from './pages/EVCharging';
import Performance from './pages/Performance';
import Inventory from './pages/Inventory';
import DemandPlanning from './pages/DemandPlanning';
import ChatBox from './components/ChatBox';
import Footer from './components/Footer';
import { vehicles } from './data/vehicles';
import useAlertBlink from './hooks/useAlertBlink';
import './assets/styles/global.css';
import 'leaflet/dist/leaflet.css';

export default function App() {
  const [chatOpen, setChatOpen] = useState(false);
  const [algorithm, setAlgorithm] = useState('Simulated Annealing');
  const alertBlink = useAlertBlink();

  return (
    <Router>
      <Navbar alertBlink={alertBlink} toggleChat={() => setChatOpen(!chatOpen)} vehicles={vehicles} />
      {chatOpen && <ChatBox vehicles={vehicles} />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/route-optimization" element={<RouteOptimization algorithm={algorithm} setAlgorithm={setAlgorithm} />} />
        <Route path="/fleet-monitoring" element={<FleetMonitoring algorithm={algorithm} />} />
        <Route path="/bpmn-process" element={<BpmnProcess />} />
        <Route path="/maintenance" element={<Maintenance />} />
        <Route path="/ev-charging" element={<EVCharging />} />
        <Route path="/performance-monitoring" element={<Performance />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/demand-planning" element={<DemandPlanning />} />
      </Routes>
      <Footer vehicles={vehicles} /> 
    </Router>
  );
}
