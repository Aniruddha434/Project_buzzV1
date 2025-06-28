import dotenv from 'dotenv';
import mongoose from 'mongoose';
import express from 'express';
import cors from 'cors';
import { body, validationResult } from 'express-validator';

// Load environment variables
dotenv.config();

console.log('🔍 ===== PAYMENT CREATION DEBUG =====');
console.log('Environment variables check:');
console.log('MONGO_URI:', process.env.MONGO_URI ? 'SET' : 'NOT SET');
console.log('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID ? 'SET' : 'NOT SET');
console.log('RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? 'SET' : 'NOT SET');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');

async function debugPaymentCreation() {
  try {
    // Connect to MongoDB
    console.log('\n📊 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    // Import models
    const { default: User } = await import('./models/User.js');
    const { default: Project } = await import('./models/Project.js');
    const { default: Payment } = await import('./models/Payment.js');

    // Create Express app for testing
    const app = express();
    app.use(cors());
    app.use(express.json());

    // Mock auth middleware for testing
    const mockAuth = (req, res, next) => {
      req.user = {
        _id: '507f1f77bcf86cd799439011', // Mock user ID
        email: 'test@example.com',
        displayName: 'Test User',
        role: 'buyer'
      };
      next();
    };

    // Test validation middleware
    const testValidation = [
      body('projectId').isMongoId().withMessage('Invalid project ID'),
      body('customerPhone').optional().custom((value) => {
        if (value && value.trim() !== '') {
          const cleanPhone = value.replace(/\D/g, '');
          if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
            throw new Error('Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9');
          }
        }
        return true;
      })
    ];

    // Test endpoint
    app.post('/test-payment-creation', mockAuth, testValidation, async (req, res) => {
      try {
        console.log('\n🧪 ===== TESTING PAYMENT CREATION =====');
        console.log('📝 Request body:', JSON.stringify(req.body, null, 2));
        console.log('👤 User:', req.user);

        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          console.log('❌ Validation errors:', errors.array());
          return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
          });
        }

        const { projectId, customerPhone = '', testMode = false } = req.body;
        const user = req.user;

        console.log('🔍 Looking for project:', projectId);

        // Find project
        const project = await Project.findById(projectId);
        if (!project) {
          console.log('❌ Project not found');
          return res.status(404).json({
            success: false,
            message: 'Project not found'
          });
        }

        console.log('✅ Project found:', project.title);

        // Check if user already has a pending payment for this project
        console.log('🔍 Checking for existing payments...');
        const existingPayment = await Payment.findOne({
          user: user._id,
          project: projectId,
          status: { $in: ['PENDING', 'ACTIVE'] }
        });

        if (existingPayment) {
          console.log('⚠️ Existing payment found:', existingPayment.orderId);
          return res.status(400).json({
            success: false,
            message: 'You already have a pending payment for this project',
            data: {
              orderId: existingPayment.orderId,
              razorpayOrderId: existingPayment.razorpayOrderId,
              status: existingPayment.status,
              createdAt: existingPayment.createdAt,
              expiryTime: existingPayment.expiryTime,
              isExpired: existingPayment.isExpired()
            }
          });
        }

        console.log('✅ No existing payments found');

        // Mock successful response
        res.json({
          success: true,
          message: 'Payment order validation successful',
          data: {
            projectId,
            projectTitle: project.title,
            amount: project.price,
            customerPhone,
            testMode,
            user: {
              id: user._id,
              email: user.email,
              displayName: user.displayName
            }
          }
        });

      } catch (error) {
        console.error('❌ Error in test endpoint:', error);
        res.status(500).json({
          success: false,
          message: error.message || 'Internal server error'
        });
      }
    });

    // Start test server
    const server = app.listen(5001, () => {
      console.log('\n🚀 Test server running on port 5001');
    });

    // Test various scenarios
    const testCases = [
      {
        name: 'Valid Payment Request',
        data: {
          projectId: '507f1f77bcf86cd799439011', // Mock project ID
          customerPhone: '9876543210',
          testMode: true
        }
      },
      {
        name: 'Invalid Project ID',
        data: {
          projectId: 'invalid-id',
          customerPhone: '9876543210'
        }
      },
      {
        name: 'Invalid Phone Number',
        data: {
          projectId: '507f1f77bcf86cd799439011',
          customerPhone: '123'
        }
      },
      {
        name: 'Missing Project ID',
        data: {
          customerPhone: '9876543210'
        }
      }
    ];

    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 1000));

    for (const testCase of testCases) {
      console.log(`\n🧪 Testing: ${testCase.name}`);
      
      try {
        const response = await fetch('http://localhost:5001/test-payment-creation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(testCase.data)
        });

        const result = await response.json();
        
        console.log(`📊 Status: ${response.status}`);
        console.log('📊 Response:', JSON.stringify(result, null, 2));

        if (response.ok) {
          console.log('✅ Test passed');
        } else {
          console.log('❌ Test failed as expected');
        }

      } catch (error) {
        console.error('❌ Request failed:', error.message);
      }
    }

    // Close server
    server.close();
    console.log('\n✅ All tests completed');

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    // Close MongoDB connection
    await mongoose.disconnect();
    console.log('📊 MongoDB disconnected');
  }
}

debugPaymentCreation();
