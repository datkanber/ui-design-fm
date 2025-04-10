import React from "react";

const RouteEnergyConsumptionChart = ({ shapData = [], labels = [] }) => {
  if (!shapData.length || !labels.length) {
    return <div style={{ padding: "10px" }}>SHAP verisi bekleniyor...</div>;
  }

  const total = shapData.reduce((sum, val) => sum + Math.abs(val), 0);

  const data = shapData.map((val, i) => ({
    name: labels[i],
    value: Math.abs(val),
    rawValue: val,
    color: val >= 0
      ? ["#4CAF50", "#2196F3", "#FF9800", "#F44336"][i % 4]
      : ["#A5D6A7", "#90CAF9", "#FFE082", "#EF9A9A"][i % 4] // pastel renkler negatifler için
  }));

  const segments = [];
  let cumulativeAngle = 0;

  data.forEach((item) => {
    const percentage = (item.value / total) * 100;
    const angle = (percentage / 100) * 360;
    segments.push({
      ...item,
      percentage,
      startAngle: cumulativeAngle,
      endAngle: cumulativeAngle + angle,
    });
    cumulativeAngle += angle;
  });

  return (
    <div style={{ padding: "10px" }}>
      <h3>Enerji Tüketimini Etkileyen Faktörler (SHAP)</h3>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div style={{ position: "relative", width: "150px", height: "150px" }}>
          {segments.map((segment, index) => {
            const startAngle = (segment.startAngle * Math.PI) / 180;
            const endAngle = (segment.endAngle * Math.PI) / 180;
            const x1 = 75 + 75 * Math.cos(startAngle);
            const y1 = 75 + 75 * Math.sin(startAngle);
            const x2 = 75 + 75 * Math.cos(endAngle);
            const y2 = 75 + 75 * Math.sin(endAngle);
            const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;

            const pathData = [
              `M 75 75`,
              `L ${x1} ${y1}`,
              `A 75 75 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              `Z`,
            ].join(" ");

            return (
              <svg key={index} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}>
                <path d={pathData} fill={segment.color} />
              </svg>
            );
          })}
        </div>

        <div style={{ marginLeft: "20px", flex: 1 }}>
          {segments.map((item, index) => (
            <div key={index} style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
              <div style={{ width: "14px", height: "14px", backgroundColor: item.color, marginRight: "8px", borderRadius: "2px" }} />
              <div style={{ marginRight: "8px" }}>{item.name}:</div>
              <div style={{ fontWeight: "bold" }}>
              {item.rawValue < 0 ? "-" : ""}{item.percentage.toFixed(1)}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RouteEnergyConsumptionChart;
