import React, { useState } from "react";

function EnergyPredictor() {
  const [formData, setFormData] = useState({
    slope: 0,
    avg_vehicle_speed: 0,
    avg_Acceleration: 0,
    avg_Total_Mass: 0,
  });

  const [prediction, setPrediction] = useState(null);
  const [shapContributions, setShapContributions] = useState([]);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: parseFloat(e.target.value),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await fetch("http://localhost:5002/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setPrediction(data.prediction);
        setShapContributions(data.shap_values);
      } else {
        setError(data.error || "Sunucudan hata döndü.");
      }
    } catch (err) {
      console.error("İstek hatası:", err);
      setError("İstek gönderilirken hata oluştu.");
    }
  };

  const getShapChart = () => {
    const totalContrib = shapContributions.reduce((sum, val) => sum + Math.abs(val), 0);
    const percentages = shapContributions.map((val) => (Math.abs(val) / totalContrib) * 100);
    const labels = ["slope", "avg_vehicle_speed", "avg_Acceleration", "avg_Total_Mass"];

    return (
      <div style={{ marginTop: "20px" }}>
        <h3>SHAP Katkıları</h3>
        <img
          src={`https://quickchart.io/chart?c={type:'pie',data:{labels:${JSON.stringify(labels)},datasets:[{data:[${percentages.join(",")}]}]}}`}
          alt="SHAP Pie Chart"
          style={{ width: "100%", maxHeight: "400px", objectFit: "contain" }}
        />
      </div>
    );
  };

  return (
    <div style={{ maxWidth: 500, margin: "auto" }}>
      <h2>Enerji Tüketimi Tahmini</h2>
      <form onSubmit={handleSubmit}>
        {Object.keys(formData).map((key) => (
          <div key={key} style={{ marginBottom: "10px" }}>
            <label>{key}:</label>
            <input
              type="number"
              name={key}
              step="any"
              value={formData[key]}
              onChange={handleChange}
              style={{ width: "100%", padding: "5px" }}
              required
            />
          </div>
        ))}
        <button type="submit">Tahmin Et</button>
      </form>

      {prediction !== null && (
        <div style={{ marginTop: "20px", fontWeight: "bold" }}>
          Tahmin Edilen Enerji Tüketimi: {prediction.toFixed(3)} kWh
        </div>
      )}

      {shapContributions.length > 0 && getShapChart()}

      {error && <div style={{ color: "red", marginTop: "20px" }}>{error}</div>}
    </div>
  );
}

export default EnergyPredictor;
