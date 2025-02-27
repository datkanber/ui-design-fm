// src/components/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Route, Truck, Package, LucideLoader, BarChartHorizontalIcon } from 'lucide-react';
import roadmapLogo from '../assets/icons/roadmap.gif';

export default function Navbar({ alertBlink, toggleChat }) {
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
        <Link to="/performance-monitoring">
          <BarChartHorizontalIcon size={20} /> BPMN Process
        </Link>
      </div>

      {/* Sohbet Kutusu */}
      <div className="chatbox-icon" onClick={toggleChat}>
        <MessageCircle size={32} color={alertBlink ? '#ff4500' : '#fff'} />
      </div>
    </nav>
  );
}
