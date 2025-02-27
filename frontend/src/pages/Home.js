import React from 'react';
import { Link } from 'react-router-dom';
import '../assets/styles/global.css';

const Home = () => {
  return (
    <div className="home-container">
      <div className="hero-section">
        <h1>Filo Yönetim Sistemine Hoş Geldiniz</h1>
        <p>Akıllı rota optimizasyonu ve gerçek zamanlı filo izleme çözümleri</p>
        
        <div className="features-grid">
          <div className="feature-card">
            <h3>Rota Optimizasyonu</h3>
            <p>Akıllı algoritmalar ile en verimli rotaları belirleyin</p>
            <Link to="/route-optimization" className="feature-link">Keşfet →</Link>
          </div>
          
          <div className="feature-card">
            <h3>Filo İzleme</h3>
            <p>Araçlarınızı gerçek zamanlı olarak takip edin</p>
            <Link to="/fleet-monitoring" className="feature-link">İzle →</Link>
          </div>
          
          <div className="feature-card">
            <h3>Süreç Yönetimi</h3>
            <p>BPMN ile iş süreçlerinizi optimize edin</p>
            <Link to="/bpmn-process" className="feature-link">İncele →</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 