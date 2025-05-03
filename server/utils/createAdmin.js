// scripts/createAdmin.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user.model');
const bcrypt = require('bcryptjs');


const createAdmin = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/roomrent-marketplace");
    
    // Check if admin exists
    const adminExists = await User.findOne({ email: 'admin@example.com' });
    
    if (adminExists) {
      console.log('Admin user already exists');
      process.exit(0);
    }
    
    // Create admin
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123', // This will be hashed by the pre-save middleware
      role: 'admin'
    });
    
    console.log('Admin user created successfully:');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();