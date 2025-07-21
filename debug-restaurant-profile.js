const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// UPDATE THESE WITH YOUR ACTUAL RESTAURANT CREDENTIALS
const TEST_CREDENTIALS = {
  email: 'restaurant@test.com', // CHANGE THIS
  password: 'password123' // CHANGE THIS
};

async function debugRestaurantProfile() {
  console.log('🔍 DEBUGGING RESTAURANT PROFILE ISSUE\n');

  try {
    // Step 1: Login
    console.log('1️⃣ Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, TEST_CREDENTIALS);
    
    if (!loginResponse.data.success) {
      console.log('❌ LOGIN FAILED');
      console.log('Please update TEST_CREDENTIALS in this script with your actual restaurant login details');
      console.log('Current credentials being used:');
      console.log('  Email:', TEST_CREDENTIALS.email);
      console.log('  Password:', TEST_CREDENTIALS.password);
      return;
    }
    
    const authToken = loginResponse.data.data.token;
    const user = loginResponse.data.data.user;
    console.log('✅ Login successful');
    console.log('  User ID:', user._id);
    console.log('  User Name:', user.name);
    console.log('  User Role:', user.role);

    // Step 2: Check if restaurant profile exists
    console.log('\n2️⃣ Checking restaurant profile...');
    try {
      const restaurantResponse = await axios.get(`${BASE_URL}/restaurants/my-restaurant`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      if (restaurantResponse.data.success) {
        const restaurant = restaurantResponse.data.data;
        console.log('✅ Restaurant profile found');
        console.log('  Restaurant ID:', restaurant._id);
        console.log('  Restaurant Name:', restaurant.name);
        console.log('  Owner ID:', restaurant.ownerId);
        console.log('  Is Active:', restaurant.isActive);
        console.log('  Address:', restaurant.address);
        console.log('  Phone:', restaurant.phone);
        
        // Check if IDs match
        if (restaurant.ownerId === user._id) {
          console.log('✅ Owner ID matches user ID');
        } else {
          console.log('❌ MISMATCH: Owner ID does not match user ID');
          console.log('  This could cause menu loading issues');
        }
        
        // Check if restaurant is active
        if (restaurant.isActive) {
          console.log('✅ Restaurant is active');
        } else {
          console.log('⚠️  Restaurant is inactive - this might cause issues');
        }
        
      } else {
        console.log('❌ RESTAURANT PROFILE NOT FOUND');
        console.log('This is likely the root cause of your menu management issues');
        console.log('\n💡 SOLUTION:');
        console.log('1. Go to your restaurant dashboard');
        console.log('2. Complete the restaurant profile setup');
        console.log('3. Fill in all required fields (name, address, phone, etc.)');
        console.log('4. Save the profile');
        console.log('5. Then try menu management again');
        return;
      }
    } catch (error) {
      console.log('❌ Error checking restaurant profile:', error.response?.data?.message || error.message);
      if (error.response?.status === 404) {
        console.log('\n🚨 RESTAURANT PROFILE NOT FOUND - THIS IS THE ROOT CAUSE!');
        console.log('\n💡 SOLUTION:');
        console.log('1. Complete restaurant setup first');
        console.log('2. Go to restaurant dashboard');
        console.log('3. Fill in restaurant profile details');
        console.log('4. Save the profile');
        console.log('5. Then try menu management');
      }
      return;
    }

    // Step 3: Test menu loading with detailed debugging
    console.log('\n3️⃣ Testing menu loading...');
    try {
      const menuResponse = await axios.get(`${BASE_URL}/menu`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      console.log('✅ Menu API call successful');
      console.log('  Response success:', menuResponse.data.success);
      console.log('  Response message:', menuResponse.data.message);
      console.log('  Response data structure:', Object.keys(menuResponse.data.data || {}));
      
      if (menuResponse.data.data && menuResponse.data.data.items) {
        console.log('  Menu items found:', menuResponse.data.data.items.length);
        if (menuResponse.data.data.items.length > 0) {
          console.log('  First item:', menuResponse.data.data.items[0].name);
        }
      } else {
        console.log('  No menu items found (this is normal for new restaurants)');
      }
      
    } catch (error) {
      console.log('❌ Menu loading failed:', error.response?.data?.message || error.message);
      console.log('  Status:', error.response?.status);
      
      if (error.response?.data?.message?.includes('Restaurant profile not found')) {
        console.log('\n🚨 ROOT CAUSE: Restaurant profile not found in menu endpoint');
        console.log('This means the restaurant profile exists but there\'s a mismatch in the database');
      }
    }

    // Step 4: Test menu creation
    console.log('\n4️⃣ Testing menu item creation...');
    const testItem = {
      name: 'Debug Test Item',
      description: 'Test item for debugging',
      price: 9.99,
      category: 'Snacks'
    };

    try {
      const createResponse = await axios.post(`${BASE_URL}/menu`, testItem, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      if (createResponse.data.success) {
        console.log('✅ Menu item creation successful');
        console.log('  Created item ID:', createResponse.data.data._id);
        
        // Clean up
        try {
          await axios.delete(`${BASE_URL}/menu/${createResponse.data.data._id}`, {
            headers: { Authorization: `Bearer ${authToken}` }
          });
          console.log('🧹 Test item cleaned up');
        } catch (cleanupError) {
          console.log('⚠️  Could not clean up test item');
        }
      } else {
        console.log('❌ Menu item creation failed:', createResponse.data.message);
        if (createResponse.data.errors) {
          console.log('  Validation errors:');
          createResponse.data.errors.forEach(err => {
            console.log(`    - ${err.field}: ${err.message}`);
          });
        }
      }
    } catch (error) {
      console.log('❌ Menu creation error:', error.response?.data?.message || error.message);
      if (error.response?.data?.errors) {
        console.log('  Validation errors:');
        error.response.data.errors.forEach(err => {
          console.log(`    - ${err.field}: ${err.message}`);
        });
      }
    }

    console.log('\n🎯 DIAGNOSIS COMPLETE');
    console.log('\nIf restaurant profile was not found, that\'s your main issue.');
    console.log('Complete the restaurant setup first, then try menu management.');

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

// Instructions
console.log('📝 SETUP INSTRUCTIONS:');
console.log('1. Update TEST_CREDENTIALS above with your restaurant login');
console.log('2. Make sure backend server is running');
console.log('3. Run: node debug-restaurant-profile.js');
console.log('4. Look for the root cause in the output');
console.log('');

// Run the debug
debugRestaurantProfile();