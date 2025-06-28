import fetch from 'node-fetch';

async function testRegistrationFix() {
  console.log('🧪 Testing Registration Fix...\n');

  const testUser = {
    email: `test${Date.now()}@example.com`,
    password: 'password123',
    displayName: 'Test User',
    role: 'buyer'
  };

  console.log('📝 Testing registration with:', {
    email: testUser.email,
    password: '***',
    displayName: testUser.displayName,
    role: testUser.role
  });

  try {
    const startTime = Date.now();
    
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testUser),
      timeout: 30000 // 30 second timeout
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`⏱️  Request completed in ${duration}ms`);
    console.log(`📊 Response status: ${response.status}`);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Registration successful!');
      console.log('Response data:', {
        success: data.success,
        message: data.message,
        userEmail: data.data?.user?.email,
        userRole: data.data?.user?.role,
        hasToken: !!data.data?.token
      });
    } else {
      const errorData = await response.json();
      console.log('❌ Registration failed:');
      console.log('Error data:', errorData);
    }

  } catch (error) {
    console.error('❌ Request failed:', error.message);
    
    if (error.name === 'AbortError') {
      console.log('⏰ Request timed out');
    }
  }
}

testRegistrationFix();
