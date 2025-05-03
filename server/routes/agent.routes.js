const express = require('express');
const { 
  getAgents, 
  getAgentById
} = require('../controllers/agent.controller.js');

const router = express.Router();

// Public routes
router.get('/', getAgents);
router.get('/:id', getAgentById);

module.exports = router;