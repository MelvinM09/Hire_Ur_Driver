const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Environment variable to toggle password hashing (for debugging)
const DISABLE_PASSWORD_HASHING = process.env.DISABLE_PASSWORD_HASHING === 'true';

const userSchema = new mongoose.Schema({
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
    lowercase: true, // Normalize email to lowercase
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    index: true // Improve query performance
  },
  password: {
    type: String,
    required: [true, 'Please provide password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Hide password by default in queries
  },
  role: {
    type: String,
    enum: {
      values: ['user', 'driver', 'admin'],
      message: 'Role must be user, driver, or admin'
    },
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true // Improve sorting/querying by creation date
  },
  isActive: {
    type: Boolean,
    default: true // Allow deactivating users without deleting
  }
});

// Hash password before saving (configurable)
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  if (DISABLE_PASSWORD_HASHING) {
    console.log('Password hashing disabled. Storing plaintext:', this.password);
  } else {
    this.password = await bcrypt.hash(this.password, 10);
    console.log('Password hashed successfully');
  }
  next();
});

// Method to compare password
userSchema.methods.matchPassword = async function(enteredPassword) {
  if (DISABLE_PASSWORD_HASHING) {
    return enteredPassword === this.password; // Plaintext comparison
  }
  return await bcrypt.compare(enteredPassword, this.password); // Hashed comparison
};

// Method to generate signed JWT token
userSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id, role: this.role, email: this.email }, // Include email in payload
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '30d' } // Default to 30 days if not set
  );
};

// Ensure email uniqueness with a custom error message
userSchema.post('save', function(error, doc, next) {
  if (error.name === 'MongoServerError' && error.code === 11000) {
    next(new Error('Email already exists'));
  } else {
    next(error);
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;