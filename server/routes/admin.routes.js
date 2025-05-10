const express = require('express');
const { 
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getDashboardStats,
  createUser,
  getAllProperties,
  updateProperty,
  deleteProperty,
  managePropertyApproval,
  getAgents,
  updateAgentStatus,
  getPendingProperties,
  getAgentPropertyStats
} = require('../controllers/admin.controller.js');
const { protect, authorize } = require('../middleware/auth.middleware.js');

const router = express.Router();

// Apply middleware to all routes
router.use(protect);
router.use(authorize('admin'));

// Dashboard stats
router.get('/stats', getDashboardStats);

// User management
router.route('/users')
  .get(getUsers)
  .post(createUser); 

router.route('/users/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

// Property management
router.route('/properties')
  .get(getAllProperties);

router.route('/properties/pending')
  .get(getPendingProperties);

router.route('/properties/:id')
  .put(updateProperty)
  .delete(deleteProperty);

router.route('/properties/:id/approval')
  .put(managePropertyApproval);

// Agent management
router.route('/agents')
  .get(getAgents);

router.route('/agents/:id/status')
  .put(updateAgentStatus);

// Analytics
router.get('/agent-stats', getAgentPropertyStats);

module.exports = router;