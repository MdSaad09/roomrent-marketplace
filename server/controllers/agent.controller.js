const User = require('../models/user.model.js');
const Property = require('../models/property.model.js');

// @desc    Get all agents
// @route   GET /api/agents
// @access  Public
exports.getAgents = async (req, res) => {
  try {
    // Build the query
    let query = User.find({ role: 'agent' }).select('-password');
    
    // Handle search
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query = query.find({
        $or: [
          { name: searchRegex },
          { email: searchRegex },
          { bio: searchRegex }
        ]
      });
    }
    
    // Filter by property count (agents with properties)
    if (req.query.hasProperties === 'true') {
      // Get agent IDs who have properties
      const agentIds = await Property.distinct('owner', { published: true });
      query = query.find({ _id: { $in: agentIds } });
    }
    
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const total = await User.countDocuments(query);
    
    query = query.skip(startIndex).limit(limit);
    
    // Execute query
    const agents = await query;
    
    // For each agent, get property count
    const agentsWithCounts = await Promise.all(
      agents.map(async (agent) => {
        const propertiesCount = await Property.countDocuments({ 
          owner: agent._id,
          published: true
        });
        
        return {
          ...agent.toObject(),
          propertiesCount
        };
      })
    );
    
    res.status(200).json({
      success: true,
      count: agents.length,
      total,
      pagination: {
        page,
        pages: Math.ceil(total / limit)
      },
      data: agentsWithCounts
    });
  } catch (err) {
    console.error('Error in getAgents:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single agent
// @route   GET /api/agents/:id
// @access  Public
exports.getAgentById = async (req, res) => {
  try {
    const agent = await User.findOne({ 
      _id: req.params.id,
      role: 'agent'
    }).select('-password');
    
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }
    
    // Get properties associated with this agent
    const properties = await Property.find({ 
      owner: agent._id,
      published: true
    });
    
    res.status(200).json({
      success: true,
      data: {
        ...agent.toObject(),
        properties
      }
    });
  } catch (err) {
    console.error('Error in getAgentById:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update agent profile
// @route   PUT /api/agents/profile
// @access  Private (Agent only)
exports.updateAgentProfile = async (req, res) => {
  try {
    // Ensure the user is an agent (middleware should handle this)
    if (req.user.role !== 'agent') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    const fieldsToUpdate = {
      name: req.body.name,
      phone: req.body.phone,
      bio: req.body.bio
    };

    // Handle avatar update if provided
    if (req.body.avatar) {
      fieldsToUpdate.avatar = req.body.avatar;
    }

    const agent = await User.findByIdAndUpdate(
      req.user.id,
      fieldsToUpdate,
      {
        new: true,
        runValidators: true
      }
    ).select('-password');

    res.status(200).json({
      success: true,
      data: agent
    });
  } catch (err) {
    console.error('Error in updateAgentProfile:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get agent dashboard stats
// @route   GET /api/agents/dashboard
// @access  Private (Agent only)
exports.getAgentDashboardStats = async (req, res) => {
  try {
    // Ensure the user is an agent (middleware should handle this)
    if (req.user.role !== 'agent') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    // Get total properties count
    const totalProperties = await Property.countDocuments({
      owner: req.user.id
    });

    // Get published properties count
    const publishedProperties = await Property.countDocuments({
      owner: req.user.id,
      published: true
    });

    // Get recent properties (last 5)
    const recentProperties = await Property.find({
      owner: req.user.id
    })
    .sort({ createdAt: -1 })
    .limit(5);

    // If you have views/inquiries models, you could count those too
    // const totalViews = await PropertyView.countDocuments({
    //   property: { $in: await Property.find({ owner: req.user.id }).select('_id') }
    // });

    res.status(200).json({
      success: true,
      data: {
        totalProperties,
        publishedProperties,
        unpublishedProperties: totalProperties - publishedProperties,
        recentProperties
        // totalViews
      }
    });
  } catch (err) {
    console.error('Error in getAgentDashboardStats:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get agent's properties
// @route   GET /api/agents/properties
// @access  Private (Agent only)
exports.getAgentProperties = async (req, res) => {
  try {
    // Ensure the user is an agent (middleware should handle this)
    if (req.user.role !== 'agent') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    // Build query
    let query = { owner: req.user.id };

    // Filter by published status if provided
    if (req.query.published !== undefined) {
      query.published = req.query.published === 'true';
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    
    const total = await Property.countDocuments(query);
    
    // Get properties
    const properties = await Property.find(query)
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);
    
    res.status(200).json({
      success: true,
      count: properties.length,
      total,
      pagination: {
        page,
        pages: Math.ceil(total / limit)
      },
      data: properties
    });
  } catch (err) {
    console.error('Error in getAgentProperties:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};