import React, { useState, useEffect } from "react";

export default function PerformanceMonitoring({ completedTasks, totalTasks }) {
  const [energyData, setEnergyData] = useState([]);
  const [eta, setEta] = useState(0); // Estimated Time of Arrival

  const completionRate = ((completedTasks / totalTasks) * 100).toFixed(2);

  useEffect(() => {
    // Dummy enerji verisi (API'ye bağlanınca güncellenebilir)
    setEnergyData([
      { id: 1, currentEnergy: 85, plannedEnergy: 100 },
      { id: 2, currentEnergy: 60, plannedEnergy: 90 },
      { id: 3, currentEnergy: 45, plannedEnergy: 80 },
    ]);

    // Örnek ETA hesaplama
    calculateETA(45, 60); // Kalan mesafe: 45 km, Hız: 60 km/s
  }, []);

  const calculateETA = (distance, speed) => {
    if (speed === 0) {
      setEta("Bilinmiyor");
    } else {
      const time = distance / speed; // saat cinsinden
      setEta(time.toFixed(2));
    }
  };

  return (
    <div style={{ padding: "16px", backgroundColor: "#fff", borderRadius: "8px" }}>
      <h2>Performans İzleme</h2>

      {/* Enerji Tüketimi */}
      <div>
        <h3>Enerji Tüketimi</h3>
        {energyData.map((data) => (
          <div key={data.id} style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>
            <strong>Araç {data.id}</strong>
            <div>Anlık Enerji: {data.currentEnergy} kWh</div>
            <div>Planlanan Enerji: {data.plannedEnergy} kWh</div>
          </div>
        ))}
      </div>

      {/* Tamamlanan İş Yüzdesi */}
      <div style={{ marginTop: "16px" }}>
        <h3>Tamamlanan İş Yüzdesi</h3>
        <div>%{completionRate}</div>
      </div>

      {/* Kalan Mesafe ve ETA */}
      <div style={{ marginTop: "16px" }}>
        <h3>Kalan Mesafe ve ETA</h3>
        <div>Kalan Mesafe: 45 km</div>
        <div>Tahmini Varış Süresi: {eta} saat</div>
      </div>
    </div>
  );
}
