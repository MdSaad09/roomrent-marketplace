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
  getUserFavorites,
  rejectProperty,
  resubmitProperty
} = require('../controllers/property.controller.js');
const { protect, authorize } = require('../middleware/auth.middleware.js');

const router = express.Router();

// Public routes
// Change this line
// router.get('/', getProperties);

// To this - make it optionally protected
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
router.put('/:id/resubmit', protect, authorize('agent'), resubmitProperty);

// Admin only routes
router.get('/admin/pending', protect, authorize('admin'), getPendingProperties);
router.put('/:id/approve', protect, authorize('admin'), approveProperty);
router.put('/:id/reject', protect, authorize('admin'), rejectProperty);

module.exports = router;