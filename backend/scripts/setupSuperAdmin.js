import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Script to clean up admin accounts and create a single super admin
 */

const SUPER_ADMIN_EMAIL = 'aniruddhagayki0@gmail.com';
const SUPER_ADMIN_PASSWORD = 'Doma@ji12';
const SUPER_ADMIN_NAME = 'Aniruddha Gayki';

async function setupSuperAdmin() {
  try {
    console.log('🔧 Starting super admin setup...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/projectbuzz');
    console.log('✅ Connected to MongoDB');

    // Step 1: Delete all existing admin accounts
    console.log('\n🗑️  Deleting all existing admin accounts...');
    const deletedAdmins = await User.deleteMany({ role: 'admin' });
    console.log(`✅ Deleted ${deletedAdmins.deletedCount} admin accounts`);

    // Step 2: Check if the email exists with any other role and delete it
    console.log('\n🔍 Checking for existing account with super admin email...');
    const existingUser = await User.findOne({ email: SUPER_ADMIN_EMAIL });
    if (existingUser) {
      console.log(`⚠️  Found existing account with email ${SUPER_ADMIN_EMAIL} (role: ${existingUser.role})`);
      await User.deleteOne({ email: SUPER_ADMIN_EMAIL });
      console.log('✅ Deleted existing account');
    } else {
      console.log('✅ No existing account found with this email');
    }

    // Step 3: Create the super admin account
    console.log('\n👤 Creating super admin account...');
    
    // Hash the password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(SUPER_ADMIN_PASSWORD, saltRounds);
    
    const superAdmin = new User({
      email: SUPER_ADMIN_EMAIL,
      password: hashedPassword,
      displayName: SUPER_ADMIN_NAME,
      role: 'admin',
      emailVerified: true,
      isActive: true,
      adminInfo: {
        adminLevel: 'super_admin',
        permissions: [
          // User Management
          'view_users',
          'manage_users',
          'delete_users',
          
          // Project Management
          'view_projects',
          'manage_projects',
          'delete_projects',
          
          // Payment Management
          'view_payments',
          'manage_payments',
          'process_refunds',
          
          // Analytics
          'view_analytics',
          'view_reports',
          'export_data',
          
          // Administration
          'manage_admins',
          'create_admin',
          'deactivate_admin',
          
          // System
          'system_settings',
          'email_notifications',
          'platform_settings'
        ],
        department: 'Administration',
        createdAt: new Date(),
        isActive: true,
        notes: 'Founder and Super Administrator - Full platform access',
        lastLogin: null,
        loginCount: 0
      },
      stats: {
        projectsPurchased: 0,
        projectsSold: 0,
        totalSpent: 0,
        totalEarned: 0
      }
    });

    await superAdmin.save();
    console.log('✅ Super admin account created successfully');

    // Step 4: Verify the creation
    console.log('\n🔍 Verifying super admin account...');
    const verifyAdmin = await User.findOne({ email: SUPER_ADMIN_EMAIL });
    if (verifyAdmin && verifyAdmin.role === 'admin' && verifyAdmin.adminInfo?.adminLevel === 'super_admin') {
      console.log('✅ Super admin account verified successfully');
      console.log(`📧 Email: ${verifyAdmin.email}`);
      console.log(`👤 Name: ${verifyAdmin.displayName}`);
      console.log(`🔑 Role: ${verifyAdmin.role}`);
      console.log(`⭐ Admin Level: ${verifyAdmin.adminInfo.adminLevel}`);
      console.log(`🛡️  Permissions: ${verifyAdmin.adminInfo.permissions.length} permissions`);
    } else {
      throw new Error('Super admin account verification failed');
    }

    // Step 5: Show summary
    console.log('\n📊 Final Summary:');
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const totalUsers = await User.countDocuments();
    console.log(`👥 Total users in database: ${totalUsers}`);
    console.log(`👑 Total admin accounts: ${totalAdmins}`);
    console.log(`🎯 Super admin email: ${SUPER_ADMIN_EMAIL}`);
    
    console.log('\n🎉 Super admin setup completed successfully!');
    console.log('\n📋 Login Credentials:');
    console.log(`   Email: ${SUPER_ADMIN_EMAIL}`);
    console.log(`   Password: ${SUPER_ADMIN_PASSWORD}`);
    console.log('\n🔗 You can now login at: http://localhost:5174/login');

  } catch (error) {
    console.error('\n❌ Error during super admin setup:', error);
    throw error;
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');
  }
}

// Run the setup
setupSuperAdmin()
  .then(() => {
    console.log('\n✅ Setup completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Setup failed:', error);
    process.exit(1);
  });
