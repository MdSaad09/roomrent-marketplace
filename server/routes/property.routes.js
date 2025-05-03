const express = require('express');
const { 
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  getFeaturedProperties,
  getUserProperties,
  getPendingProperties,
  approveProperty,
  getAgentProperties,
  toggleFavorite,
  getUserFavorites
} = require('../controllers/property.controller.js');
const { protect, authorize } = require('../middleware/auth.middleware.js');

const router = express.Router();

// Public routes
router.get('/', getProperties);
router.get('/featured', getFeaturedProperties);
router.get('/agent/:id', getAgentProperties);
router.get('/:id', getPropertyById);

// Protected routes - require login
router.get('/user/properties', protect, getUserProperties);
router.get('/user/favorites', protect, getUserFavorites);
router.put('/favorite/:id', protect, toggleFavorite);

// Routes for both admin and agent users
router.post('/', protect, authorize('admin', 'agent'), createProperty);
router.put('/:id', protect, authorize('admin', 'agent'), updateProperty);
router.delete('/:id', protect, authorize('admin', 'agent'), deleteProperty);

// Admin only routes
router.get('/admin/pending', protect, authorize('admin'), getPendingProperties);
router.put('/:id/approve', protect, authorize('admin'), approveProperty);

module.exports = router;