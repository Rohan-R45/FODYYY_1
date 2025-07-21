const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testRestaurantVisibilityFix() {
  console.log('🧪 Testing Restaurant Visibility Fix\n');

  try {
    // Test 1: Get restaurants without limit (should use default limit of 10)
    console.log('1️⃣ Testing default API call (should return 10 restaurants)...');
    try {
      const response = await axios.get(`${API_BASE_URL}/restaurants`);
      if (response.data.success) {
        const restaurants = response.data.data;
        console.log(`   ✅ API returned ${restaurants.length} restaurants`);
        console.log(`   📊 Pagination info:`);
        console.log(`      Total items: ${response.data.pagination?.totalItems || 'Unknown'}`);
        console.log(`      Current page: ${response.data.pagination?.currentPage || 'Unknown'}`);
        console.log(`      Total pages: ${response.data.pagination?.totalPages || 'Unknown'}`);
        
        if (restaurants.length === 10 && response.data.pagination?.totalItems > 10) {
          console.log('   ⚠️ This confirms the pagination issue - only showing first 10 of more restaurants');
        }
      } else {
        console.log('   ❌ API request failed:', response.data.message);
      }
    } catch (error) {
      console.log('   ❌ API request error:', error.response?.data?.message || error.message);
    }

    // Test 2: Get restaurants with high limit (should return all restaurants)
    console.log('\n2️⃣ Testing API call with high limit (should return all restaurants)...');
    try {
      const response = await axios.get(`${API_BASE_URL}/restaurants?limit=100`);
      if (response.data.success) {
        const restaurants = response.data.data;
        console.log(`   ✅ API returned ${restaurants.length} restaurants with limit=100`);
        console.log(`   📊 Pagination info:`);
        console.log(`      Total items: ${response.data.pagination?.totalItems || 'Unknown'}`);
        console.log(`      Current page: ${response.data.pagination?.currentPage || 'Unknown'}`);
        console.log(`      Total pages: ${response.data.pagination?.totalPages || 'Unknown'}`);
        
        console.log('\n   📋 All restaurants returned:');
        restaurants.forEach((restaurant, index) => {
          console.log(`      ${index + 1}. ${restaurant.name} (ID: ${restaurant._id})`);
        });
        
        if (restaurants.length === response.data.pagination?.totalItems) {
          console.log('\n   ✅ SUCCESS: All restaurants are now visible!');
        } else {
          console.log('\n   ⚠️ Still missing some restaurants');
        }
      } else {
        console.log('   ❌ API request failed:', response.data.message);
      }
    } catch (error) {
      console.log('   ❌ API request error:', error.response?.data?.message || error.message);
    }

    // Test 3: Test search functionality (should work for all restaurants)
    console.log('\n3️⃣ Testing search functionality...');
    const searchTerms = ['cafe', 'restaurant', 'mowa', 'ukusa', 'yy'];
    
    for (const term of searchTerms) {
      try {
        const response = await axios.get(`${API_BASE_URL}/restaurants?search=${encodeURIComponent(term)}&limit=100`);
        if (response.data.success) {
          const restaurants = response.data.data;
          console.log(`   Search "${term}": ${restaurants.length} results`);
          if (restaurants.length > 0) {
            restaurants.forEach(restaurant => {
              console.log(`      - ${restaurant.name}`);
            });
          }
        }
      } catch (error) {
        console.log(`   ❌ Search "${term}" failed:`, error.response?.data?.message || error.message);
      }
    }

    // Test 4: Test pagination
    console.log('\n4️⃣ Testing pagination...');
    try {
      // Get first page
      const page1Response = await axios.get(`${API_BASE_URL}/restaurants?page=1&limit=5`);
      if (page1Response.data.success) {
        console.log(`   Page 1: ${page1Response.data.data.length} restaurants`);
        
        // Get second page
        const page2Response = await axios.get(`${API_BASE_URL}/restaurants?page=2&limit=5`);
        if (page2Response.data.success) {
          console.log(`   Page 2: ${page2Response.data.data.length} restaurants`);
          
          // Check if restaurants are different
          const page1Ids = page1Response.data.data.map(r => r._id);
          const page2Ids = page2Response.data.data.map(r => r._id);
          const overlap = page1Ids.filter(id => page2Ids.includes(id));
          
          if (overlap.length === 0) {
            console.log('   ✅ Pagination working correctly - no overlap between pages');
          } else {
            console.log('   ⚠️ Pagination issue - restaurants appear on multiple pages');
          }
        }
      }
    } catch (error) {
      console.log('   ❌ Pagination test failed:', error.response?.data?.message || error.message);
    }

    // Test 5: Test sorting
    console.log('\n5️⃣ Testing sorting...');
    try {
      const response = await axios.get(`${API_BASE_URL}/restaurants?sortBy=name&sortOrder=asc&limit=100`);
      if (response.data.success) {
        const restaurants = response.data.data;
        console.log(`   ✅ Sorting test: ${restaurants.length} restaurants sorted by name`);
        console.log(`   First: ${restaurants[0]?.name}`);
        console.log(`   Last: ${restaurants[restaurants.length - 1]?.name}`);
        
        // Check if actually sorted
        const names = restaurants.map(r => r.name.toLowerCase());
        const sortedNames = [...names].sort();
        const isSorted = JSON.stringify(names) === JSON.stringify(sortedNames);
        
        if (isSorted) {
          console.log('   ✅ Restaurants are properly sorted');
        } else {
          console.log('   ⚠️ Sorting may not be working correctly');
        }
      }
    } catch (error) {
      console.log('   ❌ Sorting test failed:', error.response?.data?.message || error.message);
    }

    console.log('\n🎉 Restaurant visibility testing completed!');
    console.log('\n💡 SOLUTION SUMMARY:');
    console.log('   The issue was that the API has a default limit of 10 restaurants per page.');
    console.log('   The frontend was not specifying a limit, so only the first 10 restaurants were shown.');
    console.log('   Fix: Set limit=100 in the frontend RestaurantList component to show all restaurants.');
    console.log('\n📝 RECOMMENDATIONS:');
    console.log('   1. ✅ Immediate fix: Set high limit in frontend (already implemented)');
    console.log('   2. 🔄 Future improvement: Implement proper pagination with "Load More" or infinite scroll');
    console.log('   3. 🎯 Performance: Consider implementing virtual scrolling for large restaurant lists');
    console.log('   4. 🔍 Search: Ensure search works across all restaurants (not just current page)');

  } catch (error) {
    console.error('❌ Test script error:', error);
  }
}

// Run the test
if (require.main === module) {
  testRestaurantVisibilityFix();
}

module.exports = { testRestaurantVisibilityFix };