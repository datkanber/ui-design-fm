import React, { useState } from "react";
import "../../assets/styles/alert.css";

export default function Alert({ type, message, details, source, timestamp, resolved, onResolve, onDelete }) {
  const [showDetails, setShowDetails] = useState(false);

  // Uyarı tipine göre renkleri belirle
  const getAlertStyle = (type, source) => {
    const sourceColors = {
      "Driver": "#f39c12",
      "Vehicle": "#e74c3c",
      "Route": "#3498db",
      "Performance": "#2ecc71",
      "Delivery": "#9b59b6",
      "System": "#34495e",
    };

    const sourceColor = sourceColors[source] || "#000000";

    let icon = "ℹ️"; 
    let iconColor = "#ffffff"; 

    switch (type) {
      case "Warning":
        icon = "⚠️";
        iconColor = "#ffffff";
        return { backgroundColor: "#fcad58", color: "#721c24", icon, iconColor, sourceColor };
      case "Info":
        icon = "ℹ️"; 
        iconColor = "#00eaff";
        return { backgroundColor: "#faf373", color: "#856404", icon, iconColor, sourceColor };
      case "Error":
        icon = "❌"; 
        iconColor = "#ffe0e4"; 
        return { backgroundColor: "#f25a5a", color: "#721c24", icon, iconColor, sourceColor };
      default:
        return { backgroundColor: "#ffffff", color: "#000000", icon, iconColor, sourceColor };
    }
  };
  // eslint-disable-next-line no-unused-vars
  const { backgroundColor, color, icon, iconColor, sourceColor } = getAlertStyle(type, source);

  return (
    <div
      className={`alert-container ${resolved ? "alert-resolved" : "alert-unresolved"}`}
      style={{
        backgroundColor,
        color,
        padding: "10px",
        borderRadius: "8px",
        marginBottom: "12px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        opacity: resolved ? 0.6 : 1,
      }}
      onClick={() => setShowDetails(!showDetails)}
    >
    <span
      className={!resolved ? "blinking-icon" : ""}
      style={{
        marginRight: "10px",
        fontSize: "20px",
        display: "inline-block",
        textShadow: "0px 0px 5px rgb(255, 255, 255, 1)", // Beyaz ışıltı efekti
      }}
    >
      {icon}
    </span>


      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>{message}</span>
          <div
            style={{
              backgroundColor: sourceColor,
              color: "#fff",
              padding: "4px 8px",
              borderRadius: "12px",
              fontWeight: "bold",
              fontSize: "12px",
            }}
          >
            {source}
          </div>
        </div>

        {showDetails && (
          <div style={{ marginTop: "10px", fontSize: "12px", color: "#333", wordWrap: "break-word", whiteSpace: "pre-line" }}>
            <strong>Details:</strong>
            <pre>{details}</pre>
            <pre>Timestamp: {timestamp}</pre>

            <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onResolve();
                }}
                style={{
                  padding: "8px 12px",
                  backgroundColor: resolved ? "#aaa" : "#2ecc71",
                  color: "#fff",
                  border: "none",
                  borderRadius: "5px",
                  cursor: resolved ? "default" : "pointer",
                }}
                disabled={resolved}
              >
                {resolved ? "Çözüldü" : "Çöz"}
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                style={{
                  padding: "8px 12px",
                  backgroundColor: "#e74c3c",
                  color: "#fff",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Sil
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
