const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Environment variable to toggle password hashing (for debugging)
const DISABLE_PASSWORD_HASHING = process.env.DISABLE_PASSWORD_HASHING === 'true';

const driverSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide name'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide email'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    index: true
  },
  password: {
    type: String,
    required: [true, 'Please provide password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    default: 'driver',
    enum: ['driver']
  },
  licenseNumber: { 
    type: String,
    default: ''
  },
  vehicleType: { 
    type: String, 
    enum: [null, 'sedan', 'suv', 'luxury', 'van'], // Allow null as a valid value
    default: null // Set to null initially
  },
  vehicleNumber: { 
    type: String, 
    uppercase: true,
    default: ''
  },
  available: { 
    type: Boolean, 
    default: true 
  },
  rating: { 
    type: Number, 
    min: 1, 
    max: 5, 
    default: null // Changed from 3 to null initially
  },
  location: {
    type: { 
      type: String, 
      enum: ['Point'], 
      default: 'Point' 
    },
    coordinates: { 
      type: [Number], 
      default: [0, 0] 
    }
  },
  documents: {
    licenseImage: { type: String, default: '' },
    rcBookImage: { type: String, default: '' },
    aadharCardImage: { type: String, default: '' }
  },
  isVerified: { 
    type: Boolean, 
    default: false 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Create geospatial index for driver location
driverSchema.index({ location: '2dsphere' });

// Hash password before saving
driverSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  if (DISABLE_PASSWORD_HASHING) {
    console.log('Password hashing disabled. Storing plaintext:', this.password);
  } else {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Method to compare password
driverSchema.methods.matchPassword = async function(enteredPassword) {
  if (DISABLE_PASSWORD_HASHING) {
    return enteredPassword === this.password;
  }
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to generate signed JWT token
driverSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id, role: this.role, email: this.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

// Ensure email uniqueness with a custom error message
driverSchema.post('save', function(error, doc, next) {
  if (error.name === 'MongoServerError' && error.code === 11000) {
    next(new Error('Email already exists'));
  } else {
    next(error);
  }
});

module.exports = mongoose.model('Driver', driverSchema);