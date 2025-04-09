const express = require('express');
const router = express.Router();
const Driver = require('../models/Driver');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// @route   POST /api/drivers
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    // First create user account
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      phoneNumber: req.body.phoneNumber,
      password: req.body.password,
      role: 'driver'
    });
    await user.save();
    // Then create driver profile
    const driver = new Driver({
      user: user._id,
      ...req.body
    });
    await driver.save();
    res.status(201).json(driver);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/drivers/nearby
router.get('/nearby', protect, async (req, res) => {
  try {
    const { longitude, latitude, maxDistance = 5000 } = req.query;
    const drivers = await Driver.find({
      available: true,
      isVerified: true,
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      }
    }).limit(10);
    res.json(drivers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/drivers/:id/availability
router.put('/:id/availability', protect, async (req, res) => {
  try {
    const driver = await Driver.findOne({ user: req.user.id });
    if (!driver) {
      return res.status(404).json({ msg: 'Driver not found' });
    }
    driver.available = req.body.available;
    if (req.body.location) {
      driver.location = req.body.location;
    }
    await driver.save();
    res.json(driver);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;