const mongoose = require('mongoose');

const NodeSchema = new mongoose.Schema({
  NodeId: String,
  NodeType: String,
  Location: {
    Latitude: String,
    Longitude: String,
    Elevation: String,
  },
  ServiceInformation: Object,
  LoadInformation: Object,
  PerformanceMeasure: Object,
});

const RouteSchema = new mongoose.Schema({
  RouteId: String,
  VehicleId: String,
  DriverId: String,
  PerformanceMeasure: Object,
  Nodes: [NodeSchema],
});

// ✅ Koleksiyon adı burada açıkça belirtiliyor
const RoutePlanSchema = new mongoose.Schema({
  Name: String,
  ProblemType: String,
  ObjectiveFunction: String,
  ChargingStrategy: String,
  NumberOfCustomers: Number,
  BatteryCapacity: Number,
  MaxSpeed: Number,
  VehicleMass: Number,
  MaximumLoadCapacityVolume: Number,
  MaximumLoadCapacityKg: Number,
  BatteryRechargingRate: Number,
  EnergyConsumptionRate: Number,
  PerformanceMeasure: Object,
  Routes: [RouteSchema],
  createdAt: Date,
  updatedAt: Date,
}, { collection: 'route4plans' }); 
module.exports = mongoose.model('RoutePlan', RoutePlanSchema);
