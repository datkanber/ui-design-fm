// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import RouteOptimization from './pages/RouteOptimization';
import FleetMonitoring from './pages/FleetMonitoring';
import Maintenance from './pages/Maintenance';
import EVCharging from './pages/EVCharging';
import Performance from './pages/Performance';
import Inventory from './pages/Inventory';
import DemandPlanning from './pages/DemandPlanning';
import ChatBox from './components/ChatBox';
import Footer from './components/Footer';
import BpmnProcess from './pages/BpmnProcess';
import { vehicles } from './data/vehicles';
import useAlertBlink from './hooks/useAlertBlink';
import './assets/styles/global.css';
import 'leaflet/dist/leaflet.css';

export default function App() {
  const [chatOpen, setChatOpen] = useState(false);
  const [algorithm, setAlgorithm] = useState('Simulated Annealing');
  const alertBlink = useAlertBlink();

  // Dark mode state'i ve localStorage kullanımı
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  return (
    <Router>
      <Navbar 
        alertBlink={alertBlink} 
        toggleChat={() => setChatOpen(!chatOpen)} 
        vehicles={vehicles} 
        darkMode={darkMode} 
        setDarkMode={setDarkMode} 
      />

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

      {/* Footer'a Dark Mode Prop'u Eklendi */}
      <Footer vehicles={vehicles} darkMode={darkMode} />
    </Router>
  );
}
