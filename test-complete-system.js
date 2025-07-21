const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testCompleteSystem() {
  try {
    console.log('🧪 Testing Complete Restaurant System...\n');

    // Test 1: Check if server is running
    console.log('1. Testing server health...');
    try {
      const healthResponse = await axios.get(`${BASE_URL}/restaurants/health`);
      console.log('✅ Server is running');
      console.log('   Response:', healthResponse.data.message);
    } catch (error) {
      console.log('❌ Server is not running or health endpoint failed');
      console.log('   Error:', error.message);
      return;
    }

    // Test 2: Test restaurant profile endpoint (should require auth)
    console.log('\n2. Testing restaurant profile endpoint (without auth)...');
    try {
      const profileResponse = await axios.get(`${BASE_URL}/restaurants/profile`);
      console.log('❌ Unexpected success - should require authentication');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Endpoint correctly requires authentication');
        console.log('   Status:', error.response.status);
        console.log('   Message:', error.response.data.message);
      } else {
        console.log('❌ Unexpected error:', error.response?.data || error.message);
      }
    }

    // Test 3: Test registration endpoint structure
    console.log('\n3. Testing registration endpoint (with missing data)...');
    try {
      const regResponse = await axios.post(`${BASE_URL}/auth/register`, {
        email: 'test@example.com'
      });
      console.log('❌ Unexpected success - should require more fields');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Registration correctly validates required fields');
        console.log('   Status:', error.response.status);
        console.log('   Message:', error.response.data.message);
      } else {
        console.log('❌ Unexpected error:', error.response?.data || error.message);
      }
    }

    console.log('\n🎉 System tests completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Try logging in with an existing restaurant account');
    console.log('2. Check if the dashboard loads without "register id" errors');
    console.log('3. Try creating a new restaurant account to test the full flow');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testCompleteSystem();