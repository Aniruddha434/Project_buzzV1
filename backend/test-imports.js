// Test script to check if all imports work
console.log('🧪 Testing backend imports...');

try {
  console.log('1. Testing dotenv...');
  import('dotenv').then(() => console.log('✅ dotenv OK'));
  
  console.log('2. Testing express...');
  import('express').then(() => console.log('✅ express OK'));
  
  console.log('3. Testing mongoose...');
  import('mongoose').then(() => console.log('✅ mongoose OK'));
  
  console.log('4. Testing cors...');
  import('cors').then(() => console.log('✅ cors OK'));
  
  console.log('5. Testing helmet...');
  import('helmet').then(() => console.log('✅ helmet OK'));
  
  console.log('All imports tested!');
} catch (error) {
  console.error('❌ Import error:', error);
}
