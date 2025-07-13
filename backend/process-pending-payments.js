import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Payment from './models/Payment.js';
import notificationService from './services/notificationService.js';

// Load environment variables
dotenv.config();

async function processPendingPayments() {
  try {
    console.log('🔄 Processing pending payments that need email notifications...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find all PAID payments that haven't had their stats updated (emails not sent)
    const pendingPayments = await Payment.find({
      status: 'PAID',
      statsUpdated: { $ne: true }
    }).sort({ createdAt: -1 });

    console.log(`\n📊 Found ${pendingPayments.length} pending payments to process:\n`);

    if (pendingPayments.length === 0) {
      console.log('✅ No pending payments found. All payments have been processed.');
      return;
    }

    for (let i = 0; i < pendingPayments.length; i++) {
      const payment = pendingPayments[i];
      console.log(`${i + 1}. Processing payment: ${payment.orderId}`);
      console.log(`   Amount: ₹${payment.amount}`);
      console.log(`   Created: ${payment.createdAt}`);
      console.log(`   User ID: ${payment.user}`);
      console.log(`   Project ID: ${payment.project}`);

      try {
        // Send purchase confirmation email
        console.log('   📧 Sending purchase confirmation...');
        const purchaseResult = await notificationService.notifyPurchaseConfirmation(
          payment.user,
          payment.project,
          payment._id
        );
        console.log(`   📧 Purchase confirmation: ${purchaseResult ? '✅ Success' : '❌ Failed'}`);

        // Send payment success email
        console.log('   📧 Sending payment success notification...');
        const paymentResult = await notificationService.notifyPaymentSuccess(
          payment.user,
          payment.project,
          payment._id
        );
        console.log(`   📧 Payment success: ${paymentResult ? '✅ Success' : '❌ Failed'}`);

        // Mark as processed to prevent duplicate emails
        payment.statsUpdated = true;
        await payment.save();
        console.log('   ✅ Payment marked as processed');

      } catch (error) {
        console.error(`   ❌ Failed to process payment ${payment.orderId}:`, error.message);
      }

      console.log('   ' + '─'.repeat(50));
    }

    console.log('\n✅ Finished processing all pending payments');

  } catch (error) {
    console.error('❌ Processing failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
    process.exit(0);
  }
}

// Run the processing
processPendingPayments();
