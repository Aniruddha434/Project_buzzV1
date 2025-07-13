import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';
import Project from './models/Project.js';
import Payment from './models/Payment.js';

// Load environment variables
dotenv.config();

// Import the handlePaymentSuccess function
async function importPaymentHandler() {
  try {
    // Dynamically import the payments route to get access to handlePaymentSuccess
    const paymentsModule = await import('./routes/payments.js');
    return paymentsModule;
  } catch (error) {
    console.error('Error importing payments module:', error);
    return null;
  }
}

async function testActualPaymentFlow() {
  try {
    console.log('🔧 Testing actual payment flow with email notifications...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Create test user
    const uniqueEmail = `test-payment-${Date.now()}@example.com`;
    const testUser = new User({
      email: uniqueEmail,
      displayName: 'Payment Test User',
      password: 'test-password-123',
      role: 'buyer',
      firebaseUid: 'test-firebase-uid-' + Date.now(),
      emailVerified: true
    });
    await testUser.save();
    console.log('✅ Test user created:', testUser.email);

    // Create test project
    const uniqueTitle = `Payment Test Project ${Date.now()}`;
    const testProject = new Project({
      title: uniqueTitle,
      description: 'This is a test project for payment flow verification',
      price: 1299,
      seller: testUser._id,
      status: 'approved',
      category: 'web',
      techStack: ['JavaScript', 'React'],
      completionStatus: 100,
      images: []
    });
    await testProject.save();
    console.log('✅ Test project created:', testProject.title);

    // Create test payment (simulating what happens during actual payment)
    const testPayment = new Payment({
      user: testUser._id,
      project: testProject._id,
      amount: 1299,
      orderId: 'FLOW-TEST-' + Date.now(),
      razorpayOrderId: 'razorpay_order_flow_' + Date.now(),
      razorpayPaymentId: 'razorpay_payment_flow_' + Date.now(),
      status: 'ACTIVE', // Start as ACTIVE, will be updated to PAID
      paymentDetails: {
        razorpayPaymentId: 'razorpay_payment_flow_' + Date.now(),
        paymentMethod: 'card'
      },
      customerDetails: {
        customerId: testUser._id.toString(),
        customerEmail: testUser.email,
        customerName: testUser.displayName,
        customerPhone: '+919876543210'
      }
    });
    await testPayment.save();
    console.log('✅ Test payment created:', testPayment.orderId);

    // Simulate payment success by calling markAsPaid
    console.log('\n🔄 Simulating payment success...');
    await testPayment.markAsPaid({
      razorpayPaymentId: testPayment.paymentDetails.razorpayPaymentId,
      paymentMethod: 'card',
      bank: 'HDFC',
      wallet: null,
      vpa: null,
      cardId: 'card_test_123',
      utr: 'UTR123456789',
      acquirerData: { rrn: '123456789012' },
      fee: 2598, // 2% of 1299
      tax: 468   // 18% of fee
    });

    console.log('✅ Payment marked as PAID');

    // Now simulate the handlePaymentSuccess flow
    console.log('\n📧 Testing handlePaymentSuccess flow...');
    
    // Import notification service
    const notificationService = (await import('./services/notificationService.js')).default;
    
    // Simulate the exact flow from handlePaymentSuccess
    try {
      console.log('📧 ===== STARTING EMAIL NOTIFICATIONS =====');
      console.log('📧 Payment ID:', testPayment._id);
      console.log('📧 User ID:', testPayment.user);
      console.log('📧 Project ID:', testPayment.project);

      // Test purchase confirmation (exactly as in handlePaymentSuccess)
      console.log('📧 Sending purchase confirmation...');
      const purchaseResult = await notificationService.notifyPurchaseConfirmation(
        testPayment.user,
        testPayment.project,
        testPayment._id
      );
      console.log('📧 Purchase confirmation result:', purchaseResult ? '✅ Success' : '❌ Failed');

      // Test payment success notification
      console.log('📧 Sending payment success notification...');
      const paymentResult = await notificationService.notifyPaymentSuccess(
        testPayment.user,
        testPayment.project,
        testPayment._id
      );
      console.log('📧 Payment success result:', paymentResult ? '✅ Success' : '❌ Failed');

      // Test sale notification to seller
      console.log('📧 Sending sale notification to seller...');
      const saleResult = await notificationService.notifySale(
        testProject.seller,
        testPayment.user,
        testPayment.project,
        testPayment._id
      );
      console.log('📧 Sale notification result:', saleResult ? '✅ Success' : '❌ Failed');

      console.log('✅ ===== EMAIL NOTIFICATIONS COMPLETED =====');
    } catch (notificationError) {
      console.error('❌ Failed to send payment notifications:', notificationError.message);
      console.error('Stack trace:', notificationError.stack);
    }

    // Clean up test data
    console.log('\n🧹 Cleaning up test data...');
    await User.findByIdAndDelete(testUser._id);
    await Project.findByIdAndDelete(testProject._id);
    await Payment.findByIdAndDelete(testPayment._id);
    console.log('✅ Test data cleaned up');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
    process.exit(0);
  }
}

// Run the test
testActualPaymentFlow();
