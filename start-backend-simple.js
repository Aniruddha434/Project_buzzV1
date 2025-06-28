// Simple backend starter with explicit environment setup
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from backend/.env
const envPath = path.join(__dirname, 'backend', '.env');
console.log('📁 Loading .env from:', envPath);

const result = dotenv.config({ path: envPath });
if (result.error) {
  console.error('❌ Error loading .env file:', result.error);
} else {
  console.log('✅ Environment variables loaded');
}

// Now start the backend
console.log('🚀 Starting backend server...');
console.log('📍 MongoDB URI:', process.env.MONGO_URI ? 'Found' : 'Not found');
console.log('🔑 JWT Secret:', process.env.JWT_SECRET ? 'Found' : 'Not found');
console.log('💳 Razorpay Key:', process.env.RAZORPAY_KEY_ID ? 'Found' : 'Not found');

// Import and start the server
import('./backend/server.js').catch(error => {
  console.error('❌ Failed to start backend:', error);
});
