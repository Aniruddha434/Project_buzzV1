import dotenv from 'dotenv';
import mongoose from 'mongoose';
import emailService from './services/emailService.js';
import notificationService from './services/notificationService.js';

// Load environment variables
dotenv.config();

async function testEmailIntegration() {
  console.log('🧪 Testing Email Integration with Real Scenarios...\n');

  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected\n');

    // Test 1: Direct email service test
    console.log('📧 Testing direct email service...');
    const testResult = await emailService.sendTestEmail('infoprojectbuzz@gmail.com');
    console.log('Test email result:', testResult);

    if (testResult.success) {
      console.log('✅ Direct email service working!\n');
    } else {
      console.log('❌ Direct email service failed\n');
    }

    // Test 2: Test notification service (which uses email service)
    console.log('🔔 Testing notification service...');
    
    // Create mock data for testing
    const mockUser = {
      _id: new mongoose.Types.ObjectId(),
      email: 'infoprojectbuzz@gmail.com',
      displayName: 'Test User'
    };

    const mockProject = {
      _id: new mongoose.Types.ObjectId(),
      title: 'Test Project for Email Integration',
      seller: new mongoose.Types.ObjectId()
    };

    const mockPayment = {
      _id: new mongoose.Types.ObjectId(),
      orderId: 'TEST-EMAIL-ORDER-' + Date.now(),
      amount: 1999,
      user: mockUser._id,
      project: mockProject._id
    };

    // Test purchase confirmation notification
    console.log('Testing purchase confirmation notification...');
    const purchaseNotification = await notificationService.createNotification({
      recipientId: mockUser._id,
      title: 'Purchase Confirmation',
      message: `Your purchase of "${mockProject.title}" has been confirmed.`,
      type: 'PURCHASE_CONFIRMATION',
      category: 'purchase',
      priority: 'high',
      relatedEntities: {
        project: mockProject,
        payment: mockPayment
      },
      sendEmail: true
    });

    console.log('Purchase notification result:', purchaseNotification ? 'Created' : 'Failed');

    // Test payment success notification
    console.log('Testing payment success notification...');
    const paymentNotification = await notificationService.createNotification({
      recipientId: mockUser._id,
      title: 'Payment Successful',
      message: `Your payment for "${mockProject.title}" was successful.`,
      type: 'PAYMENT_SUCCESS',
      category: 'payment',
      priority: 'high',
      relatedEntities: {
        project: mockProject,
        payment: mockPayment
      },
      sendEmail: true
    });

    console.log('Payment notification result:', paymentNotification ? 'Created' : 'Failed');

    console.log('\n✅ Email integration test completed!');

  } catch (error) {
    console.error('❌ Email integration test failed:', error);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('🔌 MongoDB disconnected');
  }
}

// Run the test
testEmailIntegration();
