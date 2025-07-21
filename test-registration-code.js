const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

// Test data
const testRestaurantData = {
  name: 'Test Restaurant Owner',
  email: 'testrestaurant@example.com',
  password: 'password123',
  role: 'restaurant',
  phone: '9876543210',
  address: 'Test Restaurant Address, Test City',
  restaurantName: 'Test Restaurant',
  description: 'This is a test restaurant with delicious food and great service for testing purposes.',
  cuisineTypes: ['North Indian', 'Chinese'],
  ownerName: 'Test Owner'
};

const testStudentData = {
  name: 'Test Student',
  email: 'teststudent@example.com',
  password: 'password123',
  role: 'student',
  phone: '9876543211',
  address: 'Test Hostel, Room 101'
};

async function runRegistrationCodeTests() {
  console.log('🧪 Testing Restaurant Registration Code Feature\n');

  try {
    // Test 1: Restaurant registration without code (should fail)
    console.log('1️⃣ Testing restaurant registration without code...');
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, testRestaurantData);
      console.log('❌ Test failed: Registration should have been rejected without code');
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('registration code')) {
        console.log('✅ Correctly rejected registration without code');
        console.log('   Error message:', error.response.data.message);
      } else {
        console.log('❌ Unexpected error:', error.response?.data?.message || error.message);
      }
    }

    // Test 2: Restaurant registration with empty code (should fail)
    console.log('\n2️⃣ Testing restaurant registration with empty code...');
    try {
      const dataWithEmptyCode = { ...testRestaurantData, registrationCode: '' };
      const response = await axios.post(`${API_BASE_URL}/auth/register`, dataWithEmptyCode);
      console.log('❌ Test failed: Registration should have been rejected with empty code');
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('registration code')) {
        console.log('✅ Correctly rejected registration with empty code');
        console.log('   Error message:', error.response.data.message);
      } else {
        console.log('❌ Unexpected error:', error.response?.data?.message || error.message);
      }
    }

    // Test 3: Restaurant registration with incorrect code (should fail)
    console.log('\n3️⃣ Testing restaurant registration with incorrect code...');
    try {
      const dataWithWrongCode = { ...testRestaurantData, registrationCode: '1234' };
      const response = await axios.post(`${API_BASE_URL}/auth/register`, dataWithWrongCode);
      console.log('❌ Test failed: Registration should have been rejected with wrong code');
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('Invalid registration code')) {
        console.log('✅ Correctly rejected registration with wrong code');
        console.log('   Error message:', error.response.data.message);
      } else {
        console.log('❌ Unexpected error:', error.response?.data?.message || error.message);
      }
    }

    // Test 4: Restaurant registration with code containing spaces (should fail)
    console.log('\n4️⃣ Testing restaurant registration with code containing spaces...');
    try {
      const dataWithSpacedCode = { ...testRestaurantData, registrationCode: ' 2904 ' };
      const response = await axios.post(`${API_BASE_URL}/auth/register`, dataWithSpacedCode);
      if (response.data.success) {
        console.log('✅ Registration successful with spaced code (trimmed correctly)');
        console.log('   User ID:', response.data.data._id);
        console.log('   Registration method:', response.data.data.registrationMethod || 'Not tracked');
        
        // Clean up - delete the test user
        await deleteTestUser(response.data.data._id);
      } else {
        console.log('❌ Registration failed unexpectedly:', response.data.message);
      }
    } catch (error) {
      console.log('❌ Unexpected error:', error.response?.data?.message || error.message);
    }

    // Test 5: Restaurant registration with correct code (should succeed)
    console.log('\n5️⃣ Testing restaurant registration with correct code...');
    try {
      const dataWithCorrectCode = { 
        ...testRestaurantData, 
        email: 'testrestaurant2@example.com',
        phone: '9876543212',
        registrationCode: '2904' 
      };
      const response = await axios.post(`${API_BASE_URL}/auth/register`, dataWithCorrectCode);
      
      if (response.data.success) {
        console.log('✅ Registration successful with correct code');
        console.log('   User ID:', response.data.data._id);
        console.log('   Name:', response.data.data.name);
        console.log('   Role:', response.data.data.role);
        console.log('   Registration method:', response.data.data.registrationMethod || 'Not tracked');
        console.log('   Registered via code:', response.data.data.registeredViaCode || 'Not tracked');
        
        // Test login with the registered user
        console.log('\n   Testing login with registered user...');
        try {
          const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
            email: dataWithCorrectCode.email,
            password: dataWithCorrectCode.password
          });
          
          if (loginResponse.data.success) {
            console.log('   ✅ Login successful');
            console.log('   User role:', loginResponse.data.data.role);
          } else {
            console.log('   ❌ Login failed:', loginResponse.data.message);
          }
        } catch (loginError) {
          console.log('   ❌ Login error:', loginError.response?.data?.message || loginError.message);
        }
        
        // Clean up - delete the test user
        await deleteTestUser(response.data.data._id);
      } else {
        console.log('❌ Registration failed:', response.data.message);
      }
    } catch (error) {
      console.log('❌ Registration error:', error.response?.data?.message || error.message);
    }

    // Test 6: Student registration (should work without code)
    console.log('\n6️⃣ Testing student registration (should not require code)...');
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, testStudentData);
      
      if (response.data.success) {
        console.log('✅ Student registration successful (no code required)');
        console.log('   User ID:', response.data.data._id);
        console.log('   Role:', response.data.data.role);
        console.log('   Registration method:', response.data.data.registrationMethod || 'standard');
        
        // Clean up - delete the test user
        await deleteTestUser(response.data.data._id);
      } else {
        console.log('❌ Student registration failed:', response.data.message);
      }
    } catch (error) {
      console.log('❌ Student registration error:', error.response?.data?.message || error.message);
    }

    // Test 7: Edge case - numeric code as number instead of string
    console.log('\n7️⃣ Testing restaurant registration with numeric code...');
    try {
      const dataWithNumericCode = { 
        ...testRestaurantData, 
        email: 'testrestaurant3@example.com',
        phone: '9876543213',
        registrationCode: 2904  // Number instead of string
      };
      const response = await axios.post(`${API_BASE_URL}/auth/register`, dataWithNumericCode);
      
      if (response.data.success) {
        console.log('✅ Registration successful with numeric code');
        console.log('   User ID:', response.data.data._id);
        
        // Clean up - delete the test user
        await deleteTestUser(response.data.data._id);
      } else {
        console.log('❌ Registration failed:', response.data.message);
      }
    } catch (error) {
      console.log('❌ Registration error:', error.response?.data?.message || error.message);
    }

    console.log('\n🎉 All registration code tests completed!');

  } catch (error) {
    console.error('❌ Test suite error:', error.message);
  }
}

// Helper function to delete test users
async function deleteTestUser(userId) {
  try {
    // Note: This assumes you have a delete endpoint. If not, you might need to manually clean up
    console.log(`   🧹 Cleaning up test user: ${userId}`);
    // await axios.delete(`${API_BASE_URL}/auth/users/${userId}`);
  } catch (error) {
    console.log(`   ⚠️ Could not clean up test user: ${error.message}`);
  }
}

// Run the tests
if (require.main === module) {
  runRegistrationCodeTests();
}

module.exports = { runRegistrationCodeTests };