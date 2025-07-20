#!/usr/bin/env node

/**
 * Performance Optimization Script for ProjectBuzz
 * This script initializes database indexes, warms up caches, and optimizes the application
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', 'backend', '.env') });

// Import services
import databaseOptimizationService from '../backend/services/databaseOptimizationService.js';
import cacheService from '../backend/services/cacheService.js';
import { warmCache } from '../backend/middleware/cache.js';

class PerformanceOptimizer {
  constructor() {
    this.results = {
      database: null,
      cache: null,
      errors: []
    };
  }

  async run() {
    console.log('🚀 Starting ProjectBuzz Performance Optimization...\n');
    
    try {
      // Connect to MongoDB
      await this.connectDatabase();
      
      // Optimize database
      await this.optimizeDatabase();
      
      // Initialize cache
      await this.initializeCache();
      
      // Warm up caches
      await this.warmUpCaches();
      
      // Display results
      this.displayResults();
      
    } catch (error) {
      console.error('❌ Performance optimization failed:', error.message);
      this.results.errors.push(error.message);
    } finally {
      await this.cleanup();
    }
  }

  async connectDatabase() {
    console.log('🔗 Connecting to MongoDB...');
    
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_ATLAS_URI;
    if (!mongoUri) {
      throw new Error('MongoDB URI not found in environment variables');
    }

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 15000,
      socketTimeoutMS: 60000,
      maxPoolSize: 10,
      minPoolSize: 2
    });

    console.log('✅ Connected to MongoDB');
  }

  async optimizeDatabase() {
    console.log('\n📊 Optimizing Database Performance...\n');
    
    try {
      // Create indexes
      const indexResults = await databaseOptimizationService.createAllIndexes();
      this.results.database = { indexes: indexResults };
      
      // Analyze query performance
      console.log('\n📈 Analyzing Query Performance...');
      const performanceAnalysis = await databaseOptimizationService.analyzeQueryPerformance();
      this.results.database.performance = performanceAnalysis;
      
      // Get database statistics
      const dbStats = await databaseOptimizationService.getDatabaseStats();
      this.results.database.stats = dbStats;
      
      console.log('\n✅ Database optimization completed');
      
    } catch (error) {
      console.error('❌ Database optimization failed:', error.message);
      this.results.errors.push(`Database: ${error.message}`);
    }
  }

  async initializeCache() {
    console.log('\n📦 Initializing Cache System...\n');
    
    try {
      if (process.env.ENABLE_CACHING === 'true') {
        // Cache service should auto-connect
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for connection
        
        const cacheStats = await cacheService.getStats();
        this.results.cache = { 
          enabled: true, 
          connected: cacheService.isConnected,
          stats: cacheStats 
        };
        
        if (cacheService.isConnected) {
          console.log('✅ Cache system initialized');
        } else {
          console.log('⚠️  Cache system enabled but not connected');
        }
      } else {
        console.log('📦 Cache system is disabled');
        this.results.cache = { enabled: false, connected: false };
      }
      
    } catch (error) {
      console.error('❌ Cache initialization failed:', error.message);
      this.results.errors.push(`Cache: ${error.message}`);
    }
  }

  async warmUpCaches() {
    if (!cacheService.isConnected) {
      console.log('⏭️  Skipping cache warm-up (cache not connected)');
      return;
    }

    console.log('\n🔥 Warming Up Caches...\n');
    
    try {
      // Warm up project caches
      await warmCache.projects();
      
      // Warm up statistics caches
      await warmCache.statistics();
      
      console.log('\n✅ Cache warm-up completed');
      
    } catch (error) {
      console.error('❌ Cache warm-up failed:', error.message);
      this.results.errors.push(`Cache Warm-up: ${error.message}`);
    }
  }

  displayResults() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 PERFORMANCE OPTIMIZATION RESULTS');
    console.log('='.repeat(60));
    
    // Database Results
    if (this.results.database) {
      console.log('\n🗄️  DATABASE OPTIMIZATION:');
      console.log(`   Indexes Created: ${this.results.database.indexes?.length || 0}`);
      
      if (this.results.database.stats) {
        const stats = this.results.database.stats;
        console.log(`   Collections: ${stats.collections}`);
        console.log(`   Data Size: ${stats.dataSize} MB`);
        console.log(`   Index Size: ${stats.indexSize} MB`);
        console.log(`   Storage Size: ${stats.storageSize} MB`);
      }
      
      if (this.results.database.performance) {
        console.log('\n   Query Performance Analysis:');
        this.results.database.performance.forEach(analysis => {
          console.log(`     ${analysis.queryName}: ${analysis.executionTimeMs}ms (${analysis.indexUsed})`);
        });
      }
    }
    
    // Cache Results
    if (this.results.cache) {
      console.log('\n📦 CACHE SYSTEM:');
      console.log(`   Enabled: ${this.results.cache.enabled ? '✅' : '❌'}`);
      console.log(`   Connected: ${this.results.cache.connected ? '✅' : '❌'}`);
    }
    
    // Errors
    if (this.results.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      this.results.errors.forEach(error => {
        console.log(`   • ${error}`);
      });
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 Performance optimization completed!');
    console.log('='.repeat(60));
  }

  async cleanup() {
    try {
      if (cacheService.isConnected) {
        await cacheService.close();
      }
      
      if (mongoose.connection.readyState === 1) {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
      }
    } catch (error) {
      console.error('❌ Cleanup failed:', error.message);
    }
  }
}

// Run the optimizer
const optimizer = new PerformanceOptimizer();
optimizer.run().catch(error => {
  console.error('💥 Fatal error:', error.message);
  process.exit(1);
});
