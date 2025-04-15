const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true },
  pickupLocation: {
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true },
    address: String
  },
  dropLocation: {
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true },
    address: String
  },
  bookingTime: { type: Date, default: Date.now },
  startTime: Date,
  endTime: Date,
  estimatedFare: Number,
  actualFare: Number,
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'arrived', 'started', 'completed', 'cancelled'],
    default: 'pending'
  },
  cancellationReason: String,
  rating: { type: Number, min: 1, max: 5 },
  feedback: String
});

// Geospatial indexes
bookingSchema.index({ pickupLocation: '2dsphere' });
bookingSchema.index({ dropLocation: '2dsphere' });

module.exports = mongoose.model('Booking', bookingSchema);