const axios = require('axios');

// Test function to debug login issue
async function testLogin() {
  const BASE_URL = 'http://localhost:5000/api';
  
  console.log('🔍 Testing login with wrong credentials...');
  
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'wrong@example.com',
      password: 'wrongpassword'
    }, {
      timeout: 10000
    });
    
    console.log('✅ Response received:', response.data);
    
  } catch (error) {
    console.log('❌ Error caught:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      data: error.response?.data
    });
    
    // This is what should happen with wrong credentials
    if (error.response?.status === 401) {
      console.log('🎯 Expected 401 error received for wrong credentials');
    }
  }
}

// Run test
testLogin();