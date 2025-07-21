const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test credentials - UPDATE THESE WITH YOUR ACTUAL RESTAURANT ACCOUNT
const TEST_CREDENTIALS = {
  email: 'restaurant@test.com', // UPDATE THIS
  password: 'password123' // UPDATE THIS
};

async function testMenuCreation() {
  let authToken = null;

  console.log('🍽️ TESTING MENU ITEM CREATION\n');

  try {
    // Step 1: Login
    console.log('1️⃣ Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, TEST_CREDENTIALS);
    
    if (!loginResponse.data.success) {
      console.log('❌ Login failed. Please update TEST_CREDENTIALS in this script.');
      return;
    }
    
    authToken = loginResponse.data.data.token;
    console.log('✅ Login successful');

    // Step 2: Check restaurant profile
    console.log('\n2️⃣ Checking restaurant profile...');
    try {
      const restaurantResponse = await axios.get(`${BASE_URL}/restaurants/my-restaurant`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      if (!restaurantResponse.data.success) {
        console.log('❌ Restaurant profile not found!');
        console.log('💡 SOLUTION: You need to complete restaurant setup first');
        console.log('   1. Go to your restaurant dashboard');
        console.log('   2. Complete the restaurant profile setup');
        console.log('   3. Then try menu management');
        return;
      }
      
      console.log('✅ Restaurant profile found');
    } catch (error) {
      console.log('❌ Restaurant profile error:', error.response?.data?.message);
      return;
    }

    // Step 3: Test with minimal valid data
    console.log('\n3️⃣ Testing menu item creation with minimal data...');
    const minimalItem = {
      name: 'Test Burger',
      description: 'A delicious test burger for debugging',
      price: 12.99,
      category: 'Snacks'
    };

    try {
      console.log('📝 Creating item:', minimalItem);
      
      const createResponse = await axios.post(`${BASE_URL}/menu`, minimalItem, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      if (createResponse.data.success) {
        console.log('✅ SUCCESS! Menu item created successfully');
        console.log('   Item ID:', createResponse.data.data._id);
        console.log('   Item Name:', createResponse.data.data.name);
        
        // Clean up
        try {
          await axios.delete(`${BASE_URL}/menu/${createResponse.data.data._id}`, {
            headers: { Authorization: `Bearer ${authToken}` }
          });
          console.log('🧹 Test item cleaned up');
        } catch (cleanupError) {
          console.log('⚠️  Could not clean up test item (not critical)');
        }
        
        console.log('\n🎉 MENU CREATION IS WORKING!');
        console.log('💡 If you\'re still having issues in the frontend:');
        console.log('   1. Check browser console for specific errors');
        console.log('   2. Make sure you\'ve completed restaurant setup');
        console.log('   3. Try refreshing the page');
        
      } else {
        console.log('❌ Menu item creation failed:', createResponse.data.message);
        
        if (createResponse.data.errors) {
          console.log('📋 Validation errors:');
          createResponse.data.errors.forEach(error => {
            console.log(`   - ${error.field}: ${error.message}`);
          });
        }
      }
    } catch (error) {
      console.log('❌ Menu creation error:', error.response?.status, error.response?.data?.message);
      
      if (error.response?.data?.message === 'Validation failed') {
        console.log('🚨 VALIDATION FAILED - Here are the specific errors:');
        if (error.response?.data?.errors) {
          error.response.data.errors.forEach(err => {
            console.log(`   - ${err.field}: ${err.message}`);
          });
        }
      }
      
      if (error.response?.data?.message?.includes('Restaurant profile not found')) {
        console.log('🚨 RESTAURANT PROFILE NOT FOUND!');
        console.log('💡 SOLUTION: Complete restaurant setup first');
      }
    }

    // Step 4: Test with complete data
    console.log('\n4️⃣ Testing with complete menu item data...');
    const completeItem = {
      name: 'Deluxe Test Pizza',
      description: 'A comprehensive test pizza with all the fixings',
      price: 18.99,
      category: 'Dinner',
      image: '',
      preparationTime: 25,
      ingredients: ['Dough', 'Tomato Sauce', 'Cheese', 'Pepperoni'],
      allergens: ['Dairy', 'Gluten'],
      isVegetarian: false,
      isVegan: false,
      isAvailable: true,
      spiceLevel: 'Mild'
    };

    try {
      console.log('📝 Creating complete item:', completeItem);
      
      const createResponse = await axios.post(`${BASE_URL}/menu`, completeItem, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      if (createResponse.data.success) {
        console.log('✅ Complete menu item created successfully');
        
        // Clean up
        try {
          await axios.delete(`${BASE_URL}/menu/${createResponse.data.data._id}`, {
            headers: { Authorization: `Bearer ${authToken}` }
          });
          console.log('🧹 Complete test item cleaned up');
        } catch (cleanupError) {
          console.log('⚠️  Could not clean up complete test item');
        }
      } else {
        console.log('❌ Complete item creation failed:', createResponse.data.message);
      }
    } catch (error) {
      console.log('❌ Complete item creation error:', error.response?.data?.message);
    }

    console.log('\n🎯 TEST COMPLETE!');
    console.log('\nIf both tests passed, the backend is working correctly.');
    console.log('If you\'re still having frontend issues, the problem is likely:');
    console.log('1. Frontend form not sending correct data format');
    console.log('2. Restaurant setup not completed properly');
    console.log('3. Browser cache issues');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Instructions
console.log('📝 INSTRUCTIONS:');
console.log('1. Update TEST_CREDENTIALS with your restaurant account');
console.log('2. Make sure backend is running on port 5000');
console.log('3. Run: node test-menu-creation.js');
console.log('');

// Run the test
testMenuCreation();