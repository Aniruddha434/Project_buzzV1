#!/usr/bin/env node

/**
 * MongoDB Atlas Migration Script for ProjectBuzz
 *
 * This script helps migrate data from local MongoDB to MongoDB Atlas
 * and sets up the production database configuration.
 */

import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import readline from 'readline';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// Load environment variables
dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), '../backend/.env') });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

class AtlasMigration {
  constructor() {
    this.localConnection = null;
    this.atlasConnection = null;
    this.collections = ['users', 'projects', 'payments', 'wallets', 'transactions', 'notifications', 'payouts', 'negotiations', 'discountcodes'];
  }

  async run() {
    try {
      console.log('🚀 ProjectBuzz MongoDB Atlas Migration Tool\n');

      // Step 1: Get Atlas connection details
      const atlasUri = await this.getAtlasConnectionString();

      // Step 2: Test connections
      await this.testConnections(atlasUri);

      // Step 3: Migrate data
      const shouldMigrate = await question('Do you want to migrate data from local MongoDB to Atlas? (y/n): ');
      if (shouldMigrate.toLowerCase() === 'y') {
        await this.migrateData();
      }

      // Step 4: Update environment files
      const shouldUpdateEnv = await question('Do you want to update environment files with Atlas configuration? (y/n): ');
      if (shouldUpdateEnv.toLowerCase() === 'y') {
        await this.updateEnvironmentFiles(atlasUri);
      }

      // Step 5: Verify migration
      await this.verifyMigration();

      console.log('\n✅ Migration completed successfully!');
      console.log('\n📋 Next Steps:');
      console.log('1. Update your production environment variables');
      console.log('2. Configure IP whitelist in MongoDB Atlas');
      console.log('3. Test your application with the new Atlas connection');
      console.log('4. Deploy to production');

    } catch (error) {
      console.error('❌ Migration failed:', error.message);
    } finally {
      await this.cleanup();
      rl.close();
    }
  }

  async getAtlasConnectionString() {
    console.log('📝 MongoDB Atlas Configuration\n');

    const hasAtlasUri = await question('Do you already have a MongoDB Atlas connection string? (y/n): ');

    if (hasAtlasUri.toLowerCase() === 'y') {
      const atlasUri = await question('Enter your MongoDB Atlas connection string: ');
      return atlasUri;
    } else {
      console.log('\n📖 Please follow these steps to create a MongoDB Atlas cluster:');
      console.log('1. Go to https://cloud.mongodb.com/');
      console.log('2. Create a new account or sign in');
      console.log('3. Create a new cluster (free tier available)');
      console.log('4. Create a database user');
      console.log('5. Add your IP address to the IP whitelist');
      console.log('6. Get the connection string from "Connect" > "Connect your application"');
      console.log('\nThe connection string should look like:');
      console.log('mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/projectbuzz?retryWrites=true&w=majority\n');

      const atlasUri = await question('Enter your MongoDB Atlas connection string: ');
      return atlasUri;
    }
  }

  async testConnections(atlasUri) {
    console.log('\n🔗 Testing database connections...\n');

    try {
      // Test local connection
      console.log('Testing local MongoDB connection...');
      const localUri = process.env.MONGO_URI || 'mongodb://localhost:27017/projectbuzz';
      this.localConnection = new MongoClient(localUri);
      await this.localConnection.connect();
      await this.localConnection.db().admin().ping();
      console.log('✅ Local MongoDB connection successful');

      // Test Atlas connection
      console.log('Testing MongoDB Atlas connection...');
      this.atlasConnection = new MongoClient(atlasUri);
      await this.atlasConnection.connect();
      await this.atlasConnection.db().admin().ping();
      console.log('✅ MongoDB Atlas connection successful');

    } catch (error) {
      throw new Error(`Connection test failed: ${error.message}`);
    }
  }

  async migrateData() {
    console.log('\n📦 Starting data migration...\n');

    const localDb = this.localConnection.db('projectbuzz');
    const atlasDb = this.atlasConnection.db('projectbuzz');

    for (const collectionName of this.collections) {
      try {
        console.log(`Migrating ${collectionName}...`);

        // Get data from local database
        const localCollection = localDb.collection(collectionName);
        const documents = await localCollection.find({}).toArray();

        if (documents.length === 0) {
          console.log(`  ⚪ No documents found in ${collectionName}`);
          continue;
        }

        // Insert data into Atlas
        const atlasCollection = atlasDb.collection(collectionName);

        // Clear existing data in Atlas (optional)
        const shouldClear = await question(`  Clear existing data in Atlas ${collectionName}? (y/n): `);
        if (shouldClear.toLowerCase() === 'y') {
          await atlasCollection.deleteMany({});
          console.log(`  🗑️  Cleared existing data in ${collectionName}`);
        }

        // Insert documents
        if (documents.length > 0) {
          await atlasCollection.insertMany(documents);
          console.log(`  ✅ Migrated ${documents.length} documents to ${collectionName}`);
        }

      } catch (error) {
        console.error(`  ❌ Error migrating ${collectionName}:`, error.message);
      }
    }

    console.log('\n📊 Migration Summary:');
    await this.getMigrationSummary();
  }

  async getMigrationSummary() {
    const localDb = this.localConnection.db('projectbuzz');
    const atlasDb = this.atlasConnection.db('projectbuzz');

    for (const collectionName of this.collections) {
      try {
        const localCount = await localDb.collection(collectionName).countDocuments();
        const atlasCount = await atlasDb.collection(collectionName).countDocuments();

        const status = localCount === atlasCount ? '✅' : '⚠️';
        console.log(`  ${status} ${collectionName}: Local(${localCount}) -> Atlas(${atlasCount})`);
      } catch (error) {
        console.log(`  ❌ ${collectionName}: Error getting count`);
      }
    }
  }

  async updateEnvironmentFiles(atlasUri) {
    console.log('\n📝 Updating environment files...\n');

    try {
      // Update .env file
      const envPath = join(dirname(fileURLToPath(import.meta.url)), '../backend/.env');

      if (fs.existsSync(envPath)) {
        let envContent = fs.readFileSync(envPath, 'utf8');

        // Update MONGO_URI
        envContent = envContent.replace(
          /MONGO_URI=.*/,
          `MONGO_URI=${atlasUri}`
        );

        // Add Atlas-specific variables if not present
        if (!envContent.includes('MONGODB_ATLAS_URI')) {
          envContent += `\n# MongoDB Atlas Configuration\nMONGODB_ATLAS_URI=${atlasUri}\n`;
        }

        fs.writeFileSync(envPath, envContent);
        console.log('✅ Updated backend/.env file');
      }

      // Create production environment file
      const prodEnvPath = join(dirname(fileURLToPath(import.meta.url)), '../backend/.env.production');
      const prodEnvExamplePath = join(dirname(fileURLToPath(import.meta.url)), '../backend/.env.production.example');

      if (fs.existsSync(prodEnvExamplePath) && !fs.existsSync(prodEnvPath)) {
        let prodEnvContent = fs.readFileSync(prodEnvExamplePath, 'utf8');
        prodEnvContent = prodEnvContent.replace(
          /MONGO_URI=.*/,
          `MONGO_URI=${atlasUri}`
        );

        fs.writeFileSync(prodEnvPath, prodEnvContent);
        console.log('✅ Created backend/.env.production file');
      }

    } catch (error) {
      console.error('❌ Error updating environment files:', error.message);
    }
  }

  async verifyMigration() {
    console.log('\n🔍 Verifying migration...\n');

    try {
      // Test basic operations on Atlas
      const atlasDb = this.atlasConnection.db('projectbuzz');
      const testCollection = atlasDb.collection('users');
      const userCount = await testCollection.countDocuments();
      console.log(`✅ Atlas database accessible - ${userCount} users found`);

      // Test indexes
      const indexes = await testCollection.indexes();
      console.log(`✅ Found ${indexes.length} indexes on users collection`);

    } catch (error) {
      console.error('❌ Verification failed:', error.message);
    }
  }

  async cleanup() {
    try {
      if (this.localConnection) {
        await this.localConnection.close();
      }
      if (this.atlasConnection) {
        await this.atlasConnection.close();
      }
    } catch (error) {
      console.error('Error during cleanup:', error.message);
    }
  }
}

// Run the migration
const migration = new AtlasMigration();
migration.run().catch(console.error);
