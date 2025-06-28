import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

// Import services after environment variables are loaded
import emailService from './services/emailService.js';

console.log('🧪 Testing Purchase Confirmation Email...\n');

// Test data
const testUser = {
  email: 'test@example.com',
  displayName: 'Test User'
};

const testProject = {
  title: 'Test Project',
  _id: '507f1f77bcf86cd799439011'
};

const testPayment = {
  orderId: 'ORDER_' + Date.now(),
  amount: 999,
  _id: '507f1f77bcf86cd799439012'
};

async function testPurchaseEmail() {
  try {
    console.log('📧 Testing email service configuration...');
    
    // Check if email service can reinitialize
    console.log('Environment variables:');
    console.log('SMTP_USER:', process.env.SMTP_USER);
    console.log('SMTP_PASS:', process.env.SMTP_PASS ? '***' : 'undefined');
    
    // Test email verification
    const verification = await emailService.verifyConnection();
    console.log('Email verification result:', verification);
    
    // Test purchase confirmation email
    console.log('\n📧 Sending purchase confirmation email...');
    const result = await emailService.sendPurchaseConfirmation(testUser, testProject, testPayment);
    
    console.log('Email result:', result);
    
    if (result.success) {
      console.log('✅ Purchase confirmation email sent successfully!');
    } else {
      console.log('❌ Failed to send purchase confirmation email:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testPurchaseEmail();
