#!/usr/bin/env node

/**
 * Production Deployment Script for ProjectBuzz
 * This script prepares the application for production deployment
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.dirname(__dirname);

console.log('🚀 ProjectBuzz Production Deployment Script');
console.log('==========================================\n');

// Check if we're in the correct directory
if (!fs.existsSync(path.join(projectRoot, 'backend', 'package.json'))) {
  console.error('❌ Error: This script must be run from the project root directory');
  process.exit(1);
}

// Function to copy environment file
function copyEnvFile() {
  console.log('📁 Setting up environment configuration...');
  
  const prodEnvPath = path.join(projectRoot, 'backend', '.env.production');
  const envPath = path.join(projectRoot, 'backend', '.env');
  
  if (fs.existsSync(prodEnvPath)) {
    try {
      fs.copyFileSync(prodEnvPath, envPath);
      console.log('✅ Production environment file copied to .env');
    } catch (error) {
      console.error('❌ Failed to copy environment file:', error.message);
      process.exit(1);
    }
  } else {
    console.warn('⚠️  Production environment file not found at:', prodEnvPath);
    console.log('💡 Make sure to set environment variables in your deployment platform');
  }
}

// Function to validate required environment variables
function validateEnvironment() {
  console.log('\n🔍 Validating environment configuration...');
  
  const requiredVars = [
    'NODE_ENV',
    'MONGO_URI',
    'JWT_SECRET',
    'SESSION_SECRET',
    'FRONTEND_URL',
    'BACKEND_URL'
  ];
  
  const missingVars = [];
  
  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  });
  
  if (missingVars.length > 0) {
    console.warn('⚠️  Missing environment variables:');
    missingVars.forEach(varName => {
      console.warn(`   - ${varName}`);
    });
    console.log('\n💡 These should be set in your deployment platform (Render, Vercel, etc.)');
  } else {
    console.log('✅ All required environment variables are configured');
  }
}

// Function to check dependencies
function checkDependencies() {
  console.log('\n📦 Checking dependencies...');
  
  const backendPackagePath = path.join(projectRoot, 'backend', 'package.json');
  const frontendPackagePath = path.join(projectRoot, 'frontend', 'package.json');
  
  if (fs.existsSync(backendPackagePath)) {
    console.log('✅ Backend package.json found');
  } else {
    console.error('❌ Backend package.json not found');
    process.exit(1);
  }
  
  if (fs.existsSync(frontendPackagePath)) {
    console.log('✅ Frontend package.json found');
  } else {
    console.error('❌ Frontend package.json not found');
    process.exit(1);
  }
}

// Function to create deployment documentation
function createDeploymentDocs() {
  console.log('\n📝 Creating deployment documentation...');
  
  const deploymentGuide = `# ProjectBuzz Production Deployment Guide

## Environment Variables Required

### Core Configuration
- NODE_ENV=production
- PORT=10000
- MONGO_URI=mongodb+srv://...
- JWT_SECRET=your-secure-jwt-secret
- SESSION_SECRET=your-secure-session-secret

### URLs
- FRONTEND_URL=https://your-frontend-domain.com
- BACKEND_URL=https://your-backend-domain.com
- CORS_ORIGIN=https://your-frontend-domain.com

### Email Configuration
- SMTP_HOST=smtp.gmail.com
- SMTP_PORT=587
- SMTP_SECURE=false
- SMTP_USER=your-email@gmail.com
- SMTP_PASS=your-app-password
- FROM_NAME=ProjectBuzz
- FROM_EMAIL=your-email@gmail.com

### Payment Gateway (Razorpay)
- RAZORPAY_KEY_ID=your-razorpay-key-id
- RAZORPAY_KEY_SECRET=your-razorpay-secret
- RAZORPAY_ENVIRONMENT=test (or live for production)

### OAuth Configuration
- GOOGLE_CLIENT_ID=your-google-client-id
- GOOGLE_CLIENT_SECRET=your-google-client-secret
- GOOGLE_CALLBACK_URL=https://your-backend-domain.com/auth/google/callback

### Database Configuration
- DB_MAX_POOL_SIZE=20
- DB_SERVER_SELECTION_TIMEOUT=10000
- DB_SOCKET_TIMEOUT=60000
- DB_CONNECT_TIMEOUT=15000
- DB_MIN_POOL_SIZE=5

## Deployment Steps

### Backend (Render)
1. Connect your GitHub repository to Render
2. Set build command: \`cd backend && npm install\`
3. Set start command: \`cd backend && npm start\`
4. Add all environment variables listed above
5. Deploy

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set root directory to \`frontend\`
3. Set build command: \`npm run build\`
4. Add frontend environment variables:
   - VITE_API_URL=https://your-backend-domain.com/api
   - VITE_BACKEND_URL=https://your-backend-domain.com
5. Deploy

## Post-Deployment Checklist
- [ ] Backend health check responds at /
- [ ] Database connection successful
- [ ] Email service working
- [ ] OAuth redirects configured
- [ ] Payment gateway configured
- [ ] Frontend can connect to backend API
- [ ] CORS configured correctly
`;

  const docsPath = path.join(projectRoot, 'DEPLOYMENT_GUIDE.md');
  fs.writeFileSync(docsPath, deploymentGuide);
  console.log('✅ Deployment guide created at DEPLOYMENT_GUIDE.md');
}

// Main execution
async function main() {
  try {
    checkDependencies();
    copyEnvFile();
    validateEnvironment();
    createDeploymentDocs();
    
    console.log('\n🎉 Production deployment preparation complete!');
    console.log('\n📋 Next steps:');
    console.log('1. Review DEPLOYMENT_GUIDE.md for detailed instructions');
    console.log('2. Set up environment variables in your deployment platform');
    console.log('3. Deploy backend to Render');
    console.log('4. Deploy frontend to Vercel');
    console.log('5. Test the deployed application');
    
  } catch (error) {
    console.error('\n❌ Deployment preparation failed:', error.message);
    process.exit(1);
  }
}

main();
