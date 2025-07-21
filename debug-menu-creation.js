const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test with actual restaurant credentials
const RESTAURANT_CREDENTIALS = {
  email: 'pendurthirohan@gmail.com',
  password: 'Rohan@123' // You may need to update this
};

const TEST_MENU_ITEM = {
  name: 'Debug Test Item',
  description: 'A test item to debug the validation failed error',
  price: 12.99,
  category: 'Snacks',
  isVegetarian: true,
  isAvailable: true
};

async function debugMenuCreation() {
  let authToken = null;

  try {
    console.log('🔍 Debugging Menu Creation with Real Authentication...\n');

    // Step 1: Login to get auth token
    console.log('1. Logging in with restaurant credentials...');
    try {
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, RESTAURANT_CREDENTIALS);
      
      if (loginResponse.data.success) {
        authToken = loginResponse.data.data.token;
        console.log('✅ Login successful');
        console.log('   User ID:', loginResponse.data.data.user._id);
        console.log('   User Role:', loginResponse.data.data.user.role);
      } else {
        console.log('❌ Login failed:', loginResponse.data.message);
        return;
      }
    } catch (error) {
      console.log('❌ Login error:');
      console.log('   Status:', error.response?.status);
      console.log('   Message:', error.response?.data?.message || error.message);
      console.log('   Full error:', error.response?.data);
      return;
    }

    // Step 2: Check restaurant profile
    console.log('\n2. Checking restaurant profile...');
    try {
      const restaurantResponse = await axios.get(`${BASE_URL}/restaurants/my-restaurant`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      if (restaurantResponse.data.success) {
        console.log('✅ Restaurant profile found');
        console.log('   Restaurant ID:', restaurantResponse.data.data._id);
        console.log('   Restaurant Name:', restaurantResponse.data.data.name);
        console.log('   Is Active:', restaurantResponse.data.data.isActive);
      } else {
        console.log('❌ Restaurant profile issue:', restaurantResponse.data.message);
      }
    } catch (error) {
      console.log('❌ Restaurant profile error:', error.response?.data?.message || error.message);
      if (error.response?.data?.requiresSetup) {
        console.log('⚠️  Restaurant setup required - this could be the issue!');
        return;
      }
    }

    // Step 3: Try to create menu item
    console.log('\n3. Attempting to create menu item...');
    console.log('   Data being sent:', JSON.stringify(TEST_MENU_ITEM, null, 2));
    
    try {
      const createResponse = await axios.post(`${BASE_URL}/menu`, TEST_MENU_ITEM, {
        headers: { 
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (createResponse.data.success) {
        console.log('✅ Menu item created successfully!');
        console.log('   Menu Item ID:', createResponse.data.data._id);
        console.log('   Menu Item Name:', createResponse.data.data.name);
        console.log('   Associated Restaurant:', createResponse.data.data.restaurantId);
        console.log('\n🎉 The validation error is FIXED!');
      } else {
        console.log('❌ Menu item creation failed:', createResponse.data.message);
      }
    } catch (error) {
      console.log('❌ Menu item creation error:');
      console.log('   Status:', error.response?.status);
      console.log('   Message:', error.response?.data?.message);
      
      if (error.response?.data?.errors) {
        console.log('   Validation Errors:');
        error.response.data.errors.forEach(err => {
          console.log(`     - ${err.field}: ${err.message}`);
        });
      }
      
      if (error.response?.data?.message === 'Validation failed') {
        console.log('\n🔍 VALIDATION FAILED - Detailed Analysis:');
        console.log('This means the validation middleware rejected the data.');
        console.log('Check the validation errors above to see which fields failed.');
      }
    }

    // Step 4: Get current menu items to verify
    console.log('\n4. Checking current menu items...');
    try {
      const menuResponse = await axios.get(`${BASE_URL}/menu`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      if (menuResponse.data.success) {
        console.log('✅ Current menu items count:', menuResponse.data.data.length);
        if (menuResponse.data.data.length > 0) {
          console.log('   Latest item:', menuResponse.data.data[0].name);
        }
      }
    } catch (error) {
      console.log('❌ Error getting menu items:', error.response?.data?.message || error.message);
    }

  } catch (error) {
    console.error('❌ Debug script failed:', error.message);
  }
}

// Run the debug script
debugMenuCreation();