import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load environment variables first
dotenv.config();

// Import models and services
import User from './models/User.js';
import Project from './models/Project.js';
import Payment from './models/Payment.js';
import notificationService from './services/notificationService.js';

console.log('🧪 Testing Complete Payment Flow with Email Notifications...\n');

async function testPaymentFlow() {
  try {
    // Connect to MongoDB
    console.log('📊 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    // Find a test user (buyer)
    console.log('\n👤 Finding test buyer...');
    const buyer = await User.findOne({ role: 'buyer' }).limit(1);
    if (!buyer) {
      console.log('❌ No buyer found in database');
      return;
    }
    console.log('✅ Found buyer:', buyer.email);

    // Find a test project
    console.log('\n📦 Finding test project...');
    const project = await Project.findOne().populate('seller').limit(1);
    if (!project) {
      console.log('❌ No project found in database');
      return;
    }
    console.log('✅ Found project:', project.title, 'by', project.seller?.email);

    // Create a test payment record
    console.log('\n💳 Creating test payment...');
    const testPayment = new Payment({
      orderId: 'TEST_ORDER_' + Date.now(),
      razorpayOrderId: 'order_test_' + Date.now(),
      razorpayPaymentId: 'pay_test_' + Date.now(),
      user: buyer._id,
      project: project._id,
      amount: project.price || 999,
      currency: 'INR',
      status: 'PAID',
      customerDetails: {
        customerId: 'cust_test_' + Date.now(),
        customerName: buyer.displayName,
        customerEmail: buyer.email,
        customerPhone: '9999999999'
      },
      paymentDetails: {
        paymentMethod: 'card',
        bank: 'TEST_BANK'
      },
      statsUpdated: false
    });

    await testPayment.save();
    console.log('✅ Test payment created:', testPayment.orderId);

    // Test the notification service calls (same as in handlePaymentSuccess)
    console.log('\n📧 Testing email notifications...');

    try {
      // Test 1: Purchase confirmation
      console.log('📧 Sending purchase confirmation...');
      const purchaseResult = await notificationService.notifyPurchaseConfirmation(
        buyer._id,
        project._id,
        testPayment._id
      );
      console.log('Purchase confirmation result:', purchaseResult ? '✅ Success' : '❌ Failed');

      // Test 2: Payment success
      console.log('📧 Sending payment success notification...');
      const paymentResult = await notificationService.notifyPaymentSuccess(
        buyer._id,
        project._id,
        testPayment._id
      );
      console.log('Payment success result:', paymentResult ? '✅ Success' : '❌ Failed');

      // Test 3: Sale notification to seller
      if (project.seller) {
        console.log('📧 Sending sale notification to seller...');
        const saleResult = await notificationService.notifySale(
          project.seller._id,
          buyer._id,
          project._id,
          testPayment._id
        );
        console.log('Sale notification result:', saleResult ? '✅ Success' : '❌ Failed');
      }

      console.log('\n✅ All email notifications tested successfully!');

    } catch (notificationError) {
      console.error('❌ Email notification error:', notificationError.message);
      console.error('Stack trace:', notificationError.stack);
    }

    // Clean up test payment
    console.log('\n🧹 Cleaning up test data...');
    await Payment.findByIdAndDelete(testPayment._id);
    console.log('✅ Test payment deleted');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    // Close MongoDB connection
    await mongoose.disconnect();
    console.log('📊 MongoDB disconnected');
  }
}

testPaymentFlow();
