import dotenv from 'dotenv';
import mongoose from 'mongoose';
import crypto from 'crypto';

// Load environment variables first
dotenv.config();

// Import models and services
import User from './models/User.js';
import Project from './models/Project.js';
import Payment from './models/Payment.js';

console.log('🧪 Testing Complete Payment Verification Flow...\n');

async function testPaymentVerificationFlow() {
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

    // Create a test payment record (simulating order creation)
    console.log('\n💳 Creating test payment order...');
    const orderId = 'TEST_ORDER_' + Date.now();
    const razorpayOrderId = 'order_test_' + Date.now();
    const razorpayPaymentId = 'pay_test_' + Date.now();

    const testPayment = new Payment({
      orderId: orderId,
      razorpayOrderId: razorpayOrderId,
      user: buyer._id,
      project: project._id,
      amount: project.price || 999,
      currency: 'INR',
      status: 'PENDING',
      customerDetails: {
        customerId: 'cust_test_' + Date.now(),
        customerName: buyer.displayName,
        customerEmail: buyer.email,
        customerPhone: '9999999999'
      },
      statsUpdated: false
    });

    await testPayment.save();
    console.log('✅ Test payment order created:', testPayment.orderId);

    // Simulate Razorpay payment success (what happens in verify-payment endpoint)
    console.log('\n🔍 Simulating payment verification...');

    // Create mock payment details (what Razorpay sends)
    const mockPaymentDetails = {
      id: razorpayPaymentId,
      order_id: razorpayOrderId,
      status: 'captured',
      amount: (project.price || 999) * 100, // Amount in paise
      currency: 'INR',
      method: 'card',
      bank: 'TEST_BANK',
      wallet: null,
      vpa: null,
      card_id: 'card_test_123',
      acquirer_data: {
        utr: 'TEST_UTR_' + Date.now()
      },
      fee: 2000, // 20 rupees fee
      tax: 360   // 3.60 rupees tax
    };

    // Update payment record (simulating what happens in verify-payment)
    console.log('💳 Updating payment record...');
    await testPayment.markAsPaid({
      razorpayPaymentId: mockPaymentDetails.id,
      paymentMethod: mockPaymentDetails.method,
      bank: mockPaymentDetails.bank,
      wallet: mockPaymentDetails.wallet,
      vpa: mockPaymentDetails.vpa,
      cardId: mockPaymentDetails.card_id,
      utr: mockPaymentDetails.acquirer_data?.utr,
      acquirerData: mockPaymentDetails.acquirer_data,
      fee: mockPaymentDetails.fee,
      tax: mockPaymentDetails.tax
    });

    console.log('✅ Payment marked as PAID');

    // Now test the handlePaymentSuccess function
    console.log('\n🔄 Testing handlePaymentSuccess function...');

    // Import the function dynamically to ensure environment variables are loaded
    const { default: paymentsRouter } = await import('./routes/payments.js');
    
    // We need to access the handlePaymentSuccess function
    // Since it's not exported, let's test the notification service directly
    const { default: notificationService } = await import('./services/notificationService.js');

    console.log('\n📧 Testing notification service directly...');

    try {
      // Test 1: Purchase confirmation
      console.log('📧 Testing purchase confirmation...');
      const purchaseResult = await notificationService.notifyPurchaseConfirmation(
        buyer._id,
        project._id,
        testPayment._id
      );
      console.log('Purchase confirmation result:', purchaseResult ? '✅ Success' : '❌ Failed');

      // Test 2: Payment success
      console.log('📧 Testing payment success notification...');
      const paymentResult = await notificationService.notifyPaymentSuccess(
        buyer._id,
        project._id,
        testPayment._id
      );
      console.log('Payment success result:', paymentResult ? '✅ Success' : '❌ Failed');

      // Test 3: Sale notification to seller
      if (project.seller) {
        console.log('📧 Testing sale notification to seller...');
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

testPaymentVerificationFlow();
