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

//these are added later

// @desc    Get all properties (for admin with filtering options)
// @route   GET /api/admin/properties
// @access  Private/Admin
exports.getAllProperties = async (req, res) => {
  try {
    const { status, owner, published, featured, approved } = req.query;
    
    // Build query
    const query = {};
    
    if (status) query.status = status;
    if (owner) query.owner = owner;
    if (published !== undefined) query.published = published === 'true';
    if (featured !== undefined) query.featured = featured === 'true';
    if (approved !== undefined) query.approved = approved === 'true';
    
    // Execute query with pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    
    const properties = await Property.find(query)
      .populate({
        path: 'owner',
        select: 'name email role'
      })
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);
    
    const total = await Property.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: total,
      pagination: {
        current: page,
        total: Math.ceil(total / limit)
      },
      data: properties
    });
  } catch (err) {
    console.error('Error fetching properties:', err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Update property (admin can update any property)
// @route   PUT /api/admin/properties/:id
// @access  Private/Admin
exports.updateProperty = async (req, res) => {
  try {
    let property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }
    
    // Admin can update any property
    property = await Property.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate({
      path: 'owner',
      select: 'name email'
    });
    
    res.status(200).json({
      success: true,
      data: property
    });
  } catch (err) {
    console.error('Error updating property:', err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Delete property (admin can delete any property)
// @route   DELETE /api/admin/properties/:id
// @access  Private/Admin
exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }
    
    await property.remove();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error('Error deleting property:', err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Approve or reject a property
// @route   PUT /api/admin/properties/:id/approval
// @access  Private/Admin
exports.managePropertyApproval = async (req, res) => {
  try {
    const { approved, rejectionReason } = req.body;
    
    if (approved === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please specify approval status'
      });
    }
    
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }
    
    // Update approval status
    property.approved = approved;
    
    // If rejected, store the reason
    if (!approved && rejectionReason) {
      property.rejectionReason = rejectionReason;
    } else {
      property.rejectionReason = undefined; // Clear rejection reason if approved
    }
    
    await property.save();
    
    res.status(200).json({
      success: true,
      data: property
    });
  } catch (err) {
    console.error('Error managing property approval:', err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Get all agents
// @route   GET /api/admin/agents
// @access  Private/Admin
exports.getAgents = async (req, res) => {
  try {
    const agents = await User.find({ role: 'agent' })
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: agents.length,
      data: agents
    });
  } catch (err) {
    console.error('Error fetching agents:', err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Update agent status (activate/deactivate)
// @route   PUT /api/admin/agents/:id/status
// @access  Private/Admin
exports.updateAgentStatus = async (req, res) => {
  try {
    const { active } = req.body;
    
    if (active === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please specify agent status'
      });
    }
    
    const agent = await User.findById(req.params.id);
    
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }
    
    if (agent.role !== 'agent') {
      return res.status(400).json({
        success: false,
        message: 'User is not an agent'
      });
    }
    
    agent.isActive = active;
    await agent.save();
    
    res.status(200).json({
      success: true,
      data: {
        _id: agent._id,
        name: agent.name,
        email: agent.email,
        role: agent.role,
        isActive: agent.isActive
      }
    });
  } catch (err) {
    console.error('Error updating agent status:', err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Get pending properties awaiting approval
// @route   GET /api/admin/properties/pending
// @access  Private/Admin
exports.getPendingProperties = async (req, res) => {
  try {
    const properties = await Property.find({ 
      approved: { $ne: true }, // Not yet approved
      published: true // But published by agent
    })
    .populate({
      path: 'owner',
      select: 'name email role'
    })
    .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: properties.length,
      data: properties
    });
  } catch (err) {
    console.error('Error fetching pending properties:', err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Get property stats by agent
// @route   GET /api/admin/agent-stats
// @access  Private/Admin
exports.getAgentPropertyStats = async (req, res) => {
  try {
    // Aggregate properties by agent
    const agentStats = await Property.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'owner',
          foreignField: '_id',
          as: 'ownerInfo'
        }
      },
      {
        $unwind: '$ownerInfo'
      },
      {
        $match: {
          'ownerInfo.role': 'agent'
        }
      },
      {
        $group: {
          _id: '$owner',
          agentName: { $first: '$ownerInfo.name' },
          agentEmail: { $first: '$ownerInfo.email' },
          totalProperties: { $sum: 1 },
          approvedProperties: {
            $sum: { $cond: [{ $eq: ['$approved', true] }, 1, 0] }
          },
          pendingProperties: {
            $sum: { $cond: [{ $eq: ['$approved', true] }, 0, 1] }
          },
          forSale: {
            $sum: { $cond: [{ $eq: ['$status', 'for-sale'] }, 1, 0] }
          },
          forRent: {
            $sum: { $cond: [{ $eq: ['$status', 'for-rent'] }, 1, 0] }
          },
          sold: {
            $sum: { $cond: [{ $eq: ['$status', 'sold'] }, 1, 0] }
          },
          rented: {
            $sum: { $cond: [{ $eq: ['$status', 'rented'] }, 1, 0] }
          }
        }
      },
      {
        $sort: { totalProperties: -1 }
      }
    ]);
    
    res.status(200).json({
      success: true,
      count: agentStats.length,
      data: agentStats
    });
  } catch (err) {
    console.error('Error getting agent property stats:', err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Get all inquiries
// @route   GET /api/admin/inquiries
// @access  Private/Admin
exports.getInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find()
      .populate({
        path: 'property',
        select: 'title images'
      })
      .populate({
        path: 'user',
        select: 'name email avatar'
      })
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: inquiries.length,
      data: inquiries
    });
  } catch (err) {
    console.error('Error fetching inquiries:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Server error'
    });
  }
};

// @desc    Update inquiry status
// @route   PUT /api/admin/inquiries/:id/status
// @access  Private/Admin
exports.updateInquiryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'responded', 'closed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }
    
    const inquiry = await Inquiry.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: inquiry
    });
  } catch (err) {
    console.error('Error updating inquiry status:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Server error'
    });
  }
};

// @desc    Delete an inquiry
// @route   DELETE /api/admin/inquiries/:id
// @access  Private/Admin
exports.deleteInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    
    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
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