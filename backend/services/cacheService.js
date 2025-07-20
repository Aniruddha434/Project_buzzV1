import redis from 'redis';

class CacheService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.defaultTTL = parseInt(process.env.CACHE_TTL) || 3600; // 1 hour default
    this.enabled = process.env.ENABLE_CACHING === 'true';
    
    if (this.enabled) {
      this.connect();
    } else {
      console.log('📦 Redis caching is disabled');
    }
  }

  /**
   * Connect to Redis
   */
  async connect() {
    try {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      
      this.client = redis.createClient({
        url: redisUrl,
        retry_strategy: (options) => {
          if (options.error && options.error.code === 'ECONNREFUSED') {
            console.log('❌ Redis connection refused');
            return new Error('Redis connection refused');
          }
          if (options.total_retry_time > 1000 * 60 * 60) {
            console.log('❌ Redis retry time exhausted');
            return new Error('Retry time exhausted');
          }
          if (options.attempt > 10) {
            console.log('❌ Redis max retry attempts reached');
            return undefined;
          }
          // Reconnect after
          return Math.min(options.attempt * 100, 3000);
        }
      });

      this.client.on('error', (err) => {
        console.error('❌ Redis Client Error:', err.message);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        console.log('🔗 Redis connecting...');
      });

      this.client.on('ready', () => {
        console.log('✅ Redis connected and ready');
        this.isConnected = true;
      });

      this.client.on('end', () => {
        console.log('🔌 Redis connection ended');
        this.isConnected = false;
      });

      await this.client.connect();
      
    } catch (error) {
      console.error('❌ Failed to connect to Redis:', error.message);
      this.enabled = false; // Disable caching if Redis fails
    }
  }

  /**
   * Check if caching is available
   */
  isAvailable() {
    return this.enabled && this.isConnected && this.client;
  }

  /**
   * Generate cache key with prefix
   */
  generateKey(prefix, identifier) {
    return `projectbuzz:${prefix}:${identifier}`;
  }

  /**
   * Get data from cache
   */
  async get(key) {
    if (!this.isAvailable()) {
      return null;
    }

    try {
      const data = await this.client.get(key);
      if (data) {
        console.log(`📦 Cache HIT: ${key}`);
        return JSON.parse(data);
      }
      console.log(`📦 Cache MISS: ${key}`);
      return null;
    } catch (error) {
      console.error(`❌ Cache GET error for ${key}:`, error.message);
      return null;
    }
  }

  /**
   * Set data in cache
   */
  async set(key, data, ttl = null) {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      const serializedData = JSON.stringify(data);
      const expiry = ttl || this.defaultTTL;
      
      await this.client.setEx(key, expiry, serializedData);
      console.log(`📦 Cache SET: ${key} (TTL: ${expiry}s)`);
      return true;
    } catch (error) {
      console.error(`❌ Cache SET error for ${key}:`, error.message);
      return false;
    }
  }

  /**
   * Delete data from cache
   */
  async del(key) {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      await this.client.del(key);
      console.log(`📦 Cache DEL: ${key}`);
      return true;
    } catch (error) {
      console.error(`❌ Cache DEL error for ${key}:`, error.message);
      return false;
    }
  }

  /**
   * Delete multiple keys by pattern
   */
  async delPattern(pattern) {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
        console.log(`📦 Cache DEL pattern: ${pattern} (${keys.length} keys)`);
      }
      return true;
    } catch (error) {
      console.error(`❌ Cache DEL pattern error for ${pattern}:`, error.message);
      return false;
    }
  }

  /**
   * Cache projects with automatic invalidation
   */
  async cacheProjects(projects, cacheKey, ttl = 1800) { // 30 minutes
    const key = this.generateKey('projects', cacheKey);
    return await this.set(key, projects, ttl);
  }

  /**
   * Get cached projects
   */
  async getCachedProjects(cacheKey) {
    const key = this.generateKey('projects', cacheKey);
    return await this.get(key);
  }

  /**
   * Invalidate project caches
   */
  async invalidateProjectCaches(projectId = null) {
    if (projectId) {
      // Invalidate specific project
      await this.del(this.generateKey('project', projectId));
    }
    
    // Invalidate all project list caches
    await this.delPattern('projectbuzz:projects:*');
    await this.delPattern('projectbuzz:featured:*');
    await this.delPattern('projectbuzz:category:*');
  }

  /**
   * Cache user data
   */
  async cacheUser(userId, userData, ttl = 3600) { // 1 hour
    const key = this.generateKey('user', userId);
    return await this.set(key, userData, ttl);
  }

  /**
   * Get cached user
   */
  async getCachedUser(userId) {
    const key = this.generateKey('user', userId);
    return await this.get(key);
  }

  /**
   * Cache API responses
   */
  async cacheApiResponse(endpoint, params, data, ttl = 600) { // 10 minutes
    const paramString = JSON.stringify(params);
    const key = this.generateKey('api', `${endpoint}:${Buffer.from(paramString).toString('base64')}`);
    return await this.set(key, data, ttl);
  }

  /**
   * Get cached API response
   */
  async getCachedApiResponse(endpoint, params) {
    const paramString = JSON.stringify(params);
    const key = this.generateKey('api', `${endpoint}:${Buffer.from(paramString).toString('base64')}`);
    return await this.get(key);
  }

  /**
   * Cache statistics
   */
  async cacheStats(statsType, data, ttl = 7200) { // 2 hours
    const key = this.generateKey('stats', statsType);
    return await this.set(key, data, ttl);
  }

  /**
   * Get cached statistics
   */
  async getCachedStats(statsType) {
    const key = this.generateKey('stats', statsType);
    return await this.get(key);
  }

  /**
   * Increment counter (for rate limiting, analytics, etc.)
   */
  async increment(key, ttl = 3600) {
    if (!this.isAvailable()) {
      return 0;
    }

    try {
      const fullKey = this.generateKey('counter', key);
      const result = await this.client.incr(fullKey);
      
      if (result === 1) {
        // Set expiry only on first increment
        await this.client.expire(fullKey, ttl);
      }
      
      return result;
    } catch (error) {
      console.error(`❌ Cache INCREMENT error for ${key}:`, error.message);
      return 0;
    }
  }

  /**
   * Get cache statistics
   */
  async getStats() {
    if (!this.isAvailable()) {
      return { enabled: false, connected: false };
    }

    try {
      const info = await this.client.info('memory');
      const keyspace = await this.client.info('keyspace');
      
      return {
        enabled: this.enabled,
        connected: this.isConnected,
        memory: info,
        keyspace: keyspace
      };
    } catch (error) {
      console.error('❌ Failed to get cache stats:', error.message);
      return { enabled: this.enabled, connected: false, error: error.message };
    }
  }

  /**
   * Flush all cache
   */
  async flush() {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      await this.client.flushAll();
      console.log('📦 Cache flushed');
      return true;
    } catch (error) {
      console.error('❌ Cache flush error:', error.message);
      return false;
    }
  }

  /**
   * Close connection
   */
  async close() {
    if (this.client) {
      await this.client.quit();
      console.log('🔌 Redis connection closed');
    }
  }
}

export default new CacheService();
