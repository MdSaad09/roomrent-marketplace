const Inquiry = require('../models/inquiry.model.js');
const Property = require('../models/property.model.js');
const User = require('../models/user.model.js');

// @desc    Create a new inquiry
// @route   POST /api/inquiries
// @access  Private
exports.createInquiry = async (req, res) => {
  try {
    const { propertyId, message, phone } = req.body;  // Extract phone from request body
    
    // Check if property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }
    
    // Find an admin to assign the inquiry to
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      return res.status(500).json({
        success: false,
        message: 'No admin found to handle this inquiry'
      });
    }
    
    // Create inquiry - assign to admin instead of property owner
    const inquiry = await Inquiry.create({
      property: propertyId,
      user: req.user.id,
      message,
      phone: phone || req.user.phone || '',  // Use phone from form first, then fallback to user profile
      // Store original property owner for reference
      originalOwner: property.owner
    });
    
    // Populate user and property information for the response
    const populatedInquiry = await Inquiry.findById(inquiry._id)
      .populate({
        path: 'property',
        select: 'title images'
      })
      .populate({
        path: 'user',
        select: 'name email avatar'
      });
    
    res.status(201).json({
      success: true,
      data: populatedInquiry
    });
  } catch (err) {
    console.error('Error creating inquiry:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Server error'
    });
  }
};

// @desc    Get inquiries for a property (for property owner)
// @route   GET /api/inquiries/property/:propertyId
// @access  Private (admin only)
exports.getPropertyInquiries = async (req, res) => {
  try {
    const property = await Property.findById(req.params.propertyId);
    
    // Check if property exists
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }
    
    // Only admin can access inquiries
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access these inquiries'
      });
    }
    
    // Get inquiries for this property
    const inquiries = await Inquiry.find({ property: req.params.propertyId })
      .populate({
        path: 'user',
        select: 'name email avatar phone'
      })
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: inquiries.length,
      data: inquiries
    });
  } catch (err) {
    console.error('Error getting property inquiries:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Server error'
    });
  }
};

// @desc    Add a response to an inquiry
// @route   POST /api/inquiries/:id/respond
// @access  Private (admin only)
exports.respondToInquiry = async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Response message is required'
      });
    }
    
    // Find the inquiry
    const inquiry = await Inquiry.findById(req.params.id);
    
    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
    }
    
    // Only admin can respond to inquiries
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to respond to this inquiry'
      });
    }
    
    // Add response and update status
    inquiry.response = message;
    inquiry.status = 'responded';
    inquiry.respondedAt = Date.now();
    
    await inquiry.save();
    
    res.status(200).json({
      success: true,
      data: inquiry
    });
  } catch (err) {
    console.error('Error responding to inquiry:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Server error'
    });
  }
};

// @desc    Get user's sent inquiries
// @route   GET /api/inquiries/user
// @access  Private
exports.getUserInquiries = async (req, res) => {
  try {
    // Get inquiries sent by this user
    const inquiries = await Inquiry.find({ user: req.user.id })
      .populate({
        path: 'property',
        select: 'title images price status address',
        populate: {
          path: 'owner',
          select: 'name email avatar'
        }
      })
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: inquiries.length,
      data: inquiries
    });
  } catch (err) {
    console.error('Error getting user inquiries:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Server error'
    });
  }
};

// @desc    Delete an inquiry
// @route   DELETE /api/admin/inquiries/:id
// @access  Private (admin only)
exports.deleteInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    
    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
    }
    
    // Only admin can delete inquiries
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this inquiry'
      });
    }
    
    await inquiry.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Inquiry deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting inquiry:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Server error'
    });
  }
};