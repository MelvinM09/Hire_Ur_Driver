const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  licenseNumber: String,
  isAvailable: { type: Boolean, default: true }
});

module.exports = mongoose.model('Driver', driverSchema);
