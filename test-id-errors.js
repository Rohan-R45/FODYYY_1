const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test credentials - UPDATE THESE WITH YOUR ACTUAL RESTAURANT ACCOUNT
const TEST_CREDENTIALS = {
  email: 'restaurant@test.com', // UPDATE THIS
  password: 'password123' // UPDATE THIS
};

async function testIdErrors() {
  let authToken = null;

  console.log('🔍 TESTING ID FORMAT ERRORS - COMPREHENSIVE ANALYSIS\n');

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
        console.log('   1. Create a restaurant account in your app');
        console.log('   2. Update email and password in this script');
        console.log('   3. Run this script again');
        return;
      }
    } catch (error) {
      console.log('❌ Login error:', error.response?.data?.message || error.message);
      console.log('\n⚠️  TROUBLESHOOTING:');
      console.log('   1. Make sure backend is running on port 5000');
      console.log('   2. Create a restaurant account in your app');
      console.log('   3. Update TEST_CREDENTIALS in this script');
      return;
    }

    // Step 2: Test Restaurant Profile
    console.log('\n2️⃣ TESTING RESTAURANT PROFILE...');
    try {
      const restaurantResponse = await axios.get(`${BASE_URL}/restaurants/my-restaurant`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      if (restaurantResponse.data.success) {
        const restaurant = restaurantResponse.data.data;
        console.log('✅ Restaurant profile loaded');
        console.log(`   Restaurant ID: ${restaurant._id}`);
        console.log(`   Restaurant Name: ${restaurant.name}`);
        console.log(`   Owner ID: ${restaurant.ownerId}`);
        
        // Validate restaurant ID format
        const isValidRestaurantId = /^[0-9a-fA-F]{24}$/.test(restaurant._id);
        console.log(`   ID Format Valid: ${isValidRestaurantId ? '✅' : '❌'}`);
        
        if (!isValidRestaurantId) {
          console.log('   🚨 FOUND INVALID RESTAURANT ID - THIS IS THE SOURCE OF YOUR ERRORS!');
        }
      } else {
        console.log('⚠️  Restaurant profile issue:', restaurantResponse.data.message);
        if (restaurantResponse.data.message.includes('not found')) {
          console.log('   💡 You need to complete restaurant setup first');
        }
      }
    } catch (error) {
      console.log('❌ Restaurant profile error:', error.response?.data?.message || error.message);
    }

    // Step 3: Test Dashboard Analytics (the endpoint that was wrong)
    console.log('\n3️⃣ TESTING DASHBOARD ANALYTICS...');
    try {
      const analyticsResponse = await axios.get(`${BASE_URL}/orders/stats/dashboard`, {
        headers: { Authorization: `Bearer ${authToken}` },
        params: { period: 'today' }
      });
      
      if (analyticsResponse.data.success) {
        console.log('✅ Dashboard analytics loaded successfully');
        console.log('   Data keys:', Object.keys(analyticsResponse.data.data || {}));
      } else {
        console.log('❌ Dashboard analytics failed:', analyticsResponse.data.message);
      }
    } catch (error) {
      console.log('❌ Dashboard analytics error:', error.response?.status, error.response?.data?.message || error.message);
      if (error.response?.status === 404) {
        console.log('   💡 This endpoint might not exist - check backend routes');
      }
    }

    // Step 4: Test Restaurant Orders
    console.log('\n4️⃣ TESTING RESTAURANT ORDERS...');
    try {
      const ordersResponse = await axios.get(`${BASE_URL}/orders/restaurant`, {
        headers: { Authorization: `Bearer ${authToken}` },
        params: { limit: 10, sort: '-createdAt' }
      });
      
      if (ordersResponse.data.success) {
        const orders = ordersResponse.data.data.orders || ordersResponse.data.data || [];
        console.log('✅ Restaurant orders loaded');
        console.log(`   Orders count: ${orders.length}`);
        
        if (orders.length > 0) {
          console.log('\n   🔍 ANALYZING ORDER IDS:');
          orders.forEach((order, index) => {
            const orderId = order._id;
            const isValidOrderId = /^[0-9a-fA-F]{24}$/.test(orderId);
            console.log(`   Order ${index + 1}: ${orderId} - ${isValidOrderId ? '✅' : '❌ INVALID!'}`);
            
            if (!isValidOrderId) {
              console.log('   🚨 FOUND INVALID ORDER ID - THIS CAUSES "invalid order ID format" ERRORS!');
            }
            
            // Check order items
            if (order.items && order.items.length > 0) {
              console.log(`   Order ${index + 1} items:`);
              order.items.forEach((item, itemIndex) => {
                const menuItemId = item.menuItemId || item.menuItem?._id;
                if (menuItemId) {
                  const isValidMenuItemId = /^[0-9a-fA-F]{24}$/.test(menuItemId);
                  console.log(`     Item ${itemIndex + 1}: ${menuItemId} - ${isValidMenuItemId ? '✅' : '❌ INVALID!'}`);
                  
                  if (!isValidMenuItemId) {
                    console.log('     🚨 FOUND INVALID MENU ITEM ID - THIS CAUSES "invalid menu item ID format" ERRORS!');
                  }
                }
              });
            }
          });
        } else {
          console.log('   📝 No orders found - this is normal for new restaurants');
        }
      } else {
        console.log('❌ Restaurant orders failed:', ordersResponse.data.message);
      }
    } catch (error) {
      console.log('❌ Restaurant orders error:', error.response?.status, error.response?.data?.message || error.message);
    }

    // Step 5: Test Menu Items
    console.log('\n5️⃣ TESTING MENU ITEMS...');
    try {
      const menuResponse = await axios.get(`${BASE_URL}/menu`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      if (menuResponse.data.success) {
        const menuItems = menuResponse.data.data.items || menuResponse.data.data || [];
        console.log('✅ Menu items loaded');
        console.log(`   Menu items count: ${menuItems.length}`);
        
        if (menuItems.length > 0) {
          console.log('\n   🔍 ANALYZING MENU ITEM IDS:');
          menuItems.forEach((item, index) => {
            const itemId = item._id;
            const isValidItemId = /^[0-9a-fA-F]{24}$/.test(itemId);
            console.log(`   Item ${index + 1}: ${itemId} - ${isValidItemId ? '✅' : '❌ INVALID!'}`);
            
            if (!isValidItemId) {
              console.log('   🚨 FOUND INVALID MENU ITEM ID - THIS CAUSES "invalid menu item ID format" ERRORS!');
            }
            
            // Check restaurant ID reference
            const restaurantId = item.restaurantId;
            if (restaurantId) {
              const isValidRestaurantRef = /^[0-9a-fA-F]{24}$/.test(restaurantId);
              console.log(`   Item ${index + 1} restaurant ref: ${restaurantId} - ${isValidRestaurantRef ? '✅' : '❌ INVALID!'}`);
            }
          });
        } else {
          console.log('   📝 No menu items found - add some items to test');
        }
      } else {
        console.log('❌ Menu items failed:', menuResponse.data.message);
      }
    } catch (error) {
      console.log('❌ Menu items error:', error.response?.status, error.response?.data?.message || error.message);
    }

    // Step 6: Test Invalid ID Scenarios
    console.log('\n6️⃣ TESTING INVALID ID SCENARIOS...');
    
    // Test with obviously invalid IDs
    const invalidIds = ['undefined', 'null', '', '123', 'invalid-id', '507f1f77bcf86cd799439011x'];
    
    for (const invalidId of invalidIds) {
      console.log(`\n   Testing with invalid ID: "${invalidId}"`);
      
      try {
        await axios.get(`${BASE_URL}/menu/${invalidId}`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        console.log('   ⚠️  Request succeeded (unexpected)');
      } catch (error) {
        if (error.response?.status === 400 && error.response?.data?.message?.includes('Invalid')) {
          console.log('   ✅ Properly rejected with validation error');
        } else {
          console.log('   ❌ Unexpected error:', error.response?.data?.message || error.message);
        }
      }
    }

    console.log('\n🎯 ANALYSIS COMPLETE!');
    console.log('\n📋 SUMMARY:');
    console.log('Look for any "❌ INVALID!" or "🚨 FOUND INVALID" messages above.');
    console.log('Those indicate the exact source of your ID format errors.');
    console.log('\n💡 SOLUTIONS:');
    console.log('1. If you see invalid restaurant ID: Check your restaurant setup');
    console.log('2. If you see invalid order IDs: Clean up your orders database');
    console.log('3. If you see invalid menu item IDs: Clean up your menu items database');
    console.log('4. The frontend now filters out invalid data automatically');
    console.log('5. The backend now validates IDs before database queries');

  } catch (error) {
    console.error('❌ Test script failed:', error.message);
  }
}

// Instructions
console.log('📝 INSTRUCTIONS:');
console.log('1. Update TEST_CREDENTIALS with your restaurant account details');
console.log('2. Make sure backend server is running on port 5000');
console.log('3. Run: node test-id-errors.js');
console.log('4. Look for "❌ INVALID!" messages to find the source of errors');
console.log('');

// Run the test
testIdErrors();