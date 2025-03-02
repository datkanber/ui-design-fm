import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import RouteOptimization from './pages/RouteOptimization';
import FleetMonitoring from './pages/FleetMonitoring';
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
      {/* Navbar içinde dark mode butonu var */}
      <Navbar 
        alertBlink={alertBlink} 
        toggleChat={() => setChatOpen(!chatOpen)} 
        vehicles={vehicles} 
        darkMode={darkMode} 
        setDarkMode={setDarkMode} 
      />

      {/* Sohbet Kutusu Açık mı? */}
      {chatOpen && <ChatBox vehicles={vehicles} />}

      <Routes>
        <Route path="/" element={<RouteOptimization algorithm={algorithm} setAlgorithm={setAlgorithm} />} />
        <Route path="/route-optimization" element={<RouteOptimization algorithm={algorithm} setAlgorithm={setAlgorithm} />} />
        <Route path="/fleet-monitoring" element={<FleetMonitoring algorithm={algorithm} />} />
      </Routes>

      {/* Footer'a Dark Mode Prop'u Eklendi */}
      <Footer vehicles={vehicles} darkMode={darkMode} />
    </Router>
  );
}
