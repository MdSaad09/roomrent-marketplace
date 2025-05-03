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
    
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const total = await User.countDocuments({ role: 'agent' });
    
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