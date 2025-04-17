const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const Driver = require('../models/Driver');
const Admin = require('../models/Admin');

// Improved in-memory storage with automatic cleanup
const storage = {
  unverifiedRegistrations: new Map(),
  loginOtps: new Map(),
  registrationAttempts: new Map(),
  cleanup: function() {
    const now = Date.now();
    const OTP_EXPIRY_TIME = 10 * 60 * 1000; // 10 minutes
    
    // Cleanup unverified registrations
    for (const [email, data] of this.unverifiedRegistrations) {
      if (now - data.timestamp > OTP_EXPIRY_TIME) {
        this.unverifiedRegistrations.delete(email);
        console.log(`Cleaned up expired registration for ${email}`);
      }
    }
    
    // Cleanup login OTPs
    for (const [email, data] of this.loginOtps) {
      if (now - data.timestamp > OTP_EXPIRY_TIME) {
        this.loginOtps.delete(email);
        console.log(`Cleaned up expired login OTP for ${email}`);
      }
    }
  }
};

// Run cleanup every hour
setInterval(() => storage.cleanup(), 60 * 60 * 1000);

// Enhanced rate limiter
const otpRequestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  handler: (req, res) => {
    res.status(429).json({ 
      success: false,
      msg: 'Too many OTP requests. Please try again later.',
      retryAfter: req.rateLimit.resetTime
    });
  }
});

// Email transporter with better error handling
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD
    },
    pool: true,
    maxConnections: 1,
    rateLimit: 5 // 5 messages per second
  });
};

const transporter = createTransporter();

// Verify SMTP connection with retry logic
const verifyTransporter = async () => {
  try {
    await transporter.verify();
    console.log('SMTP Server is ready to send emails');
  } catch (error) {
    console.error('SMTP Connection Error:', error);
    // Attempt to recreate transporter after delay
    setTimeout(verifyTransporter, 10000);
  }
};
verifyTransporter();

// Enhanced email sending with retries
async function sendEmail(to, subject, text, html, retries = 3) {
  const mailOptions = {
    from: `"Hire Ur Driver" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    text,
    html
  };

  for (let i = 0; i < retries; i++) {
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent successfully to:', to);
      return { success: true, info };
    } catch (error) {
      console.error(`Email send attempt ${i + 1} failed:`, error.message);
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
    }
  }
}

// Enhanced login endpoint with detailed debugging
// ... (previous code remains unchanged until /login)

// ... (previous imports remain the same)

// Enhanced login endpoint
router.post('/login', [
  check('email', 'Please include valid email').isEmail().normalizeEmail(),
  check('password', 'Password is required').exists().trim()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array() 
    });
  }

  const { email, password } = req.body;
  const emailLower = email.toLowerCase();

  try {
    console.log('Login attempt for:', emailLower);
    console.log('Input password length:', password.length);

    // Case-insensitive search with collation
    const admin = await Admin.findOne({ email: { $regex: new RegExp(`^${emailLower}$`, 'i') } })
      .select('+password')
      .collation({ locale: 'en', strength: 2 });

    if (!admin) {
      console.log('No admin found with email:', emailLower);
      return res.status(400).json({ 
        success: false,
        msg: 'Invalid credentials' 
      });
    }

    console.log('Found admin:', {
      email: admin.email,
      _id: admin._id,
      passwordStartsWith: admin.password.substring(0, 10) + '...'
    });

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      console.log('Password mismatch for admin:', emailLower);
      return res.status(400).json({ 
        success: false,
        msg: 'Invalid credentials' 
      });
    }

    const token = admin.getSignedJwtToken();
    console.log('Login successful for:', emailLower);

    res.json({ 
      success: true,
      token,
      role: admin.role,
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email
      }
    });

  } catch (err) {
    console.error('Login error:', {
      message: err.message,
      stack: err.stack,
      emailAttempted: emailLower
    });
    res.status(500).json({ 
      success: false,
      msg: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// ... (rest of the routes remain the same)

// ... (rest of the code remains unchanged)

// Enhanced registration endpoint
router.post('/register', [
  otpRequestLimiter,
  check('name', 'Name is required').not().isEmpty().trim(),
  check('email', 'Please include valid email').isEmail().normalizeEmail(),
  check('password', 'Password must be 6+ characters').isLength({ min: 6 }).trim(),
  check('role', 'Role must be user or driver').isIn(['user', 'driver'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array() 
    });
  }

  const { name, email, password, role } = req.body;
  const emailLower = email.toLowerCase();

  try {
    // Check for existing email across all collections
    const existingRecords = await Promise.all([
      User.findOne({ email: emailLower }),
      Driver.findOne({ email: emailLower }),
      Admin.findOne({ email: emailLower })
    ]);

    if (existingRecords.some(record => record !== null)) {
      return res.status(400).json({ 
        success: false,
        msg: 'Email already exists' 
      });
    }

    const attempts = storage.registrationAttempts.get(emailLower) || 0;
    if (attempts >= 100) {
      return res.status(429).json({ 
        success: false,
        msg: 'Too many registration attempts' 
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    storage.unverifiedRegistrations.set(emailLower, { 
      name, 
      email: emailLower, 
      password, 
      role, 
      otp, 
      timestamp: Date.now() 
    });
    storage.registrationAttempts.set(emailLower, attempts + 1);

    await sendEmail(
      emailLower,
      'Your OTP for Registration',
      `Your OTP is ${otp}. Valid for 10 minutes.`,
      `<div>
        <h2>Hire Ur Driver Registration</h2>
        <p>Your OTP is: <strong>${otp}</strong></p>
        <p>Valid for 10 minutes.</p>
      </div>`
    );

    res.status(201).json({ 
      success: true,
      msg: 'OTP sent to your email' 
    });

  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ 
      success: false,
      msg: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// OTP Verification endpoint
router.post('/verify-otp', [
  check('otp', 'OTP is required').not().isEmpty().trim(),
  check('email', 'Email is required').isEmail().normalizeEmail()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array() 
    });
  }

  const { otp, email } = req.body;
  const emailLower = email.toLowerCase();

  try {
    const registrationData = storage.unverifiedRegistrations.get(emailLower);
    
    if (!registrationData) {
      return res.status(400).json({ 
        success: false,
        msg: 'No pending registration found' 
      });
    }

    if (Date.now() - registrationData.timestamp > 10 * 60 * 1000) {
      storage.unverifiedRegistrations.delete(emailLower);
      return res.status(400).json({ 
        success: false,
        msg: 'OTP has expired' 
      });
    }

    if (registrationData.otp !== otp) {
      return res.status(400).json({ 
        success: false,
        msg: 'Invalid OTP' 
      });
    }

    let user;
    switch (registrationData.role) {
      case 'driver':
        user = new Driver({
          name: registrationData.name,
          email: registrationData.email,
          password: registrationData.password,
          role: registrationData.role,
          location: {
            type: 'Point',
            coordinates: [0, 0]
          }
        });
        break;
      case 'user':
      default:
        user = new User({
          name: registrationData.name,
          email: registrationData.email,
          password: registrationData.password,
          role: registrationData.role
        });
        break;
    }

    await user.save();
    storage.unverifiedRegistrations.delete(emailLower);
    storage.registrationAttempts.delete(emailLower);

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
    res.status(500).json({ 
      success: false,
      msg: 'Server error during OTP verification',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// OTP Login Request
router.post('/request-login-otp', [
  otpRequestLimiter,
  check('email', 'Please include valid email').isEmail().normalizeEmail()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array() 
    });
  }

  const { email } = req.body;
  const emailLower = email.toLowerCase();

  try {
    const query = { email: emailLower };
    const options = { collation: { locale: 'en', strength: 2 } };
    const [user, driver, admin] = await Promise.all([
      User.findOne(query, null, options),
      Driver.findOne(query, null, options),
      Admin.findOne(query, null, options)
    ]);

    const foundUser = user || driver || admin;
    
    if (!foundUser) {
      return res.status(404).json({ 
        success: false,
        msg: 'User not found' 
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    storage.loginOtps.set(emailLower, {
      email: emailLower,
      otp,
      userId: foundUser._id,
      timestamp: Date.now()
    });

    await sendEmail(
      emailLower,
      'Your Login OTP',
      `Your OTP is ${otp}. Valid for 10 minutes.`,
      `<div>
        <h2>Hire Ur Driver Login</h2>
        <p>Your OTP is: <strong>${otp}</strong></p>
        <p>Valid for 10 minutes.</p>
      </div>`
    );

    res.status(200).json({ 
      success: true,
      msg: 'OTP sent to your email' 
    });

  } catch (err) {
    console.error('OTP request error:', err);
    res.status(500).json({ 
      success: false,
      msg: 'Server error during OTP request',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Verify Login OTP
router.post('/verify-login-otp', [
  check('email', 'Email is required').isEmail().normalizeEmail(),
  check('otp', 'OTP is required').not().isEmpty().trim()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array() 
    });
  }

  const { email, otp } = req.body;
  const emailLower = email.toLowerCase();

  try {
    const otpData = storage.loginOtps.get(emailLower);
    
    if (!otpData || otpData.otp !== otp) {
      return res.status(400).json({ 
        success: false,
        msg: 'Invalid OTP' 
      });
    }

    if (Date.now() - otpData.timestamp > 10 * 60 * 1000) {
      storage.loginOtps.delete(emailLower);
      return res.status(400).json({ 
        success: false,
        msg: 'OTP has expired' 
      });
    }

    const query = { _id: otpData.userId };
    const options = { collation: { locale: 'en', strength: 2 } };
    const [user, driver, admin] = await Promise.all([
      User.findOne(query, null, options),
      Driver.findOne(query, null, options),
      Admin.findOne(query, null, options)
    ]);

    const foundUser = user || driver || admin;
    if (!foundUser) {
      return res.status(404).json({ 
        success: false,
        msg: 'User not found' 
      });
    }

    storage.loginOtps.delete(emailLower);
    const token = foundUser.getSignedJwtToken();
    
    res.json({ 
      success: true,
      token,
      role: foundUser.role || (driver ? 'driver' : admin ? 'admin' : 'user'),
      user: {
        id: foundUser._id,
        name: foundUser.name,
        email: foundUser.email
      }
    });

  } catch (err) {
    console.error('OTP verification error:', err);
    res.status(500).json({ 
      success: false,
      msg: 'Server error during OTP verification',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Password Reset Request Endpoint
router.post('/forgot-password', [
  otpRequestLimiter,
  check('email', 'Please include a valid email').isEmail().normalizeEmail()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array() 
    });
  }

  const { email } = req.body;
  const emailLower = email.toLowerCase();

  try {
    const query = { email: emailLower };
    const options = { collation: { locale: 'en', strength: 2 } };
    const [user, driver, admin] = await Promise.all([
      User.findOne(query, null, options),
      Driver.findOne(query, null, options),
      Admin.findOne(query, null, options)
    ]);

    const foundUser = user || driver || admin;

    if (!foundUser) {
      return res.status(404).json({ 
        success: false,
        msg: 'User not found' 
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    storage.loginOtps.set(emailLower, {
      email: emailLower,
      otp,
      userId: foundUser._id,
      timestamp: Date.now(),
      purpose: 'password_reset'
    });

    await sendEmail(
      emailLower,
      'Password Reset OTP',
      `Your OTP for password reset is ${otp}. Valid for 10 minutes.`,
      `<div>
        <h2>Hire Ur Driver Password Reset</h2>
        <p>Your OTP is: <strong>${otp}</strong></p>
        <p>Valid for 10 minutes.</p>
      </div>`
    );

    res.status(200).json({ 
      success: true,
      msg: 'Password reset OTP sent to your email' 
    });

  } catch (err) {
    console.error('Password reset request error:', err);
    res.status(500).json({ 
      success: false,
      msg: 'Server error during password reset request',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Password Reset Verification and Update Endpoint
router.post('/reset-password', [
  check('email', 'Please include a valid email').isEmail().normalizeEmail(),
  check('otp', 'OTP is required').not().isEmpty().trim(),
  check('newPassword', 'New password must be 6+ characters').isLength({ min: 6 }).trim()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array() 
    });
  }

  const { email, otp, newPassword } = req.body;
  const emailLower = email.toLowerCase();

  try {
    const otpData = storage.loginOtps.get(emailLower);

    if (!otpData || otpData.otp !== otp || otpData.purpose !== 'password_reset') {
      return res.status(400).json({ 
        success: false,
        msg: 'Invalid or incorrect OTP' 
      });
    }

    if (Date.now() - otpData.timestamp > 10 * 60 * 1000) {
      storage.loginOtps.delete(emailLower);
      return res.status(400).json({ 
        success: false,
        msg: 'OTP has expired' 
      });
    }

    const query = { _id: otpData.userId };
    const options = { collation: { locale: 'en', strength: 2 } };
    const [user, driver, admin] = await Promise.all([
      User.findOne(query, null, options),
      Driver.findOne(query, null, options),
      Admin.findOne(query, null, options)
    ]);

    const foundUser = user || driver || admin;
    if (!foundUser) {
      return res.status(404).json({ 
        success: false,
        msg: 'User not found' 
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    foundUser.password = hashedPassword;
    await foundUser.save();

    storage.loginOtps.delete(emailLower);
    res.status(200).json({ 
      success: true,
      msg: 'Password reset successfully' 
    });

  } catch (err) {
    console.error('Password reset error:', err);
    res.status(500).json({ 
      success: false,
      msg: 'Server error during password reset',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

module.exports = router;