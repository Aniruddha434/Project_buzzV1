// Test script to test payment API endpoint
import fetch from 'node-fetch';

async function testPaymentAPI() {
  try {
    console.log('🧪 Testing Payment API...\n');

    // Test data
    const testData = {
      projectId: '507f1f77bcf86cd799439011', // Mock project ID
      amount: 100,
      customerPhone: '9999999999'
    };

    console.log('📤 Sending request to create payment order...');
    console.log('Request data:', testData);

    const response = await fetch('http://localhost:5000/api/payments/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer mock-token' // Mock auth token
      },
      body: JSON.stringify(testData)
    });

    console.log(`📥 Response status: ${response.status} ${response.statusText}`);

    const responseData = await response.text();
    console.log('📄 Response body:', responseData);

    if (response.ok) {
      console.log('✅ Payment API test successful!');
    } else {
      console.log('❌ Payment API test failed');
    }

  } catch (error) {
    console.error('❌ Error testing payment API:', error);
  }
}

// Run the test
testPaymentAPI();
