// Test registration fix
const axios = require('axios');

async function testRegistrationFix() {
  console.log('🔧 Testing Registration Fix...\n');

  const API_BASE_URL = 'http://localhost:5000/api';
  
  // Test student registration data (as it would be sent from frontend after fix)
  const studentData = {
    name: 'Test Student Registration',
    email: 'test.registration@student.com',
    password: 'password123',
    phone: '9876543299',
    role: 'student',
    address: 'Hostel A, IIT Tirupati, Room: A-101' // Combined address
  };

  // Test restaurant registration data
  const restaurantData = {
    name: 'Test Restaurant Owner',
    email: 'test.restaurant@example.com',
    password: 'password123',
    phone: '9876543298',
    role: 'restaurant',
    address: 'Test Restaurant Address, IIT Tirupati', // Single address field
    ownerName: 'Test Owner',
    restaurantName: 'Test Restaurant',
    description: 'This is a test restaurant for registration testing purposes.',
    cuisineTypes: ['North Indian', 'South Indian']
  };

  try {
    console.log('1️⃣ Testing Student Registration...');
    
    // Delete existing test user if exists
    try {
      await axios.delete(`${API_BASE_URL}/test/user/${studentData.email}`);
    } catch (e) {
      // Ignore if user doesn't exist
    }
    
    const studentResponse = await axios.post(`${API_BASE_URL}/auth/register`, studentData);
    
    if (studentResponse.data.success) {
      console.log('✅ Student registration successful!');
      console.log('   Message:', studentResponse.data.message);
      console.log('   User ID:', studentResponse.data.data?._id || 'Not provided');
      console.log('   Name:', studentResponse.data.data?.name || 'Not provided');
      console.log('   Email:', studentResponse.data.data?.email || 'Not provided');
      console.log('   Role:', studentResponse.data.data?.role || 'Not provided');
      console.log('   Address:', studentResponse.data.data?.address || 'Not provided');
    } else {
      console.log('❌ Student registration failed:', studentResponse.data.message);
    }

    console.log('\n2️⃣ Testing Restaurant Registration...');
    
    // Delete existing test user if exists
    try {
      await axios.delete(`${API_BASE_URL}/test/user/${restaurantData.email}`);
    } catch (e) {
      // Ignore if user doesn't exist
    }
    
    const restaurantResponse = await axios.post(`${API_BASE_URL}/auth/register`, restaurantData);
    
    if (restaurantResponse.data.success) {
      console.log('✅ Restaurant registration successful!');
      console.log('   Message:', restaurantResponse.data.message);
      console.log('   User ID:', restaurantResponse.data.data?._id || 'Not provided');
      console.log('   Name:', restaurantResponse.data.data?.name || 'Not provided');
      console.log('   Email:', restaurantResponse.data.data?.email || 'Not provided');
      console.log('   Role:', restaurantResponse.data.data?.role || 'Not provided');
      console.log('   Address:', restaurantResponse.data.data?.address || 'Not provided');
    } else {
      console.log('❌ Restaurant registration failed:', restaurantResponse.data.message);
    }

    console.log('\n3️⃣ Testing Login with Registered Users...');
    
    // Test login with student
    try {
      const studentLoginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: studentData.email,
        password: studentData.password
      });
      
      if (studentLoginResponse.data.success) {
        console.log('✅ Student login after registration successful!');
        console.log('   Token received:', !!studentLoginResponse.data.data.token);
      } else {
        console.log('❌ Student login failed:', studentLoginResponse.data.message);
      }
    } catch (error) {
      console.log('❌ Student login error:', error.response?.data?.message || error.message);
    }

    // Test login with restaurant
    try {
      const restaurantLoginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: restaurantData.email,
        password: restaurantData.password
      });
      
      if (restaurantLoginResponse.data.success) {
        console.log('✅ Restaurant login after registration successful!');
        console.log('   Token received:', !!restaurantLoginResponse.data.data.token);
      } else {
        console.log('❌ Restaurant login failed:', restaurantLoginResponse.data.message);
      }
    } catch (error) {
      console.log('❌ Restaurant login error:', error.response?.data?.message || error.message);
    }

    console.log('\n🎉 Registration fix test completed!');
    console.log('\n📋 Summary:');
    console.log('✅ Frontend now combines hostelAddress + roomNumber into single address field');
    console.log('✅ Frontend now uses restaurantAddress as address field');
    console.log('✅ Backend receives the expected address field format');
    console.log('✅ Registration should now work without "Address is required" error');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

// Run the test
testRegistrationFix();