import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config();

async function checkProjects() {
  try {
    console.log('📊 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    // Import models
    const { default: Project } = await import('./models/Project.js');
    const { default: User } = await import('./models/User.js');
    const { default: Payment } = await import('./models/Payment.js');

    // Check projects
    console.log('\n📋 Checking projects in database...');
    const projects = await Project.find().populate('seller', 'email displayName').limit(5);
    
    console.log(`Found ${projects.length} projects:`);
    projects.forEach((project, index) => {
      console.log(`${index + 1}. ID: ${project._id}`);
      console.log(`   Title: ${project.title}`);
      console.log(`   Price: ₹${project.price}`);
      console.log(`   Seller: ${project.seller?.email || 'Unknown'}`);
      console.log(`   Status: ${project.status}`);
      console.log('');
    });

    // Check users
    console.log('\n👥 Checking users in database...');
    const users = await User.find({ role: 'buyer' }).limit(3);
    
    console.log(`Found ${users.length} buyer users:`);
    users.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user._id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Display Name: ${user.displayName}`);
      console.log(`   Role: ${user.role}`);
      console.log('');
    });

    // Check payments
    console.log('\n💳 Checking recent payments...');
    const payments = await Payment.find()
      .populate('user', 'email displayName')
      .populate('project', 'title price')
      .sort({ createdAt: -1 })
      .limit(5);
    
    console.log(`Found ${payments.length} recent payments:`);
    payments.forEach((payment, index) => {
      console.log(`${index + 1}. Order ID: ${payment.orderId}`);
      console.log(`   User: ${payment.user?.email || 'Unknown'}`);
      console.log(`   Project: ${payment.project?.title || 'Unknown'}`);
      console.log(`   Amount: ₹${payment.amount}`);
      console.log(`   Status: ${payment.status}`);
      console.log(`   Created: ${payment.createdAt}`);
      console.log('');
    });

    // Check for pending payments
    console.log('\n⏳ Checking pending/active payments...');
    const pendingPayments = await Payment.find({
      status: { $in: ['PENDING', 'ACTIVE'] }
    })
      .populate('user', 'email displayName')
      .populate('project', 'title price');
    
    console.log(`Found ${pendingPayments.length} pending/active payments:`);
    pendingPayments.forEach((payment, index) => {
      console.log(`${index + 1}. Order ID: ${payment.orderId}`);
      console.log(`   User: ${payment.user?.email || 'Unknown'}`);
      console.log(`   Project: ${payment.project?.title || 'Unknown'}`);
      console.log(`   Status: ${payment.status}`);
      console.log(`   Is Expired: ${payment.isExpired()}`);
      console.log(`   Created: ${payment.createdAt}`);
      console.log('');
    });

    // Provide test data
    if (projects.length > 0 && users.length > 0) {
      console.log('\n🧪 Test Data for Payment Creation:');
      console.log('Use this data for testing payment creation:');
      console.log(`Project ID: ${projects[0]._id}`);
      console.log(`User ID: ${users[0]._id}`);
      console.log(`Project Title: ${projects[0].title}`);
      console.log(`Project Price: ₹${projects[0].price}`);
      console.log(`User Email: ${users[0].email}`);
    }

    await mongoose.disconnect();
    console.log('\n📊 MongoDB disconnected');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

checkProjects();
