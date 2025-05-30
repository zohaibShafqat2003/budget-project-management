const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');

// Temporary placeholder for search controller
const searchController = {
  search: (req, res) => {
    res.status(200).json({ 
      success: true, 
      message: 'Search functionality coming soon',
      data: []
    });
  }
};

router.use(authenticateToken);

// Global search endpoint
router.get('/', searchController.search);

module.exports = router; 