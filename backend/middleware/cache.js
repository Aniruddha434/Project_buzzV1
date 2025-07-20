import cacheService from '../services/cacheService.js';

/**
 * Cache middleware for API responses
 */
export const cacheMiddleware = (options = {}) => {
  const {
    ttl = 600, // 10 minutes default
    keyGenerator = null,
    skipCache = false,
    varyBy = []
  } = options;

  return async (req, res, next) => {
    // Skip caching if disabled or in development
    if (skipCache || !cacheService.isAvailable() || process.env.NODE_ENV === 'development') {
      return next();
    }

    try {
      // Generate cache key
      let cacheKey;
      if (keyGenerator && typeof keyGenerator === 'function') {
        cacheKey = keyGenerator(req);
      } else {
        // Default key generation
        const baseKey = `${req.method}:${req.originalUrl}`;
        const queryString = JSON.stringify(req.query);
        const varyString = varyBy.map(field => req.get(field) || '').join(':');
        cacheKey = `${baseKey}:${Buffer.from(queryString + varyString).toString('base64')}`;
      }

      // Try to get from cache
      const cachedData = await cacheService.getCachedApiResponse(req.originalUrl, {
        query: req.query,
        method: req.method,
        vary: varyBy.map(field => req.get(field))
      });

      if (cachedData) {
        console.log(`📦 Serving cached response for: ${req.originalUrl}`);
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('X-Cache-Key', cacheKey);
        return res.json(cachedData);
      }

      // Store original res.json
      const originalJson = res.json;

      // Override res.json to cache the response
      res.json = function(data) {
        // Only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          cacheService.cacheApiResponse(req.originalUrl, {
            query: req.query,
            method: req.method,
            vary: varyBy.map(field => req.get(field))
          }, data, ttl).catch(err => {
            console.error('Failed to cache response:', err.message);
          });
        }

        res.setHeader('X-Cache', 'MISS');
        res.setHeader('X-Cache-Key', cacheKey);
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error.message);
      next(); // Continue without caching
    }
  };
};

/**
 * Cache invalidation middleware
 */
export const invalidateCache = (patterns = []) => {
  return async (req, res, next) => {
    // Store original res.json
    const originalJson = res.json;

    // Override res.json to invalidate cache after successful response
    res.json = function(data) {
      // Only invalidate on successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        patterns.forEach(pattern => {
          cacheService.delPattern(pattern).catch(err => {
            console.error(`Failed to invalidate cache pattern ${pattern}:`, err.message);
          });
        });
      }

      return originalJson.call(this, data);
    };

    next();
  };
};

/**
 * Project-specific cache middleware
 */
export const projectCacheMiddleware = (ttl = 1800) => { // 30 minutes
  return cacheMiddleware({
    ttl,
    keyGenerator: (req) => {
      const { page = 1, limit = 12, category, search, sortBy, featured } = req.query;
      return `projects:${page}:${limit}:${category || 'all'}:${search || 'none'}:${sortBy || 'created'}:${featured || 'all'}`;
    }
  });
};

/**
 * User-specific cache middleware
 */
export const userCacheMiddleware = (ttl = 3600) => { // 1 hour
  return cacheMiddleware({
    ttl,
    keyGenerator: (req) => {
      const userId = req.user?._id || req.params.id;
      return `user:${userId}:${req.originalUrl}`;
    },
    varyBy: ['Authorization']
  });
};

/**
 * Statistics cache middleware
 */
export const statsCacheMiddleware = (ttl = 7200) => { // 2 hours
  return cacheMiddleware({
    ttl,
    keyGenerator: (req) => {
      return `stats:${req.originalUrl}:${JSON.stringify(req.query)}`;
    }
  });
};

/**
 * Image cache middleware
 */
export const imageCacheMiddleware = (ttl = 86400) => { // 24 hours
  return (req, res, next) => {
    // Set cache headers for images
    res.setHeader('Cache-Control', `public, max-age=${ttl}, immutable`);
    res.setHeader('ETag', `"${req.params.filename}-${Date.now()}"`);
    
    // Check if client has cached version
    const clientETag = req.get('If-None-Match');
    if (clientETag && clientETag.includes(req.params.filename)) {
      return res.status(304).end();
    }

    next();
  };
};

/**
 * Cache warming functions
 */
export const warmCache = {
  /**
   * Warm up project caches
   */
  async projects() {
    try {
      console.log('🔥 Warming up project caches...');
      
      // Import here to avoid circular dependency
      const Project = (await import('../models/Project.js')).default;
      
      // Cache featured projects
      const featuredProjects = await Project.find({ featured: true, status: 'approved' })
        .populate('seller', 'displayName photoURL')
        .sort({ createdAt: -1 })
        .limit(12);
      
      await cacheService.cacheProjects(featuredProjects, 'featured:all', 1800);
      
      // Cache recent projects
      const recentProjects = await Project.find({ status: 'approved' })
        .populate('seller', 'displayName photoURL')
        .sort({ createdAt: -1 })
        .limit(12);
      
      await cacheService.cacheProjects(recentProjects, 'recent:all', 1800);
      
      // Cache by categories
      const categories = ['web', 'mobile', 'desktop', 'ai-ml', 'blockchain', 'games'];
      for (const category of categories) {
        const categoryProjects = await Project.find({ category, status: 'approved' })
          .populate('seller', 'displayName photoURL')
          .sort({ createdAt: -1 })
          .limit(12);
        
        await cacheService.cacheProjects(categoryProjects, `category:${category}`, 1800);
      }
      
      console.log('✅ Project caches warmed up');
    } catch (error) {
      console.error('❌ Failed to warm up project caches:', error.message);
    }
  },

  /**
   * Warm up statistics caches
   */
  async statistics() {
    try {
      console.log('🔥 Warming up statistics caches...');
      
      const Project = (await import('../models/Project.js')).default;
      const User = (await import('../models/User.js')).default;
      
      // Cache project statistics
      const projectStats = {
        total: await Project.countDocuments({ status: 'approved' }),
        featured: await Project.countDocuments({ featured: true, status: 'approved' }),
        byCategory: {}
      };
      
      const categories = ['web', 'mobile', 'desktop', 'ai-ml', 'blockchain', 'games'];
      for (const category of categories) {
        projectStats.byCategory[category] = await Project.countDocuments({ 
          category, 
          status: 'approved' 
        });
      }
      
      await cacheService.cacheStats('projects', projectStats, 7200);
      
      // Cache user statistics
      const userStats = {
        total: await User.countDocuments(),
        sellers: await User.countDocuments({ role: 'seller' }),
        buyers: await User.countDocuments({ role: 'buyer' }),
        active: await User.countDocuments({ isActive: true })
      };
      
      await cacheService.cacheStats('users', userStats, 7200);
      
      console.log('✅ Statistics caches warmed up');
    } catch (error) {
      console.error('❌ Failed to warm up statistics caches:', error.message);
    }
  }
};

/**
 * Cache health check
 */
export const cacheHealthCheck = async () => {
  try {
    const stats = await cacheService.getStats();
    return {
      enabled: cacheService.enabled,
      connected: cacheService.isConnected,
      stats
    };
  } catch (error) {
    return {
      enabled: false,
      connected: false,
      error: error.message
    };
  }
};
