import fetch from 'node-fetch';

async function testEmailAPI() {
  console.log('🧪 Testing Email API Endpoints...\n');

  const baseURL = 'http://localhost:5000/api';

  try {
    // Test 1: Check email status endpoint (no auth required for testing)
    console.log('📊 Testing email status endpoint...');
    const statusResponse = await fetch(`${baseURL}/admin/email-status`);
    const statusData = await statusResponse.json();
    
    console.log('Status Response:', JSON.stringify(statusData, null, 2));

    // Test 2: Test email sending (this would normally require admin auth)
    console.log('\n📧 Testing email sending endpoint...');
    const emailResponse = await fetch(`${baseURL}/admin/test-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'infoprojectbuzz@gmail.com',
        type: 'test'
      })
    });

    const emailData = await emailResponse.json();
    console.log('Email Response:', JSON.stringify(emailData, null, 2));

  } catch (error) {
    console.error('❌ API test failed:', error);
  }
}

// Run the test
testEmailAPI();
