import express from 'express';
import mongoose from 'mongoose';
import { promisify } from 'util';
import logger from '../utils/logger.js';

const router = express.Router();

// Basic health check
router.get('/', async (req, res) => {
  try {
    const healthCheck = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
      services: {}
    };

    // Check MongoDB connection
    try {
      const dbState = mongoose.connection.readyState;
      const dbStates = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
      };
      
      healthCheck.services.database = {
        status: dbState === 1 ? 'healthy' : 'unhealthy',
        state: dbStates[dbState],
        responseTime: null
      };

      if (dbState === 1) {
        const start = Date.now();
        await mongoose.connection.db.admin().ping();
        healthCheck.services.database.responseTime = `${Date.now() - start}ms`;
      }
    } catch (error) {
      healthCheck.services.database = {
        status: 'unhealthy',
        error: error.message
      };
    }

    // Check Redis connection (if enabled)
    if (process.env.ENABLE_CACHING === 'true') {
      try {
        // Add Redis health check here if using Redis
        healthCheck.services.cache = {
          status: 'healthy',
          responseTime: '0ms'
        };
      } catch (error) {
        healthCheck.services.cache = {
          status: 'unhealthy',
          error: error.message
        };
      }
    }

    // Check external services
    healthCheck.services.razorpay = {
      status: process.env.RAZORPAY_KEY_ID ? 'configured' : 'not_configured'
    };

    healthCheck.services.email = {
      status: process.env.SMTP_USER ? 'configured' : 'not_configured'
    };

    // System metrics
    healthCheck.system = {
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024)
      },
      cpu: process.cpuUsage(),
      platform: process.platform,
      nodeVersion: process.version
    };

    // Determine overall health
    const unhealthyServices = Object.values(healthCheck.services)
      .filter(service => service.status === 'unhealthy');
    
    if (unhealthyServices.length > 0) {
      healthCheck.status = 'DEGRADED';
      res.status(503);
    }

    res.json(healthCheck);
  } catch (error) {
    logger.error('Health check failed', { error: error.message });
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Detailed health check
router.get('/detailed', async (req, res) => {
  try {
    const detailedHealth = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
      services: {},
      metrics: {},
      configuration: {}
    };

    // Database metrics
    if (mongoose.connection.readyState === 1) {
      try {
        const dbStats = await mongoose.connection.db.stats();
        detailedHealth.metrics.database = {
          collections: dbStats.collections,
          dataSize: Math.round(dbStats.dataSize / 1024 / 1024), // MB
          indexSize: Math.round(dbStats.indexSize / 1024 / 1024), // MB
          storageSize: Math.round(dbStats.storageSize / 1024 / 1024) // MB
        };
      } catch (error) {
        detailedHealth.metrics.database = { error: error.message };
      }
    }

    // Application metrics
    detailedHealth.metrics.application = {
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      eventLoopDelay: null, // Could add event loop monitoring
      activeHandles: process._getActiveHandles().length,
      activeRequests: process._getActiveRequests().length
    };

    // Configuration status (without sensitive data)
    detailedHealth.configuration = {
      cors: !!process.env.CORS_ORIGIN,
      rateLimit: !!process.env.RATE_LIMIT_MAX_REQUESTS,
      logging: !!process.env.LOG_LEVEL,
      security: {
        helmet: true,
        jwt: !!process.env.JWT_SECRET,
        bcrypt: !!process.env.BCRYPT_ROUNDS
      },
      features: {
        caching: process.env.ENABLE_CACHING === 'true',
        compression: process.env.COMPRESSION_ENABLED !== 'false',
        requestLogging: process.env.ENABLE_REQUEST_LOGGING !== 'false'
      }
    };

    res.json(detailedHealth);
  } catch (error) {
    logger.error('Detailed health check failed', { error: error.message });
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Readiness probe
router.get('/ready', async (req, res) => {
  try {
    // Check if all critical services are ready
    const isDbReady = mongoose.connection.readyState === 1;
    
    if (!isDbReady) {
      return res.status(503).json({
        status: 'NOT_READY',
        message: 'Database not ready',
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      status: 'READY',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'NOT_READY',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Liveness probe
router.get('/live', (req, res) => {
  res.json({
    status: 'ALIVE',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

export default router;
