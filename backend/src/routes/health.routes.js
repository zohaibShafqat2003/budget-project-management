const express = require('express');
const router = express.Router();
const { sequelize } = require('../config/db');

// Basic health check
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Service is healthy',
    timestamp: new Date().toISOString()
  });
});

// Detailed health check
router.get('/detailed', async (req, res) => {
  try {
    // Check database connection
    const dbStatus = await sequelize.authenticate()
      .then(() => 'connected')
      .catch(() => 'disconnected');

    // Get system information
    const systemInfo = {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage()
    };

    res.json({
      success: true,
      status: {
        database: dbStatus,
        system: systemInfo
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Health check failed',
      error: error.message
    });
  }
});

module.exports = router; 