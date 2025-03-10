const mongoose = require("mongoose");

const VehicleSchema = new mongoose.Schema({
  VehicleId: { type: String, required: true, unique: true },
  CurrentLocation: {
    Latitude: String,
    Longitude: String,
  },
  Capacity: {
    Weight: Number,
    Volume: Number,
  },
  BatteryLevel: Number,
  LastUpdateTime: Date,
}, { collection: 'route4vehicles' });

module.exports = mongoose.model("Vehicle", VehicleSchema);
