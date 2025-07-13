import dotenv from 'dotenv';
import mongoose from 'mongoose';
import notificationService from './services/notificationService.js';
import User from './models/User.js';
import Project from './models/Project.js';
import Payment from './models/Payment.js';

// Load environment variables
dotenv.config();

async function testPurchaseEmailFix() {
  try {
    console.log('🔧 Testing purchase email fix...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Create test user with unique email
    const uniqueEmail = `test-${Date.now()}@example.com`;
    const testUser = new User({
      email: uniqueEmail,
      displayName: 'Test User',
      password: 'test-password-123', // Required field
      role: 'buyer',
      firebaseUid: 'test-firebase-uid-' + Date.now(),
      emailVerified: true
    });
    await testUser.save();
    console.log('✅ Test user created:', testUser.email);

    // Create test project with unique title
    const uniqueTitle = `Test Project for Email ${Date.now()}`;
    const testProject = new Project({
      title: uniqueTitle,
      description: 'This is a test project for email verification',
      price: 999,
      seller: testUser._id, // Using same user as seller for simplicity
      status: 'approved',
      category: 'web', // Valid enum value
      techStack: ['JavaScript', 'Node.js'],
      completionStatus: 100, // Number between 0-100
      images: []
    });
    await testProject.save();
    console.log('✅ Test project created:', testProject.title);

    // Create test payment
    const testPayment = new Payment({
      user: testUser._id,
      project: testProject._id,
      amount: 999,
      orderId: 'TEST-ORDER-' + Date.now(),
      razorpayOrderId: 'razorpay_order_test_' + Date.now(),
      razorpayPaymentId: 'razorpay_payment_test_' + Date.now(),
      status: 'PAID', // Valid enum value
      paymentDetails: {
        razorpayPaymentId: 'razorpay_payment_test_' + Date.now(),
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

    // Test purchase confirmation notification
    console.log('\n📧 Testing purchase confirmation notification...');
    const purchaseResult = await notificationService.notifyPurchaseConfirmation(
      testUser._id,
      testProject._id,
      testPayment._id
    );
    
    if (purchaseResult) {
      console.log('✅ Purchase confirmation notification sent successfully');
    } else {
      console.log('❌ Purchase confirmation notification failed');
    }

    // Test payment success notification
    console.log('\n📧 Testing payment success notification...');
    const paymentResult = await notificationService.notifyPaymentSuccess(
      testUser._id,
      testProject._id,
      testPayment._id
    );
    
    if (paymentResult) {
      console.log('✅ Payment success notification sent successfully');
    } else {
      console.log('❌ Payment success notification failed');
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
testPurchaseEmailFix();
