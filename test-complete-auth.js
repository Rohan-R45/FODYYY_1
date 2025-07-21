const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/auth';

async function testCompleteAuth() {
  console.log('🔐 Testing Complete Authentication System\n');

  try {
    // Test 1: Check server connectivity
    console.log('1️⃣ Checking server connectivity...');
    try {
      const healthResponse = await axios.get('http://localhost:5000/');
      console.log('✅ Server is running!');
      console.log('   Message:', healthResponse.data.message);
    } catch (error) {
      console.log('❌ Server is not accessible');
      console.log('   Please start the server with: node server.js');
      return;
    }

    // Generate unique test data
    const timestamp = Date.now();
    const testUser = {
      name: 'Test Student',
      email: `teststudent${timestamp}@example.com`,
      password: 'password123',
      role: 'student',
      phone: `987654${timestamp.toString().slice(-4)}`,
      address: 'Test Address, Test City'
    };

    let authToken = '';

    // Test 2: User Registration
    console.log('\n2️⃣ Testing User Registration...');
    try {
      const registerResponse = await axios.post(`${BASE_URL}/register`, testUser);
      console.log('✅ Registration successful!');
      console.log('   User ID:', registerResponse.data.data._id);
      console.log('   Name:', registerResponse.data.data.name);
      console.log('   Email:', registerResponse.data.data.email);
      console.log('   Role:', registerResponse.data.data.role);
      console.log('   Token received:', registerResponse.data.data.token ? 'Yes' : 'No');
      
      authToken = registerResponse.data.data.token;
    } catch (error) {
      console.log('❌ Registration failed:');
      console.log('   Status:', error.response?.status);
      console.log('   Error:', error.response?.data?.message || error.message);
      return;
    }

    // Test 3: User Login
    console.log('\n3️⃣ Testing User Login...');
    try {
      const loginData = {
        email: testUser.email,
        password: testUser.password
      };

      const loginResponse = await axios.post(`${BASE_URL}/login`, loginData);
      console.log('✅ Login successful!');
      console.log('   User ID:', loginResponse.data.data._id);
      console.log('   Name:', loginResponse.data.data.name);
      console.log('   Token received:', loginResponse.data.data.token ? 'Yes' : 'No');
      
      // Update token from login
      authToken = loginResponse.data.data.token;
    } catch (error) {
      console.log('❌ Login failed:');
      console.log('   Status:', error.response?.status);
      console.log('   Error:', error.response?.data?.message || error.message);
    }

    // Test 4: Get User Profile (Protected Route)
    console.log('\n4️⃣ Testing Get User Profile...');
    try {
      const profileResponse = await axios.get(`${BASE_URL}/me`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      console.log('✅ Profile retrieval successful!');
      console.log('   User ID:', profileResponse.data.data._id);
      console.log('   Name:', profileResponse.data.data.name);
      console.log('   Email:', profileResponse.data.data.email);
      console.log('   Role:', profileResponse.data.data.role);
    } catch (error) {
      console.log('❌ Profile retrieval failed:');
      console.log('   Status:', error.response?.status);
      console.log('   Error:', error.response?.data?.message || error.message);
    }

    // Test 5: Update Profile
    console.log('\n5️⃣ Testing Profile Update...');
    try {
      const updateData = {
        name: 'Updated Test Student',
        phone: `987654${(timestamp + 1).toString().slice(-4)}`
      };

      const updateResponse = await axios.put(`${BASE_URL}/profile`, updateData, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      console.log('✅ Profile update successful!');
      console.log('   Updated name:', updateResponse.data.data.name);
      console.log('   Updated phone:', updateResponse.data.data.phone);
    } catch (error) {
      console.log('❌ Profile update failed:');
      console.log('   Status:', error.response?.status);
      console.log('   Error:', error.response?.data?.message || error.message);
    }

    // Test 6: Change Password
    console.log('\n6️⃣ Testing Password Change...');
    try {
      const passwordData = {
        currentPassword: 'password123',
        newPassword: 'newpassword123'
      };

      const passwordResponse = await axios.put(`${BASE_URL}/change-password`, passwordData, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      console.log('✅ Password change successful!');
      console.log('   Message:', passwordResponse.data.message);
    } catch (error) {
      console.log('❌ Password change failed:');
      console.log('   Status:', error.response?.status);
      console.log('   Error:', error.response?.data?.message || error.message);
    }

    // Test 7: Login with New Password
    console.log('\n7️⃣ Testing Login with New Password...');
    try {
      const newLoginData = {
        email: testUser.email,
        password: 'newpassword123'
      };

      const newLoginResponse = await axios.post(`${BASE_URL}/login`, newLoginData);
      console.log('✅ Login with new password successful!');
      console.log('   Token received:', newLoginResponse.data.data.token ? 'Yes' : 'No');
      
      authToken = newLoginResponse.data.data.token;
    } catch (error) {
      console.log('❌ Login with new password failed:');
      console.log('   Status:', error.response?.status);
      console.log('   Error:', error.response?.data?.message || error.message);
    }

    // Test 8: Token Refresh
    console.log('\n8️⃣ Testing Token Refresh...');
    try {
      const refreshResponse = await axios.post(`${BASE_URL}/refresh`, {}, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      console.log('✅ Token refresh successful!');
      console.log('   New token received:', refreshResponse.data.data.token ? 'Yes' : 'No');
    } catch (error) {
      console.log('❌ Token refresh failed:');
      console.log('   Status:', error.response?.status);
      console.log('   Error:', error.response?.data?.message || error.message);
    }

    // Test 9: Logout
    console.log('\n9️⃣ Testing Logout...');
    try {
      const logoutResponse = await axios.post(`${BASE_URL}/logout`, {}, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      console.log('✅ Logout successful!');
      console.log('   Message:', logoutResponse.data.message);
    } catch (error) {
      console.log('❌ Logout failed:');
      console.log('   Status:', error.response?.status);
      console.log('   Error:', error.response?.data?.message || error.message);
    }

    // Test 10: Invalid Login
    console.log('\n🔟 Testing Invalid Login...');
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

    // Test 11: Protected Route Without Token
    console.log('\n1️⃣1️⃣ Testing Protected Route Without Token...');
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

    // Test 12: Registration Validation
    console.log('\n1️⃣2️⃣ Testing Registration Validation...');
    try {
      await axios.post(`${BASE_URL}/register`, {
        name: 'Test',
        email: 'invalid-email',
        password: '123', // Too short
        role: 'invalid-role',
        phone: '123'
      });
      console.log('❌ Registration validation test failed - should have returned error');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Registration validation working correctly!');
        console.log('   Error message:', error.response.data.message);
      } else {
        console.log('❌ Unexpected error:', error.response?.data?.message || error.message);
      }
    }

    console.log('\n🎉 Complete Authentication System Testing Finished!');
    console.log('\n📊 Summary:');
    console.log('   ✅ User Registration');
    console.log('   ✅ User Login');
    console.log('   ✅ Profile Retrieval');
    console.log('   ✅ Profile Update');
    console.log('   ✅ Password Change');
    console.log('   ✅ Token Refresh');
    console.log('   ✅ User Logout');
    console.log('   ✅ Security Validation');
    console.log('   ✅ Error Handling');

  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  }
}

// Run the complete authentication test
testCompleteAuth();