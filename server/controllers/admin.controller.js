const User = require('../models/user.model.js');
const Property = require('../models/property.model.js');
const Inquiry = require('../models/inquiry.model.js');
const mongoose = require('mongoose');



// @desc    Create new user
// @route   POST /api/admin/users
// @access  Private/Admin
exports.createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create new user with 'user' role by default
    const user = await User.create({
      name,
      email,
      password,
      role: 'user' // Always set to 'user'
    });

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private/Admin
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProperties = await Property.countDocuments();
    const totalInquiries = await Inquiry.countDocuments();
    
    // Get properties by status
    const propertiesForSale = await Property.countDocuments({ status: 'for-sale' });
    const propertiesForRent = await Property.countDocuments({ status: 'for-rent' });
    const propertiesSold = await Property.countDocuments({ status: 'sold' });
    const propertiesRented = await Property.countDocuments({ status: 'rented' });
    
    // Get recent properties
    const recentProperties = await Property.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate({
        path: 'owner',
        select: 'name'
      });
    
    // Get recent users
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email role createdAt');
    
    // Get recent inquiries
    const recentInquiries = await Inquiry.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate([
        { path: 'property', select: 'title' },
        { path: 'user', select: 'name email' }
      ]);
    
    res.status(200).json({
      success: true,
      data: {
        counts: {
          users: totalUsers,
          properties: totalProperties,
          inquiries: totalInquiries
        },
        propertyStats: {
          forSale: propertiesForSale,
          forRent: propertiesForRent,
          sold: propertiesSold,
          rented: propertiesRented
        },
        recent: {
          properties: recentProperties,
          users: recentUsers,
          inquiries: recentInquiries
        }
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};