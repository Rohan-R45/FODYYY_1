const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

const API_BASE_URL = 'http://localhost:5000/api';

async function debugRestaurantVisibility() {
  console.log('🔍 Debugging Restaurant Visibility Issue\n');

  try {
    // Connect to MongoDB directly to check database state
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const { Restaurant, User } = require('./models');

    // Step 1: Check all restaurants in database
    console.log('\n1️⃣ Checking all restaurants in database...');
    const allRestaurants = await Restaurant.find({}).populate('ownerId', 'name email');
    console.log(`   Total restaurants in database: ${allRestaurants.length}`);
    
    if (allRestaurants.length > 0) {
      console.log('\n   Restaurant details:');
      allRestaurants.forEach((restaurant, index) => {
        console.log(`   ${index + 1}. ${restaurant.name}`);
        console.log(`      ID: ${restaurant._id}`);
        console.log(`      Owner: ${restaurant.ownerId?.name || 'Unknown'} (${restaurant.ownerId?.email || 'No email'})`);
        console.log(`      Is Active: ${restaurant.isActive}`);
        console.log(`      Address: ${restaurant.address || 'No address'}`);
        console.log(`      Cuisine: ${restaurant.cuisine?.join(', ') || 'No cuisine'}`);
        console.log(`      Created: ${restaurant.createdAt}`);
        console.log('');
      });
    }

    // Step 2: Check active restaurants
    console.log('\n2️⃣ Checking active restaurants...');
    const activeRestaurants = await Restaurant.find({ isActive: true }).populate('ownerId', 'name email');
    console.log(`   Active restaurants: ${activeRestaurants.length}`);
    
    if (activeRestaurants.length !== allRestaurants.length) {
      console.log('   ⚠️ Some restaurants are inactive!');
      const inactiveRestaurants = await Restaurant.find({ isActive: false }).populate('ownerId', 'name email');
      console.log(`   Inactive restaurants: ${inactiveRestaurants.length}`);
      inactiveRestaurants.forEach((restaurant, index) => {
        console.log(`   ${index + 1}. ${restaurant.name} (Owner: ${restaurant.ownerId?.email || 'Unknown'})`);
      });
    }

    // Step 3: Test API endpoint without filters
    console.log('\n3️⃣ Testing API endpoint without filters...');
    try {
      const response = await axios.get(`${API_BASE_URL}/restaurants`);
      if (response.data.success) {
        const apiRestaurants = response.data.data;
        console.log(`   API returned: ${apiRestaurants.length} restaurants`);
        
        if (apiRestaurants.length !== activeRestaurants.length) {
          console.log('   ⚠️ API result count doesn\'t match database active count!');
          console.log(`   Database active: ${activeRestaurants.length}`);
          console.log(`   API returned: ${apiRestaurants.length}`);
        }

        // Check which restaurants are missing from API
        const apiRestaurantIds = apiRestaurants.map(r => r._id);
        const missingFromApi = activeRestaurants.filter(r => !apiRestaurantIds.includes(r._id.toString()));
        
        if (missingFromApi.length > 0) {
          console.log('\n   🚨 Restaurants missing from API response:');
          missingFromApi.forEach((restaurant, index) => {
            console.log(`   ${index + 1}. ${restaurant.name}`);
            console.log(`      ID: ${restaurant._id}`);
            console.log(`      Owner: ${restaurant.ownerId?.email || 'Unknown'}`);
            console.log(`      Is Active: ${restaurant.isActive}`);
            console.log(`      Address: ${restaurant.address || 'No address'}`);
            console.log(`      Cuisine: ${restaurant.cuisine?.join(', ') || 'No cuisine'}`);
          });
        }

        console.log('\n   API returned restaurants:');
        apiRestaurants.forEach((restaurant, index) => {
          console.log(`   ${index + 1}. ${restaurant.name} (ID: ${restaurant._id})`);
        });
      } else {
        console.log('   ❌ API request failed:', response.data.message);
      }
    } catch (error) {
      console.log('   ❌ API request error:', error.response?.data?.message || error.message);
    }

    // Step 4: Test API endpoint with search
    console.log('\n4️⃣ Testing API endpoint with search...');
    if (allRestaurants.length > 0) {
      const testRestaurant = allRestaurants[0];
      const searchTerm = testRestaurant.name.split(' ')[0]; // Use first word of restaurant name
      
      try {
        const response = await axios.get(`${API_BASE_URL}/restaurants?search=${encodeURIComponent(searchTerm)}`);
        if (response.data.success) {
          const searchResults = response.data.data;
          console.log(`   Search for "${searchTerm}" returned: ${searchResults.length} restaurants`);
          
          const foundTestRestaurant = searchResults.find(r => r._id === testRestaurant._id.toString());
          if (foundTestRestaurant) {
            console.log(`   ✅ Test restaurant "${testRestaurant.name}" found in search results`);
          } else {
            console.log(`   ❌ Test restaurant "${testRestaurant.name}" NOT found in search results`);
          }
        } else {
          console.log('   ❌ Search API request failed:', response.data.message);
        }
      } catch (error) {
        console.log('   ❌ Search API request error:', error.response?.data?.message || error.message);
      }
    }

    // Step 5: Check for data inconsistencies
    console.log('\n5️⃣ Checking for data inconsistencies...');
    
    // Check for restaurants with missing required fields
    const restaurantsWithIssues = await Restaurant.find({
      $or: [
        { name: { $exists: false } },
        { name: '' },
        { isActive: { $exists: false } },
        { ownerId: { $exists: false } }
      ]
    });

    if (restaurantsWithIssues.length > 0) {
      console.log(`   ⚠️ Found ${restaurantsWithIssues.length} restaurants with data issues:`);
      restaurantsWithIssues.forEach((restaurant, index) => {
        console.log(`   ${index + 1}. ID: ${restaurant._id}`);
        console.log(`      Name: ${restaurant.name || 'MISSING'}`);
        console.log(`      Is Active: ${restaurant.isActive}`);
        console.log(`      Owner ID: ${restaurant.ownerId || 'MISSING'}`);
      });
    } else {
      console.log('   ✅ No data inconsistencies found');
    }

    // Step 6: Check pagination
    console.log('\n6️⃣ Testing pagination...');
    try {
      const response = await axios.get(`${API_BASE_URL}/restaurants?limit=1`);
      if (response.data.success) {
        console.log(`   ✅ Pagination test successful`);
        console.log(`   Total items: ${response.data.pagination?.totalItems || 'Unknown'}`);
        console.log(`   Current page: ${response.data.pagination?.currentPage || 'Unknown'}`);
        console.log(`   Total pages: ${response.data.pagination?.totalPages || 'Unknown'}`);
      }
    } catch (error) {
      console.log('   ❌ Pagination test failed:', error.response?.data?.message || error.message);
    }

    // Step 7: Check sorting
    console.log('\n7️⃣ Testing sorting...');
    try {
      const response = await axios.get(`${API_BASE_URL}/restaurants?sortBy=name&sortOrder=asc`);
      if (response.data.success) {
        const sortedRestaurants = response.data.data;
        console.log(`   ✅ Sorting test successful - ${sortedRestaurants.length} restaurants returned`);
        if (sortedRestaurants.length > 1) {
          console.log(`   First: ${sortedRestaurants[0].name}`);
          console.log(`   Last: ${sortedRestaurants[sortedRestaurants.length - 1].name}`);
        }
      }
    } catch (error) {
      console.log('   ❌ Sorting test failed:', error.response?.data?.message || error.message);
    }

    console.log('\n🎯 DIAGNOSIS SUMMARY:');
    console.log(`   Total restaurants in database: ${allRestaurants.length}`);
    console.log(`   Active restaurants in database: ${activeRestaurants.length}`);
    
    if (activeRestaurants.length === 0) {
      console.log('\n🚨 ROOT CAUSE: No active restaurants found!');
      console.log('   SOLUTION: Check why restaurants are marked as inactive');
    } else if (allRestaurants.length > activeRestaurants.length) {
      console.log('\n⚠️ ISSUE: Some restaurants are inactive');
      console.log('   Check the inactive restaurants listed above');
    }

  } catch (error) {
    console.error('❌ Debug script error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

// Run the debug script
if (require.main === module) {
  runDebugScript();
}

async function runDebugScript() {
  console.log('🚀 Starting Restaurant Visibility Debug Script...');
  console.log('📋 This script will:');
  console.log('   1. Check all restaurants in database');
  console.log('   2. Check active vs inactive restaurants');
  console.log('   3. Test API endpoints');
  console.log('   4. Compare database vs API results');
  console.log('   5. Identify missing restaurants');
  console.log('   6. Check for data inconsistencies');
  console.log('');
  
  await debugRestaurantVisibility();
}

module.exports = { debugRestaurantVisibility };