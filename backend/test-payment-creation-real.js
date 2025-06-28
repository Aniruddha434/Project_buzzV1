import dotenv from 'dotenv';
import fetch from 'node-fetch';

// Load environment variables
dotenv.config();

async function testPaymentCreationReal() {
  try {
    console.log('🧪 Testing Real Payment Creation API...\n');

    // Test data - using a mock project ID that should exist
    const testCases = [
      {
        name: 'Valid Payment Request',
        data: {
          projectId: '6841d8ad70a35146bb84fcc1', // Real project ID from uploads
          customerPhone: '9876543210',
          testMode: true
        },
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODNlZjFkMWE0YzFkYzM3ZTE1ZWRmZmQiLCJlbWFpbCI6InRlc3RAdGVzdC5jb20iLCJyb2xlIjoiYnV5ZXIiLCJpYXQiOjE3NDkxNDg5NTgsImV4cCI6MTc0OTIzNTM1OH0.mock-token' // Mock JWT token
        }
      },
      {
        name: 'Missing Authorization',
        data: {
          projectId: '6841d8ad70a35146bb84fcc1',
          customerPhone: '9876543210'
        },
        headers: {
          'Content-Type': 'application/json'
        }
      },
      {
        name: 'Invalid Project ID Format',
        data: {
          projectId: 'invalid-id',
          customerPhone: '9876543210'
        },
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token'
        }
      },
      {
        name: 'Invalid Phone Number',
        data: {
          projectId: '6841d8ad70a35146bb84fcc1',
          customerPhone: '123'
        },
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token'
        }
      },
      {
        name: 'Empty Request Body',
        data: {},
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token'
        }
      }
    ];

    for (const testCase of testCases) {
      console.log(`🧪 Testing: ${testCase.name}`);
      console.log('📤 Request data:', JSON.stringify(testCase.data, null, 2));
      
      try {
        const response = await fetch('http://localhost:5000/api/payments/create-order', {
          method: 'POST',
          headers: testCase.headers,
          body: JSON.stringify(testCase.data)
        });

        console.log(`📊 Status: ${response.status} ${response.statusText}`);
        
        let result;
        try {
          result = await response.json();
          console.log('📊 Response:', JSON.stringify(result, null, 2));
        } catch (parseError) {
          const text = await response.text();
          console.log('📊 Response (text):', text);
        }

        if (response.ok) {
          console.log('✅ Request successful');
        } else {
          console.log('❌ Request failed');
        }

      } catch (error) {
        console.error('❌ Request error:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
          console.log('💡 Backend server is not running. Please start it with: node server.js');
          break;
        }
      }
      
      console.log(''); // Empty line for readability
    }

    console.log('🏁 Test completed');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

testPaymentCreationReal();
