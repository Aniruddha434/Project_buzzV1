// Test script to test payment API with proper authentication
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import User from './models/User.js';
import Project from './models/Project.js';

// Load environment variables
dotenv.config();

async function testPaymentWithAuth() {
  try {
    console.log('🧪 Testing Payment API with Authentication...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find a test user
    let testUser = await User.findOne({ email: { $regex: /test|demo/i } });
    if (!testUser) {
      // Get any user
      testUser = await User.findOne();
    }

    if (!testUser) {
      console.log('❌ No users found in database');
      return;
    }

    console.log(`👤 Using test user: ${testUser.email}`);

    // Find a test project
    let testProject = await Project.findOne();
    if (!testProject) {
      console.log('❌ No projects found in database');
      return;
    }

    console.log(`📦 Using test project: ${testProject.title}`);

    // Generate JWT token
    const token = jwt.sign(
      { userId: testUser._id },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '1h' }
    );

    // Test data
    const testData = {
      projectId: testProject._id.toString(),
      amount: 100,
      customerPhone: '9999999999'
    };

    console.log('\n📤 Sending request to create payment order...');
    console.log('Request data:', testData);

    const response = await fetch('http://localhost:5000/api/payments/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(testData)
    });

    console.log(`📥 Response status: ${response.status} ${response.statusText}`);

    const responseData = await response.text();
    console.log('📄 Response body:', responseData);

    if (response.ok) {
      console.log('✅ Payment API test successful!');
      const parsedData = JSON.parse(responseData);
      if (parsedData.data && parsedData.data.razorpayOrderId) {
        console.log(`🎉 Razorpay order created: ${parsedData.data.razorpayOrderId}`);
      }
    } else {
      console.log('❌ Payment API test failed');
    }

    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB');

  } catch (error) {
    console.error('❌ Error testing payment API:', error);
  }
}

// Run the test
testPaymentWithAuth();
