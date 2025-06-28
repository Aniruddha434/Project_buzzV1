import fetch from 'node-fetch';

async function testNegotiationAPI() {
  try {
    console.log('🧪 Testing Negotiation API...');

    // First, let's get a buyer token
    console.log('\n1. Logging in as buyer...');
    const loginResponse = await fetch('http://localhost:5001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'buyer1@test.com',
        password: 'password123'
      })
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    console.log('📋 Login response:', JSON.stringify(loginData, null, 2));
    const token = loginData.token || loginData.data?.token;
    console.log('✅ Login successful, token:', token ? 'Present' : 'Missing');

    // Get available projects
    console.log('\n2. Fetching available projects...');
    const projectsResponse = await fetch('http://localhost:5001/api/projects', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!projectsResponse.ok) {
      throw new Error(`Projects fetch failed: ${projectsResponse.status}`);
    }

    const projectsData = await projectsResponse.json();

    const projects = projectsData.data?.projects || projectsData.projects || projectsData;
    console.log(`✅ Found ${projects.length} projects`);

    if (projects.length === 0) {
      console.log('❌ No projects available for testing');
      return;
    }

    const testProject = projects[0];
    console.log(`📦 Testing with project: ${testProject.title} (ID: ${testProject._id})`);
    console.log(`💰 Price: ₹${testProject.price}`);
    console.log(`👤 Seller: ${testProject.seller ? testProject.seller._id || testProject.seller : 'NO SELLER'}`);

    // Test starting a negotiation
    console.log('\n3. Testing negotiation start...');
    const negotiationResponse = await fetch('http://localhost:5001/api/negotiations/start', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        projectId: testProject._id,
        templateId: 'interested',
        message: 'Test negotiation message'
      })
    });

    console.log(`📡 Response status: ${negotiationResponse.status}`);

    if (negotiationResponse.ok) {
      const negotiationData = await negotiationResponse.json();
      console.log('✅ Negotiation started successfully!');
      console.log(`🆔 Negotiation ID: ${negotiationData.negotiation._id}`);
    } else {
      const errorData = await negotiationResponse.json();
      console.log('❌ Negotiation failed:');
      console.log(JSON.stringify(errorData, null, 2));
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testNegotiationAPI();
