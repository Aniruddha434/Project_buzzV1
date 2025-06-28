import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables explicitly
const envPath = path.join(__dirname, '.env');
console.log('Loading .env from:', envPath);
dotenv.config({ path: envPath });

// Import email service after loading env
import emailService from './services/emailService.js';

async function testEmailService() {
  console.log('🧪 Testing Email Service...\n');

  try {
    // Test 1: Check email service configuration
    console.log('📧 Email Service Configuration:');
    console.log(`SMTP Host: ${process.env.SMTP_HOST}`);
    console.log(`SMTP Port: ${process.env.SMTP_PORT}`);
    console.log(`SMTP User: ${process.env.SMTP_USER}`);
    console.log(`SMTP Pass: ${process.env.SMTP_PASS ? '***' + process.env.SMTP_PASS.slice(-4) : 'Not set'}`);
    console.log(`From Email: ${process.env.FROM_EMAIL}`);
    console.log(`From Name: ${process.env.FROM_NAME}\n`);

    // Test 2: Verify email connection
    console.log('🔍 Testing email connection...');
    const connectionResult = await emailService.verifyConnection();
    console.log('Connection result:', connectionResult);

    if (!connectionResult.success) {
      console.log('❌ Email connection failed:', connectionResult.error);
      return;
    }

    // Test 3: Send test email
    console.log('\n📤 Sending test email...');
    const testEmailResult = await emailService.sendTestEmail('infoprojectbuzz@gmail.com');
    console.log('Test email result:', testEmailResult);

    if (testEmailResult.success) {
      console.log('✅ Test email sent successfully!');
      console.log('Message ID:', testEmailResult.messageId);
    } else {
      console.log('❌ Test email failed:', testEmailResult.error);
    }

    // Test 4: Test specific notification methods
    console.log('\n🧪 Testing notification methods...');

    const mockUser = {
      email: 'infoprojectbuzz@gmail.com',
      displayName: 'Test User'
    };

    const mockProject = {
      title: 'Test Project',
      _id: 'test-project-id'
    };

    const mockPayment = {
      orderId: 'TEST-ORDER-123',
      amount: 999,
      _id: 'test-payment-id'
    };

    // Test purchase confirmation
    console.log('Testing purchase confirmation email...');
    const purchaseResult = await emailService.sendPurchaseConfirmation(mockUser, mockProject, mockPayment);
    console.log('Purchase confirmation result:', purchaseResult);

    // Test payment success
    console.log('Testing payment success email...');
    const paymentSuccessResult = await emailService.sendPaymentSuccess(mockUser, mockPayment, mockProject);
    console.log('Payment success result:', paymentSuccessResult);

  } catch (error) {
    console.error('❌ Email service test failed:', error);
  }
}

// Run the test
testEmailService();
