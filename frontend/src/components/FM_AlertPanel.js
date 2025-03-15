import React, { useState } from "react";
import "../assets/styles/alert.css";

// Alert Component
const Alert = ({ type, message, details, source, timestamp, onResolve, onDelete }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [isResolved, setIsResolved] = useState(false); // Track the resolved state

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

    let icon = "ℹ️"; // Default icon for informational alerts
    let iconColor = "#ffffff"; // Default icon color

    switch (type) {
      case "Warning":
        icon = "⚠️"; // Warning icon
        iconColor = "#ffffff"; // Neon yellow for warning
        return { backgroundColor: "#ffe297", color: "#721c24", icon, iconColor, sourceColor };
      case "Info":
        icon = "ℹ️"; // Information icon
        iconColor = "#00eaff"; // Neon cyan for info
        return { backgroundColor: "#fbffce", color: "#856404", icon, iconColor, sourceColor };
      case "Error":
        icon = "❌"; // Error icon
        iconColor = "#ffe0e4"; // Neon red for error
        return { backgroundColor: "#f5c6cb", color: "#721c24", icon, iconColor, sourceColor };
      case "Success":
        icon = "✅"; // Success icon (Resolved alert)
        iconColor = "#32ff7e"; // Neon green for success
        return { backgroundColor: "#d4edda", color: "#155724", icon, iconColor, sourceColor };
      default:
        return { backgroundColor: "#ffffff", color: "#000000", icon, iconColor, sourceColor };
    }
  };

  // Get the styles based on the type
  const { backgroundColor, color, icon, iconColor, sourceColor } = getAlertStyle(type, source);

  // Add more detailed context to the details section
  const detailedMessage = `${details}\nTimestamp: ${timestamp}\nSeverity Level: ${type}\nSource Category: ${source}`;

  // Conditional className for resolved state (making it faint)
  const alertClassName = isResolved ? "alert-resolved" : "alert-unresolved";

  return (
    <div
      className={alertClassName} // Apply the class based on resolved state
      style={{
        backgroundColor,
        color,
        padding: "10px",
        borderRadius: "8px",
        marginBottom: "12px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        opacity: isResolved ? 0.6 : 1, // Make alert faint when resolved
      }}
      onClick={() => setShowDetails(!showDetails)}
    >
      <span
        style={{
          marginRight: "10px",
          color: iconColor,
          fontSize: "20px",
          textShadow: `0 0 5px ${iconColor}, 0 0 10px ${iconColor}, 0 0 15px ${iconColor}`,
          animation: isResolved ? "none" : "flash 1s infinite", // Flash effect when unresolved
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
            <pre>{detailedMessage}</pre>

            {/* Buttons */}
            <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent triggering parent click event
                  setIsResolved(true); // Mark as resolved
                  onResolve();
                }}
                style={{
                  padding: "8px 12px",
                  backgroundColor: "#2ecc71",
                  color: "#fff",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                {isResolved ? "Çözüldü" : "Çöz"} {/* Change button text */}
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
};

export default Alert;
