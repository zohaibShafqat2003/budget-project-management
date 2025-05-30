// Load environment variables first
require('dotenv').config();

const { testConnection } = require('./config/db');
const { syncDatabase } = require('./models');
const logger = require('./config/logger');
const app = require('./app');

/**
 * Start the server with proper initialization sequence
 */
const startServer = async () => {
const PORT = process.env.PORT || 5000;

  try {
    // Step 1: Test database connection
    logger.info('Testing database connection...');
    await testConnection();
    logger.info('Database connection successful');
    
    // Step 2: Sync database models if in development mode
    if (process.env.NODE_ENV === 'development') {
      const forceSync = process.env.FORCE_DB_SYNC === 'true';
      logger.info(`Syncing database models${forceSync ? ' with force option' : ''}...`);
      await syncDatabase(forceSync);
      logger.info('Database sync completed');
    }
    
    // Step 3: Start Express server
    const server = app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
      logger.info(`http://localhost:${PORT}`);
    });
    
    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, shutting down gracefully');
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
      
      // Force close after 10s
      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    });
    
    process.on('SIGINT', () => {
      logger.info('SIGINT received, shutting down gracefully');
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
      
      // Force close after 10s
      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    });
    
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
  // Don't crash the server, but log it
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  // Give time for logging before crashing
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

// Start the server
startServer(); 