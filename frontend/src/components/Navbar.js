// src/components/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Route, Truck, Package, LucideLoader, BarChartHorizontalIcon, Moon, Sun } from 'lucide-react';
import roadmapLogo from '../assets/icons/roadmap.gif';

export default function Navbar({ alertBlink, toggleChat, darkMode, setDarkMode }) {
  return (
    <nav className="navbar">
      {/* Logo ve Başlık */}
      <div className="navbar-brand">
        <img src={roadmapLogo} alt="Roadmap Logo" className="navbar-logo" />
        <span>Filo Yönetim Paneli</span>
      </div>

      {/* Menü Linkleri */}
      <div className="navbar-links">
        <Link to="/route-optimization">
          <Route size={20} /> Rota Optimizasyonu
        </Link>
        <Link to="/fleet-monitoring">
          <LucideLoader size={20} /> Canlı Araç İzleme
        </Link>
        <Link to="/vehicles">
          <Truck size={20} /> Araçlar
        </Link>
        <Link to="/orders">
          <Package size={20} /> Siparişler
        </Link>
        <Link to="/performance-monitoring">
          <BarChartHorizontalIcon size={20} /> Raporlar
        </Link>
      </div>

      {/* Dark Mode Butonu */}
      <button className="dark-mode-toggle" onClick={() => setDarkMode(!darkMode)}>
        {darkMode ? <Sun size={34} color="#FFD700" /> : <Moon size={34} color="#222121" />}
      </button>

      {/* Sohbet Kutusu */}
      <div className="chatbox-icon" onClick={toggleChat}>
        <MessageCircle size={33} color={alertBlink ? '#222121' : '#fff'} />
      </div>
    </nav>
  );
}
