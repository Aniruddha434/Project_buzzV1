import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

async function testOTPVerification() {
  try {
    console.log('🧪 Testing OTP verification endpoint...');

    // Test 1: Invalid request (missing fields)
    console.log('\n1. Testing with missing fields...');
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/verify-otp`, {});
      console.log('❌ Should have failed but got:', response.data);
    } catch (error) {
      console.log('✅ Expected validation error:', error.response?.data?.message);
    }

    // Test 2: Invalid OTP format
    console.log('\n2. Testing with invalid OTP format...');
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/verify-otp`, {
        userId: 'test123',
        otp: '123', // Too short
        type: 'email'
      });
      console.log('❌ Should have failed but got:', response.data);
    } catch (error) {
      console.log('✅ Expected validation error:', error.response?.data?.message);
    }

    // Test 3: Valid format but non-existent user
    console.log('\n3. Testing with valid format but non-existent user...');
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/verify-otp`, {
        userId: 'nonexistent123',
        otp: '123456',
        type: 'email'
      });
      console.log('❌ Should have failed but got:', response.data);
    } catch (error) {
      console.log('✅ Expected error:', error.response?.data?.message);
    }

    // Test 4: Check server health
    console.log('\n4. Testing server health...');
    try {
      const response = await axios.get(`${API_BASE_URL.replace('/api', '')}`);
      console.log('✅ Server is running:', response.data?.message);
    } catch (error) {
      console.log('❌ Server health check failed:', error.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testOTPVerification();
