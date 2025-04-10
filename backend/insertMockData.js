// insertMockData.js – 3 Rota, Güncellenebilir Mock Veri
const mongoose = require("mongoose");
const mongoURI = "mongodb+srv://burak2kanber:ploW4nuSpzwXakhM@cluster0.on8m7.mongodb.net/RouteManagementDB?retryWrites=true&w=majority";

mongoose.connect(mongoURI)
  .then(() => console.log("✅ MongoDB bağlantısı başarılı!"))
  .catch((err) => console.error("❌ MongoDB bağlantı hatası:", err));

const performanceSchema = new mongoose.Schema({
  route_id: String,
  vehicle_id: String,
  timestamp: Date,
  location: { lat: Number, lon: Number },
  avg_vehicle_speed: Number,
  distance_traveled_km: Number,
  avg_Acceleration: Number,
  avg_Total_Mass: Number,
  slope: Number,
  status: String,
});

const PerformanceData = mongoose.model("PerformanceData", performanceSchema, "anlikPerformansRota");

let counters = { route_001: 0, route_002: 0, route_003: 0 };
const baseWeight = 3000;
const deliveryCount = 12;

function generateRoute1Data() {
  const counter = counters.route_001++;
  const stop = counter % deliveryCount;
  const weight = baseWeight - (stop * ((baseWeight - 1500) / deliveryCount));
  const speed = 40 + Math.sin(counter / 2) * 10;
  const slope = Math.sin(counter / 3) * 5;

  return {
    route_id: "route_001",
    vehicle_id: "vehicle_A1",
    timestamp: new Date(),
    location: {
      lat: 38.45 + Math.sin(counter / 10) * 0.01,
      lon: 27.15 + Math.cos(counter / 10) * 0.01
    },
    avg_vehicle_speed: parseFloat(speed.toFixed(2)),
    distance_traveled_km: parseFloat((0.2 * (counter + 1)).toFixed(3)),
    avg_Acceleration: parseFloat((0.3 + Math.random() * 0.5).toFixed(2)),
    avg_Total_Mass: parseFloat(weight.toFixed(1)),
    slope: parseFloat(slope.toFixed(2)),
    status: "moving"
  };
}

function generateRoute2Data() {
  const counter = counters.route_002++;
  const speed = 25 + Math.sin(counter / 3) * 5;
  const slope = Math.cos(counter / 4) * 2;
  const weight = 2200;

  return {
    route_id: "route_002",
    vehicle_id: "vehicle_B2",
    timestamp: new Date(),
    location: {
      lat: 38.42 + Math.sin(counter / 12) * 0.005,
      lon: 27.12 + Math.cos(counter / 12) * 0.005
    },
    avg_vehicle_speed: parseFloat(speed.toFixed(2)),
    distance_traveled_km: parseFloat((0.1 * (counter + 1)).toFixed(3)),
    avg_Acceleration: parseFloat((0.1 + Math.random() * 0.4).toFixed(2)),
    avg_Total_Mass: parseFloat(weight.toFixed(1)),
    slope: parseFloat(slope.toFixed(2)),
    status: "moving"
  };
}

function generateRoute3Data() {
  const counter = counters.route_003++;
  const slope = Math.sin(counter / 2) * 6;
  const speed = 50 + Math.cos(counter / 3) * 15;
  const weight = 2750;

  return {
    route_id: "route_003",
    vehicle_id: "vehicle_C3",
    timestamp: new Date(),
    location: {
      lat: 38.48 + Math.sin(counter / 14) * 0.007,
      lon: 27.18 + Math.cos(counter / 14) * 0.007
    },
    avg_vehicle_speed: parseFloat(speed.toFixed(2)),
    distance_traveled_km: parseFloat((0.3 * (counter + 1)).toFixed(3)),
    avg_Acceleration: parseFloat((0.4 + Math.random() * 0.6).toFixed(2)),
    avg_Total_Mass: parseFloat(weight.toFixed(1)),
    slope: parseFloat(slope.toFixed(2)),
    status: "moving"
  };
}

const isMockEnabled = true;

if (isMockEnabled) {
  setInterval(async () => {
    const updatedData1 = generateRoute1Data();
    const updatedData2 = generateRoute2Data();
    const updatedData3 = generateRoute3Data();

    await PerformanceData.updateOne(
      { route_id: "route_001" },
      { $set: updatedData1 }
    );
    await PerformanceData.updateOne(
      { route_id: "route_002" },
      { $set: updatedData2 }
    );
    await PerformanceData.updateOne(
      { route_id: "route_003" },
      { $set: updatedData3 }
    );

    console.log("🔁 Mevcut 3 rota verisi GÜNCELLENDİ ✔");
  }, 5000);
}