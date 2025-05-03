// server/routes/user.routes.js
const express = require('express');
const { 
  updateProfile,
  getUserProfile,
  addToFavorites,
  removeFromFavorites,
  getFavorites
} = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Apply middleware to all routes
router.use(protect);

// User profile routes
router.get('/me', getUserProfile);
router.put('/profile', updateProfile);

// Favorites routes
router.get('/favorites', getFavorites);
router.post('/favorites/:propertyId', addToFavorites);
router.delete('/favorites/:propertyId', removeFromFavorites);

module.exports = router;