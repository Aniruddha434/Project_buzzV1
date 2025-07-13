#!/usr/bin/env node

/**
 * Production Environment Setup for Render Deployment
 * This script ensures environment variables are properly loaded
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Setting up production environment...');

// Try to load .env.production first, then fall back to .env
const prodEnvPath = path.join(__dirname, '.env.production');
const envPath = path.join(__dirname, '.env');

let envLoaded = false;

// Try production environment file first
try {
  const result = dotenv.config({ path: prodEnvPath });
  if (!result.error) {
    console.log('✅ Loaded .env.production');
    envLoaded = true;
  }
} catch (error) {
  console.log('⚠️  .env.production not found, trying .env');
}

// Fall back to regular .env file
if (!envLoaded) {
  try {
    const result = dotenv.config({ path: envPath });
    if (!result.error) {
      console.log('✅ Loaded .env');
      envLoaded = true;
    }
  } catch (error) {
    console.log('⚠️  .env not found, using system environment variables');
  }
}

// Validate critical environment variables
const requiredVars = [
  'MONGO_URI',
  'JWT_SECRET',
  'SESSION_SECRET'
];

const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  console.error('\n💡 Set these in your deployment platform or .env file');
  process.exit(1);
}

// Set defaults for optional variables
process.env.NODE_ENV = process.env.NODE_ENV || 'production';
process.env.PORT = process.env.PORT || '10000';
process.env.BCRYPT_ROUNDS = process.env.BCRYPT_ROUNDS || '14';

console.log('✅ Environment setup complete');
console.log(`📍 Environment: ${process.env.NODE_ENV}`);
console.log(`🚀 Port: ${process.env.PORT}`);
console.log(`🗄️  Database: ${process.env.MONGO_URI ? 'Configured' : 'Not configured'}`);
console.log(`📧 Email: ${process.env.SMTP_USER ? 'Configured' : 'Not configured'}`);

export default true;
