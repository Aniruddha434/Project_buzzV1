#!/usr/bin/env node

/**
 * Google OAuth Test Script for Local Development
 * Tests Google OAuth configuration and provides debugging information
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../backend/.env') });

console.log('🔍 Google OAuth Configuration Test\n');

// Check environment variables
console.log('📋 Environment Variables:');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? '✅ SET' : '❌ NOT SET');
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? '✅ SET' : '❌ NOT SET');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL || 'http://localhost:5173');
console.log('BACKEND_URL:', process.env.BACKEND_URL || 'http://localhost:5000');
console.log('NODE_ENV:', process.env.NODE_ENV || 'development');

console.log('\n🔗 OAuth URLs:');
const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

console.log('Google Auth URL:', `${backendUrl}/api/auth/google`);
console.log('Google Callback URL:', `${backendUrl}/api/auth/google/callback`);
console.log('Frontend Callback URL:', `${frontendUrl}/auth/callback`);

console.log('\n📝 Google Cloud Console Setup:');
console.log('1. Go to: https://console.cloud.google.com/');
console.log('2. Select your project or create a new one');
console.log('3. Enable Google+ API');
console.log('4. Go to Credentials > OAuth 2.0 Client IDs');
console.log('5. Add these Authorized redirect URIs:');
console.log(`   - ${backendUrl}/api/auth/google/callback`);
console.log(`   - http://localhost:5000/api/auth/google/callback`);

console.log('\n🧪 Test Steps:');
console.log('1. Start your backend server: npm run dev:backend');
console.log('2. Start your frontend server: npm run dev:frontend');
console.log('3. Open browser and go to: http://localhost:5173/login');
console.log('4. Click "Sign in with Google"');
console.log('5. Check browser console and backend logs for errors');

console.log('\n🔧 Common Issues & Solutions:');
console.log('• "redirect_uri_mismatch": Add callback URL to Google Console');
console.log('• "invalid_client": Check CLIENT_ID and CLIENT_SECRET');
console.log('• CORS errors: Ensure CORS_ORIGIN includes frontend URL');
console.log('• CSP errors: Update Content-Security-Policy headers');

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.log('\n❌ Missing Google OAuth credentials!');
  console.log('Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in backend/.env');
  process.exit(1);
}

console.log('\n✅ Google OAuth configuration looks good!');
console.log('You can now test the OAuth flow.');
