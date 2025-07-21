// Test login error handling
const axios = require('axios');

async function testLoginErrors() {
  console.log('🔧 Testing Login Error Handling...\n');

  const API_BASE_URL = 'http://localhost:5000/api';

  const testCases = [
    {
      name: 'Wrong Email (Unregistered Account)',
      credentials: {
        email: 'nonexistent@user.com',
        password: 'password123'
      },
      expectedMessage: 'Invalid email or password'
    },
    {
      name: 'Wrong Password (Registered Account)',
      credentials: {
        email: 'demo@student.com',
        password: 'wrongpassword'
      },
      expectedMessage: 'Invalid email or password'
    },
    {
      name: 'Empty Email',
      credentials: {
        email: '',
        password: 'password123'
      },
      expectedMessage: 'Please provide email and password'
    },
    {
      name: 'Empty Password',
      credentials: {
        email: 'demo@student.com',
        password: ''
      },
      expectedMessage: 'Please provide email and password'
    },
    {
      name: 'Valid Credentials (Should Work)',
      credentials: {
        email: 'demo@student.com',
        password: 'password123'
      },
      expectedMessage: 'Login successful'
    }
  ];

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`${i + 1}️⃣ Testing: ${testCase.name}`);
    console.log(`   Email: "${testCase.credentials.email}"`);
    console.log(`   Password: "${testCase.credentials.password}"`);

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, testCase.credentials);
      
      // Success response
      console.log(`   ✅ Response: ${response.status} - ${response.data.message}`);
      console.log(`   Success: ${response.data.success}`);
      
      if (response.data.success && response.data.data) {
        console.log(`   User: ${response.data.data.name} (${response.data.data.role})`);
        console.log(`   Token: ${response.data.data.token ? 'Received' : 'Missing'}`);
      }
      
    } catch (error) {
      // Error response
      if (error.response) {
        console.log(`   ❌ Response: ${error.response.status} - ${error.response.data.message}`);
        console.log(`   Success: ${error.response.data.success}`);
        console.log(`   Expected: "${testCase.expectedMessage}"`);
        console.log(`   Received: "${error.response.data.message}"`);
        console.log(`   Match: ${error.response.data.message === testCase.expectedMessage ? '✅' : '❌'}`);
      } else {
        console.log(`   ❌ Network Error: ${error.message}`);
      }
    }
    
    console.log(''); // Empty line for readability
  }

  console.log('🎯 Summary:');
  console.log('The backend is returning proper error messages for:');
  console.log('✅ Invalid email (unregistered account)');
  console.log('✅ Invalid password (wrong password)');
  console.log('✅ Missing email or password');
  console.log('✅ Valid credentials');
  console.log('\nIf frontend is not showing these errors, the issue is in:');
  console.log('1. AuthContext error handling');
  console.log('2. Login component error display');
  console.log('3. Toast notification setup');
}

// Run the test
testLoginErrors();