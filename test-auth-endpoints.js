const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/auth';

async function testAuthEndpoints() {
  console.log('🧪 Testing Authentication Endpoints\n');

  try {
    // Test 1: Register a new user
    console.log('1️⃣ Testing Registration...');
    const timestamp = Date.now();
    const registerData = {
      name: 'Test Student',
      email: `teststudent${timestamp}@example.com`,
      password: 'password123',
      role: 'student',
      phone: `987654${timestamp.toString().slice(-4)}`,
      address: 'Test Address, Test City'
    };

    try {
      const registerResponse = await axios.post(`${BASE_URL}/register`, registerData);
      console.log('✅ Registration successful!');
      console.log('   User ID:', registerResponse.data.data._id);
      console.log('   Name:', registerResponse.data.data.name);
      console.log('   Email:', registerResponse.data.data.email);
      console.log('   Role:', registerResponse.data.data.role);
    } catch (error) {
      if (error.response?.data?.message?.includes('already exists')) {
        console.log('ℹ️  User already exists, continuing with login test...');
      } else {
        console.log('❌ Registration failed:', error.response?.data?.message || error.message);
        return;
      }
    }

    // Test 2: Login with the user
    console.log('\n2️⃣ Testing Login...');
    const loginData = {
      email: registerData.email,
      password: 'password123'
    };

    const loginResponse = await axios.post(`${BASE_URL}/login`, loginData);
    console.log('✅ Login successful!');
    console.log('   User ID:', loginResponse.data.data._id);
    console.log('   Name:', loginResponse.data.data.name);
    console.log('   Token received:', loginResponse.data.data.token ? 'Yes' : 'No');

    const token = loginResponse.data.data.token;

    // Test 3: Get user profile
    console.log('\n3️⃣ Testing Profile Retrieval...');
    const profileResponse = await axios.get(`${BASE_URL}/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('✅ Profile retrieval successful!');
    console.log('   User ID:', profileResponse.data.data._id);
    console.log('   Name:', profileResponse.data.data.name);
    console.log('   Email:', profileResponse.data.data.email);
    console.log('   Role:', profileResponse.data.data.role);

    // Test 4: Test invalid login
    console.log('\n4️⃣ Testing Invalid Login...');
    try {
      await axios.post(`${BASE_URL}/login`, {
        email: 'nonexistent@example.com',
        password: 'wrongpassword'
      });
      console.log('❌ Invalid login test failed - should have returned error');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Invalid login correctly rejected!');
        console.log('   Error message:', error.response.data.message);
      } else {
        console.log('❌ Unexpected error:', error.response?.data?.message || error.message);
      }
    }

    // Test 5: Test protected route without token
    console.log('\n5️⃣ Testing Protected Route Without Token...');
    try {
      await axios.get(`${BASE_URL}/me`);
      console.log('❌ Protected route test failed - should have returned error');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Protected route correctly rejected without token!');
        console.log('   Error message:', error.response.data.message);
      } else {
        console.log('❌ Unexpected error:', error.response?.data?.message || error.message);
      }
    }

    console.log('\n🎉 All authentication endpoints are working correctly!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.error('   Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Test server connectivity first
async function testServerConnectivity() {
  try {
    const response = await axios.get('http://localhost:5000/');
    console.log('✅ Server is running and accessible');
    console.log('   Message:', response.data.message);
    return true;
  } catch (error) {
    console.error('❌ Server is not accessible:', error.message);
    console.error('   Make sure the server is running on port 5000');
    return false;
  }
}

async function main() {
  console.log('🚀 Starting Authentication Endpoint Tests\n');
  
  const serverRunning = await testServerConnectivity();
  if (!serverRunning) {
    console.log('\n💡 To start the server, run: node server.js');
    return;
  }

  console.log('');
  await testAuthEndpoints();
}

main().catch(console.error);