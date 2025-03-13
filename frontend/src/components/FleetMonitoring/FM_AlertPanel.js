import React, { useState } from "react";

// Alert Component
const Alert = ({ type, message, details, source, timestamp }) => {
  const [showDetails, setShowDetails] = useState(false);

  // Function to determine styles based on the alert type
  const getAlertStyle = (type, source) => {
    const sourceColors = {
      "Driver": "#f39c12", // Yellow
      "Vehicle": "#e74c3c", // Red
      "Route": "#3498db", // Blue
      "Performance": "#2ecc71", // Green
      "Delivery": "#9b59b6", // Purple
      "System": "#34495e", // Gray
    };

    const sourceColor = sourceColors[source] || "#000000";

    switch (type) {
      case "Error":
        return { backgroundColor: "#ffe297", color: "#721c24", icon: "⚠️", sourceColor };
      case "Alert":
        return { backgroundColor: "#fbffce", color: "#856404", icon: "⚡", sourceColor };
      case "Critical Failure":
        return { backgroundColor: "#f5c6cb", color: "#721c24", icon: "❌", sourceColor };
      default:
        return { backgroundColor: "#ffffff", color: "#000000", icon: "ℹ️", sourceColor };
    }
  };

  // Get the styles based on the type
  const { backgroundColor, color, icon, sourceColor } = getAlertStyle(type, source);

  // Add more detailed context to the details section
  const detailedMessage = `${details}\nTimestamp: ${timestamp}\nSeverity Level: ${type}\nSource Category: ${source}`;

  return (
    <div
      style={{
        backgroundColor,
        color,
        padding: "10px",
        borderRadius: "8px",
        marginBottom: "12px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
      }}
      onClick={() => setShowDetails(!showDetails)}
    >
      <span style={{ marginRight: "10px" }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>{message}</span>
          {/* Source container */}
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
            <pre>{detailedMessage}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alert;
