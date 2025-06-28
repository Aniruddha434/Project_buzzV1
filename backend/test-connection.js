import fetch from 'node-fetch';

async function testConnection() {
  console.log('🧪 Testing Backend Connection...\n');

  const testUrls = [
    'http://localhost:5000',
    'http://localhost:5000/api',
    'http://127.0.0.1:5000',
    'http://127.0.0.1:5000/api'
  ];

  for (const url of testUrls) {
    try {
      console.log(`Testing: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        timeout: 5000
      });

      console.log(`✅ Status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.text();
        console.log(`✅ Response: ${data.substring(0, 100)}...`);
      }
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
    console.log('---');
  }
}

testConnection();
