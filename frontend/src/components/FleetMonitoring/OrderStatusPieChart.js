import React from "react";

const OrderStatusPieChart = ({ orders }) => {
  const statusCategories = {
    requested: { label: "Talep Edildi", color: "#3498db", icon: "📩", count: 0 },
    onTheWay: { label: "Yolda", color: "#f1c40f", icon: "🚚", count: 0 },
    delivered: { label: "Teslim Edildi", color: "#2ecc71", icon: "📦", count: 0 },
    cancelled: { label: "İptal Edildi", color: "#e74c3c", icon: "❌", count: 0 },
  };

  const totalOrders = orders?.length || 0;

  // Örnek veri dağılımı
  statusCategories.requested.count = Math.floor(totalOrders * 0.2);
  statusCategories.onTheWay.count = Math.floor(totalOrders * 0.3);
  statusCategories.delivered.count = Math.floor(totalOrders * 0.4);
  statusCategories.cancelled.count =
    totalOrders -
    statusCategories.requested.count -
    statusCategories.onTheWay.count -
    statusCategories.delivered.count;

  const statusData = Object.values(statusCategories).filter((c) => c.count > 0);
  const total = statusData.reduce((sum, item) => sum + item.count, 0);

  let cumulativeAngle = 0;
  const segments = statusData.map((item) => {
    const percentage = (item.count / total) * 100;
    const angle = (percentage / 100) * 360;
    const segment = {
      ...item,
      percentage,
      startAngle: cumulativeAngle,
      endAngle: cumulativeAngle + angle,
    };
    cumulativeAngle += angle;
    return segment;
  });

  return (
    <div style={{ padding: "10px" }}>
      <h3>Sipariş Durumu Dağılımı</h3>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        {/* Pasta grafik */}
        <div style={{ position: "relative", width: "150px", height: "150px" }}>
          {segments.map((segment, index) => {
            const startAngle = (segment.startAngle * Math.PI) / 180;
            const endAngle = (segment.endAngle * Math.PI) / 180;
            const x1 = 75 + 75 * Math.cos(startAngle);
            const y1 = 75 + 75 * Math.sin(startAngle);
            const x2 = 75 + 75 * Math.cos(endAngle);
            const y2 = 75 + 75 * Math.sin(endAngle);
            const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;

            const pathData = [`M 75 75`, `L ${x1} ${y1}`, `A 75 75 0 ${largeArcFlag} 1 ${x2} ${y2}`, `Z`].join(" ");
            return (
              <svg key={index} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}>
                <path d={pathData} fill={segment.color} />
              </svg>
            );
          })}
        </div>

        {/* Açıklama kutuları */}
        <div style={{ marginLeft: "20px", flex: 1 }}>
          {segments.map((item, index) => (
            <div key={index} style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
              <div style={{ fontSize: "18px", marginRight: "8px" }}>{item.icon}</div>
              <div style={{ marginRight: "8px", flex: 1 }}>{item.label}:</div>
              <div style={{ fontWeight: "bold" }}>{item.percentage.toFixed(1)}% ({item.count})</div>
            </div>
          ))}

          {/* 🟢 Legend başlığı */}
          <div style={{ marginTop: "16px", fontSize: "14px", color: "#555" }}>
            <strong>Renk & İkon Açıklamaları:</strong>
            <ul style={{ display: "flex", flexWrap: "wrap", gap: "12px", paddingLeft: "0", marginTop: "12px" }}>
              {Object.values(statusCategories).map((s, i) => (
                <li
                  key={i}
                  style={{ display: "flex", alignItems: "center", gap: "6px", listStyle: "none" }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      width: "14px",
                      height: "14px",
                      backgroundColor: s.color,
                      borderRadius: "2px",
                    }}
                  />
                  <span>{s.icon}</span> – <span>{s.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderStatusPieChart;
