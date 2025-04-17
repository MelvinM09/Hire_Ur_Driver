const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
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
    default: 'admin',
    enum: ['admin']
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Enhanced password hashing with better logging
adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    console.log('Hashing password for admin:', this.email);
    console.log('Original password length:', this.password.length);
    this.password = await bcrypt.hash(this.password, 12); // Increased salt rounds
    console.log('Password hashed successfully');
    next();
  } catch (err) {
    console.error('Error hashing password:', err);
    next(err);
  }
});

// Improved password comparison method
adminSchema.methods.matchPassword = async function(enteredPassword) {
  try {
    console.log('Password comparison for:', this.email);
    console.log('Entered password length:', enteredPassword.length);
    console.log('Stored password starts with:', this.password.substring(0, 10) + '...');
    
    const match = await bcrypt.compare(enteredPassword, this.password);
    console.log('Password match result:', match);
    return match;
  } catch (err) {
    console.error('Error comparing passwords:', err);
    throw err;
  }
};

// JWT Token generation
adminSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id, role: this.role, email: this.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

// Better error handling for duplicate email
adminSchema.post('save', function(error, doc, next) {
  if (error.name === 'MongoServerError' && error.code === 11000) {
    next(new Error('Email already exists'));
  } else {
    next(error);
  }
});

module.exports = mongoose.model('Admin', adminSchema, 'admin');