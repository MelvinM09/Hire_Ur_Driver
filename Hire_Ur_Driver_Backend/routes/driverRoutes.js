const express = require('express');
const router = express.Router();
const Driver = require('../models/Driver');
const User = require('../models/User');
const { check, validationResult } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');

// @route   POST /api/drivers
// @desc    Create a new driver with associated user account
// @access  Private (Admin only)
router.post(
  '/',
  [
    protect,
    authorize('admin'),
    check('name', 'Name is required').not().isEmpty().trim(),
    check('email', 'Please include a valid email').isEmail().normalizeEmail(),
    check('phoneNumber', 'Phone number is required').not().isEmpty().trim(),
    check('password', 'Password must be 6+ characters').isLength({ min: 6 }).trim()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { name, email, phoneNumber, password } = req.body;

      // Create user account
      const user = new User({
        name,
        email,
        phoneNumber,
        password, // Stored as plaintext (pre('save') disabled)
        role: 'driver'
      });
      await user.save();

      // Create driver profile
      const driver = new Driver({
        user: user._id,
        name,
        email,
        phoneNumber,
        password, // Stored as plaintext (pre('save') disabled)
        vehicleType: 'NA', // Default to NA
        rating: null, // Default to null
        location: {
          type: 'Point',
          coordinates: [0, 0]
        },
        available: true,
        isVerified: false
      });
      await driver.save();

      res.status(201).json({
        success: true,
        driver: {
          id: driver._id,
          name: driver.name,
          email: driver.email,
          role: driver.role
        }
      });

    } catch (err) {
      console.error('Driver creation error:', {
        message: err.message,
        stack: err.stack,
        requestBody: req.body
      });
      res.status(500).json({
        success: false,
        msg: 'Server error during driver creation',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  }
);

// @route   GET /api/drivers/nearby
// @desc    Get nearby available and verified drivers
// @access  Private
router.get('/nearby', protect, async (req, res) => {
  try {
    const { longitude, latitude, maxDistance = 5000 } = req.query;

    if (!longitude || !latitude) {
      return res.status(400).json({
        success: false,
        msg: 'Longitude and latitude are required'
      });
    }

    const drivers = await Driver.find({
      available: true,
      isVerified: true,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      }
    }).limit(10);

    res.json({
      success: true,
      drivers
    });

  } catch (err) {
    console.error('Nearby drivers error:', {
      message: err.message,
      stack: err.stack,
      query: req.query
    });
    res.status(500).json({
      success: false,
      msg: 'Server error fetching nearby drivers',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// @route   PUT /api/drivers/:id/availability
// @desc    Update driver availability and optional location
// @access  Private
router.put('/:id/availability', protect, async (req, res) => {
  try {
    const driver = await Driver.findOne({ user: req.user.id });
    if (!driver) {
      return res.status(404).json({ success: false, msg: 'Driver not found' });
    }

    // Validate availability
    const { available } = req.body;
    if (typeof available !== 'boolean') {
      return res.status(400).json({
        success: false,
        msg: 'Available must be a boolean value'
      });
    }

    driver.available = available;

    // Update location if provided
    if (req.body.location && req.body.location.coordinates && Array.isArray(req.body.location.coordinates)) {
      driver.location = {
        type: 'Point',
        coordinates: req.body.location.coordinates.map(coord => parseFloat(coord))
      };
    }

    await driver.save();

    res.json({
      success: true,
      driver: {
        id: driver._id,
        available: driver.available,
        location: driver.location
      }
    });

  } catch (err) {
    console.error('Update availability error:', {
      message: err.message,
      stack: err.stack,
      requestBody: req.body
    });
    res.status(500).json({
      success: false,
      msg: 'Server error updating availability',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

module.exports = router;