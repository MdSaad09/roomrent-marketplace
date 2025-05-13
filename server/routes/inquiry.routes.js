const express = require('express');
const { 
  createInquiry,
  getPropertyInquiries,
  getUserInquiries,
  respondToInquiry,
  deleteInquiry // Add this back
} = require('../controllers/inquiry.controller.js');
const { protect } = require('../middleware/auth.middleware.js');

const router = express.Router();

// Apply middleware to all routes
router.use(protect);

// Create a new inquiry
router.post('/', createInquiry);

// Get inquiries for a specific property (for property owners)
router.get('/property/:propertyId', getPropertyInquiries);

// Get inquiries sent by the current user
router.get('/user', getUserInquiries);

// Add this new route
router.post('/:id/respond', respondToInquiry);

// Uncomment and fix this line - the path should be just /:id since we're already mounted at /api/admin/inquiries
router.delete('/:id', deleteInquiry);

module.exports = router;