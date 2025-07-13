import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';
import Project from './models/Project.js';
import Payment from './models/Payment.js';

// Load environment variables
dotenv.config();

async function debugEmailRecipient() {
  try {
    console.log('🔍 Debugging email recipient issue...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Create a real buyer (different from seller)
    const buyerEmail = `buyer-${Date.now()}@example.com`;
    const buyer = new User({
      email: buyerEmail,
      displayName: 'Real Buyer User',
      password: 'buyer-password-123',
      role: 'buyer',
      firebaseUid: 'buyer-firebase-uid-' + Date.now(),
      emailVerified: true
    });
    await buyer.save();
    console.log('✅ Buyer created:', buyer.email, 'ID:', buyer._id);

    // Create a seller (different from buyer)
    const sellerEmail = `seller-${Date.now()}@example.com`;
    const seller = new User({
      email: sellerEmail,
      displayName: 'Real Seller User',
      password: 'seller-password-123',
      role: 'seller',
      firebaseUid: 'seller-firebase-uid-' + Date.now(),
      emailVerified: true
    });
    await seller.save();
    console.log('✅ Seller created:', seller.email, 'ID:', seller._id);

    // Create project by seller
    const uniqueTitle = `Debug Project ${Date.now()}`;
    const project = new Project({
      title: uniqueTitle,
      description: 'This is a debug project to test email recipients',
      price: 1599,
      seller: seller._id, // Project belongs to seller
      status: 'approved',
      category: 'web',
      techStack: ['JavaScript', 'React'],
      completionStatus: 100,
      images: []
    });
    await project.save();
    console.log('✅ Project created:', project.title, 'Seller ID:', project.seller);

    // Create payment by buyer for seller's project
    const payment = new Payment({
      user: buyer._id, // Payment made by buyer
      project: project._id, // For seller's project
      amount: 1599,
      orderId: 'DEBUG-ORDER-' + Date.now(),
      razorpayOrderId: 'razorpay_order_debug_' + Date.now(),
      razorpayPaymentId: 'razorpay_payment_debug_' + Date.now(),
      status: 'PAID',
      paymentDetails: {
        razorpayPaymentId: 'razorpay_payment_debug_' + Date.now(),
        paymentMethod: 'card'
      },
      customerDetails: {
        customerId: buyer._id.toString(),
        customerEmail: buyer.email, // Buyer's email
        customerName: buyer.displayName,
        customerPhone: '+919876543210'
      }
    });
    await payment.save();
    console.log('✅ Payment created:', payment.orderId);
    console.log('📧 Payment user (buyer):', payment.user);
    console.log('📧 Payment customer email:', payment.customerDetails.customerEmail);

    // Now test the notification flow
    console.log('\n🔍 Testing notification flow...');
    
    // Import notification service
    const notificationService = (await import('./services/notificationService.js')).default;
    
    // Test with the exact same parameters as the real flow
    console.log('📧 Calling notifyPurchaseConfirmation with:');
    console.log('📧 Buyer ID (payment.user):', payment.user);
    console.log('📧 Project ID:', payment.project);
    console.log('📧 Payment ID:', payment._id);

    // Fetch the actual user to verify
    const actualBuyer = await User.findById(payment.user);
    console.log('📧 Actual buyer from DB:', { 
      id: actualBuyer._id, 
      email: actualBuyer.email, 
      displayName: actualBuyer.displayName 
    });

    const actualSeller = await User.findById(project.seller);
    console.log('📧 Actual seller from DB:', { 
      id: actualSeller._id, 
      email: actualSeller.email, 
      displayName: actualSeller.displayName 
    });

    // Now call the notification service
    const result = await notificationService.notifyPurchaseConfirmation(
      payment.user,    // This should be buyer's ID
      payment.project, // This should be project ID
      payment._id      // This should be payment ID
    );

    console.log('📧 Notification result:', result ? '✅ Success' : '❌ Failed');

    // Clean up test data
    console.log('\n🧹 Cleaning up test data...');
    await User.findByIdAndDelete(buyer._id);
    await User.findByIdAndDelete(seller._id);
    await Project.findByIdAndDelete(project._id);
    await Payment.findByIdAndDelete(payment._id);
    console.log('✅ Test data cleaned up');

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
    process.exit(0);
  }
}

// Run the debug
debugEmailRecipient();
