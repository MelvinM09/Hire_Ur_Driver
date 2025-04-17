const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const bcrypt = require('bcryptjs');

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hire_ur_driver';

// Updated MongoDB connection without deprecated options
mongoose.connect(mongoURI)
  .then(() => {
    console.log('MongoDB connected successfully');
    // Start seeding only after successful connection
    seedAdmin();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function seedAdmin() {
  try {
    console.log('\n=== Starting Admin Seeding Process ===');
    
    const adminData = {
      name: 'Admin User',
      email: 'admin@hireurdriver.com',
      password: 'admin@123', // 8 characters
      role: 'admin'
    };

    console.log('Admin credentials:', {
      email: adminData.email,
      password: adminData.password,
      passwordLength: adminData.password.length
    });

    // Check for existing admin
    let admin = await Admin.findOne({ email: adminData.email });
    
    if (admin) {
      console.log('Admin already exists, updating password...');
      admin.password = adminData.password;
    } else {
      console.log('Creating new admin...');
      admin = new Admin(adminData);
    }

    // Save the admin (this will trigger the pre-save hook to hash the password)
    await admin.save();
    console.log('Admin saved successfully:', {
      _id: admin._id,
      email: admin.email,
      createdAt: admin.createdAt
    });

    // Verify the admin can be retrieved and password matches
    const verifiedAdmin = await Admin.findOne({ email: adminData.email }).select('+password');
    if (!verifiedAdmin) {
      throw new Error('Failed to retrieve admin after saving');
    }

    // Compare the password directly (bypassing model method for verification)
    const isMatch = await bcrypt.compare(adminData.password, verifiedAdmin.password);
    console.log('Password verification:', isMatch ? 'SUCCESS' : 'FAILED');

    if (!isMatch) {
      throw new Error('Password verification failed');
    }

    console.log('=== Admin Seeding Completed Successfully ===\n');
    process.exit(0);
  } catch (err) {
    console.error('\n!!! Admin Seeding Failed !!!');
    console.error('Error:', err.message);
    console.error('Stack:', err.stack);
    process.exit(1);
  }
}