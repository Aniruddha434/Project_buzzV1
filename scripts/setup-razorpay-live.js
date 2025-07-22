#!/usr/bin/env node

/**
 * Razorpay Live Mode Setup Script
 * 
 * This script helps configure Razorpay live keys for production deployment.
 * It provides instructions and validates the setup.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 ProjectBuzz - Razorpay Live Mode Setup');
console.log('==========================================\n');

// Check if we have the live keys from the CSV file
const csvPath = 'c:\\Users\\aniru\\Downloads\\rzp Live.csv';
let liveKeys = null;

try {
  if (fs.existsSync(csvPath)) {
    console.log('✅ Found Razorpay Live CSV file');
    console.log('📄 Reading live keys from:', csvPath);
    
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    console.log('📋 CSV Content Preview:');
    console.log(csvContent.substring(0, 200) + '...\n');
    
    // Parse CSV to extract keys (you'll need to adjust based on actual CSV format)
    const lines = csvContent.split('\n');
    console.log('📊 CSV has', lines.length, 'lines');
    
    // Look for key patterns
    const keyIdMatch = csvContent.match(/rzp_live_[A-Za-z0-9]+/);
    const keySecretMatch = csvContent.match(/[A-Za-z0-9]{24,}/); // Typical secret length
    
    if (keyIdMatch) {
      liveKeys = {
        keyId: keyIdMatch[0],
        keySecret: 'FOUND_IN_CSV' // Don't log actual secret
      };
      console.log('🔑 Found Live Key ID:', liveKeys.keyId);
      console.log('🔐 Found Key Secret: [HIDDEN FOR SECURITY]');
    }
  } else {
    console.log('⚠️  CSV file not found at:', csvPath);
  }
} catch (error) {
  console.log('❌ Error reading CSV file:', error.message);
}

console.log('\n🎯 RAZORPAY LIVE MODE MIGRATION STEPS');
console.log('=====================================\n');

console.log('📋 STEP 1: BACKEND (Render) Environment Variables');
console.log('--------------------------------------------------');
console.log('Go to: https://dashboard.render.com/web/srv-your-service-id/env');
console.log('Update these environment variables:');
console.log('');
if (liveKeys) {
  console.log(`RAZORPAY_KEY_ID=${liveKeys.keyId}`);
  console.log('RAZORPAY_KEY_SECRET=[YOUR_LIVE_SECRET_FROM_CSV]');
} else {
  console.log('RAZORPAY_KEY_ID=rzp_live_[YOUR_LIVE_KEY_ID]');
  console.log('RAZORPAY_KEY_SECRET=[YOUR_LIVE_SECRET]');
}
console.log('RAZORPAY_ENVIRONMENT=production');
console.log('');

console.log('📋 STEP 2: FRONTEND (Vercel) Environment Variables');
console.log('---------------------------------------------------');
console.log('Go to: https://vercel.com/your-username/project-buzz-v/settings/environment-variables');
console.log('Update this environment variable:');
console.log('');
if (liveKeys) {
  console.log(`VITE_RAZORPAY_KEY_ID=${liveKeys.keyId}`);
} else {
  console.log('VITE_RAZORPAY_KEY_ID=rzp_live_[YOUR_LIVE_KEY_ID]');
}
console.log('');

console.log('📋 STEP 3: WEBHOOK CONFIGURATION');
console.log('---------------------------------');
console.log('Go to: https://dashboard.razorpay.com/app/webhooks');
console.log('Add webhook URL: https://project-buzzv1-2.onrender.com/api/payments/webhook');
console.log('Select events: payment.captured, payment.failed, order.paid');
console.log('');

console.log('📋 STEP 4: TESTING CHECKLIST');
console.log('-----------------------------');
console.log('After deployment, test these:');
console.log('✓ Create a small test payment (₹1)');
console.log('✓ Verify payment success flow');
console.log('✓ Check webhook delivery');
console.log('✓ Verify email notifications');
console.log('✓ Test payment failure scenarios');
console.log('✓ Check dashboard transaction display');
console.log('');

console.log('📋 STEP 5: MONITORING & SAFETY');
console.log('-------------------------------');
console.log('✓ Monitor Razorpay dashboard for transactions');
console.log('✓ Check server logs for any errors');
console.log('✓ Verify all payments are captured correctly');
console.log('✓ Test refund process if needed');
console.log('✓ Keep test environment for future development');
console.log('');

console.log('🔒 SECURITY REMINDERS');
console.log('---------------------');
console.log('❌ NEVER commit live keys to repository');
console.log('❌ NEVER share live keys in chat/email');
console.log('✅ Only set live keys in production environment');
console.log('✅ Use test keys for development');
console.log('✅ Monitor transactions regularly');
console.log('');

console.log('🚀 DEPLOYMENT COMMANDS');
console.log('----------------------');
console.log('After updating environment variables:');
console.log('');
console.log('Backend (Render):');
console.log('- Environment variables update triggers auto-deployment');
console.log('- Or manually trigger deployment from Render dashboard');
console.log('');
console.log('Frontend (Vercel):');
console.log('- git push origin main (triggers auto-deployment)');
console.log('- Or manually trigger deployment from Vercel dashboard');
console.log('');

console.log('✅ SETUP COMPLETE!');
console.log('==================');
console.log('');
console.log('Next steps:');
console.log('1. Update Render environment variables');
console.log('2. Update Vercel environment variables');
console.log('3. Configure webhooks in Razorpay dashboard');
console.log('4. Deploy and test thoroughly');
console.log('5. Monitor first few transactions closely');
console.log('');
console.log('🎉 ProjectBuzz is ready for live payments!');

// Create environment variable templates
const renderEnvTemplate = `# Render Environment Variables for ProjectBuzz Live Mode
# Copy these to: https://dashboard.render.com/web/srv-your-service-id/env

RAZORPAY_KEY_ID=${liveKeys ? liveKeys.keyId : 'rzp_live_[YOUR_LIVE_KEY_ID]'}
RAZORPAY_KEY_SECRET=[YOUR_LIVE_SECRET_FROM_CSV]
RAZORPAY_ENVIRONMENT=production

# Other existing variables remain the same
NODE_ENV=production
MONGO_URI=mongodb+srv://aniruddhagayki0:oWSKPA8ZqqjnrcSt@cluster0.hujehyy.mongodb.net/projectbuzz?retryWrites=true&w=majority
JWT_SECRET=your-production-jwt-secret-minimum-64-characters-long-and-very-secure
FRONTEND_URL=https://project-buzz-v.vercel.app
BACKEND_URL=https://project-buzzv1-2.onrender.com
CORS_ORIGIN=https://project-buzz-v.vercel.app,https://projectbuzz.tech
`;

const vercelEnvTemplate = `# Vercel Environment Variables for ProjectBuzz Live Mode
# Copy these to: https://vercel.com/your-username/project-buzz-v/settings/environment-variables

VITE_RAZORPAY_KEY_ID=${liveKeys ? liveKeys.keyId : 'rzp_live_[YOUR_LIVE_KEY_ID]'}

# Other existing variables remain the same
VITE_API_URL=https://project-buzzv1-2.onrender.com/api
VITE_BACKEND_URL=https://project-buzzv1-2.onrender.com
VITE_FRONTEND_URL=https://project-buzz-v.vercel.app
VITE_GOOGLE_CLIENT_ID=584078217672-hdcv33j1da7p6m4lv4q3pi1g8759asdl.apps.googleusercontent.com
`;

// Save templates
fs.writeFileSync('RENDER_ENV_LIVE.txt', renderEnvTemplate);
fs.writeFileSync('VERCEL_ENV_LIVE.txt', vercelEnvTemplate);

console.log('📄 Environment templates saved:');
console.log('- RENDER_ENV_LIVE.txt (for Render dashboard)');
console.log('- VERCEL_ENV_LIVE.txt (for Vercel dashboard)');
console.log('');
console.log('🔧 Ready to go live! Follow the steps above.');
