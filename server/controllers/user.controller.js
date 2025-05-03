// server/controllers/user.controller.js
const User = require('../models/user.model');
const Property = require('../models/property.model');

// @desc    Get user profile
// @route   GET /api/users/me
// @access  Private
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
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

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    // Fields to update
    const fieldsToUpdate = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      bio: req.body.bio
    };
    
    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(key => 
      fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );
    
    // Update avatar if provided
    if (req.body.avatar) {
      fieldsToUpdate.avatar = req.body.avatar;
    }
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      fieldsToUpdate,
      {
        new: true,
        runValidators: true
      }
    );
    
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

// @desc    Get user favorites
// @route   GET /api/users/favorites
// @access  Private
exports.getFavorites = async (req, res) => {
  try {
    // Find the user
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Try to populate favorites if needed
    let favorites = [];
    if (user.favorites && user.favorites.length > 0) {
      try {
        const populatedUser = await User.findById(req.user.id).populate('favorites');
        favorites = populatedUser.favorites;
      } catch (err) {
        // If population fails, just return the IDs
        favorites = user.favorites;
      }
    }
    
    res.status(200).json({
      success: true,
      data: user.favorites || []
    });
  } catch (err) {
    console.error('Error in getFavorites:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Server error'
    });
  }
};

// @desc    Add property to favorites
// @route   POST /api/users/favorites/:propertyId
// @access  Private
exports.addToFavorites = async (req, res) => {
  try {
    const property = await Property.findById(req.params.propertyId);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }
    
    const user = await User.findById(req.user.id);
    
    // Check if property is already in favorites
    if (user.favorites.includes(req.params.propertyId)) {
      return res.status(400).json({
        success: false,
        message: 'Property already in favorites'
      });
    }
    
    // Add to favorites
    user.favorites.push(req.params.propertyId);
    await user.save();
    
    res.status(200).json({
      success: true,
      data: user.favorites
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Remove property from favorites
// @route   DELETE /api/users/favorites/:propertyId
// @access  Private
exports.removeFromFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Check if property is in favorites
    if (!user.favorites.includes(req.params.propertyId)) {
      return res.status(400).json({
        success: false,
        message: 'Property not in favorites'
      });
    }
    
    // Remove from favorites
    user.favorites = user.favorites.filter(
      id => id.toString() !== req.params.propertyId
    );
    await user.save();
    
    res.status(200).json({
      success: true,
      data: user.favorites
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};