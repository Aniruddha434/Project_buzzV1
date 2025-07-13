import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';
import Project from './models/Project.js';
import Payment from './models/Payment.js';

// Load environment variables
dotenv.config();

async function checkRecentPayments() {
  try {
    console.log('🔍 Checking recent payments and their email recipients...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Get the 10 most recent payments
    const recentPayments = await Payment.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'email displayName role')
      .populate('project', 'title seller')
      .populate({
        path: 'project',
        populate: {
          path: 'seller',
          select: 'email displayName role'
        }
      });

    console.log(`\n📊 Found ${recentPayments.length} recent payments:\n`);

    for (let i = 0; i < recentPayments.length; i++) {
      const payment = recentPayments[i];
      console.log(`${i + 1}. Payment: ${payment.orderId}`);
      console.log(`   Status: ${payment.status}`);
      console.log(`   Amount: ₹${payment.amount}`);
      console.log(`   Stats Updated: ${payment.statsUpdated || false}`);
      console.log(`   Created: ${payment.createdAt}`);
      
      if (payment.user) {
        console.log(`   👤 BUYER: ${payment.user.email} (${payment.user.displayName || 'No name'}) - Role: ${payment.user.role}`);
      } else {
        console.log(`   👤 BUYER: User not found or deleted`);
      }
      
      if (payment.project && payment.project.seller) {
        console.log(`   🏪 SELLER: ${payment.project.seller.email} (${payment.project.seller.displayName || 'No name'}) - Role: ${payment.project.seller.role}`);
      } else {
        console.log(`   🏪 SELLER: Project or seller not found`);
      }
      
      if (payment.customerDetails) {
        console.log(`   📧 CUSTOMER EMAIL: ${payment.customerDetails.customerEmail}`);
        console.log(`   📞 CUSTOMER PHONE: ${payment.customerDetails.customerPhone || 'Not provided'}`);
      }
      
      // Check if buyer and seller are the same
      if (payment.user && payment.project && payment.project.seller) {
        const isSameUser = payment.user._id.toString() === payment.project.seller._id.toString();
        console.log(`   ⚠️  SAME USER AS BUYER & SELLER: ${isSameUser ? 'YES' : 'NO'}`);
      }
      
      console.log(`   📧 EMAIL SHOULD GO TO: ${payment.user ? payment.user.email : 'Unknown'}`);
      console.log('   ' + '─'.repeat(60));
    }

    // Check for any test emails in the database
    console.log('\n🔍 Checking for test users in database...');
    const testUsers = await User.find({
      $or: [
        { email: /test.*@example\.com/ },
        { email: /.*test.*@.*/ },
        { displayName: /test/i }
      ]
    }).select('email displayName role createdAt');

    if (testUsers.length > 0) {
      console.log(`\n⚠️  Found ${testUsers.length} test users:`);
      testUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email} (${user.displayName || 'No name'}) - ${user.role} - Created: ${user.createdAt}`);
      });
    } else {
      console.log('✅ No test users found in database');
    }

    // Check recent notifications
    console.log('\n🔍 Checking recent notifications...');
    try {
      const Notification = (await import('./models/Notification.js')).default;
      const recentNotifications = await Notification.find({
        type: { $in: ['PURCHASE_CONFIRMATION', 'PAYMENT_SUCCESS'] }
      })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('recipient', 'email displayName');

      if (recentNotifications.length > 0) {
        console.log(`\n📧 Found ${recentNotifications.length} recent purchase/payment notifications:`);
        recentNotifications.forEach((notif, index) => {
          console.log(`${index + 1}. ${notif.type} - To: ${notif.recipient.email} - ${notif.createdAt}`);
          console.log(`   Email Sent: ${notif.channels?.email?.sent || false}`);
          console.log(`   Email Status: ${notif.channels?.email?.deliveryStatus || 'unknown'}`);
        });
      } else {
        console.log('📧 No recent purchase/payment notifications found');
      }
    } catch (error) {
      console.log('⚠️  Could not check notifications:', error.message);
    }

  } catch (error) {
    console.error('❌ Check failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('\n✅ MongoDB connection closed');
    process.exit(0);
  }
}

// Run the check
checkRecentPayments();
