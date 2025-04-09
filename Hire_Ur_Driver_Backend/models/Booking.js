const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
  pickupLocation: String,
  dropLocation: String,
  time: Date,
  status: { type: String, default: 'Pending' }
});

module.exports = mongoose.model('Booking', bookingSchema);
