// Debug script to check JWT token format and validity
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000/api';

async function debugToken() {
  try {
    console.log('🔍 JWT Token Debug Script');
    console.log('========================');

    // Step 1: Login and get a fresh token
    console.log('\n1️⃣ Getting fresh token...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'seller@test.com',
        password: 'password123'
      })
    });

    if (!loginResponse.ok) {
      const errorText = await loginResponse.text();
      console.log('❌ Login failed:', errorText);
      return;
    }

    const loginData = await loginResponse.json();
    console.log('📋 Login response structure:', Object.keys(loginData));
    
    // Check different possible token locations
    const token = loginData.token || loginData.data?.token || loginData.accessToken;
    
    if (!token) {
      console.log('❌ No token found in response');
      console.log('Full response:', JSON.stringify(loginData, null, 2));
      return;
    }

    console.log('✅ Token found');
    console.log('🔍 Token length:', token.length);
    console.log('🔍 Token starts with:', token.substring(0, 20) + '...');
    console.log('🔍 Token format check:');
    
    // Check if it's a valid JWT format (should have 3 parts separated by dots)
    const tokenParts = token.split('.');
    console.log('   - Parts count:', tokenParts.length, '(should be 3)');
    
    if (tokenParts.length === 3) {
      console.log('   - Header length:', tokenParts[0].length);
      console.log('   - Payload length:', tokenParts[1].length);
      console.log('   - Signature length:', tokenParts[2].length);
      
      // Try to decode the header and payload (base64)
      try {
        const header = JSON.parse(Buffer.from(tokenParts[0], 'base64').toString());
        console.log('   - Header:', header);
        
        const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
        console.log('   - Payload:', payload);
      } catch (e) {
        console.log('   - ❌ Failed to decode token parts:', e.message);
      }
    } else {
      console.log('   - ❌ Invalid JWT format (should have 3 parts)');
    }

    // Step 2: Test the token with a simple API call
    console.log('\n2️⃣ Testing token with API call...');
    const testResponse = await fetch(`${API_BASE}/users/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log('📡 Test response status:', testResponse.status);
    
    if (testResponse.ok) {
      const userData = await testResponse.json();
      console.log('✅ Token is valid');
      console.log('👤 User:', userData.data?.email);
    } else {
      const errorText = await testResponse.text();
      console.log('❌ Token validation failed:', errorText);
    }

    // Step 3: Test with negotiations endpoint
    console.log('\n3️⃣ Testing with negotiations endpoint...');
    const negotiationsResponse = await fetch(`${API_BASE}/negotiations/my`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log('📡 Negotiations response status:', negotiationsResponse.status);
    
    if (negotiationsResponse.ok) {
      const negotiationsData = await negotiationsResponse.json();
      console.log('✅ Negotiations endpoint accessible');
      console.log('📋 Negotiations count:', negotiationsData.negotiations?.length || 0);
    } else {
      const errorText = await negotiationsResponse.text();
      console.log('❌ Negotiations endpoint failed:', errorText);
    }

  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

// Run the debug
debugToken();
