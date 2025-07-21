const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test credentials - UPDATE THESE WITH YOUR ACTUAL RESTAURANT ACCOUNT
const TEST_CREDENTIALS = {
  email: 'restaurant@test.com', // UPDATE THIS
  password: 'password123' // UPDATE THIS
};

async function debugMenuIssues() {
  let authToken = null;

  console.log('🔍 DEBUGGING MENU MANAGEMENT ISSUES\n');

  try {
    // Step 1: Login
    console.log('1️⃣ TESTING LOGIN...');
    try {
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, TEST_CREDENTIALS);
      
      if (loginResponse.data.success) {
        authToken = loginResponse.data.data.token;
        console.log('✅ Login successful');
        console.log(`   User: ${loginResponse.data.data.user.name} (${loginResponse.data.data.user.role})`);
        console.log(`   User ID: ${loginResponse.data.data.user._id}`);
      } else {
        console.log('❌ Login failed:', loginResponse.data.message);
        console.log('\n⚠️  PLEASE UPDATE TEST_CREDENTIALS IN THIS SCRIPT');
        return;
      }
    } catch (error) {
      console.log('❌ Login error:', error.response?.data?.message || error.message);
      console.log('\n⚠️  Make sure backend is running and update TEST_CREDENTIALS');
      return;
    }

    // Step 2: Check Restaurant Profile
    console.log('\n2️⃣ CHECKING RESTAURANT PROFILE...');
    try {
      const restaurantResponse = await axios.get(`${BASE_URL}/restaurants/my-restaurant`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      if (restaurantResponse.data.success) {
        const restaurant = restaurantResponse.data.data;
        console.log('✅ Restaurant profile found');
        console.log(`   Restaurant ID: ${restaurant._id}`);
        console.log(`   Restaurant Name: ${restaurant.name}`);
        console.log(`   Owner ID: ${restaurant.ownerId}`);
        console.log(`   Is Active: ${restaurant.isActive}`);
        
        // Validate restaurant ID format
        const isValidRestaurantId = /^[0-9a-fA-F]{24}$/.test(restaurant._id);
        console.log(`   ID Format Valid: ${isValidRestaurantId ? '✅' : '❌'}`);
        
        if (!isValidRestaurantId) {
          console.log('   🚨 INVALID RESTAURANT ID - THIS IS THE ROOT CAUSE!');
          console.log('   💡 SOLUTION: You need to recreate your restaurant profile');
          return;
        }

        if (!restaurant.isActive) {
          console.log('   ⚠️  Restaurant is inactive - this might cause issues');
        }
      } else {
        console.log('❌ Restaurant profile not found:', restaurantResponse.data.message);
        console.log('   🚨 THIS IS THE ROOT CAUSE - NO RESTAURANT PROFILE!');
        console.log('   💡 SOLUTION: You need to complete restaurant setup first');
        console.log('   📝 Steps:');
        console.log('      1. Go to restaurant dashboard');
        console.log('      2. Complete restaurant profile setup');
        console.log('      3. Then try menu management');
        return;
      }
    } catch (error) {
      console.log('❌ Restaurant profile error:', error.response?.status, error.response?.data?.message || error.message);
      if (error.response?.status === 404) {
        console.log('   🚨 RESTAURANT PROFILE NOT FOUND - THIS IS THE ROOT CAUSE!');
        console.log('   💡 SOLUTION: Complete restaurant setup first');
      }
      return;
    }

    // Step 3: Test Menu Items API (the one causing "invalid menu item id format")
    console.log('\n3️⃣ TESTING MENU ITEMS API...');
    try {
      const menuResponse = await axios.get(`${BASE_URL}/menu`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      if (menuResponse.data.success) {
        const menuItems = menuResponse.data.data.items || menuResponse.data.data || [];
        console.log('✅ Menu items loaded successfully');
        console.log(`   Menu items count: ${menuItems.length}`);
        
        if (menuItems.length === 0) {
          console.log('   📝 No menu items found (this is normal for new restaurants)');
        } else {
          console.log('   🔍 Menu items found:');
          menuItems.forEach((item, index) => {
            console.log(`      ${index + 1}. ${item.name} - ${item.category} - $${item.price}`);
          });
        }
      } else {
        console.log('❌ Menu items failed:', menuResponse.data.message);
      }
    } catch (error) {
      console.log('❌ Menu items error:', error.response?.status, error.response?.data?.message || error.message);
      if (error.response?.data?.message?.includes('Invalid') && error.response?.data?.message?.includes('ID format')) {
        console.log('   🚨 THIS IS THE "invalid menu item id format" ERROR YOU\'RE SEEING!');
        console.log('   💡 This suggests there\'s corrupted data in your database');
      }
    }

    // Step 4: Test Menu Item Creation
    console.log('\n4️⃣ TESTING MENU ITEM CREATION...');
    const testMenuItem = {
      name: 'Test Item',
      description: 'Test description for debugging',
      price: 9.99,
      category: 'Snacks',
      isVegetarian: false,
      isAvailable: true
    };

    try {
      console.log('   📝 Attempting to create test menu item:', testMenuItem);
      
      const createResponse = await axios.post(`${BASE_URL}/menu`, testMenuItem, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      if (createResponse.data.success) {
        console.log('✅ Menu item created successfully!');
        console.log(`   Created item ID: ${createResponse.data.data._id}`);
        
        // Clean up - delete the test item
        try {
          await axios.delete(`${BASE_URL}/menu/${createResponse.data.data._id}`, {
            headers: { Authorization: `Bearer ${authToken}` }
          });
          console.log('   🧹 Test item cleaned up');
        } catch (cleanupError) {
          console.log('   ⚠️  Could not clean up test item (not critical)');
        }
      } else {
        console.log('❌ Menu item creation failed:', createResponse.data.message);
        if (createResponse.data.errors) {
          console.log('   📋 Validation errors:');
          createResponse.data.errors.forEach(error => {
            console.log(`      - ${error.field}: ${error.message}`);
          });
        }
      }
    } catch (error) {
      console.log('❌ Menu item creation error:', error.response?.status, error.response?.data?.message || error.message);
      
      if (error.response?.data?.message === 'Validation failed') {
        console.log('   🚨 THIS IS THE "validation failed" ERROR YOU\'RE SEEING!');
        if (error.response?.data?.errors) {
          console.log('   📋 Specific validation errors:');
          error.response.data.errors.forEach(err => {
            console.log(`      - ${err.field}: ${err.message}`);
          });
        }
      }
      
      if (error.response?.data?.message?.includes('Restaurant profile not found')) {
        console.log('   🚨 RESTAURANT PROFILE ISSUE - THIS IS THE ROOT CAUSE!');
      }
    }

    // Step 5: Test Categories API
    console.log('\n5️⃣ TESTING CATEGORIES API...');
    try {
      const categoriesResponse = await axios.get(`${BASE_URL}/menu/categories`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      if (categoriesResponse.data.success) {
        console.log('✅ Categories loaded successfully');
        console.log('   Available categories:', categoriesResponse.data.data.categories);
      } else {
        console.log('❌ Categories failed:', categoriesResponse.data.message);
      }
    } catch (error) {
      console.log('❌ Categories error:', error.response?.status, error.response?.data?.message || error.message);
    }

    console.log('\n🎯 DIAGNOSIS COMPLETE!');
    console.log('\n📋 SUMMARY OF FINDINGS:');
    console.log('Look for any ❌ or 🚨 messages above to identify the root cause.');
    
    console.log('\n💡 COMMON SOLUTIONS:');
    console.log('1. If "Restaurant profile not found": Complete restaurant setup first');
    console.log('2. If "Invalid restaurant ID": Recreate restaurant profile');
    console.log('3. If "Validation failed": Check the specific field errors listed above');
    console.log('4. If menu loads but creation fails: Check validation rules');

  } catch (error) {
    console.error('❌ Debug script failed:', error.message);
  }
}

// Instructions
console.log('📝 INSTRUCTIONS:');
console.log('1. Update TEST_CREDENTIALS with your restaurant account details');
console.log('2. Make sure backend server is running on port 5000');
console.log('3. Run: node debug-menu-issues.js');
console.log('4. Look for ❌ and 🚨 messages to find the root cause');
console.log('');

// Run the debug
debugMenuIssues();