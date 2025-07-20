import mongoose from 'mongoose';
import Project from '../models/Project.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import Negotiation from '../models/Negotiation.js';

class DatabaseOptimizationService {
  constructor() {
    this.indexCreationResults = [];
  }

  /**
   * Create comprehensive indexes for all collections
   */
  async createAllIndexes() {
    console.log('🚀 Starting comprehensive database indexing...\n');
    
    try {
      await this.createProjectIndexes();
      await this.createUserIndexes();
      await this.createTransactionIndexes();
      await this.createNegotiationIndexes();
      
      console.log('\n✅ All database indexes created successfully!');
      return this.indexCreationResults;
    } catch (error) {
      console.error('❌ Database indexing failed:', error.message);
      throw error;
    }
  }

  /**
   * Create optimized indexes for Project collection
   */
  async createProjectIndexes() {
    console.log('📊 Creating Project collection indexes...');
    
    const projectIndexes = [
      // Core query indexes
      { fields: { status: 1, createdAt: -1 }, name: 'status_created_idx' },
      { fields: { seller: 1, status: 1 }, name: 'seller_status_idx' },
      { fields: { category: 1, status: 1, createdAt: -1 }, name: 'category_status_created_idx' },
      
      // Search and filtering indexes
      { fields: { tags: 1, status: 1 }, name: 'tags_status_idx' },
      { fields: { price: 1, status: 1 }, name: 'price_status_idx' },
      { fields: { featured: 1, status: 1, createdAt: -1 }, name: 'featured_status_created_idx' },
      
      // Performance indexes
      { fields: { 'stats.sales': -1, status: 1 }, name: 'sales_status_idx' },
      { fields: { 'stats.rating.average': -1, status: 1 }, name: 'rating_status_idx' },
      { fields: { 'stats.views': -1, status: 1 }, name: 'views_status_idx' },
      
      // Compound search indexes
      { fields: { category: 1, price: 1, status: 1 }, name: 'category_price_status_idx' },
      { fields: { seller: 1, createdAt: -1 }, name: 'seller_created_idx' },
      
      // Text search index (already exists but ensuring it's optimized)
      { 
        fields: { title: 'text', description: 'text', tags: 'text' }, 
        name: 'text_search_idx',
        options: { 
          weights: { title: 10, tags: 5, description: 1 },
          name: 'project_text_index'
        }
      },
      
      // Geospatial index (if location-based features are added)
      // { fields: { location: '2dsphere' }, name: 'location_idx' },
      
      // Sparse indexes for optional fields
      { fields: { slug: 1 }, name: 'slug_idx', options: { unique: true, sparse: true } },
      { fields: { publishedAt: -1 }, name: 'published_idx', options: { sparse: true } }
    ];

    await this.createIndexes('projects', projectIndexes);
  }

  /**
   * Create optimized indexes for User collection
   */
  async createUserIndexes() {
    console.log('👥 Creating User collection indexes...');
    
    const userIndexes = [
      // Authentication indexes
      { fields: { email: 1 }, name: 'email_idx', options: { unique: true } },
      { fields: { googleId: 1 }, name: 'google_id_idx', options: { sparse: true, unique: true } },
      { fields: { githubId: 1 }, name: 'github_id_idx', options: { sparse: true, unique: true } },
      
      // Query indexes
      { fields: { role: 1, isActive: 1 }, name: 'role_active_idx' },
      { fields: { createdAt: -1 }, name: 'created_idx' },
      { fields: { lastLoginAt: -1 }, name: 'last_login_idx', options: { sparse: true } },
      
      // Performance indexes
      { fields: { 'stats.projectsSold': -1 }, name: 'projects_sold_idx' },
      { fields: { 'stats.totalEarnings': -1 }, name: 'total_earnings_idx' },
      { fields: { 'wallet.balance': -1 }, name: 'wallet_balance_idx' },
      
      // Search indexes
      { fields: { displayName: 'text', email: 'text' }, name: 'user_search_idx' }
    ];

    await this.createIndexes('users', userIndexes);
  }

  /**
   * Create optimized indexes for Transaction collection
   */
  async createTransactionIndexes() {
    console.log('💰 Creating Transaction collection indexes...');
    
    const transactionIndexes = [
      // Core query indexes
      { fields: { user: 1, createdAt: -1 }, name: 'user_created_idx' },
      { fields: { wallet: 1, createdAt: -1 }, name: 'wallet_created_idx' },
      { fields: { type: 1, status: 1, createdAt: -1 }, name: 'type_status_created_idx' },
      
      // Status and category indexes
      { fields: { status: 1, createdAt: -1 }, name: 'status_created_idx' },
      { fields: { category: 1, createdAt: -1 }, name: 'category_created_idx' },
      
      // Reference indexes
      { fields: { transactionId: 1 }, name: 'transaction_id_idx', options: { unique: true, sparse: true } },
      { fields: { relatedPayment: 1 }, name: 'related_payment_idx', options: { sparse: true } },
      { fields: { relatedPayout: 1 }, name: 'related_payout_idx', options: { sparse: true } },
      
      // Compound indexes for complex queries
      { fields: { user: 1, type: 1, createdAt: -1 }, name: 'user_type_created_idx' },
      { fields: { wallet: 1, status: 1, createdAt: -1 }, name: 'wallet_status_created_idx' }
    ];

    await this.createIndexes('transactions', transactionIndexes);
  }

  /**
   * Create optimized indexes for Negotiation collection
   */
  async createNegotiationIndexes() {
    console.log('🤝 Creating Negotiation collection indexes...');
    
    const negotiationIndexes = [
      // Core query indexes
      { fields: { buyer: 1, status: 1 }, name: 'buyer_status_idx' },
      { fields: { seller: 1, status: 1 }, name: 'seller_status_idx' },
      { fields: { project: 1, status: 1 }, name: 'project_status_idx' },
      
      // Activity indexes
      { fields: { lastActivity: -1 }, name: 'last_activity_idx' },
      { fields: { createdAt: -1 }, name: 'created_idx' },
      
      // Compound indexes
      { fields: { buyer: 1, seller: 1, project: 1 }, name: 'buyer_seller_project_idx' },
      { fields: { status: 1, lastActivity: -1 }, name: 'status_activity_idx' }
    ];

    await this.createIndexes('negotiations', negotiationIndexes);
  }

  /**
   * Helper method to create indexes for a collection
   */
  async createIndexes(collectionName, indexes) {
    const collection = mongoose.connection.db.collection(collectionName);
    
    for (const indexDef of indexes) {
      try {
        const result = await collection.createIndex(indexDef.fields, {
          name: indexDef.name,
          background: true, // Create in background to avoid blocking
          ...indexDef.options
        });
        
        console.log(`  ✅ Created index: ${indexDef.name} on ${collectionName}`);
        this.indexCreationResults.push({
          collection: collectionName,
          index: indexDef.name,
          status: 'success',
          result
        });
      } catch (error) {
        if (error.code === 85) {
          // Index already exists
          console.log(`  ⚠️  Index already exists: ${indexDef.name} on ${collectionName}`);
          this.indexCreationResults.push({
            collection: collectionName,
            index: indexDef.name,
            status: 'exists',
            message: 'Index already exists'
          });
        } else {
          console.error(`  ❌ Failed to create index: ${indexDef.name} on ${collectionName}:`, error.message);
          this.indexCreationResults.push({
            collection: collectionName,
            index: indexDef.name,
            status: 'error',
            error: error.message
          });
        }
      }
    }
  }

  /**
   * Analyze query performance
   */
  async analyzeQueryPerformance() {
    console.log('📈 Analyzing query performance...\n');
    
    const analyses = [];
    
    // Analyze common project queries
    const projectQueries = [
      { name: 'Featured Projects', query: { featured: true, status: 'approved' } },
      { name: 'Category Filter', query: { category: 'web', status: 'approved' } },
      { name: 'Price Range', query: { price: { $gte: 100, $lte: 1000 }, status: 'approved' } },
      { name: 'Seller Projects', query: { seller: new mongoose.Types.ObjectId() } }
    ];

    for (const queryDef of projectQueries) {
      try {
        const explain = await Project.find(queryDef.query).explain('executionStats');
        analyses.push({
          collection: 'projects',
          queryName: queryDef.name,
          executionTimeMs: explain.executionStats.executionTimeMillis,
          docsExamined: explain.executionStats.totalDocsExamined,
          docsReturned: explain.executionStats.totalDocsReturned,
          indexUsed: explain.executionStats.executionStages.indexName || 'COLLSCAN'
        });
      } catch (error) {
        console.error(`Failed to analyze query: ${queryDef.name}`, error.message);
      }
    }

    return analyses;
  }

  /**
   * Get database statistics
   */
  async getDatabaseStats() {
    try {
      const db = mongoose.connection.db;
      const stats = await db.stats();
      
      return {
        collections: stats.collections,
        dataSize: Math.round(stats.dataSize / 1024 / 1024 * 100) / 100, // MB
        indexSize: Math.round(stats.indexSize / 1024 / 1024 * 100) / 100, // MB
        storageSize: Math.round(stats.storageSize / 1024 / 1024 * 100) / 100, // MB
        indexes: stats.indexes,
        avgObjSize: Math.round(stats.avgObjSize)
      };
    } catch (error) {
      console.error('Failed to get database stats:', error.message);
      return null;
    }
  }
}

export default new DatabaseOptimizationService();
