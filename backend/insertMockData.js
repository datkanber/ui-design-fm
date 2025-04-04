const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker");

const mongoURI = "mongodb+srv://burak2kanber:ploW4nuSpzwXakhM@cluster0.on8m7.mongodb.net/RouteManagementDB?retryWrites=true&w=majority";

mongoose.connect(mongoURI)
  .then(() => console.log("✅ MongoDB bağlantısı başarılı!"))
  .catch((err) => console.error("❌ MongoDB bağlantı hatası:", err));

const performanceSchema = new mongoose.Schema({
  route_id: String,
  vehicle_id: String,
  timestamp: Date,
  location: {
    lat: Number,
    lon: Number
  },
  elevation: Number,
  speed_kmh: Number,
  gradient: Number,
  direction: Number,
  distance_traveled_km: Number,
  acceleration: Number,
  weight_kg: Number,
  status: String,
  avg_energy_consumption_kwh_km: Number,
  estimated_total_energy_kwh: Number,
  range_effect_percent: Number,
  total_distance_km: Number,
  estimated_duration_min: Number,
  stop_count: Number,
  traffic_level: String,
  slope_profile: String,
  efficiency_score: Number
});

const PerformanceData = mongoose.model("PerformanceData", performanceSchema, "anlikPerformansRota");

const routes = ["route_001", "route_002", "route_003"];
const vehicles = ["vehicle_123", "vehicle_456", "vehicle_789"];
const trafficLevels = ["Düşük", "Orta", "Yüksek"];
const slopeProfiles = ["Düz", "Hafif Eğimli", "Dalgalı", "Dik"];

function generateMockData() {
  const route = faker.helpers.arrayElement(routes);
  const speed = Number(faker.number.float({ min: 40, max: 120 }).toFixed(2));
  const distance = Number(faker.number.float({ min: 10, max: 120 }).toFixed(2));
  const energyPerKm = Number(faker.number.float({ min: 0.15, max: 0.35 }).toFixed(2));
  const totalEnergy = +(distance * energyPerKm).toFixed(2);

  const acceleration = Number(faker.number.float({ min: 0.1, max: 3 }).toFixed(2));
  const weight_kg = faker.number.int({ min: 1500, max: 4000 });

  return {
    route_id: route,
    vehicle_id: faker.helpers.arrayElement(vehicles),
    timestamp: new Date(),
    location: {
      lat: faker.location.latitude({ min: 38.4, max: 38.5 }),
      lon: faker.location.longitude({ min: 27.1, max: 27.2 })
    },
    elevation: faker.number.int({ min: 30, max: 150 }),
    speed_kmh: speed,
    gradient: Number(faker.number.float({ min: -10, max: 10 }).toFixed(2)),
    direction: faker.number.int({ min: 0, max: 360 }),
    distance_traveled_km: Number(faker.number.float({ min: 1, max: distance }).toFixed(2)),
    acceleration,  // garanti eklendi
    weight_kg,     // garanti eklendi
    status: faker.helpers.arrayElement(["moving", "stopped", "idle"]),
    avg_energy_consumption_kwh_km: energyPerKm,
    estimated_total_energy_kwh: totalEnergy,
    range_effect_percent: faker.number.int({ min: -20, max: 0 }),
    total_distance_km: distance,
    estimated_duration_min: Math.floor((distance / speed) * 60),
    stop_count: faker.number.int({ min: 0, max: 6 }),
    traffic_level: faker.helpers.arrayElement(trafficLevels),
    slope_profile: faker.helpers.arrayElement(slopeProfiles),
    efficiency_score: faker.number.int({ min: 50, max: 100 })
  };



  // ✅ Kontrol için log
  if (!mock.acceleration || !mock.weight_kg || !mock.distance_traveled_km) {
    console.log("🚨 Eksik veri üretildi:", mock);
  }

  return mock;
}

setInterval(() => {
  const mockData = generateMockData();
  const newData = new PerformanceData(mockData);
  newData.save()
    .then(() => console.log("✔ Yeni veri eklendi:", {
      route: mockData.route_id,
      speed: mockData.speed_kmh,
      acc: mockData.acceleration,
      weight: mockData.weight_kg,
      dist: mockData.distance_traveled_km
    }))
    .catch((err) => console.error("❌ Veri eklenirken hata:", err));
}, 5000);
