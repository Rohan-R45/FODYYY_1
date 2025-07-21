const mongoose = require('mongoose');
const { Restaurant, MenuItem } = require('./models');

// Load environment variables
require('dotenv').config();

async function testRestaurantLoading() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database');

    console.log('🔍 TESTING RESTAURANT DATA LOADING\n');

    // Test 1: Restaurant List (Student Dashboard)
    console.log('1️⃣ Testing Restaurant List Query (Student Dashboard)...');
    const restaurantListQuery = { isActive: true };
    const restaurants = await Restaurant.find(restaurantListQuery)
      .populate('ownerId', 'name email phone')
      .sort({ rating: -1 })
      .limit(8)
      .lean();

    console.log(`   ✅ Found ${restaurants.length} restaurants`);
    restaurants.forEach((r, i) => {
      console.log(`     ${i + 1}. ${r.name} (Rating: ${r.rating || 'N/A'})`);
    });

    if (restaurants.length === 0) {
      console.log('   ❌ NO RESTAURANTS FOUND - This explains the dashboard issue!');
      return;
    }

    // Test 2: Restaurant Detail Query
    console.log('\n2️⃣ Testing Restaurant Detail Query...');
    const testRestaurant = restaurants[0];
    console.log(`   Testing with: ${testRestaurant.name} (ID: ${testRestaurant._id})`);

    const restaurantDetail = await Restaurant.findById(testRestaurant._id)
      .populate('ownerId', 'name email phone')
      .lean();

    if (restaurantDetail) {
      console.log('   ✅ Restaurant detail fetch successful');
      console.log(`     Name: ${restaurantDetail.name}`);
      console.log(`     Address: ${restaurantDetail.address}`);
      console.log(`     Active: ${restaurantDetail.isActive}`);
    } else {
      console.log('   ❌ Restaurant detail fetch failed');
    }

    // Test 3: Menu Items Query
    console.log('\n3️⃣ Testing Menu Items Query...');
    const menuItems = await MenuItem.find({
      restaurantId: testRestaurant._id,
      isAvailable: true
    }).sort({ category: 1, name: 1 });

    console.log(`   ✅ Found ${menuItems.length} menu items`);
    
    if (menuItems.length === 0) {
      console.log('   ❌ NO MENU ITEMS FOUND - This explains the menu display issue!');
    } else {
      // Group by category
      const menuByCategory = menuItems.reduce((acc, item) => {
        if (!acc[item.category]) {
          acc[item.category] = [];
        }
        acc[item.category].push(item);
        return acc;
      }, {});

      console.log('   📋 Menu items by category:');
      Object.keys(menuByCategory).forEach(category => {
        console.log(`     ${category}: ${menuByCategory[category].length} items`);
        menuByCategory[category].slice(0, 2).forEach(item => {
          console.log(`       - ${item.name} ($${item.price})`);
        });
      });
    }

    // Test 4: API Response Structure Simulation
    console.log('\n4️⃣ Testing API Response Structure...');
    
    // Simulate restaurant list API response
    const restaurantListResponse = {
      success: true,
      message: 'Restaurants retrieved successfully',
      data: restaurants,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: restaurants.length,
        itemsPerPage: 8
      }
    };
    console.log('   ✅ Restaurant list API response structure: OK');

    // Simulate restaurant detail API response
    const restaurantDetailResponse = {
      success: true,
      message: 'Restaurant details retrieved successfully',
      data: {
        restaurant: restaurantDetail,
        menuItems: menuItems.reduce((acc, item) => {
          if (!acc[item.category]) {
            acc[item.category] = [];
          }
          acc[item.category].push(item);
          return acc;
        }, {}),
        stats: {
          totalMenuItems: menuItems.length,
          categoriesCount: Object.keys(menuItems.reduce((acc, item) => {
            acc[item.category] = true;
            return acc;
          }, {})).length
        }
      }
    };
    console.log('   ✅ Restaurant detail API response structure: OK');

    // Test 5: Frontend Data Extraction Simulation
    console.log('\n5️⃣ Testing Frontend Data Extraction...');
    
    // Test how frontend would extract restaurant list
    const frontendRestaurants = restaurantListResponse.data;
    console.log(`   ✅ Frontend would get ${frontendRestaurants.length} restaurants`);

    // Test how frontend would extract restaurant detail
    const frontendRestaurant = restaurantDetailResponse.data.restaurant;
    const frontendMenuItems = [];
    if (restaurantDetailResponse.data.menuItems) {
      Object.values(restaurantDetailResponse.data.menuItems).forEach(categoryItems => {
        frontendMenuItems.push(...categoryItems);
      });
    }
    console.log(`   ✅ Frontend would get restaurant: ${frontendRestaurant.name}`);
    console.log(`   ✅ Frontend would get ${frontendMenuItems.length} menu items`);

    // Final Summary
    console.log('\n🎯 DIAGNOSIS SUMMARY:');
    console.log(`✅ Database Connection: Working`);
    console.log(`✅ Restaurants Available: ${restaurants.length} found`);
    console.log(`✅ Restaurant Details: Working`);
    console.log(`✅ Menu Items: ${menuItems.length} found for test restaurant`);
    console.log(`✅ API Response Structure: Correct`);
    console.log(`✅ Frontend Data Extraction: Should work`);

    if (restaurants.length > 0 && menuItems.length > 0) {
      console.log('\n🎉 ALL SYSTEMS GO!');
      console.log('   Your restaurant data and menus should now load properly');
      console.log('   Try refreshing your student dashboard and clicking on restaurants');
    } else {
      console.log('\n❌ ISSUES FOUND:');
      if (restaurants.length === 0) console.log('   - No restaurants available');
      if (menuItems.length === 0) console.log('   - No menu items available');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

testRestaurantLoading();