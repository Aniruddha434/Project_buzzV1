// Test script to simulate the exact frontend accept offer workflow
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000/api';

async function testFrontendAcceptOffer() {
  try {
    console.log('🧪 Testing Frontend Accept Offer Workflow');
    console.log('==========================================');

    // Step 1: Login as seller (simulate frontend login)
    console.log('\n1️⃣ Seller Login (Frontend Simulation)...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:5173'
      },
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
    const token = loginData.data?.token;
    
    if (!token) {
      console.log('❌ No token in login response');
      console.log('Response:', JSON.stringify(loginData, null, 2));
      return;
    }

    console.log('✅ Login successful');
    console.log('🔍 Token info:');
    console.log('   - Length:', token.length);
    console.log('   - Preview:', token.substring(0, 30) + '...');

    // Step 2: Get negotiations (simulate frontend API call)
    console.log('\n2️⃣ Fetching Negotiations...');
    const negotiationsResponse = await fetch(`${API_BASE}/negotiations/my`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:5173'
      }
    });

    if (!negotiationsResponse.ok) {
      const errorText = await negotiationsResponse.text();
      console.log('❌ Negotiations fetch failed:', errorText);
      return;
    }

    const negotiationsData = await negotiationsResponse.json();
    console.log(`📋 Found ${negotiationsData.negotiations.length} negotiations`);

    // Find an active negotiation with a current offer
    const activeNegotiation = negotiationsData.negotiations.find(
      n => n.status === 'active' && n.currentOffer && n.seller._id === loginData.data.user._id
    );

    if (!activeNegotiation) {
      console.log('❌ No active negotiations with offers found for this seller');
      console.log('Available negotiations:', negotiationsData.negotiations.map(n => ({
        id: n._id,
        status: n.status,
        currentOffer: n.currentOffer,
        seller: n.seller._id || n.seller,
        loginUserId: loginData.data.user._id
      })));
      return;
    }

    console.log('✅ Found active negotiation with offer:', {
      id: activeNegotiation._id,
      project: activeNegotiation.project.title,
      currentOffer: activeNegotiation.currentOffer,
      status: activeNegotiation.status,
      seller: activeNegotiation.seller._id
    });

    // Step 3: Accept the offer (simulate exact frontend API call)
    console.log('\n3️⃣ Accepting Offer (Frontend Simulation)...');
    console.log('🔍 Request details:');
    console.log('   - URL:', `${API_BASE}/negotiations/${activeNegotiation._id}/accept`);
    console.log('   - Method: POST');
    console.log('   - Token preview:', token.substring(0, 30) + '...');

    const acceptResponse = await fetch(`${API_BASE}/negotiations/${activeNegotiation._id}/accept`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:5173'
      }
    });

    console.log('📡 Accept response status:', acceptResponse.status);
    console.log('📡 Accept response headers:', Object.fromEntries(acceptResponse.headers.entries()));

    if (acceptResponse.ok) {
      const acceptData = await acceptResponse.json();
      console.log('✅ Offer accepted successfully!');
      console.log('🎫 Discount Code:', acceptData.discountCode);
      console.log('💰 Final Price:', acceptData.finalPrice);
      console.log('⏰ Expires At:', acceptData.expiresAt);
    } else {
      const errorText = await acceptResponse.text();
      console.log('❌ Accept offer failed');
      console.log('Error status:', acceptResponse.status);
      console.log('Error response:', errorText);
      
      // Try to parse as JSON if possible
      try {
        const errorJson = JSON.parse(errorText);
        console.log('Error JSON:', JSON.stringify(errorJson, null, 2));
      } catch (e) {
        console.log('Error is not JSON format');
      }
    }

    // Step 4: Test token validity after the request
    console.log('\n4️⃣ Testing Token Validity After Request...');
    const testResponse = await fetch(`${API_BASE}/users/me`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Origin': 'http://localhost:5173'
      }
    });

    if (testResponse.ok) {
      console.log('✅ Token still valid after accept request');
    } else {
      console.log('❌ Token invalid after accept request');
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testFrontendAcceptOffer();
