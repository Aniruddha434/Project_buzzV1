import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Payment from './models/Payment.js';

// Load environment variables
dotenv.config();

async function cleanupPendingPayments() {
  try {
    console.log('🧹 Cleaning up pending payments...\n');

    // Connect to MongoDB
    console.log('📊 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    // Find all pending/active payments
    const pendingPayments = await Payment.find({
      status: { $in: ['PENDING', 'ACTIVE'] }
    }).populate('user', 'email displayName').populate('project', 'title');

    console.log(`\n📋 Found ${pendingPayments.length} pending/active payments:`);

    if (pendingPayments.length > 0) {
      pendingPayments.forEach((payment, index) => {
        console.log(`${index + 1}. Order ID: ${payment.orderId}`);
        console.log(`   User: ${payment.user?.email || 'Unknown'}`);
        console.log(`   Project: ${payment.project?.title || 'Unknown'}`);
        console.log(`   Status: ${payment.status}`);
        console.log(`   Created: ${payment.createdAt}`);
        console.log(`   Expires: ${payment.expiryTime || 'No expiry'}`);
        console.log(`   Is Expired: ${payment.isExpired()}`);
        console.log('');
      });

      // Ask for confirmation
      console.log('🤔 Do you want to clean up these payments?');
      console.log('This will mark all pending/active payments as EXPIRED.');
      console.log('Type "yes" to continue or anything else to cancel:');

      // For automated cleanup, uncomment the next line and comment out the interactive part
      // const answer = 'yes';
      
      // Interactive confirmation (comment out for automated cleanup)
      const answer = await new Promise((resolve) => {
        process.stdin.once('data', (data) => {
          resolve(data.toString().trim().toLowerCase());
        });
      });

      if (answer === 'yes') {
        console.log('\n🧹 Cleaning up pending payments...');
        
        const result = await Payment.updateMany(
          { status: { $in: ['PENDING', 'ACTIVE'] } },
          { $set: { status: 'EXPIRED' } }
        );

        console.log(`✅ Marked ${result.modifiedCount} payments as EXPIRED`);
        
        // Verify cleanup
        const remainingPending = await Payment.countDocuments({
          status: { $in: ['PENDING', 'ACTIVE'] }
        });
        
        console.log(`📊 Remaining pending payments: ${remainingPending}`);
        
        if (remainingPending === 0) {
          console.log('🎉 All pending payments cleaned up successfully!');
        }
      } else {
        console.log('❌ Cleanup cancelled');
      }
    } else {
      console.log('✅ No pending payments found - nothing to clean up!');
    }

    // Show summary
    console.log('\n📊 Payment Status Summary:');
    const statusCounts = await Payment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    statusCounts.forEach(status => {
      console.log(`   ${status._id}: ${status.count}`);
    });

    await mongoose.disconnect();
    console.log('\n📡 Disconnected from MongoDB');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// For automated cleanup without confirmation, use this function
async function forceCleanupPendingPayments() {
  try {
    console.log('🧹 Force cleaning up all pending payments...\n');

    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    const result = await Payment.updateMany(
      { status: { $in: ['PENDING', 'ACTIVE'] } },
      { $set: { status: 'EXPIRED' } }
    );

    console.log(`✅ Force marked ${result.modifiedCount} payments as EXPIRED`);

    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Check command line arguments
const args = process.argv.slice(2);
if (args.includes('--force')) {
  forceCleanupPendingPayments();
} else {
  cleanupPendingPayments();
}
