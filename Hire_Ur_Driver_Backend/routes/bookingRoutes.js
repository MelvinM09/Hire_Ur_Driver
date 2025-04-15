const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Driver = require('../models/Driver');
const { protect } = require('../middleware/auth');

// @route   POST /api/bookings
router.post('/', protect, async (req, res) => {
  try {
    // Find nearest available driver
    const driver = await Driver.findOne({
      available: true,
      isVerified: true,
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: req.body.pickupLocation.coordinates
          },
          $maxDistance: 5000 // 5km radius
        }
      }
    });
    if (!driver) {
      return res.status(400).json({ msg: 'No available drivers nearby' });
    }
    const booking = new Booking({
      user: req.user.id,
      driver: driver._id,
      ...req.body
    });
    await booking.save();
    // Mark driver as unavailable
    driver.available = false;
    await driver.save();
    res.status(201).json(booking);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/bookings
router.get('/', protect, async (req, res) => {
  try {
    let bookings;
    if (req.user.role === 'admin') {
      bookings = await Booking.find()
        .populate('user', 'name email phoneNumber')
        .populate('driver', 'vehicleType vehicleNumber rating');
    } else {
      bookings = await Booking.find({ user: req.user.id })
        .populate('driver', 'vehicleType vehicleNumber rating');
    }
    res.json(bookings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/bookings/:id/status
router.put('/:id/status', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ msg: 'Booking not found' });
    }
    // Add status transition validation here
    booking.status = req.body.status;
    if (req.body.status === 'completed') {
      booking.endTime = Date.now();
      const driver = await Driver.findById(booking.driver);
      driver.available = true;
      await driver.save();
    }
    await booking.save();
    res.json(booking);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;