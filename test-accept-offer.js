// Test script to debug the accept offer functionality
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000/api';

async function testAcceptOffer() {
  try {
    console.log('🧪 Testing Accept Offer Functionality');
    console.log('=====================================');

    // Step 1: Login as a seller
    console.log('\n1️⃣ Logging in as seller...');
    const sellerLoginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'seller@test.com',
        password: 'password123'
      })
    });

    if (!sellerLoginResponse.ok) {
      console.log('❌ Seller login failed');
      return;
    }

    const sellerData = await sellerLoginResponse.json();
    const sellerToken = sellerData.token;
    console.log('✅ Seller logged in successfully');

    // Step 2: Get seller's negotiations
    console.log('\n2️⃣ Fetching seller negotiations...');
    const negotiationsResponse = await fetch(`${API_BASE}/negotiations/my`, {
      headers: { 'Authorization': `Bearer ${sellerToken}` }
    });

    if (!negotiationsResponse.ok) {
      console.log('❌ Failed to fetch negotiations');
      return;
    }

    const negotiationsData = await negotiationsResponse.json();
    console.log(`📋 Found ${negotiationsData.negotiations.length} negotiations`);

    // Find an active negotiation with a current offer
    const activeNegotiation = negotiationsData.negotiations.find(
      n => n.status === 'active' && n.currentOffer
    );

    if (!activeNegotiation) {
      console.log('❌ No active negotiations with offers found');
      console.log('Available negotiations:', negotiationsData.negotiations.map(n => ({
        id: n._id,
        status: n.status,
        currentOffer: n.currentOffer
      })));
      return;
    }

    console.log('✅ Found active negotiation with offer:', {
      id: activeNegotiation._id,
      project: activeNegotiation.project.title,
      currentOffer: activeNegotiation.currentOffer,
      status: activeNegotiation.status
    });

    // Step 3: Accept the offer
    console.log('\n3️⃣ Accepting the offer...');
    const acceptResponse = await fetch(`${API_BASE}/negotiations/${activeNegotiation._id}/accept`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${sellerToken}` }
    });

    console.log('📡 Accept response status:', acceptResponse.status);

    if (acceptResponse.ok) {
      const acceptData = await acceptResponse.json();
      console.log('✅ Offer accepted successfully!');
      console.log('🎫 Discount Code:', acceptData.discountCode);
      console.log('💰 Final Price:', acceptData.finalPrice);
      console.log('⏰ Expires At:', acceptData.expiresAt);
    } else {
      const errorData = await acceptResponse.text();
      console.log('❌ Accept offer failed');
      console.log('Error response:', errorData);
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testAcceptOffer();
