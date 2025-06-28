import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Script to verify the super admin account and test login credentials
 */

const verifyAdminAccount = async () => {
  try {
    console.log('🔍 Verifying super admin account...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/projectbuzz');
    console.log('✅ Connected to MongoDB');

    const superAdminEmail = 'aniruddhagayki0@gmail.com';
    const superAdminPassword = 'Doma@ji12';

    // Find the admin account
    console.log(`🔍 Looking for admin account: ${superAdminEmail}`);
    const admin = await User.findOne({ email: superAdminEmail });

    if (!admin) {
      console.error('❌ Admin account not found!');
      return;
    }

    console.log('✅ Admin account found!');
    console.log('📧 Email:', admin.email);
    console.log('👤 Display Name:', admin.displayName);
    console.log('🔑 Role:', admin.role);
    console.log('📅 Created:', admin.createdAt);
    console.log('🔓 Email Verified:', admin.emailVerified);
    console.log('✅ Is Active:', admin.isActive);

    if (admin.adminInfo) {
      console.log('👑 Admin Level:', admin.adminInfo.adminLevel);
      console.log('🏢 Department:', admin.adminInfo.department);
      console.log('🛡️ Permissions Count:', admin.adminInfo.permissions?.length || 0);
      console.log('🔐 Admin Active:', admin.adminInfo.isActive);
    }

    // Test password verification
    console.log('\n🔐 Testing password verification...');
    const isPasswordValid = await bcrypt.compare(superAdminPassword, admin.password);
    
    if (isPasswordValid) {
      console.log('✅ Password verification successful!');
    } else {
      console.error('❌ Password verification failed!');
      console.log('🔧 Attempting to fix password...');
      
      // Hash the correct password and update
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(superAdminPassword, saltRounds);
      
      await User.updateOne(
        { email: superAdminEmail },
        { password: hashedPassword }
      );
      
      console.log('✅ Password updated successfully!');
      
      // Verify again
      const updatedAdmin = await User.findOne({ email: superAdminEmail });
      const isNewPasswordValid = await bcrypt.compare(superAdminPassword, updatedAdmin.password);
      
      if (isNewPasswordValid) {
        console.log('✅ Password verification now successful!');
      } else {
        console.error('❌ Password verification still failed!');
      }
    }

    // Test login simulation
    console.log('\n🧪 Simulating login process...');
    
    // Check if user exists and is active
    if (!admin.isActive) {
      console.error('❌ Account is not active!');
      await User.updateOne({ email: superAdminEmail }, { isActive: true });
      console.log('✅ Account activated!');
    }

    // Check email verification
    if (!admin.emailVerified) {
      console.error('❌ Email is not verified!');
      await User.updateOne({ email: superAdminEmail }, { emailVerified: true });
      console.log('✅ Email verified!');
    }

    console.log('\n📋 FINAL VERIFICATION:');
    console.log('======================');
    
    const finalAdmin = await User.findOne({ email: superAdminEmail });
    console.log('📧 Email:', finalAdmin.email);
    console.log('🔑 Role:', finalAdmin.role);
    console.log('✅ Is Active:', finalAdmin.isActive);
    console.log('📧 Email Verified:', finalAdmin.emailVerified);
    console.log('👑 Admin Level:', finalAdmin.adminInfo?.adminLevel);
    
    // Test password one more time
    const finalPasswordTest = await bcrypt.compare(superAdminPassword, finalAdmin.password);
    console.log('🔐 Password Valid:', finalPasswordTest);

    if (finalPasswordTest && finalAdmin.isActive && finalAdmin.emailVerified) {
      console.log('\n🎉 LOGIN SHOULD WORK NOW!');
      console.log('🌐 Login URL: http://localhost:5174/login');
      console.log('📧 Email: aniruddhagayki0@gmail.com');
      console.log('🔒 Password: Doma@ji12');
    } else {
      console.log('\n❌ LOGIN ISSUES DETECTED:');
      if (!finalPasswordTest) console.log('- Password verification failed');
      if (!finalAdmin.isActive) console.log('- Account is not active');
      if (!finalAdmin.emailVerified) console.log('- Email is not verified');
    }

  } catch (error) {
    console.error('❌ Error during verification:', error);
    throw error;
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');
  }
};

// Run the verification
verifyAdminAccount()
  .then(() => {
    console.log('🎉 Verification completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Verification failed:', error);
    process.exit(1);
  });
