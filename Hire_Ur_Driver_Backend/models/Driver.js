const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  licenseNumber: { type: String, required: [true, 'Please provide license number'], unique: true },
  vehicleType: { type: String, enum: ['sedan', 'suv', 'luxury', 'van'], required: true },
  vehicleNumber: { type: String, required: [true, 'Please provide vehicle number'], unique: true, uppercase: true },
  available: { type: Boolean, default: true },
  rating: { type: Number, min: 1, max: 5, default: 3 },
  location: {
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true }
  },
  documents: {
    licenseImage: String,
    rcBookImage: String,
    aadharCardImage: String
  },
  isVerified: { type: Boolean, default: false }
});

// Create geospatial index for driver location
driverSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Driver', driverSchema);