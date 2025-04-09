const express = require('express');
const router = express.Router();
const Driver = require('../models/Driver');

// Register new driver
router.post('/register', async (req, res) => {
  try {
    const newDriver = new Driver(req.body);
    await newDriver.save();
    res.status(201).json({ message: 'Driver registered successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});

module.exports = router;
