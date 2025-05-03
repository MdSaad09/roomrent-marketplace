const Property = require('../models/property.model.js');
const { validationResult } = require('express-validator');
const User = require('../models/user.model.js')
const mongoose = require('mongoose');

// Update only the createProperty function in property.controller.js
exports.createProperty = async (req, res) => {
  try {
    const propertyData = req.body;
    
    // Add the owner field - set to current user
    propertyData.owner = req.user.id;
    
    // Process image URLs to ensure consistency
    if (propertyData.images && propertyData.images.length > 0) {
      propertyData.images = propertyData.images.map(image => {
        // If no URL, skip this image
        if (!image.url) return image;
        
        // If already a full URL, leave it alone
        if (image.url.startsWith('http://') || image.url.startsWith('https://')) {
          return image;
        }
        
        // If just a filename, add the path
        if (!image.url.includes('/')) {
          image.url = `/uploads/${image.url}`;
        }
        
        // Make sure it has a public_id
        if (!image.public_id) {
          image.public_id = `temp_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
        }
        
        return image;
      });
    }
    
    // Set publication status based on role
    // Admin properties are published by default, agent properties need approval
    if (req.user.role === 'agent') {
      propertyData.published = false; // Require admin approval
    }
    
    console.log('Creating property with data:', {
      title: propertyData.title,
      owner: propertyData.owner,
      imageCount: propertyData.images?.length || 0,
      published: propertyData.published
    });
    
    const property = await Property.create(propertyData);
    
    res.status(201).json({
      success: true,
      data: property
    });
  } catch (err) {
    console.error('Error creating property:', err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Get all properties
// @route   GET /api/properties
// @access  Public
exports.getProperties = async (req, res) => {
  try {
    console.log('Received query params:', req.query);
    
    // Build the filter object
    let filters = {};
    
    // By default, only show published properties to public users
    // Admins can see all, and agents can see their own unpublished properties
    if (!req.user || req.user.role === 'user') {
      filters.published = true;
    } else if (req.user.role === 'agent' && req.query.showMine) {
      // If an agent wants to see their own properties
      filters.owner = req.user.id;
    } else if (req.user.role !== 'admin') {
      // For agents viewing all properties (not their own)
      filters.published = true;
    }
    
    // Handle status filter (for-sale, for-rent)
    if (req.query.status) {
      filters.status = req.query.status;
    }
    
    // Handle property type filter
    if (req.query.type) {
      filters.type = req.query.type;
    }
    
    // Handle price range
    if (req.query.minPrice) {
      filters.price = { ...filters.price, $gte: parseInt(req.query.minPrice) };
    }
    if (req.query.maxPrice) {
      filters.price = { ...filters.price, $lte: parseInt(req.query.maxPrice) };
    }
    
    // Handle bedrooms filter
    if (req.query.bedrooms) {
      filters.bedrooms = parseInt(req.query.bedrooms);
    }
    
    // Handle city filter
    if (req.query.city) {
      filters['address.city'] = { $regex: new RegExp(req.query.city, 'i') };
    }
    
    // Filter by agent/owner
    if (req.query.agent) {
      filters.owner = req.query.agent;
    }
    
    console.log('Applied filters:', filters);
    
    // Create base query
    let query = Property.find(filters).populate({
      path: 'owner',
      select: 'name email avatar role phone bio'
    });
    
    // Handle text search 
    if (req.query.search) {
      // First try with $text if you have text index set up
      try {
        query = query.find({ $text: { $search: req.query.search } });
      } catch (err) {
        // Fallback to regex search on title and description
        const searchRegex = new RegExp(req.query.search, 'i');
        query = query.find({
          $or: [
            { title: searchRegex },
            { description: searchRegex },
            { 'address.street': searchRegex },
            { 'address.city': searchRegex },
            { 'address.state': searchRegex },
            { 'address.zipcode': searchRegex }
          ]
        });
      }
    }
    
    // Handle other query params (select, sort, pagination)
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }
    
    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }
    
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    // Get total count of matching documents for pagination
    const total = await Property.countDocuments(filters);
    
    query = query.skip(startIndex).limit(limit);
    
    // Executing query
    const properties = await query;
    
    // Pagination result
    const pagination = {};
    
    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }
    
    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }
    
    console.log(`Found ${properties.length} properties matching filters`);
    
    res.status(200).json({
      success: true,
      count: properties.length,
      total,
      pagination,
      data: properties
    });
  } catch (err) {
    console.error('Error in getProperties:', err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Get single property
// @route   GET /api/properties/:id
// @access  Public
exports.getProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate({
      path: 'owner',
      select: 'name email avatar phone role bio'
    });
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }
    
    // Check if property is published or if the user is authorized to view it
    if (!property.published && 
        (!req.user || 
         (req.user.role !== 'admin' && 
          property.owner._id.toString() !== req.user.id))) {
      return res.status(403).json({
        success: false,
        message: 'This property is not currently published'
      });
    }
    
    // Increment view count
    property.views += 1;
    await property.save();
    
    res.status(200).json({
      success: true,
      data: property
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// Update only the updateProperty function in property.controller.js
// In property.controller.js, update the updateProperty function:

exports.updateProperty = async (req, res) => {
  try {
    let property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }
    
    // Ensure owner is converted to string safely
    const ownerId = property.owner ? property.owner.toString() : null;
    const userId = req.user.id ? req.user.id.toString() : null;
    
    // Check if user is authorized (owner or admin)
    if (ownerId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this property'
      });
    }
    
    // Process image URLs to ensure consistency
    const updateData = { ...req.body };
    
    if (updateData.images && Array.isArray(updateData.images)) {
      updateData.images = updateData.images.map(image => {
        // Skip if image object is invalid
        if (!image) return image;
        
        // Make sure it has a public_id
        if (!image.public_id && image.url) {
          // Extract a filename from the URL if possible
          const urlParts = image.url.split('/');
          const filename = urlParts[urlParts.length - 1];
          image.public_id = filename || `temp_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
        }
        
        return image;
      });
    }
    
    // If agent is updating, ensure they can't set status to published
    if (req.user.role === 'agent') {
      // Agent can update their property but can't publish it themselves
      updateData.published = false; // Always keep as unpublished until admin approval
      
      property = await Property.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
        runValidators: true
      });
    } else {
      // Admin can update any property and change publication status
      property = await Property.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
        runValidators: true
      });
    }
    
    console.log('Updated property:', {
      id: property._id,
      title: property.title,
      imageCount: property.images?.length || 0
    });
    
    res.status(200).json({
      success: true,
      data: property
    });
  } catch (err) {
    console.error('Error updating property:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to update property'
    });
  }
};

// @desc    Delete property
// @route   DELETE /api/properties/:id
// @access  Private
exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }
    
    // Make sure user is property owner or admin
    if (property.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this property'
      });
    }
    
    // Delete the property
    await Property.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error('Error in deleteProperty:', err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Get featured properties
// @route   GET /api/properties/featured
// @access  Public
exports.getFeaturedProperties = async (req, res) => {
  try {
    const properties = await Property.find({ 
      featured: true,
      published: true
    })
    .limit(6)
    .populate({
      path: 'owner',
      select: 'name avatar role'
    });
    
    res.status(200).json({
      success: true,
      count: properties.length,
      data: properties
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// backend/controllers/property.controller.js

// @desc    Get user properties
// @route   GET /api/properties/user
// @access  Private
exports.getUserProperties = async (req, res) => {
  try {
    console.log("Fetching properties for user ID:", req.user.id);
    
    // Return properties owned by the current user
    const properties = await Property.find({ owner: req.user.id })
      .populate({
        path: 'owner',
        select: 'name email avatar role'
      })
      .sort({ createdAt: -1 });
    
    console.log(`Found ${properties.length} properties for user`);
    
    res.status(200).json({
      success: true,
      count: properties.length,
      data: properties
    });
  } catch (err) {
    console.error("Error in getUserProperties:", err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Get properties pending approval (Admin only)
// @route   GET /api/properties/pending
// @access  Private/Admin
exports.getPendingProperties = async (req, res) => {
  try {
    // Only admin can access this
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access pending properties'
      });
    }
    
    // Find properties that are unpublished
    const properties = await Property.find({ published: false })
      .populate({
        path: 'owner',
        select: 'name email avatar phone role'
      });
    
    res.status(200).json({
      success: true,
      count: properties.length,
      data: properties
    });
  } catch (err) {
    console.error('Error getting pending properties:', err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Approve a property listing (Admin only)
// @route   PUT /api/properties/:id/approve
// @access  Private/Admin
exports.approveProperty = async (req, res) => {
  try {
    // Only admin can approve properties
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to approve properties'
      });
    }
    
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }
    
    // Update property to published status
    property.published = true;
    await property.save();
    
    res.status(200).json({
      success: true,
      message: 'Property has been approved and published',
      data: property
    });
  } catch (err) {
    console.error('Error approving property:', err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Get agent properties (Public)
// @route   GET /api/properties/agent/:id
// @access  Public
exports.getAgentProperties = async (req, res) => {
  try {
    const agentId = req.params.id;
    
    // Validate if agent exists and has agent role
    const agent = await User.findById(agentId);
    if (!agent || agent.role !== 'agent') {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }
    
    // Find published properties by this agent
    const properties = await Property.find({ 
      owner: agentId,
      published: true
    });
    
    res.status(200).json({
      success: true,
      count: properties.length,
      agent: {
        name: agent.name,
        email: agent.email,
        phone: agent.phone,
        bio: agent.bio,
        avatar: agent.avatar
      },
      data: properties
    });
  } catch (err) {
    console.error('Error getting agent properties:', err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// Get property by ID
exports.getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if the ID is a special route parameter
    if (id === 'user') {
      // Handle the 'user' special case - maybe return user's properties
      return res.status(400).json({
        success: false,
        message: "Invalid property ID. Did you mean to access user properties?"
      });
    }
    
    // Validate if id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid property ID format"
      });
    }
    
    const property = await Property.findById(id).populate({
      path: 'owner',
      select: 'name email avatar phone role bio'
    });
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: property
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// Get all properties
exports.getAllProperties = async (req, res) => {
  try {
    // For admin view, no restrictions
    if (req.user && req.user.role === 'admin') {
      const properties = await Property.find();
      return res.json(properties);
    }
    
    // For non-admin, only return published properties
    const properties = await Property.find({ published: true });
    res.json(properties);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get user's favorite properties
exports.getUserFavorites = async (req, res) => {
  try {
    // Find the user with populated favorites
    const user = await User.findById(req.user.id).populate('favorites');
    
    res.status(200).json({
      success: true,
      count: user.favorites.length,
      data: user.favorites
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// Toggle a property as favorite
exports.toggleFavorite = async (req, res) => {
  try {
    const propertyId = req.params.id;
    const userId = req.user.id;
    
    // Find the user
    const user = await User.findById(userId);
    
    // Check if property is already in favorites
    const isFavorite = user.favorites.includes(propertyId);
    
    if (isFavorite) {
            // Remove from favorites
            user.favorites = user.favorites.filter(id => id.toString() !== propertyId);
            await user.save();
            
            res.status(200).json({
              success: true,
              isFavorite: false,
              message: 'Property removed from favorites'
            });
          } else {
            // Add to favorites
            user.favorites.push(propertyId);
            await user.save();
            
            res.status(200).json({
              success: true,
              isFavorite: true,
              message: 'Property added to favorites'
            });
          }
        } catch (err) {
          console.error(err);
          res.status(500).json({
            success: false,
            message: 'Server Error'
          });
        }
      };