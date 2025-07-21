const axios = require('axios');

// Test the restaurant profile endpoint
async function testRestaurantProfile() {
  try {
    console.log('🧪 Testing Restaurant Profile Endpoint...\n');

    // First, let's test if the endpoint exists (should return 401 without auth)
    try {
      const response = await axios.get('http://localhost:5000/api/restaurants/profile');
      console.log('❌ Unexpected success - endpoint should require authentication');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Endpoint exists and correctly requires authentication');
        console.log('   Status:', error.response.status);
        console.log('   Message:', error.response.data.message);
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }

    console.log('\n🔍 Endpoint test completed');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testRestaurantProfile();