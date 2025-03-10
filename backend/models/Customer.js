const mongoose = require("mongoose");

const CustomerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: { type: String },
  address: { type: String, required: true },
  demand: { type: Number, required: true },
  orderDate: { type: String, required: true },
  timeWindow: { type: String },
  status: { type: String, enum: ["Requested", "On the way", "Delivered", "Cancelled"], default: "Requested" },
  notes: { type: String },
});

module.exports = mongoose.model("Customer", CustomerSchema);
