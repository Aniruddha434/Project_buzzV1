import dotenv from 'dotenv';
import mongoose from 'mongoose';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';

// Load environment variables
dotenv.config();

console.log('🧪 Testing Payment System Fixes...\n');

async function testPaymentFixes() {
  try {
    // Connect to MongoDB
    console.log('📊 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    // Import models
    const { default: User } = await import('./models/User.js');
    const { default: Project } = await import('./models/Project.js');
    const { default: Payment } = await import('./models/Payment.js');

    // Create test user if not exists
    let testUser = await User.findOne({ email: 'test@projectbuzz.com' });
    if (!testUser) {
      testUser = new User({
        email: 'test@projectbuzz.com',
        password: 'password123',
        displayName: 'Test User',
        role: 'buyer',
        emailVerified: true
      });
      await testUser.save();
      console.log('✅ Test user created');
    } else {
      console.log('✅ Test user found');
    }

    // Create test project if not exists
    let testProject = await Project.findOne({ title: 'Test Project for Payment' });
    if (!testProject) {
      // Find a seller user
      let sellerUser = await User.findOne({ role: 'seller' });
      if (!sellerUser) {
        sellerUser = new User({
          email: 'seller@projectbuzz.com',
          password: 'password123',
          displayName: 'Test Seller',
          role: 'seller',
          emailVerified: true
        });
        await sellerUser.save();
      }

      testProject = new Project({
        title: 'Test Project for Payment',
        description: 'A test project for payment system testing',
        price: 1000,
        seller: sellerUser._id,
        status: 'approved',
        techStack: ['JavaScript', 'Node.js'],
        complexity: 'intermediate',
        timeline: '1-2 weeks',
        images: []
      });
      await testProject.save();
      console.log('✅ Test project created');
    } else {
      console.log('✅ Test project found');
    }

    // Generate JWT token for testing
    const token = jwt.sign(
      { 
        userId: testUser._id, 
        email: testUser.email, 
        role: testUser.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Create Express app for testing
    const app = express();
    app.use(cors());
    app.use(express.json());

    // Import and use payment routes
    const { default: paymentRoutes } = await import('./routes/payments.js');
    app.use('/api/payments', paymentRoutes);

    // Start test server
    const server = app.listen(5002, () => {
      console.log('🚀 Test server running on port 5002');
    });

    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test cases
    const testCases = [
      {
        name: 'Valid Payment Request with testMode',
        data: {
          projectId: testProject._id.toString(),
          customerPhone: '9876543210',
          testMode: true
        },
        expectedStatus: 201
      },
      {
        name: 'Valid Payment Request without testMode',
        data: {
          projectId: testProject._id.toString(),
          customerPhone: '9876543210'
        },
        expectedStatus: 201
      },
      {
        name: 'Invalid Project ID',
        data: {
          projectId: 'invalid-id',
          customerPhone: '9876543210'
        },
        expectedStatus: 400
      },
      {
        name: 'Missing Project ID',
        data: {
          customerPhone: '9876543210'
        },
        expectedStatus: 400
      },
      {
        name: 'Invalid Phone Number',
        data: {
          projectId: testProject._id.toString(),
          customerPhone: '123'
        },
        expectedStatus: 400
      },
      {
        name: 'Non-existent Project',
        data: {
          projectId: '507f1f77bcf86cd799439011',
          customerPhone: '9876543210'
        },
        expectedStatus: 404
      }
    ];

    let passedTests = 0;
    let totalTests = testCases.length;

    for (const testCase of testCases) {
      console.log(`\n🧪 Testing: ${testCase.name}`);
      
      try {
        const response = await fetch('http://localhost:5002/api/payments/create-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(testCase.data)
        });

        const result = await response.json();
        
        console.log(`📊 Status: ${response.status} (expected: ${testCase.expectedStatus})`);
        console.log('📊 Response:', JSON.stringify(result, null, 2));

        if (response.status === testCase.expectedStatus) {
          console.log('✅ Test PASSED');
          passedTests++;
        } else {
          console.log('❌ Test FAILED - Status mismatch');
        }

        // Clean up any created payments for next test
        if (response.status === 201 && result.data?.orderId) {
          await Payment.findOneAndDelete({ orderId: result.data.orderId });
          console.log('🧹 Cleaned up test payment');
        }

      } catch (error) {
        console.error('❌ Request failed:', error.message);
      }
    }

    // Test existing payment scenario
    console.log('\n🧪 Testing: Existing Payment Scenario');
    
    // Create a pending payment first
    const pendingPayment = new Payment({
      orderId: 'test_order_' + Date.now(),
      razorpayOrderId: 'rzp_test_' + Date.now(),
      user: testUser._id,
      project: testProject._id,
      amount: testProject.price,
      currency: 'INR',
      status: 'ACTIVE',
      customerDetails: {
        customerId: 'test_customer',
        customerName: testUser.displayName,
        customerEmail: testUser.email,
        customerPhone: '9876543210'
      },
      expiryTime: new Date(Date.now() + 30 * 60 * 1000)
    });
    
    await pendingPayment.save();
    console.log('📋 Created pending payment for testing');

    // Try to create another payment for the same project
    try {
      const response = await fetch('http://localhost:5002/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          projectId: testProject._id.toString(),
          customerPhone: '9876543210'
        })
      });

      const result = await response.json();
      
      console.log(`📊 Status: ${response.status}`);
      console.log('📊 Response:', JSON.stringify(result, null, 2));

      if (response.status === 400 && result.message?.includes('already have a pending payment')) {
        console.log('✅ Existing payment detection PASSED');
        passedTests++;
        totalTests++;
      } else {
        console.log('❌ Existing payment detection FAILED');
        totalTests++;
      }

    } catch (error) {
      console.error('❌ Existing payment test failed:', error.message);
      totalTests++;
    }

    // Clean up test payment
    await Payment.findByIdAndDelete(pendingPayment._id);
    console.log('🧹 Cleaned up test payment');

    // Close server
    server.close();
    console.log('\n✅ All tests completed');
    console.log(`📊 Results: ${passedTests}/${totalTests} tests passed`);
    console.log(`📊 Success Rate: ${Math.round((passedTests/totalTests) * 100)}%`);

    if (passedTests === totalTests) {
      console.log('🎉 All tests PASSED! Payment system fixes are working correctly.');
    } else {
      console.log('⚠️ Some tests FAILED. Please review the issues above.');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    // Close MongoDB connection
    await mongoose.disconnect();
    console.log('📊 MongoDB disconnected');
  }
}

testPaymentFixes();
