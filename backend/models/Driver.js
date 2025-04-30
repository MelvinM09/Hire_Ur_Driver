import mongoose from 'mongoose';

const driverSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  licenseNumber: { type: String, required: true, unique: true },
  availability: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  // Add more fields as needed (e.g., rating, vehicle)
});

export default mongoose.model('Driver', driverSchema);