import express from 'express';
import Booking from '../models/Booking.js';
import User from '../models/User.js';
import Driver from '../models/Driver.js';

const router = express.Router();

// Create a new booking
router.post('/', async (req, res) => {
  try {
    const { userId, driverId, pickupLocation, dropoffLocation, bookingTime } = req.body;

    // Validate user and driver existence
    const user = await User.findById(userId);
    const driver = await Driver.findById(driverId);

    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!driver) return res.status(404).json({ message: 'Driver not found' });
    if (!driver.availability) return res.status(400).json({ message: 'Driver is not available' });

    const booking = new Booking({
      user: userId,
      driver: driverId,
      pickupLocation,
      dropoffLocation,
      bookingTime: new Date(bookingTime),
      status: 'pending',
    });

    await booking.save();

    // Update driver availability
    driver.availability = false;
    await driver.save();

    res.status(201).json(booking);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get all bookings
router.get('/', async (req, res) => {
  try {
    const bookings = await Booking.find().populate('user driver');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a specific booking by ID
router.get('/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('user driver');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update a booking (e.g., change status or details)
router.put('/:id', async (req, res) => {
  try {
    const { status, pickupLocation, dropoffLocation, bookingTime } = req.body;

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (status) booking.status = status;
    if (pickupLocation) booking.pickupLocation = pickupLocation;
    if (dropoffLocation) booking.dropoffLocation = dropoffLocation;
    if (bookingTime) booking.bookingTime = new Date(bookingTime);

    await booking.save();

    // If booking is completed or cancelled, make the driver available again
    if (status === 'completed' || status === 'cancelled') {
      const driver = await Driver.findById(booking.driver);
      if (driver) {
        driver.availability = true;
        await driver.save();
      }
    }

    res.json(booking);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a booking
router.delete('/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Make the driver available again if the booking is deleted
    const driver = await Driver.findById(booking.driver);
    if (driver) {
      driver.availability = true;
      await driver.save();
    }

    await booking.deleteOne();
    res.json({ message: 'Booking deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;