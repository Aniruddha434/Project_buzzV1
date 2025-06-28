#!/usr/bin/env node

import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGO_URI;
const DB_NAME = 'projectbuzz';

async function upgradeAdminPermissions() {
  console.log('\n🔧 Upgrading Admin Permissions');
  console.log('================================');

  if (!MONGODB_URI) {
    console.error('❌ MONGO_URI not found in environment variables');
    process.exit(1);
  }

  const client = new MongoClient(MONGODB_URI);

  try {
    // Connect to MongoDB
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas');

    const db = client.db(DB_NAME);
    const usersCollection = db.collection('users');

    // Find all admin users
    const adminUsers = await usersCollection.find({ role: 'admin' }).toArray();
    console.log(`📚 Found ${adminUsers.length} admin user(s)`);

    if (adminUsers.length === 0) {
      console.log('⚠️  No admin users found');
      return;
    }

    // Upgrade each admin to super_admin with full permissions
    for (const admin of adminUsers) {
      console.log(`\n🔧 Upgrading admin: ${admin.email}`);

      const updateResult = await usersCollection.updateOne(
        { _id: admin._id },
        {
          $set: {
            'adminInfo.adminLevel': 'super_admin',
            'adminInfo.permissions': [
              'view_users', 'manage_users', 'delete_users',
              'view_projects', 'manage_projects', 'delete_projects',
              'view_payments', 'manage_payments', 'process_refunds',
              'view_analytics', 'view_reports', 'export_data',
              'manage_admins', 'create_admin', 'deactivate_admin',
              'system_settings', 'email_notifications', 'platform_settings'
            ],
            'adminInfo.lastUpdatedAt': new Date(),
            'adminInfo.isActive': true
          }
        }
      );

      if (updateResult.modifiedCount > 0) {
        console.log(`✅ Successfully upgraded ${admin.email} to super_admin`);
      } else {
        console.log(`⚠️  No changes made to ${admin.email}`);
      }
    }

    // Verify the upgrades
    console.log('\n🔍 Verification:');
    const updatedAdmins = await usersCollection.find({ role: 'admin' }).toArray();

    for (const admin of updatedAdmins) {
      console.log(`   ${admin.email}:`);
      console.log(`     - Admin Level: ${admin.adminInfo?.adminLevel || 'Not set'}`);
      console.log(`     - Permissions: ${admin.adminInfo?.permissions?.length || 0} permissions`);
      console.log(`     - Can Create Admins: ${admin.adminInfo?.permissions?.includes('create_admin') ? 'Yes' : 'No'}`);
    }

    console.log('\n✅ Admin permissions upgrade completed!');

  } catch (error) {
    console.error('❌ Error upgrading admin permissions:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

// Run the upgrade
upgradeAdminPermissions().catch(console.error);
