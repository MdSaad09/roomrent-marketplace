const express = require('express');
const { 
  getAgents, 
  getAgentById,
  updateAgentProfile,
  getAgentDashboardStats,
  getAgentProperties
} = require('../controllers/agent.controller.js');

// Import middleware for authentication and authorization
const { protect, authorize } = require('../middleware/auth.middleware.js');

const router = express.Router();

// Public routes
router.get('/', getAgents);
router.get('/:id', getAgentById);

// Protected routes (agent only)
router.put('/profile', protect, authorize('agent'), updateAgentProfile);
router.get('/dashboard/stats', protect, authorize('agent'), getAgentDashboardStats);
router.get('/dashboard/properties', protect, authorize('agent'), getAgentProperties);

module.exports = router;