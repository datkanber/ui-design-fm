const Vehicle = require("../models/Vehicle");

class VehicleService {
  async getAllVehicles() {
    return await Vehicle.find({});
  }

  async getVehicleById(id) {
    return await Vehicle.findOne({ VehicleId: id });
  }
}

module.exports = new VehicleService();
