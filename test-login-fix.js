const axios = require('axios');

async function testLoginFix() {
  console.log('🔧 Testing Login Fix\n');

  const BASE_URL = 'http://localhost:5000/api/auth';
  
  try {
    // Test 1: Check server connectivity
    console.log('1️⃣ Checking server connectivity...');
    try {
      const healthResponse = await axios.get('http://localhost:5000/');
      console.log('✅ Server is running!');
      console.log('   Message:', healthResponse.data.message);
    } catch (error) {
      console.log('❌ Server is not accessible');
      console.log('   Error:', error.message);
      return;
    }

    // Test 2: Test CORS with OPTIONS request
    console.log('\n2️⃣ Testing CORS configuration...');
    try {
      const corsResponse = await axios.options(`${BASE_URL}/login`);
      console.log('✅ CORS preflight successful!');
    } catch (error) {
      console.log('⚠️  CORS preflight failed, but this might be normal');
      console.log('   Status:', error.response?.status);
    }

    // Test 3: Try to login with existing user
    console.log('\n3️⃣ Testing login with existing demo user...');
    
    // First, let's create a test user
    const testUser = {
      name: 'Demo User',
      email: 'demo@example.com',
      password: 'password123',
      role: 'student',
      phone: '9876543210',
      address: 'Demo Address'
    };

    try {
      const registerResponse = await axios.post(`${BASE_URL}/register`, testUser);
      console.log('✅ Demo user created/exists');
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('ℹ️  Demo user already exists, continuing...');
      } else {
        console.log('❌ Failed to create demo user:', error.response?.data?.message);
      }
    }

    // Now test login
    console.log('\n4️⃣ Testing login functionality...');
    try {
      const loginData = {
        email: 'demo@example.com',
        password: 'password123'
      };

      const loginResponse = await axios.post(`${BASE_URL}/login`, loginData);
      console.log('✅ Login successful!');
      console.log('   Response format:', {
        success: loginResponse.data.success,
        hasData: !!loginResponse.data.data,
        hasToken: !!loginResponse.data.data?.token,
        hasUser: !!loginResponse.data.data?.email
      });
      console.log('   User email:', loginResponse.data.data?.email);
      console.log('   User role:', loginResponse.data.data?.role);

      const token = loginResponse.data.data.token;

      // Test 5: Test token validation
      console.log('\n5️⃣ Testing token validation...');
      try {
        const validateResponse = await axios.get(`${BASE_URL}/validate`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log('✅ Token validation successful!');
        console.log('   User:', validateResponse.data.data?.email);
      } catch (error) {
        console.log('❌ Token validation failed:');
        console.log('   Status:', error.response?.status);
        console.log('   Error:', error.response?.data?.message);
      }

      // Test 6: Test profile endpoint
      console.log('\n6️⃣ Testing profile endpoint...');
      try {
        const profileResponse = await axios.get(`${BASE_URL}/profile`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log('✅ Profile retrieval successful!');
        console.log('   User:', profileResponse.data.data?.email);
      } catch (error) {
        console.log('❌ Profile retrieval failed:');
        console.log('   Status:', error.response?.status);
        console.log('   Error:', error.response?.data?.message);
      }

    } catch (error) {
      console.log('❌ Login failed:');
      console.log('   Status:', error.response?.status);
      console.log('   Error:', error.response?.data?.message || error.message);
      console.log('   Full error:', error.code);
      
      if (error.code === 'ECONNREFUSED') {
        console.log('   🔍 This is a connection error - server might not be running');
      }
    }

    // Test 7: Test with wrong credentials
    console.log('\n7️⃣ Testing with wrong credentials...');
    try {
      await axios.post(`${BASE_URL}/login`, {
        email: 'demo@example.com',
        password: 'wrongpassword'
      });
      console.log('❌ Wrong credentials test failed - should have been rejected');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Wrong credentials correctly rejected!');
        console.log('   Error message:', error.response.data.message);
      } else {
        console.log('❌ Unexpected error:', error.response?.data?.message || error.message);
      }
    }

    console.log('\n🎉 Login fix testing completed!');

  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  }
}

// Run the test
testLoginFix();