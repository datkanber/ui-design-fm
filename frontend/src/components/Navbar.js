import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  MessageCircle,
  Route,
  Truck,
  Package,
  BarChart2,
  Activity,
  Menu,
  X,
  Sun,
  Moon,
  GitBranch // FlowChart yerine GitBranch kullanıldı
} from "lucide-react";
import roadmapLogo from "../assets/icons/roadmap.gif";

export default function Navbar({ alertBlink, toggleChat, darkMode, setDarkMode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  
  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  // Define navigation items
  const navItems = [
    { 
      path: "/route-optimization", 
      label: "Route Optimization", 
      icon: <Route size={20} strokeWidth={2} /> 
    },
    { 
      path: "/fleet-monitoring", 
      label: "Fleet Monitoring", 
      icon: <Activity size={20} strokeWidth={2} /> 
    },
    { 
      path: "/vehicles", 
      label: "Vehicles", 
      icon: <Truck size={20} strokeWidth={2} /> 
    },
    { 
      path: "/orders", 
      label: "Orders", 
      icon: <Package size={20} strokeWidth={2} /> 
    },
    { 
      path: "/performance-monitoring", 
      label: "Analytics", 
      icon: <BarChart2 size={20} strokeWidth={2} /> 
    },
    { 
      path: "/bpmn-process", 
      label: "Process Designer", 
      icon: <GitBranch size={20} strokeWidth={2} /> // FlowChart yerine GitBranch kullanıldı
    }
  ];

  return (
    <nav className={`navbar ${darkMode ? 'dark' : 'light'}`}>
      <div className="navbar-container">
        {/* Logo and Title */}
        <div className="navbar-brand">
          <Link to="/" className="logo-link">
            <img src={roadmapLogo} alt="Fleet Management Logo" className="navbar-logo" />
            <span className="brand-name">Fleet Manager</span>
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="mobile-menu-toggle" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Navigation Links */}
        <div className={`navbar-links ${mobileMenuOpen ? 'active' : ''}`}>
          {navItems.map((item, index) => (
            <Link 
              key={index} 
              to={item.path} 
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
            >
              <div className="nav-icon">{item.icon}</div>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>

        {/* Right Side Controls */}
        <div className="navbar-controls">
          {/* Theme Toggle Button */}
          <button 
            className="theme-toggle" 
            onClick={() => setDarkMode(!darkMode)}
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? 
              <Sun size={24} className="sun-icon" /> : 
              <Moon size={24} className="moon-icon" />
            }
          </button>
          
          {/* Chat Button */}
          <button 
            className={`chat-button ${alertBlink ? 'blink' : ''}`}
            onClick={toggleChat}
            aria-label="Open chat"
          >
            <MessageCircle size={24} />
          </button>
        </div>
      </div>
    </nav>
  );
}
