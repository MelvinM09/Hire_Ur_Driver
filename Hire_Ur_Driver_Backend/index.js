const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const driverRoutes = require('./routes/driverRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('🚀 Hire Ur Driver Backend is Running!');
});

app.use('/api/drivers', driverRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/auth', authRoutes);

// MongoDB Connection with enhanced options
mongoose.connect(process.env.MONGO_URI, {
  dbName: 'hire_ur_driver'
}).then(() => {
  console.log('MongoDB connected successfully to hire_ur_driver');
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error('MongoDB connection failed:', err.message);
  process.exit(1);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error encountered:', err.stack);
  res.status(500).json({ msg: 'Something went wrong on the server!' });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed.');
    process.exit(0);
  });
});