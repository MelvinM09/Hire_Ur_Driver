const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');

// In-memory storage
const unverifiedRegistrations = new Map();
const loginOtps = new Map();
const registrationAttempts = new Map();
const OTP_EXPIRY_TIME = 10 * 60 * 1000; // 10 minutes
const MAX_REGISTRATION_ATTEMPTS = 100;

// Email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

// Cleanup expired data hourly
setInterval(cleanupExpiredData, 60 * 60 * 1000);

function cleanupExpiredData() {
  const now = Date.now();
  
  // Cleanup registrations
  for (const [email, data] of unverifiedRegistrations) {
    if (now - data.timestamp > OTP_EXPIRY_TIME) {
      unverifiedRegistrations.delete(email);
      console.log(`Cleaned up expired registration for ${email}`);
    }
  }
  
  // Cleanup login OTPs
  for (const [email, data] of loginOtps) {
    if (now - data.timestamp > OTP_EXPIRY_TIME) {
      loginOtps.delete(email);
      console.log(`Cleaned up expired login OTP for ${email}`);
    }
  }
}

// Registration endpoint
router.post('/register', [
  check('name', 'Name is required').not().isEmpty().trim(),
  check('email', 'Please include valid email').isEmail().normalizeEmail(),
  check('password', 'Password must be 6 or more characters').isLength({ min: 6 }).trim(),
  check('role', 'Role must be user, driver, or admin').isIn(['user', 'driver', 'admin'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password, role } = req.body;

  try {
    // Case-insensitive email check
    const existingUser = await User.findOne({ 
      email: { $regex: new RegExp(`^${email}$`, 'i') } 
    });
    
    if (existingUser) {
      return res.status(400).json({ msg: 'Email already exists' });
    }

    const attempts = registrationAttempts.get(email.toLowerCase()) || 0;
    if (attempts >= MAX_REGISTRATION_ATTEMPTS) {
      return res.status(429).json({ msg: 'Too many registration attempts' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const registrationData = { 
      name, 
      email: email.toLowerCase(), 
      password, 
      role, 
      otp, 
      timestamp: Date.now() 
    };

    unverifiedRegistrations.set(email.toLowerCase(), registrationData);
    registrationAttempts.set(email.toLowerCase(), attempts + 1);

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Your OTP for Registration',
      text: `Your OTP is ${otp}. Valid for 10 minutes.`,
      html: `<strong>Your OTP is ${otp}. Valid for 10 minutes.</strong>`
    };

    await transporter.sendMail(mailOptions);
    res.status(201).json({ msg: 'OTP sent to your email' });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ msg: 'Server error during registration' });
  }
});

// Login endpoint - FIXED VERSION
router.post('/login', [
  check('email', 'Please include valid email').isEmail().normalizeEmail(),
  check('password', 'Password is required').exists().trim()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // Case-insensitive email search with password select
    const user = await User.findOne({ 
      email: { $regex: new RegExp(`^${email}$`, 'i') }
    }).select('+password');

    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Debug logs (can remove after testing)
    console.log('Login attempt for:', user.email);
    console.log('Stored hash:', user.password);
    console.log('Input password:', password);

    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const token = user.getSignedJwtToken();
    res.json({ 
      success: true,
      token, 
      role: user.role,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ msg: 'Server error during login' });
  }
});

// OTP Verification endpoint
router.post('/verify-otp', [
  check('otp', 'OTP is required').not().isEmpty().trim(),
  check('email', 'Email is required').isEmail().normalizeEmail()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { otp, email } = req.body;

  try {
    const registrationData = unverifiedRegistrations.get(email.toLowerCase());
    
    if (!registrationData) {
      return res.status(400).json({ msg: 'No pending registration found' });
    }

    if (Date.now() - registrationData.timestamp > OTP_EXPIRY_TIME) {
      unverifiedRegistrations.delete(email.toLowerCase());
      return res.status(400).json({ msg: 'OTP has expired' });
    }

    if (registrationData.otp !== otp) {
      return res.status(400).json({ msg: 'Invalid OTP' });
    }

    const hashedPassword = await bcrypt.hash(registrationData.password, 10);
    const user = new User({
      name: registrationData.name,
      email: registrationData.email,
      password: hashedPassword,
      role: registrationData.role
    });

    await user.save();
    unverifiedRegistrations.delete(email.toLowerCase());
    registrationAttempts.delete(email.toLowerCase());

    const token = user.getSignedJwtToken();
    res.json({ 
      success: true, 
      token, 
      role: user.role,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    console.error('OTP verification error:', err);
    res.status(500).json({ msg: 'Server error during OTP verification' });
  }
});

// OTP Login Request
router.post('/request-login-otp', [
  check('email', 'Please include valid email').isEmail().normalizeEmail()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email } = req.body;

  try {
    const user = await User.findOne({ 
      email: { $regex: new RegExp(`^${email}$`, 'i') } 
    });
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    loginOtps.set(email.toLowerCase(), {
      email: email.toLowerCase(),
      otp,
      userId: user._id,
      timestamp: Date.now()
    });

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Your Login OTP',
      text: `Your OTP is ${otp}. Valid for 10 minutes.`,
      html: `<strong>Your OTP is ${otp}. Valid for 10 minutes.</strong>`
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ msg: 'OTP sent to your email' });
  } catch (err) {
    console.error('OTP request error:', err);
    res.status(500).json({ msg: 'Server error during OTP request' });
  }
});

// Verify Login OTP
router.post('/verify-login-otp', [
  check('email', 'Email is required').isEmail().normalizeEmail(),
  check('otp', 'OTP is required').not().isEmpty().trim()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, otp } = req.body;

  try {
    const otpData = loginOtps.get(email.toLowerCase());
    
    if (!otpData || otpData.otp !== otp) {
      return res.status(400).json({ msg: 'Invalid OTP' });
    }

    if (Date.now() - otpData.timestamp > OTP_EXPIRY_TIME) {
      loginOtps.delete(email.toLowerCase());
      return res.status(400).json({ msg: 'OTP has expired' });
    }

    const user = await User.findById(otpData.userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    loginOtps.delete(email.toLowerCase());
    const token = user.getSignedJwtToken();
    
    res.json({ 
      success: true,
      token, 
      role: user.role,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    console.error('OTP verification error:', err);
    res.status(500).json({ msg: 'Server error during OTP verification' });
  }
});

module.exports = router;