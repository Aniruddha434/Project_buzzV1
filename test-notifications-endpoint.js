import axios from 'axios';

const BACKEND_URL = 'https://project-buzzv1-2.onrender.com';

console.log('📢 Testing Notifications Endpoint');
console.log('=================================');

// Create test seller
const testSeller = {
  email: `notif-test-${Date.now()}@test.com`,
  password: 'TestPassword123',
  displayName: 'Notification Test Seller',
  fullName: 'Notification Test Seller Full',
  phoneNumber: '+1234567890',
  occupation: 'Developer',
  experienceLevel: 'intermediate',
  yearsOfExperience: 3,
  motivation: 'Testing notifications endpoint',
  specializations: ['web-development'],
  sellerTermsAccepted: true
};

console.log('\n🔐 Creating test seller...');
let token = null;
try {
  const sellerResponse = await axios.post(`${BACKEND_URL}/api/auth/register-seller`, testSeller);
  if (sellerResponse.data.success) {
    token = sellerResponse.data.data.token;
    console.log('✅ Test seller created successfully');
  }
} catch (sellerError) {
  console.log('❌ Failed to create test seller');
  console.log(`   Error: ${sellerError.response?.data?.message || sellerError.message}`);
}

if (token) {
  // Test notifications unread-count endpoint
  console.log('\n📢 Testing /api/notifications/unread-count...');
  try {
    const unreadResponse = await axios.get(
      `${BACKEND_URL}/api/notifications/unread-count`,
      {
        headers: { 'Authorization': `Bearer ${token}` },
        timeout: 15000
      }
    );
    
    if (unreadResponse.data.success) {
      console.log('✅ Notifications unread-count endpoint working');
      console.log(`   Unread count: ${unreadResponse.data.data.unreadCount}`);
    }
  } catch (unreadError) {
    console.log('❌ Notifications unread-count endpoint failed');
    console.log(`   Status: ${unreadError.response?.status || 'No response'}`);
    console.log(`   Error: ${unreadError.response?.data?.message || unreadError.message}`);
    
    if (unreadError.code === 'ECONNRESET' || unreadError.message.includes('ERR_CONNECTION_CLOSED')) {
      console.log('   🔍 Connection closed error detected');
      console.log('   This might be related to the same issue affecting project creation');
    }
  }

  // Test general notifications endpoint
  console.log('\n📢 Testing /api/notifications...');
  try {
    const notificationsResponse = await axios.get(
      `${BACKEND_URL}/api/notifications`,
      {
        headers: { 'Authorization': `Bearer ${token}` },
        timeout: 15000
      }
    );
    
    if (notificationsResponse.data.success) {
      console.log('✅ Notifications endpoint working');
      console.log(`   Found ${notificationsResponse.data.data.notifications.length} notifications`);
    }
  } catch (notificationsError) {
    console.log('❌ Notifications endpoint failed');
    console.log(`   Status: ${notificationsError.response?.status || 'No response'}`);
    console.log(`   Error: ${notificationsError.response?.data?.message || notificationsError.message}`);
  }
}

console.log('\n📊 Notifications Test Complete');
console.log('If notifications endpoints fail with connection errors:');
console.log('- This suggests a broader server connectivity issue');
console.log('- The backend might be experiencing high load or timeouts');
console.log('- Database connection issues could be affecting multiple endpoints');
