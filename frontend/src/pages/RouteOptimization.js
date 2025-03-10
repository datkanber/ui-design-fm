import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../assets/styles/global.css';
import 'leaflet/dist/leaflet.css';
import Layout from "../components/Layout";

export default function RouteOptimization() {
  const [algorithm, setAlgorithm] = useState("Simulated Annealing");
  const [comparisonResults, setComparisonResults] = useState([]);
  const [openComparison, setOpenComparison] = useState(false);
  const [openOptimization, setOpenOptimization] = useState(false);
  const [data, setData] = useState(null);

  // Hata yönetimi fonksiyonu
  const handleError = (error) => {
    console.error("API Hatası:", error);
  };

  useEffect(() => {
    axios.get('http://localhost:5000/api/routes')
      .then(response => {
        if (Array.isArray(response.data) && response.data.length > 0) {
          setData(response.data[0]); // İlk RoutePlan verisini al
        } else {
          console.warn("Boş veri döndü!");
        }
      })
      .catch(handleError); // Hata yönetimi burada kullanılıyor
  }, []);

  const routeColors = {
    "Simulated Annealing": "blue",
    "Tabu Search": "green",
    "OR-Tools": "red",
  };

  if (!data || !data.Routes) {
    return <p>Loading...</p>; // Veri yüklenmezse çökmeyi önler
  }

  const plannedRoutes = data.Routes.map(route => ({
    positions: route.Nodes?.map(node => [
      parseFloat(node.Location?.Latitude) || 0, 
      parseFloat(node.Location?.Longitude) || 0
    ])
  })) || [];

  const completedRoutes = plannedRoutes; // Gerçek tamamlanan rotaları belirlemek için API'de ayrım yapılabilir

  // Trafik verisini çekme (Örnek bir eşik değeri kullanıldı)
  const traffic = data.Routes.flatMap(route =>
    route.Nodes?.filter(node => node.PerformanceMeasure?.AccEnergy > 200)
      .map(node => ({
        positions: [[
          parseFloat(node.Location?.Latitude) || 0, 
          parseFloat(node.Location?.Longitude) || 0
        ]]
      }))
  ) || [];

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
      customers={data.Routes.flatMap(route => route.Nodes?.filter(node => node.$?.NodeType === "Customer")) || []}
      vehicles={data.Routes.map(route => ({
        id: route.VehicleId, 
        position: [
          parseFloat(route.Nodes?.[0]?.Location?.Latitude) || 0, 
          parseFloat(route.Nodes?.[0]?.Location?.Longitude) || 0
        ]
      })) || []}
      chargingStations={data.Routes.flatMap(route => route.Nodes?.filter(node => node.$?.NodeType === "Depot")) || []}
      orders={data.Routes.flatMap(route => route.Nodes?.filter(node => node.$?.NodeType === "Customer")) || []}
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
