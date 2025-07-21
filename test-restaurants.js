// Comprehensive test script for restaurant routes
const http = require('http');

// Test data
const testData = {
  restaurantOwner: {
    name: "Restaurant Owner",
    email: "owner@restaurant.com",
    password: "password123",
    role: "restaurant",
    phone: "+1234567890"
  },
  student: {
    name: "Test Student",
    email: "student@test.com",
    password: "password123",
    role: "student",
    phone: "+1987654321",
    address: "123 Student Street, Campus City"
  },
  restaurant: {
    name: "Delicious Bites",
    description: "A cozy restaurant serving authentic Italian cuisine with fresh ingredients and traditional recipes.",
    address: "123 Main Street, Food District, City Center",
    phone: "+1555123456",
    image: "https://example.com/restaurant.jpg",
    deliveryTime: "25-35 mins",
    cuisine: ["Italian", "Mediterranean"],
    priceRange: "$$"
  }
};

// Helper function to make HTTP requests
function makeRequest(path, method = 'GET', data = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve({
            statusCode: res.statusCode,
            data: parsedData
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            data: responseData
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Test functions
async function setupTestUsers() {
  console.log('🔧 Setting up test users...\n');
  
  let restaurantToken = null;
  let studentToken = null;

  try {
    // Register restaurant owner
    const ownerResult = await makeRequest('/api/auth/register', 'POST', testData.restaurantOwner);
    if (ownerResult.statusCode === 201) {
      restaurantToken = ownerResult.data.data.token;
      console.log('✅ Restaurant owner registered successfully');
    } else if (ownerResult.statusCode === 409) {
      // User already exists, try to login
      const loginResult = await makeRequest('/api/auth/login', 'POST', {
        email: testData.restaurantOwner.email,
        password: testData.restaurantOwner.password
      });
      if (loginResult.statusCode === 200) {
        restaurantToken = loginResult.data.data.token;
        console.log('✅ Restaurant owner logged in successfully');
      }
    }

    // Register student
    const studentResult = await makeRequest('/api/auth/register', 'POST', testData.student);
    if (studentResult.statusCode === 201) {
      studentToken = studentResult.data.data.token;
      console.log('✅ Student registered successfully');
    } else if (studentResult.statusCode === 409) {
      // User already exists, try to login
      const loginResult = await makeRequest('/api/auth/login', 'POST', {
        email: testData.student.email,
        password: testData.student.password
      });
      if (loginResult.statusCode === 200) {
        studentToken = loginResult.data.data.token;
        console.log('✅ Student logged in successfully');
      }
    }

  } catch (error) {
    console.log('❌ Setup error:', error.message);
  }

  console.log('');
  return { restaurantToken, studentToken };
}

async function testPublicRoutes() {
  console.log('🧪 Testing Public Restaurant Routes...\n');

  // Test get all restaurants
  try {
    const result = await makeRequest('/api/restaurants');
    console.log(`✅ GET /api/restaurants: ${result.statusCode}`);
    if (result.data.success) {
      console.log(`   Found ${result.data.data.length} restaurants`);
      if (result.data.pagination) {
        console.log(`   Pagination: Page ${result.data.pagination.currentPage} of ${result.data.pagination.totalPages}`);
      }
    }
  } catch (error) {
    console.log(`❌ GET /api/restaurants: ${error.message}`);
  }

  // Test search functionality
  try {
    const result = await makeRequest('/api/restaurants?search=pizza&limit=5');
    console.log(`✅ GET /api/restaurants (search): ${result.statusCode}`);
    if (result.data.success) {
      console.log(`   Search results: ${result.data.data.length} restaurants`);
    }
  } catch (error) {
    console.log(`❌ GET /api/restaurants (search): ${error.message}`);
  }

  console.log('');
}

async function testRestaurantCreation(restaurantToken) {
  console.log('🧪 Testing Restaurant Creation...\n');

  if (!restaurantToken) {
    console.log('❌ No restaurant token available');
    return null;
  }

  try {
    const result = await makeRequest('/api/restaurants', 'POST', testData.restaurant, restaurantToken);
    console.log(`✅ POST /api/restaurants: ${result.statusCode}`);
    
    if (result.data.success) {
      console.log(`   Restaurant created: ${result.data.data.name}`);
      console.log(`   Restaurant ID: ${result.data.data._id}`);
      return result.data.data._id;
    } else {
      console.log(`   Error: ${result.data.message}`);
      if (result.data.errors) {
        result.data.errors.forEach(err => {
          console.log(`   - ${err.field}: ${err.message}`);
        });
      }
    }
  } catch (error) {
    console.log(`❌ POST /api/restaurants: ${error.message}`);
  }

  console.log('');
  return null;
}

async function testRestaurantDetails(restaurantId) {
  console.log('🧪 Testing Restaurant Details...\n');

  if (!restaurantId) {
    console.log('❌ No restaurant ID available');
    return;
  }

  try {
    const result = await makeRequest(`/api/restaurants/${restaurantId}`);
    console.log(`✅ GET /api/restaurants/${restaurantId}: ${result.statusCode}`);
    
    if (result.data.success) {
      const restaurant = result.data.data.restaurant;
      console.log(`   Restaurant: ${restaurant.name}`);
      console.log(`   Address: ${restaurant.address}`);
      console.log(`   Rating: ${restaurant.rating}/5`);
      console.log(`   Menu categories: ${result.data.data.stats.categoriesCount}`);
      console.log(`   Total menu items: ${result.data.data.stats.totalMenuItems}`);
    }
  } catch (error) {
    console.log(`❌ GET /api/restaurants/${restaurantId}: ${error.message}`);
  }

  console.log('');
}

async function testRestaurantUpdate(restaurantId, restaurantToken) {
  console.log('🧪 Testing Restaurant Update...\n');

  if (!restaurantId || !restaurantToken) {
    console.log('❌ Missing restaurant ID or token');
    return;
  }

  const updateData = {
    description: "Updated description: An amazing restaurant with the best Italian food in town!",
    deliveryTime: "20-30 mins",
    priceRange: "$$$"
  };

  try {
    const result = await makeRequest(`/api/restaurants/${restaurantId}`, 'PUT', updateData, restaurantToken);
    console.log(`✅ PUT /api/restaurants/${restaurantId}: ${result.statusCode}`);
    
    if (result.data.success) {
      console.log(`   Restaurant updated: ${result.data.data.name}`);
      console.log(`   New delivery time: ${result.data.data.deliveryTime}`);
      console.log(`   New price range: ${result.data.data.priceRange}`);
    } else {
      console.log(`   Error: ${result.data.message}`);
    }
  } catch (error) {
    console.log(`❌ PUT /api/restaurants/${restaurantId}: ${error.message}`);
  }

  console.log('');
}

async function testRestaurantStats(restaurantId, restaurantToken) {
  console.log('🧪 Testing Restaurant Statistics...\n');

  if (!restaurantId || !restaurantToken) {
    console.log('❌ Missing restaurant ID or token');
    return;
  }

  try {
    const result = await makeRequest(`/api/restaurants/${restaurantId}/stats`, 'GET', null, restaurantToken);
    console.log(`✅ GET /api/restaurants/${restaurantId}/stats: ${result.statusCode}`);
    
    if (result.data.success) {
      const stats = result.data.data;
      console.log(`   Restaurant: ${stats.restaurant.name}`);
      console.log(`   Rating: ${stats.restaurant.rating}/5 (${stats.restaurant.totalRatings} ratings)`);
      console.log(`   Menu items: ${stats.menu.totalItems} total, ${stats.menu.availableItems} available`);
      console.log(`   Categories: ${stats.menu.categoriesCount}`);
      console.log(`   Average price: $${stats.menu.averagePrice}`);
    }
  } catch (error) {
    console.log(`❌ GET /api/restaurants/${restaurantId}/stats: ${error.message}`);
  }

  console.log('');
}

async function testUnauthorizedAccess(restaurantId, studentToken) {
  console.log('🧪 Testing Unauthorized Access...\n');

  if (!restaurantId) {
    console.log('❌ No restaurant ID available');
    return;
  }

  // Test student trying to update restaurant
  try {
    const result = await makeRequest(`/api/restaurants/${restaurantId}`, 'PUT', 
      { name: "Hacked Restaurant" }, studentToken);
    console.log(`✅ Unauthorized update test: ${result.statusCode} (Expected 403)`);
    if (result.statusCode === 403) {
      console.log(`   Correctly blocked: ${result.data.message}`);
    }
  } catch (error) {
    console.log(`❌ Unauthorized update test: ${error.message}`);
  }

  // Test accessing without token
  try {
    const result = await makeRequest(`/api/restaurants/${restaurantId}`, 'PUT', 
      { name: "Hacked Restaurant" });
    console.log(`✅ No token test: ${result.statusCode} (Expected 401)`);
    if (result.statusCode === 401) {
      console.log(`   Correctly blocked: ${result.data.message}`);
    }
  } catch (error) {
    console.log(`❌ No token test: ${error.message}`);
  }

  console.log('');
}

async function testValidationErrors(restaurantToken) {
  console.log('🧪 Testing Validation Errors...\n');

  if (!restaurantToken) {
    console.log('❌ No restaurant token available');
    return;
  }

  const invalidData = {
    name: "A", // Too short
    description: "A".repeat(501), // Too long
    address: "Short", // Too short
    phone: "123", // Invalid
    deliveryTime: "invalid format",
    cuisine: [] // Empty array
  };

  try {
    const result = await makeRequest('/api/restaurants', 'POST', invalidData, restaurantToken);
    console.log(`✅ Validation test: ${result.statusCode} (Expected 400)`);
    
    if (result.statusCode === 400 && result.data.errors) {
      console.log(`   Validation errors caught: ${result.data.errors.length}`);
      result.data.errors.forEach(err => {
        console.log(`   - ${err.field}: ${err.message}`);
      });
    }
  } catch (error) {
    console.log(`❌ Validation test: ${error.message}`);
  }

  console.log('');
}

async function testRestaurantDeactivation(restaurantId, restaurantToken) {
  console.log('🧪 Testing Restaurant Deactivation...\n');

  if (!restaurantId || !restaurantToken) {
    console.log('❌ Missing restaurant ID or token');
    return;
  }

  try {
    const result = await makeRequest(`/api/restaurants/${restaurantId}`, 'DELETE', null, restaurantToken);
    console.log(`✅ DELETE /api/restaurants/${restaurantId}: ${result.statusCode}`);
    
    if (result.data.success) {
      console.log(`   Restaurant deactivated: ${result.data.data.name}`);
      console.log(`   Active status: ${result.data.data.isActive}`);
    }
  } catch (error) {
    console.log(`❌ DELETE /api/restaurants/${restaurantId}: ${error.message}`);
  }

  // Test reactivation
  try {
    const result = await makeRequest(`/api/restaurants/${restaurantId}/reactivate`, 'PATCH', null, restaurantToken);
    console.log(`✅ PATCH /api/restaurants/${restaurantId}/reactivate: ${result.statusCode}`);
    
    if (result.data.success) {
      console.log(`   Restaurant reactivated: ${result.data.data.name}`);
      console.log(`   Active status: ${result.data.data.isActive}`);
    }
  } catch (error) {
    console.log(`❌ PATCH /api/restaurants/${restaurantId}/reactivate: ${error.message}`);
  }

  console.log('');
}

// Main test runner
async function runAllTests() {
  console.log('🚀 FODYYY Restaurant Routes Test Suite\n');
  console.log('=' .repeat(60));
  
  try {
    // Setup
    const { restaurantToken, studentToken } = await setupTestUsers();
    
    // Test public routes
    await testPublicRoutes();
    
    // Test restaurant creation
    const restaurantId = await testRestaurantCreation(restaurantToken);
    
    // Test restaurant details
    await testRestaurantDetails(restaurantId);
    
    // Test restaurant update
    await testRestaurantUpdate(restaurantId, restaurantToken);
    
    // Test restaurant statistics
    await testRestaurantStats(restaurantId, restaurantToken);
    
    // Test unauthorized access
    await testUnauthorizedAccess(restaurantId, studentToken);
    
    // Test validation errors
    await testValidationErrors(restaurantToken);
    
    // Test deactivation/reactivation
    await testRestaurantDeactivation(restaurantId, restaurantToken);
    
    console.log('🎉 All restaurant tests completed!');
    console.log('=' .repeat(60));
    
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  }
}

// Check if server is running
async function checkServer() {
  try {
    await makeRequest('/api/health');
    return true;
  } catch (error) {
    return false;
  }
}

// Start tests
async function startTests() {
  console.log('Checking if server is running...');
  
  const serverRunning = await checkServer();
  if (!serverRunning) {
    console.log('❌ Server is not running!');
    console.log('Please start the server with: npm run dev');
    console.log('Then run this test with: node test-restaurants.js');
    return;
  }
  
  console.log('✅ Server is running, starting tests...\n');
  await runAllTests();
}

startTests();