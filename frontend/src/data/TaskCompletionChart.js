import React, { useState, useEffect } from 'react';

const TaskCompletionChart = ({ routeId }) => {
  const [completionData, setCompletionData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      console.log("✅ API çağrısı başlatılıyor... Route ID:", routeId);
    
      try {
        const response = await fetch(`http://localhost:3001/api/performance/${routeId}`);
        console.log("📡 API isteği gönderildi. Status:", response.status);
    
        const data = await response.json();
        console.log("📊 API'den dönen veri:", data);
    
        const formattedData = data.map((item) => ({
          name: item.vehicle_id,
          completion: item.status === "moving" ? 50 : item.status === "completed" ? 100 : 0
        }));
    
        console.log("🔄 Formatlanmış veri:", formattedData);
        setCompletionData(formattedData);
      } catch (error) {
        console.error("❌ API isteği başarısız:", error);
      }
    };
    

    fetchData();
    const interval = setInterval(fetchData, 5000); // 5 saniyede bir güncelle

    return () => clearInterval(interval); // Component unmount olunca temizle
  }, [routeId]);

  return (
    <div style={{ padding: "10px" }}>
      <h3>Görev Tamamlanma Oranları</h3>
      {completionData.length === 0 ? (
        <p>Veri bulunamadı</p>
      ) : (
        completionData.map(item => (
          <div key={item.name} style={{ marginBottom: "15px" }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <div style={{ width: "80px", marginRight: "10px" }}>{item.name}:</div>
              <div style={{ flex: 1, backgroundColor: "#e0e0e0", height: "24px", borderRadius: "4px", overflow: "hidden" }}>
                <div 
                  style={{ 
                    width: `${item.completion}%`, 
                    height: "100%", 
                    backgroundColor: item.completion > 75 ? "#4caf50" : item.completion > 50 ? "#ff9800" : "#f44336",
                    transition: "width 0.5s ease-in-out"
                  }}
                />
              </div>
              <div style={{ marginLeft: "10px", width: "60px", textAlign: "right" }}>
                {item.completion.toFixed(1)}%
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default TaskCompletionChart;
