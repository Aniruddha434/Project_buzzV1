#!/usr/bin/env node

/**
 * MongoDB Atlas Health Check Script for ProjectBuzz
 *
 * This script performs comprehensive health checks on the Atlas database
 */

import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), '../backend/.env') });

class AtlasHealthCheck {
  constructor() {
    this.connection = null;
    this.results = {
      connection: false,
      collections: {},
      indexes: {},
      performance: {},
      errors: []
    };
  }

  async run() {
    try {
      console.log('🏥 MongoDB Atlas Health Check\n');

      await this.checkConnection();
      await this.checkCollections();
      await this.checkIndexes();
      await this.checkPerformance();
      await this.checkDataIntegrity();

      this.printReport();

    } catch (error) {
      console.error('❌ Health check failed:', error.message);
      this.results.errors.push(error.message);
    } finally {
      await this.cleanup();
    }
  }

  async checkConnection() {
    console.log('🔗 Checking database connection...');

    try {
      const startTime = Date.now();

      const connectionOptions = {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 15000,
        socketTimeoutMS: 60000,
        maxPoolSize: 10,
        retryWrites: true,
        retryReads: true
      };

      this.connection = new MongoClient(process.env.MONGO_URI, connectionOptions);
      await this.connection.connect();

      const connectionTime = Date.now() - startTime;
      this.results.connection = true;
      this.results.performance.connectionTime = connectionTime;

      console.log(`✅ Connection successful (${connectionTime}ms)`);

      // Test ping
      const pingStart = Date.now();
      await this.connection.db().admin().ping();
      const pingTime = Date.now() - pingStart;
      this.results.performance.pingTime = pingTime;

      console.log(`✅ Database ping successful (${pingTime}ms)`);

    } catch (error) {
      this.results.connection = false;
      this.results.errors.push(`Connection failed: ${error.message}`);
      throw error;
    }
  }

  async checkCollections() {
    console.log('\n📚 Checking collections...');

    const expectedCollections = [
      'users', 'projects', 'payments', 'wallets',
      'transactions', 'notifications', 'payouts',
      'negotiations', 'discountcodes'
    ];

    try {
      const db = this.connection.db('projectbuzz');
      const collections = await db.listCollections().toArray();
      const collectionNames = collections.map(c => c.name);

      for (const expectedCollection of expectedCollections) {
        if (collectionNames.includes(expectedCollection)) {
          const count = await db.collection(expectedCollection).countDocuments();
          this.results.collections[expectedCollection] = {
            exists: true,
            count: count
          };
          console.log(`✅ ${expectedCollection}: ${count} documents`);
        } else {
          this.results.collections[expectedCollection] = {
            exists: false,
            count: 0
          };
          console.log(`⚠️  ${expectedCollection}: Collection not found`);
        }
      }

    } catch (error) {
      this.results.errors.push(`Collection check failed: ${error.message}`);
      console.error('❌ Collection check failed:', error.message);
    }
  }

  async checkIndexes() {
    console.log('\n📊 Checking indexes...');

    const criticalIndexes = {
      users: ['email_1', 'role_1'],
      projects: ['seller_1', 'status_1', 'category_1'],
      payments: ['orderId_1', 'razorpayOrderId_1', 'user_1'],
      wallets: ['user_1'],
      transactions: ['wallet_1', 'user_1', 'type_1']
    };

    try {
      const db = this.connection.db('projectbuzz');

      for (const [collectionName, expectedIndexes] of Object.entries(criticalIndexes)) {
        if (this.results.collections[collectionName]?.exists) {
          const collection = db.collection(collectionName);
          const indexes = await collection.indexes();
          const indexNames = indexes.map(idx => idx.name);

          this.results.indexes[collectionName] = {
            total: indexes.length,
            missing: []
          };

          for (const expectedIndex of expectedIndexes) {
            if (!indexNames.includes(expectedIndex)) {
              this.results.indexes[collectionName].missing.push(expectedIndex);
            }
          }

          const missingCount = this.results.indexes[collectionName].missing.length;
          if (missingCount === 0) {
            console.log(`✅ ${collectionName}: All critical indexes present (${indexes.length} total)`);
          } else {
            console.log(`⚠️  ${collectionName}: ${missingCount} missing indexes`);
          }
        }
      }

    } catch (error) {
      this.results.errors.push(`Index check failed: ${error.message}`);
      console.error('❌ Index check failed:', error.message);
    }
  }

  async checkPerformance() {
    console.log('\n⚡ Checking performance...');

    try {
      const db = this.connection.db('projectbuzz');

      // Test query performance
      const queryTests = [
        {
          name: 'User lookup by email',
          collection: 'users',
          query: { email: { $exists: true } },
          limit: 1
        },
        {
          name: 'Active projects',
          collection: 'projects',
          query: { status: 'approved' },
          limit: 10
        },
        {
          name: 'Recent payments',
          collection: 'payments',
          query: {},
          sort: { createdAt: -1 },
          limit: 5
        }
      ];

      for (const test of queryTests) {
        if (this.results.collections[test.collection]?.exists) {
          const startTime = Date.now();

          let query = db.collection(test.collection).find(test.query);
          if (test.sort) query = query.sort(test.sort);
          if (test.limit) query = query.limit(test.limit);

          await query.toArray();

          const queryTime = Date.now() - startTime;
          this.results.performance[test.name] = queryTime;

          const status = queryTime < 100 ? '✅' : queryTime < 500 ? '⚠️' : '❌';
          console.log(`${status} ${test.name}: ${queryTime}ms`);
        }
      }

    } catch (error) {
      this.results.errors.push(`Performance check failed: ${error.message}`);
      console.error('❌ Performance check failed:', error.message);
    }
  }

  async checkDataIntegrity() {
    console.log('\n🔍 Checking data integrity...');

    try {
      const db = this.connection.db('projectbuzz');

      // Check for orphaned records
      if (this.results.collections.projects?.exists && this.results.collections.users?.exists) {
        const projects = await db.collection('projects').find({}, { projection: { seller: 1 } }).toArray();
        const users = await db.collection('users').find({}, { projection: { _id: 1 } }).toArray();
        const userIds = new Set(users.map(u => u._id.toString()));

        let orphanedProjects = 0;
        for (const project of projects) {
          if (!userIds.has(project.seller.toString())) {
            orphanedProjects++;
          }
        }

        if (orphanedProjects === 0) {
          console.log('✅ No orphaned projects found');
        } else {
          console.log(`⚠️  Found ${orphanedProjects} orphaned projects`);
          this.results.errors.push(`${orphanedProjects} orphaned projects found`);
        }
      }

      // Check for duplicate emails
      if (this.results.collections.users?.exists) {
        const duplicateEmails = await db.collection('users').aggregate([
          { $group: { _id: '$email', count: { $sum: 1 } } },
          { $match: { count: { $gt: 1 } } }
        ]).toArray();

        if (duplicateEmails.length === 0) {
          console.log('✅ No duplicate emails found');
        } else {
          console.log(`⚠️  Found ${duplicateEmails.length} duplicate emails`);
          this.results.errors.push(`${duplicateEmails.length} duplicate emails found`);
        }
      }

    } catch (error) {
      this.results.errors.push(`Data integrity check failed: ${error.message}`);
      console.error('❌ Data integrity check failed:', error.message);
    }
  }

  printReport() {
    console.log('\n📋 Health Check Report');
    console.log('='.repeat(50));

    // Connection status
    console.log(`\n🔗 Connection: ${this.results.connection ? '✅ Healthy' : '❌ Failed'}`);
    if (this.results.performance.connectionTime) {
      console.log(`   Connection time: ${this.results.performance.connectionTime}ms`);
    }
    if (this.results.performance.pingTime) {
      console.log(`   Ping time: ${this.results.performance.pingTime}ms`);
    }

    // Collections status
    console.log('\n📚 Collections:');
    for (const [name, info] of Object.entries(this.results.collections)) {
      const status = info.exists ? '✅' : '❌';
      console.log(`   ${status} ${name}: ${info.count} documents`);
    }

    // Index status
    console.log('\n📊 Indexes:');
    for (const [name, info] of Object.entries(this.results.indexes)) {
      const status = info.missing.length === 0 ? '✅' : '⚠️';
      console.log(`   ${status} ${name}: ${info.total} indexes${info.missing.length > 0 ? ` (${info.missing.length} missing)` : ''}`);
    }

    // Performance
    console.log('\n⚡ Performance:');
    for (const [test, time] of Object.entries(this.results.performance)) {
      if (test !== 'connectionTime' && test !== 'pingTime') {
        const status = time < 100 ? '✅' : time < 500 ? '⚠️' : '❌';
        console.log(`   ${status} ${test}: ${time}ms`);
      }
    }

    // Errors
    if (this.results.errors.length > 0) {
      console.log('\n❌ Issues Found:');
      this.results.errors.forEach(error => {
        console.log(`   • ${error}`);
      });
    } else {
      console.log('\n✅ No issues found - Database is healthy!');
    }

    console.log('\n' + '='.repeat(50));
  }

  async cleanup() {
    try {
      if (this.connection) {
        await this.connection.close();
      }
    } catch (error) {
      console.error('Error during cleanup:', error.message);
    }
  }
}

// Run the health check
const healthCheck = new AtlasHealthCheck();
healthCheck.run().catch(console.error);
