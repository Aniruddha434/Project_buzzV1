// Script to clean up old pending payments
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Payment from './models/Payment.js';
import Project from './models/Project.js';
import User from './models/User.js';

// Load environment variables
dotenv.config();

async function cleanupPendingPayments() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find all pending/active payments
    const pendingPayments = await Payment.find({
      status: { $in: ['PENDING', 'ACTIVE'] }
    }).populate('project', 'title').populate('user', 'email');

    console.log(`Found ${pendingPayments.length} pending/active payments:`);

    pendingPayments.forEach((payment, index) => {
      console.log(`${index + 1}. Order ID: ${payment.orderId}`);
      console.log(`   User: ${payment.user?.email || 'Unknown'}`);
      console.log(`   Project: ${payment.project?.title || 'Unknown'}`);
      console.log(`   Status: ${payment.status}`);
      console.log(`   Created: ${payment.createdAt}`);
      console.log(`   Cashfree Order: ${payment.cashfreeOrderId || 'None'}`);
      console.log(`   Razorpay Order: ${payment.razorpayOrderId || 'None'}`);
      console.log('   ---');
    });

    // Ask user if they want to clean up
    console.log('\n🧹 Cleaning up old pending payments...');

    // Mark old payments as expired (older than 1 hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const result = await Payment.updateMany(
      {
        status: { $in: ['PENDING', 'ACTIVE'] },
        createdAt: { $lt: oneHourAgo }
      },
      {
        $set: { status: 'EXPIRED' }
      }
    );

    console.log(`✅ Marked ${result.modifiedCount} old payments as EXPIRED`);

    // Also clean up any payments without proper gateway order IDs
    const invalidPayments = await Payment.updateMany(
      {
        status: { $in: ['PENDING', 'ACTIVE'] },
        $and: [
          { $or: [{ cashfreeOrderId: { $exists: false } }, { cashfreeOrderId: null }] },
          { $or: [{ razorpayOrderId: { $exists: false } }, { razorpayOrderId: null }] }
        ]
      },
      {
        $set: { status: 'FAILED' }
      }
    );

    console.log(`✅ Marked ${invalidPayments.modifiedCount} invalid payments as FAILED`);

    // Clean up ALL remaining active payments for testing
    console.log('\n🧪 TESTING: Cleaning up ALL remaining active payments...');
    const allActivePayments = await Payment.updateMany(
      {
        status: { $in: ['PENDING', 'ACTIVE'] }
      },
      {
        $set: { status: 'EXPIRED' }
      }
    );

    console.log(`✅ Marked ${allActivePayments.modifiedCount} remaining active payments as EXPIRED`);

    // Show remaining active payments
    const remainingActive = await Payment.countDocuments({
      status: { $in: ['PENDING', 'ACTIVE'] }
    });

    console.log(`📊 Remaining active payments: ${remainingActive}`);

    console.log('\n🎉 Cleanup completed successfully!');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB');
  }
}

// Run the cleanup
cleanupPendingPayments();
