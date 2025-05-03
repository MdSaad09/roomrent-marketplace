const express = require('express');
const { 
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getDashboardStats,
  createUser // Add this import
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

module.exports = router;