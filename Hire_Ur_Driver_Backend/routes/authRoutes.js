const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');

// In-memory storage
const unverifiedRegistrations = new Map();
const loginOtps = new Map();
const registrationAttempts = new Map();
const OTP_EXPIRY_TIME = 10 * 60 * 1000; // 10 minutes
const MAX_REGISTRATION_ATTEMPTS = 100;

// Rate limiter for OTP requests
const otpRequestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit to 5 requests per window
  message: 'Too many OTP requests. Please try again later.'
});

// Email transporter (Gmail)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

// Alternative: Ethereal for testing (uncomment to use)
/*
const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: 'your-ethereal-user@ethereal.email', // Replace with Ethereal user
    pass: 'your-ethereal-password' // Replace with Ethereal password
  }
});
*/

// Debug environment variables
console.log('Gmail User:', process.env.GMAIL_USER);
console.log('Gmail App Password:', process.env.GMAIL_APP_PASSWORD ? 'Set' : 'Not set');

// Verify SMTP connection
transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP Connection Error:', error.stack);
  } else {
    console.log('SMTP Server is ready to send emails');
  }
});

// Centralized email sending function with detailed error logging
async function sendEmail(to, subject, text, html) {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to,
    subject,
    text,
    html
  };
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', {
      response: info.response,
      messageId: info.messageId,
      to,
      subject
    });
    return { success: true, info };
  } catch (error) {
    console.error('Email sending failed:', {
      error: error.message,
      stack: error.stack,
      code: error.code,
      errno: error.errno,
      syscall: error.syscall
    });
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

// Test email endpoint
router.get('/test-email', async (req, res) => {
  try {
    await sendEmail(
      'test@example.com', // Replace with your test email
      'Test Email from Hire Ur Driver',
      'This is a test email to verify Nodemailer configuration.',
      '<strong>This is a test email to verify Nodemailer configuration.</strong>'
    );
    res.json({ msg: 'Test email sent successfully' });
  } catch (err) {
    console.error('Test email error:', err.stack);
    res.status(500).json({ msg: err.message || 'Failed to send test email' });
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
  otpRequestLimiter,
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

    await sendEmail(
      email,
      'Your OTP for Registration',
      `Your OTP is ${otp}. Valid for 10 minutes.`,
      `<strong>Your OTP is ${otp}. Valid for 10 minutes.</strong>`
    );

    res.status(201).json({ msg: 'OTP sent to your email' });
  } catch (err) {
    console.error('Registration error:', err.stack);
    res.status(500).json({ msg: err.message || 'Server error during registration' });
  }
});

// Resend OTP endpoint
router.post('/resend-otp', [
  otpRequestLimiter,
  check('email', 'Please include valid email').isEmail().normalizeEmail()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email } = req.body;

  try {
    const registrationData = unverifiedRegistrations.get(email.toLowerCase());
    if (!registrationData) {
      return res.status(400).json({ msg: 'No pending registration found for this email' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    registrationData.otp = otp;
    registrationData.timestamp = Date.now();
    unverifiedRegistrations.set(email.toLowerCase(), registrationData);

    await sendEmail(
      email,
      'Your New OTP for Registration',
      `Your new OTP is ${otp}. Valid for 10 minutes.`,
      `<strong>Your new OTP is ${otp}. Valid for 10 minutes.</strong>`
    );

    res.status(200).json({ msg: 'New OTP sent to your email. Please verify.' });
  } catch (err) {
    console.error('Resend OTP error:', err.stack);
    res.status(500).json({ msg: err.message || 'Server error during OTP resend' });
  }
});

// Login endpoint
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
    console.error('Login error:', err.stack);
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
    console.error('OTP verification error:', err.stack);
    res.status(500).json({ msg: 'Server error during OTP verification' });
  }
});

// OTP Login Request
router.post('/request-login-otp', [
  otpRequestLimiter,
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

    await sendEmail(
      email,
      'Your Login OTP',
      `Your OTP is ${otp}. Valid for 10 minutes.`,
      `<strong>Your OTP is ${otp}. Valid for 10 minutes.</strong>`
    );

    res.status(200).json({ msg: 'OTP sent to your email' });
  } catch (err) {
    console.error('OTP request error:', err.stack);
    res.status(500).json({ msg: err.message || 'Server error during OTP request' });
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
    console.error('OTP verification error:', err.stack);
    res.status(500).json({ msg: 'Server error during OTP verification' });
  }
});

// Password Reset Request Endpoint
router.post('/forgot-password', [
  otpRequestLimiter,
  check('email', 'Please include a valid email').isEmail().normalizeEmail()
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
      timestamp: Date.now(),
      purpose: 'password_reset'
    });

    await sendEmail(
      email,
      'Password Reset OTP',
      `Your OTP for password reset is ${otp}. Valid for 10 minutes.`,
      `<strong>Your OTP for password reset is ${otp}. Valid for 10 minutes.</strong>`
    );

    res.status(200).json({ msg: 'Password reset OTP sent to your email' });
  } catch (err) {
    console.error('Password reset request error:', err.stack);
    res.status(500).json({ msg: err.message || 'Server error during password reset request' });
  }
});

// Password Reset Verification and Update Endpoint
router.post('/reset-password', [
  check('email', 'Please include a valid email').isEmail().normalizeEmail(),
  check('otp', 'OTP is required').not().isEmpty().trim(),
  check('newPassword', 'New password must be 6 or more characters').isLength({ min: 6 }).trim()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, otp, newPassword } = req.body;

  try {
    const otpData = loginOtps.get(email.toLowerCase());

    if (!otpData || otpData.otp !== otp || otpData.purpose !== 'password_reset') {
      return res.status(400).json({ msg: 'Invalid or incorrect OTP' });
    }

    if (Date.now() - otpData.timestamp > OTP_EXPIRY_TIME) {
      loginOtps.delete(email.toLowerCase());
      return res.status(400).json({ msg: 'OTP has expired' });
    }

    const user = await User.findById(otpData.userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    loginOtps.delete(email.toLowerCase());
    res.status(200).json({ msg: 'Password reset successfully' });
  } catch (err) {
    console.error('Password reset error:', err.stack);
    res.status(500).json({ msg: 'Server error during password reset' });
  }
});

module.exports = router;