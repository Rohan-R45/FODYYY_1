const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test with a simple login (you'll need to update credentials)
const TEST_CREDENTIALS = {
  email: 'test@restaurant.com', // Update this
  password: 'password123' // Update this
};

async function debugDashboardErrors() {
  let authToken = null;

  try {
    console.log('🔍 Debugging Dashboard API Calls and ID Format Errors...\n');

    // Step 1: Login (you may need to create a test account first)
    console.log('1. Attempting login...');
    try {
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, TEST_CREDENTIALS);
      
      if (loginResponse.data.success) {
        authToken = loginResponse.data.data.token;
        console.log('✅ Login successful');
        console.log('   User ID:', loginResponse.data.data.user._id);
        console.log('   User Role:', loginResponse.data.data.user.role);
      } else {
        console.log('❌ Login failed:', loginResponse.data.message);
        console.log('⚠️  Please update TEST_CREDENTIALS in this script with valid restaurant account details');
        return;
      }
    } catch (error) {
      console.log('❌ Login error:', error.response?.data?.message || error.message);
      console.log('⚠️  Please ensure:');
      console.log('   1. Backend server is running on port 5000');
      console.log('   2. You have a valid restaurant account');
      console.log('   3. Update TEST_CREDENTIALS in this script');
      return;
    }

    // Step 2: Test restaurant profile
    console.log('\n2. Testing restaurant profile...');
    try {
      const restaurantResponse = await axios.get(`${BASE_URL}/restaurants/my-restaurant`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      if (restaurantResponse.data.success) {
        console.log('✅ Restaurant profile loaded');
        console.log('   Restaurant ID:', restaurantResponse.data.data._id);
        console.log('   Restaurant Name:', restaurantResponse.data.data.name);
      } else {
        console.log('⚠️  Restaurant profile issue:', restaurantResponse.data.message);
      }
    } catch (error) {
      console.log('❌ Restaurant profile error:', error.response?.data?.message || error.message);
    }

    // Step 3: Test dashboard stats endpoint
    console.log('\n3. Testing order analytics (dashboard stats)...');
    try {
      const statsResponse = await axios.get(`${BASE_URL}/orders/stats/dashboard`, {
        headers: { Authorization: `Bearer ${authToken}` },
        params: { period: 'today' }
      });
      
      if (statsResponse.data.success) {
        console.log('✅ Order analytics loaded successfully');
        console.log('   Data keys:', Object.keys(statsResponse.data.data || {}));
      } else {
        console.log('❌ Order analytics failed:', statsResponse.data.message);
      }
    } catch (error) {
      console.log('❌ Order analytics error:', error.response?.status, error.response?.data?.message || error.message);
      if (error.response?.status === 404) {
        console.log('   This endpoint might not exist - check backend routes');
      }
    }

    // Step 4: Test restaurant orders endpoint
    console.log('\n4. Testing restaurant orders...');
    try {
      const ordersResponse = await axios.get(`${BASE_URL}/orders/restaurant`, {
        headers: { Authorization: `Bearer ${authToken}` },
        params: { limit: 10, sort: '-createdAt' }
      });
      
      if (ordersResponse.data.success) {
        const orders = ordersResponse.data.data.orders || ordersResponse.data.data || [];
        console.log('✅ Restaurant orders loaded');
        console.log('   Orders count:', orders.length);
        
        // Check for invalid order IDs
        if (orders.length > 0) {
          console.log('\n   📋 Checking order IDs for validity:');
          orders.forEach((order, index) => {
            const orderId = order._id;
            const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(orderId);
            console.log(`   Order ${index + 1}: ${orderId} - ${isValidObjectId ? '✅ Valid' : '❌ INVALID'}`);
            
            if (!isValidObjectId) {
              console.log('   ⚠️  FOUND INVALID ORDER ID - This could cause "invalid order ID format" errors!');
            }
            
            // Check menu item IDs in order items
            if (order.items && order.items.length > 0) {
              console.log(`   Order ${index + 1} items:`);
              order.items.forEach((item, itemIndex) => {
                const menuItemId = item.menuItemId || item.menuItem?._id;
                const isValidMenuItemId = /^[0-9a-fA-F]{24}$/.test(menuItemId);
                console.log(`     Item ${itemIndex + 1}: ${menuItemId} - ${isValidMenuItemId ? '✅ Valid' : '❌ INVALID'}`);
                
                if (!isValidMenuItemId) {
                  console.log('     ⚠️  FOUND INVALID MENU ITEM ID - This could cause "invalid menu item ID format" errors!');
                }
              });
            }
          });
        }
      } else {
        console.log('❌ Restaurant orders failed:', ordersResponse.data.message);
      }
    } catch (error) {
      console.log('❌ Restaurant orders error:', error.response?.status, error.response?.data?.message || error.message);
    }

    // Step 5: Test menu items endpoint
    console.log('\n5. Testing menu items...');
    try {
      const menuResponse = await axios.get(`${BASE_URL}/menu`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      if (menuResponse.data.success) {
        const menuItems = menuResponse.data.data.items || menuResponse.data.data || [];
        console.log('✅ Menu items loaded');
        console.log('   Menu items count:', menuItems.length);
        
        // Check for invalid menu item IDs
        if (menuItems.length > 0) {
          console.log('\n   🍽️  Checking menu item IDs for validity:');
          menuItems.forEach((item, index) => {
            const itemId = item._id;
            const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(itemId);
            console.log(`   Item ${index + 1}: ${itemId} - ${isValidObjectId ? '✅ Valid' : '❌ INVALID'}`);
            
            if (!isValidObjectId) {
              console.log('   ⚠️  FOUND INVALID MENU ITEM ID - This could cause "invalid menu item ID format" errors!');
            }
          });
        }
      } else {
        console.log('❌ Menu items failed:', menuResponse.data.message);
      }
    } catch (error) {
      console.log('❌ Menu items error:', error.response?.status, error.response?.data?.message || error.message);
    }

    console.log('\n🎯 SUMMARY:');
    console.log('If you see any "❌ INVALID" IDs above, those are the source of your errors!');
    console.log('The "invalid menu item id format" and "invalid order id format" errors');
    console.log('are caused by API responses containing invalid MongoDB ObjectIDs.');
    console.log('\n💡 SOLUTIONS:');
    console.log('1. Check your database for corrupted data');
    console.log('2. Ensure all _id fields are valid MongoDB ObjectIDs');
    console.log('3. Add data validation in your backend before saving to database');
    console.log('4. Clean up any existing invalid data in your database');

  } catch (error) {
    console.error('❌ Debug script failed:', error.message);
  }
}

// Instructions for running this script
console.log('📝 INSTRUCTIONS:');
console.log('1. Update TEST_CREDENTIALS with your restaurant account details');
console.log('2. Make sure backend server is running on port 5000');
console.log('3. Run: node debug-dashboard-errors.js');
console.log('4. Look for any "❌ INVALID" IDs in the output');
console.log('');

// Run the debug script
debugDashboardErrors();