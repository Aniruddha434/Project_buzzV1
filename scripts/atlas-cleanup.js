#!/usr/bin/env node

/**
 * MongoDB Atlas Data Cleanup Script for ProjectBuzz
 * 
 * This script fixes data integrity issues found during health checks
 */

import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import readline from 'readline';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), '../backend/.env') });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

class AtlasCleanup {
  constructor() {
    this.connection = null;
  }

  async run() {
    try {
      console.log('🧹 ProjectBuzz MongoDB Atlas Data Cleanup\n');
      
      await this.connect();
      await this.analyzeIssues();
      await this.fixPaymentIndexes();
      await this.fixOrphanedProjects();
      await this.verifyCleanup();
      
      console.log('\n✅ Data cleanup completed successfully!');
      
    } catch (error) {
      console.error('❌ Cleanup failed:', error.message);
    } finally {
      await this.cleanup();
      rl.close();
    }
  }

  async connect() {
    console.log('🔗 Connecting to MongoDB Atlas...');
    
    const connectionOptions = {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 15000,
      retryWrites: true,
      retryReads: true
    };

    this.connection = new MongoClient(process.env.MONGO_URI, connectionOptions);
    await this.connection.connect();
    await this.connection.db().admin().ping();
    console.log('✅ Connected to MongoDB Atlas');
  }

  async analyzeIssues() {
    console.log('\n🔍 Analyzing data issues...\n');
    
    const db = this.connection.db('projectbuzz');
    
    // Check payment issues
    const paymentsWithNullOrderId = await db.collection('payments')
      .countDocuments({ razorpayOrderId: null });
    
    console.log(`📊 Analysis Results:`);
    console.log(`   Payments with null razorpayOrderId: ${paymentsWithNullOrderId}`);
    
    // Check orphaned projects
    const projects = await db.collection('projects').find({}, { projection: { seller: 1, title: 1 } }).toArray();
    const users = await db.collection('users').find({}, { projection: { _id: 1 } }).toArray();
    const userIds = new Set(users.map(u => u._id.toString()));
    
    const orphanedProjects = projects.filter(project => 
      !userIds.has(project.seller.toString())
    );
    
    console.log(`   Orphaned projects: ${orphanedProjects.length}`);
    
    if (orphanedProjects.length > 0) {
      console.log('   Orphaned project details:');
      orphanedProjects.forEach(project => {
        console.log(`     • ${project.title} (seller: ${project.seller})`);
      });
    }
  }

  async fixPaymentIndexes() {
    console.log('\n💳 Fixing payment index issues...\n');
    
    const db = this.connection.db('projectbuzz');
    const paymentsCollection = db.collection('payments');
    
    try {
      // Check for payments with null razorpayOrderId
      const nullOrderIdPayments = await paymentsCollection
        .find({ razorpayOrderId: null })
        .toArray();
      
      if (nullOrderIdPayments.length > 0) {
        console.log(`Found ${nullOrderIdPayments.length} payments with null razorpayOrderId`);
        
        const shouldFix = await question('Do you want to generate unique razorpayOrderId for these payments? (y/n): ');
        
        if (shouldFix.toLowerCase() === 'y') {
          for (const payment of nullOrderIdPayments) {
            const newOrderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            await paymentsCollection.updateOne(
              { _id: payment._id },
              { $set: { razorpayOrderId: newOrderId } }
            );
            
            console.log(`  ✅ Updated payment ${payment._id} with razorpayOrderId: ${newOrderId}`);
          }
          
          // Now try to create the unique index
          try {
            await paymentsCollection.createIndex({ razorpayOrderId: 1 }, { unique: true });
            console.log('✅ Created unique index on razorpayOrderId');
          } catch (error) {
            console.log('⚠️  Index creation failed:', error.message);
          }
        }
      } else {
        console.log('✅ No payment index issues found');
      }
      
    } catch (error) {
      console.error('❌ Error fixing payment indexes:', error.message);
    }
  }

  async fixOrphanedProjects() {
    console.log('\n📚 Fixing orphaned projects...\n');
    
    const db = this.connection.db('projectbuzz');
    
    try {
      // Get orphaned projects
      const projects = await db.collection('projects').find({}).toArray();
      const users = await db.collection('users').find({}).toArray();
      const userIds = new Set(users.map(u => u._id.toString()));
      
      const orphanedProjects = projects.filter(project => 
        !userIds.has(project.seller.toString())
      );
      
      if (orphanedProjects.length > 0) {
        console.log(`Found ${orphanedProjects.length} orphaned projects:`);
        
        for (const project of orphanedProjects) {
          console.log(`  • ${project.title} (seller: ${project.seller})`);
        }
        
        const action = await question('\nChoose action: (1) Delete orphaned projects, (2) Assign to admin user, (3) Skip: ');
        
        if (action === '1') {
          // Delete orphaned projects
          const projectIds = orphanedProjects.map(p => p._id);
          const result = await db.collection('projects').deleteMany({ _id: { $in: projectIds } });
          console.log(`✅ Deleted ${result.deletedCount} orphaned projects`);
          
        } else if (action === '2') {
          // Find or create admin user
          let adminUser = await db.collection('users').findOne({ role: 'admin' });
          
          if (!adminUser) {
            console.log('No admin user found. Creating one...');
            const adminData = {
              email: 'admin@projectbuzz.com',
              displayName: 'System Admin',
              role: 'admin',
              createdAt: new Date(),
              stats: {
                projectsPurchased: 0,
                projectsSold: 0,
                totalSpent: 0,
                totalEarned: 0
              }
            };
            
            const insertResult = await db.collection('users').insertOne(adminData);
            adminUser = { _id: insertResult.insertedId, ...adminData };
            console.log('✅ Created admin user');
          }
          
          // Assign orphaned projects to admin
          const projectIds = orphanedProjects.map(p => p._id);
          const result = await db.collection('projects').updateMany(
            { _id: { $in: projectIds } },
            { $set: { seller: adminUser._id } }
          );
          
          console.log(`✅ Assigned ${result.modifiedCount} projects to admin user`);
        } else {
          console.log('⚪ Skipped orphaned projects cleanup');
        }
      } else {
        console.log('✅ No orphaned projects found');
      }
      
    } catch (error) {
      console.error('❌ Error fixing orphaned projects:', error.message);
    }
  }

  async verifyCleanup() {
    console.log('\n🔍 Verifying cleanup results...\n');
    
    const db = this.connection.db('projectbuzz');
    
    try {
      // Check payments
      const nullOrderIdCount = await db.collection('payments')
        .countDocuments({ razorpayOrderId: null });
      
      console.log(`📊 Verification Results:`);
      console.log(`   Payments with null razorpayOrderId: ${nullOrderIdCount}`);
      
      // Check orphaned projects
      const projects = await db.collection('projects').find({}).toArray();
      const users = await db.collection('users').find({}).toArray();
      const userIds = new Set(users.map(u => u._id.toString()));
      
      const orphanedCount = projects.filter(project => 
        !userIds.has(project.seller.toString())
      ).length;
      
      console.log(`   Orphaned projects: ${orphanedCount}`);
      
      if (nullOrderIdCount === 0 && orphanedCount === 0) {
        console.log('\n✅ All data integrity issues have been resolved!');
      } else {
        console.log('\n⚠️  Some issues remain - manual intervention may be required');
      }
      
    } catch (error) {
      console.error('❌ Verification failed:', error.message);
    }
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

// Run the cleanup
const cleanup = new AtlasCleanup();
cleanup.run().catch(console.error);
