import dotenv from 'dotenv';
import mongoose from 'mongoose';
import express from 'express';
import cors from 'cors';

// Load environment variables first
dotenv.config();

// Import the auth routes
import authRoutes from './routes/auth.js';

console.log('🧪 Testing Registration Debug...\n');

async function testRegistrationDebug() {
  try {
    // Connect to MongoDB
    console.log('📊 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    // Create a minimal Express app for testing
    const app = express();
    
    // Middleware
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    
    // Routes
    app.use('/api/auth', authRoutes);
    
    // Start server
    const server = app.listen(5001, () => {
      console.log('🚀 Test server running on port 5001');
    });

    // Wait a moment for server to start
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test registration with various scenarios
    const testCases = [
      {
        name: 'Valid Registration',
        data: {
          email: `test${Date.now()}@example.com`,
          password: 'password123',
          displayName: 'Test User',
          role: 'buyer'
        }
      },
      {
        name: 'Missing Email',
        data: {
          password: 'password123',
          displayName: 'Test User',
          role: 'buyer'
        }
      },
      {
        name: 'Invalid Email',
        data: {
          email: 'invalid-email',
          password: 'password123',
          displayName: 'Test User',
          role: 'buyer'
        }
      },
      {
        name: 'Short Password',
        data: {
          email: `test${Date.now()}@example.com`,
          password: '123',
          displayName: 'Test User',
          role: 'buyer'
        }
      },
      {
        name: 'Invalid Role',
        data: {
          email: `test${Date.now()}@example.com`,
          password: 'password123',
          displayName: 'Test User',
          role: 'invalid'
        }
      },
      {
        name: 'Empty Display Name',
        data: {
          email: `test${Date.now()}@example.com`,
          password: 'password123',
          displayName: '',
          role: 'buyer'
        }
      }
    ];

    for (const testCase of testCases) {
      console.log(`\n🧪 Testing: ${testCase.name}`);
      console.log('📝 Data:', testCase.data);

      try {
        const response = await fetch('http://localhost:5001/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(testCase.data)
        });

        const result = await response.json();
        
        console.log(`📊 Status: ${response.status}`);
        console.log('📊 Response:', result);

        if (response.ok) {
          console.log('✅ Test passed');
        } else {
          console.log('❌ Test failed as expected');
        }

      } catch (error) {
        console.error('❌ Request failed:', error.message);
      }
    }

    // Test duplicate email scenario
    console.log('\n🧪 Testing: Duplicate Email');
    const duplicateEmail = `duplicate${Date.now()}@example.com`;
    
    // First registration
    console.log('📝 First registration attempt...');
    const firstResponse = await fetch('http://localhost:5001/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: duplicateEmail,
        password: 'password123',
        displayName: 'First User',
        role: 'buyer'
      })
    });

    const firstResult = await firstResponse.json();
    console.log(`📊 First attempt - Status: ${firstResponse.status}`);
    console.log('📊 First attempt - Response:', firstResult);

    // Second registration (should fail)
    console.log('📝 Second registration attempt (duplicate)...');
    const secondResponse = await fetch('http://localhost:5001/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: duplicateEmail,
        password: 'password123',
        displayName: 'Second User',
        role: 'buyer'
      })
    });

    const secondResult = await secondResponse.json();
    console.log(`📊 Second attempt - Status: ${secondResponse.status}`);
    console.log('📊 Second attempt - Response:', secondResult);

    // Close server
    server.close();
    console.log('\n✅ All tests completed');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    // Close MongoDB connection
    await mongoose.disconnect();
    console.log('📊 MongoDB disconnected');
  }
}

testRegistrationDebug();
