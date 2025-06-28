// Simple test script to verify negotiation API endpoints
import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

// Test data
const testUser = {
  email: 'test@example.com',
  password: 'password123',
  displayName: 'Test User',
  role: 'buyer'
};

const testSeller = {
  email: 'seller@example.com', 
  password: 'password123',
  displayName: 'Test Seller',
  role: 'seller'
};

async function testNegotiationAPI() {
  try {
    console.log('🧪 Testing Negotiation API...\n');

    // Test 1: Check if negotiations endpoint is accessible
    console.log('1. Testing negotiations endpoint accessibility...');
    try {
      const response = await axios.get(`${BASE_URL}/negotiations/my`, {
        headers: { 'Authorization': 'Bearer invalid-token' }
      });
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Negotiations endpoint is accessible (returns 401 for invalid token)');
      } else {
        console.log('❌ Unexpected error:', error.message);
        console.log('Error details:', error.code, error.response?.status);
      }
    }

    // Test 2: Check if backend is running
    console.log('\n2. Testing backend connectivity...');
    try {
      const response = await axios.get(`${BASE_URL}/projects`);
      console.log('✅ Backend is running');
    } catch (error) {
      console.log('❌ Backend connectivity issue:', error.message);
      console.log('Error details:', error.code, error.response?.status);
      return;
    }

    console.log('\n✅ Basic API tests completed');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testNegotiationAPI();
