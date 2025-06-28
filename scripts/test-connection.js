#!/usr/bin/env node

/**
 * Simple MongoDB Connection Test for ProjectBuzz
 */

import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), '../backend/.env') });

async function testConnection() {
  console.log('🔗 Testing MongoDB Connection...\n');
  
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/projectbuzz';
  console.log(`📍 Connecting to: ${uri.replace(/\/\/.*@/, '//***:***@')}`);
  
  let client;
  
  try {
    // Create connection
    client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000
    });
    
    // Connect
    await client.connect();
    console.log('✅ Connection successful');
    
    // Test ping
    await client.db().admin().ping();
    console.log('✅ Database ping successful');
    
    // List collections
    const db = client.db('projectbuzz');
    const collections = await db.listCollections().toArray();
    console.log(`✅ Found ${collections.length} collections:`);
    
    for (const collection of collections) {
      const count = await db.collection(collection.name).countDocuments();
      console.log(`   📚 ${collection.name}: ${count} documents`);
    }
    
    console.log('\n🎉 MongoDB connection test completed successfully!');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Troubleshooting tips:');
      console.log('   • Make sure MongoDB is running locally');
      console.log('   • Check if the connection string is correct');
      console.log('   • For Atlas: verify IP whitelist and credentials');
    }
    
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

testConnection().catch(console.error);
