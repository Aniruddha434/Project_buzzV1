#!/usr/bin/env node

/**
 * MongoDB Atlas Authentication Test Script
 */

import { MongoClient } from 'mongodb';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function testAtlasConnection() {
  console.log('🔐 MongoDB Atlas Authentication Tester\n');
  
  try {
    const connectionString = await question('Enter your MongoDB Atlas connection string: ');
    
    console.log('\n🔗 Testing connection...');
    console.log(`📍 Connecting to: ${connectionString.replace(/\/\/.*@/, '//***:***@')}`);
    
    const client = new MongoClient(connectionString, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000
    });
    
    // Test connection
    await client.connect();
    console.log('✅ Connection successful!');
    
    // Test ping
    await client.db().admin().ping();
    console.log('✅ Database ping successful!');
    
    // Test database access
    const db = client.db('projectbuzz');
    const collections = await db.listCollections().toArray();
    console.log(`✅ Found ${collections.length} collections`);
    
    // Test basic operations
    const testCollection = db.collection('test');
    await testCollection.insertOne({ test: true, timestamp: new Date() });
    await testCollection.deleteOne({ test: true });
    console.log('✅ Read/write operations successful!');
    
    await client.close();
    
    console.log('\n🎉 All tests passed! Your Atlas connection is working perfectly.');
    console.log('\n📝 Next steps:');
    console.log('1. Update your backend/.env file with this connection string');
    console.log('2. Restart your backend server');
    console.log('3. Test the featured projects API');
    
  } catch (error) {
    console.error('\n❌ Connection failed:', error.message);
    
    if (error.message.includes('authentication failed')) {
      console.log('\n💡 Authentication troubleshooting:');
      console.log('1. Check username and password in connection string');
      console.log('2. Verify user exists in Database Access');
      console.log('3. Ensure user has proper permissions');
      console.log('4. Check for special characters in password (need URL encoding)');
    } else if (error.message.includes('network') || error.message.includes('timeout')) {
      console.log('\n💡 Network troubleshooting:');
      console.log('1. Check IP whitelist in Network Access');
      console.log('2. Add 0.0.0.0/0 for testing');
      console.log('3. Verify internet connection');
    }
  } finally {
    rl.close();
  }
}

testAtlasConnection().catch(console.error);
