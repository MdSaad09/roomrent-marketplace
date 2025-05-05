const express = require('express');
const { check } = require('express-validator');
const { 
  register, 
  login, 
  getMe, 
  logout,
  updateProfile,
  getAgents,
  getAgentProfile,
  changePassword
} = require('../controllers/auth.controller.js');
const { protect } = require('../middleware/auth.middleware.js');

const router = express.Router();

router.post(
  '/register',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be at least 6 characters').isLength({ min: 6 })
  ],
  register
);

router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  login
);

// Add this after the updateProfile route
router.put(
  '/password',
  [
    check('currentPassword', 'Current password is required').exists(),
    check('newPassword', 'New password must be at least 6 characters').isLength({ min: 6 })
  ],
  protect,
  changePassword
);

router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.get('/logout', protect, logout);

// Public routes to get agent information
router.get('/agents', getAgents);
router.get('/agents/:id', getAgentProfile);

module.exports = router;