// Simple script to check and clean payments
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Simple Payment schema for checking
const paymentSchema = new mongoose.Schema({
  orderId: String,
  razorpayOrderId: String,
  cashfreeOrderId: String,
  status: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  createdAt: { type: Date, default: Date.now },
  expiryTime: Date
});

const Payment = mongoose.model('Payment', paymentSchema);

async function checkAndCleanPayments() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find all active/pending payments
    const activePayments = await Payment.find({
      status: { $in: ['PENDING', 'ACTIVE'] }
    });

    console.log(`Found ${activePayments.length} active/pending payments:`);
    
    activePayments.forEach((payment, index) => {
      console.log(`${index + 1}. Order ID: ${payment.orderId}`);
      console.log(`   Status: ${payment.status}`);
      console.log(`   Created: ${payment.createdAt}`);
      console.log(`   Razorpay Order: ${payment.razorpayOrderId || 'None'}`);
      console.log(`   Cashfree Order: ${payment.cashfreeOrderId || 'None'}`);
      console.log('   ---');
    });

    // Clean up all active payments
    if (activePayments.length > 0) {
      console.log('\n🧹 Cleaning up all active payments...');
      const result = await Payment.updateMany(
        { status: { $in: ['PENDING', 'ACTIVE'] } },
        { $set: { status: 'EXPIRED' } }
      );
      console.log(`✅ Marked ${result.modifiedCount} payments as EXPIRED`);
    }

    // Check remaining active payments
    const remainingActive = await Payment.countDocuments({
      status: { $in: ['PENDING', 'ACTIVE'] }
    });

    console.log(`📊 Remaining active payments: ${remainingActive}`);

    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run the check
checkAndCleanPayments();
