const axios = require('axios');

async function testMinimalLogin() {
  console.log('🧪 Testing Minimal Login Routes\n');

  const BASE_URL = 'http://localhost:5000';
  
  // Test data
  const testData = {
    email: 'test@example.com',
    password: 'password123'
  };

  try {
    // Test 1: Check if server is running
    console.log('1️⃣ Checking server status...');
    try {
      const healthResponse = await axios.get(`${BASE_URL}/`);
      console.log('✅ Server is running!');
      console.log('   Message:', healthResponse.data.message);
    } catch (error) {
      console.log('❌ Server is not running on port 5000');
      console.log('   Please start the server with: node server.js');
      return;
    }

    // Test 2: Test the main test route
    console.log('\n2️⃣ Testing /api/test/login route...');
    try {
      const testResponse = await axios.post(`${BASE_URL}/api/test/login`, testData);
      console.log('✅ /api/test/login route working!');
      console.log('   Success:', testResponse.data.success);
      console.log('   Message:', testResponse.data.message);
      console.log('   Email:', testResponse.data.data.email);
    } catch (error) {
      console.log('❌ /api/test/login route failed:');
      console.log('   Status:', error.response?.status);
      console.log('   Error:', error.response?.data?.error || error.message);
    }

    // Test 3: Test the alternative route
    console.log('\n3️⃣ Testing /api/auth/test-login route...');
    try {
      const altResponse = await axios.post(`${BASE_URL}/api/auth/test-login`, testData);
      console.log('✅ /api/auth/test-login route working!');
      console.log('   Success:', altResponse.data.success);
      console.log('   Message:', altResponse.data.message);
      console.log('   Route:', altResponse.data.route);
    } catch (error) {
      console.log('❌ /api/auth/test-login route failed:');
      console.log('   Status:', error.response?.status);
      console.log('   Error:', error.response?.data?.error || error.message);
    }

    // Test 4: Test validation (missing email)
    console.log('\n4️⃣ Testing validation (missing email)...');
    try {
      await axios.post(`${BASE_URL}/api/test/login`, { password: 'test123' });
      console.log('❌ Validation test failed - should have returned error');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Validation working correctly!');
        console.log('   Error:', error.response.data.error);
      } else {
        console.log('❌ Unexpected error:', error.response?.data || error.message);
      }
    }

    // Test 5: Test validation (invalid email format)
    console.log('\n5️⃣ Testing validation (invalid email format)...');
    try {
      await axios.post(`${BASE_URL}/api/test/login`, { 
        email: 'invalid-email', 
        password: 'test123' 
      });
      console.log('❌ Email validation test failed - should have returned error');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Email validation working correctly!');
        console.log('   Error:', error.response.data.error);
      } else {
        console.log('❌ Unexpected error:', error.response?.data || error.message);
      }
    }

    console.log('\n🎉 Minimal login route testing completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testMinimalLogin();