// Comprehensive test script for menu routes
const http = require('http');

// Test data
const testData = {
  restaurantOwner: {
    name: "Menu Test Owner",
    email: "menuowner@restaurant.com",
    password: "password123",
    role: "restaurant",
    phone: "+1234567890"
  },
  student: {
    name: "Menu Test Student",
    email: "menustudent@test.com",
    password: "password123",
    role: "student",
    phone: "+1987654321",
    address: "123 Student Street, Campus City"
  },
  restaurant: {
    name: "Menu Test Restaurant",
    description: "A test restaurant for menu testing",
    address: "123 Menu Street, Test District, City Center",
    phone: "+1555123456",
    deliveryTime: "25-35 mins",
    cuisine: ["Italian", "American"],
    priceRange: "$$"
  },
  menuItems: [
    {
      name: "Margherita Pizza",
      description: "Classic pizza with fresh tomatoes, mozzarella, and basil",
      price: 12.99,
      category: "Main Course",
      preparationTime: 20,
      ingredients: ["Tomato sauce", "Mozzarella cheese", "Fresh basil", "Olive oil"],
      allergens: ["Dairy", "Gluten"],
      isVegetarian: true,
      isVegan: false,
      spiceLevel: "Mild",
      nutritionalInfo: {
        calories: 280,
        protein: 12,
        carbs: 35,
        fat: 10
      }
    },
    {
      name: "Caesar Salad",
      description: "Fresh romaine lettuce with Caesar dressing and croutons",
      price: 8.50,
      category: "Appetizer",
      preparationTime: 10,
      ingredients: ["Romaine lettuce", "Caesar dressing", "Croutons", "Parmesan cheese"],
      allergens: ["Dairy", "Eggs"],
      isVegetarian: true,
      isVegan: false,
      spiceLevel: "Not Applicable"
    },
    {
      name: "Chocolate Brownie",
      description: "Rich chocolate brownie with vanilla ice cream",
      price: 6.99,
      category: "Dessert",
      preparationTime: 5,
      ingredients: ["Chocolate", "Flour", "Sugar", "Eggs", "Vanilla ice cream"],
      allergens: ["Dairy", "Eggs", "Gluten"],
      isVegetarian: true,
      isVegan: false,
      spiceLevel: "Not Applicable"
    },
    {
      name: "Fresh Orange Juice",
      description: "Freshly squeezed orange juice",
      price: 3.99,
      category: "Beverages",
      preparationTime: 3,
      ingredients: ["Fresh oranges"],
      allergens: [],
      isVegetarian: true,
      isVegan: true,
      spiceLevel: "Not Applicable"
    }
  ]
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
async function setupTestData() {
  console.log('🔧 Setting up test data...\n');
  
  let restaurantToken = null;
  let studentToken = null;
  let restaurantId = null;

  try {
    // Register/login restaurant owner
    const ownerResult = await makeRequest('/api/auth/register', 'POST', testData.restaurantOwner);
    if (ownerResult.statusCode === 201) {
      restaurantToken = ownerResult.data.data.token;
      console.log('✅ Restaurant owner registered successfully');
    } else if (ownerResult.statusCode === 409) {
      const loginResult = await makeRequest('/api/auth/login', 'POST', {
        email: testData.restaurantOwner.email,
        password: testData.restaurantOwner.password
      });
      if (loginResult.statusCode === 200) {
        restaurantToken = loginResult.data.data.token;
        console.log('✅ Restaurant owner logged in successfully');
      }
    }

    // Register/login student
    const studentResult = await makeRequest('/api/auth/register', 'POST', testData.student);
    if (studentResult.statusCode === 201) {
      studentToken = studentResult.data.data.token;
      console.log('✅ Student registered successfully');
    } else if (studentResult.statusCode === 409) {
      const loginResult = await makeRequest('/api/auth/login', 'POST', {
        email: testData.student.email,
        password: testData.student.password
      });
      if (loginResult.statusCode === 200) {
        studentToken = loginResult.data.data.token;
        console.log('✅ Student logged in successfully');
      }
    }

    // Create restaurant
    if (restaurantToken) {
      const restaurantResult = await makeRequest('/api/restaurants', 'POST', testData.restaurant, restaurantToken);
      if (restaurantResult.statusCode === 201) {
        restaurantId = restaurantResult.data.data._id;
        console.log('✅ Restaurant created successfully');
      } else if (restaurantResult.statusCode === 409) {
        // Restaurant already exists, get it
        const restaurantsResult = await makeRequest('/api/restaurants');
        if (restaurantsResult.data.success && restaurantsResult.data.data.length > 0) {
          const userRestaurant = restaurantsResult.data.data.find(r => r.name === testData.restaurant.name);
          if (userRestaurant) {
            restaurantId = userRestaurant._id;
            console.log('✅ Restaurant found successfully');
          }
        }
      }
    }

  } catch (error) {
    console.log('❌ Setup error:', error.message);
  }

  console.log('');
  return { restaurantToken, studentToken, restaurantId };
}

async function testMenuItemCreation(restaurantToken, restaurantId) {
  console.log('🧪 Testing Menu Item Creation...\n');

  if (!restaurantToken || !restaurantId) {
    console.log('❌ Missing restaurant token or ID');
    return [];
  }

  const createdItems = [];

  for (const [index, menuItem] of testData.menuItems.entries()) {
    try {
      const menuItemData = { ...menuItem, restaurantId };
      const result = await makeRequest('/api/menu', 'POST', menuItemData, restaurantToken);
      
      console.log(`✅ POST /api/menu (${menuItem.name}): ${result.statusCode}`);
      
      if (result.data.success) {
        console.log(`   Created: ${result.data.data.name} - $${result.data.data.price}`);
        console.log(`   Category: ${result.data.data.category}`);
        createdItems.push(result.data.data._id);
      } else {
        console.log(`   Error: ${result.data.message}`);
        if (result.data.errors) {
          result.data.errors.forEach(err => {
            console.log(`   - ${err.field}: ${err.message}`);
          });
        }
      }
    } catch (error) {
      console.log(`❌ POST /api/menu (${menuItem.name}): ${error.message}`);
    }
  }

  console.log('');
  return createdItems;
}

async function testGetMenuItems(restaurantId) {
  console.log('🧪 Testing Get Menu Items...\n');

  if (!restaurantId) {
    console.log('❌ No restaurant ID available');
    return;
  }

  // Test get all menu items
  try {
    const result = await makeRequest(`/api/menu/restaurant/${restaurantId}`);
    console.log(`✅ GET /api/menu/restaurant/${restaurantId}: ${result.statusCode}`);
    
    if (result.data.success) {
      const stats = result.data.data.stats;
      console.log(`   Total items: ${stats.totalItems}`);
      console.log(`   Categories: ${stats.categoriesCount}`);
      console.log(`   Average price: $${stats.averagePrice}`);
      console.log(`   Vegetarian items: ${stats.vegetarianCount}`);
      console.log(`   Vegan items: ${stats.veganCount}`);
      
      const menuItems = result.data.data.menuItems;
      Object.keys(menuItems).forEach(category => {
        console.log(`   ${category}: ${menuItems[category].length} items`);
      });
    }
  } catch (error) {
    console.log(`❌ GET /api/menu/restaurant/${restaurantId}: ${error.message}`);
  }

  // Test with filters
  try {
    const result = await makeRequest(`/api/menu/restaurant/${restaurantId}?category=Main Course&vegetarian=true`);
    console.log(`✅ GET /api/menu/restaurant/${restaurantId} (filtered): ${result.statusCode}`);
    
    if (result.data.success) {
      console.log(`   Filtered results: ${result.data.data.stats.totalItems} items`);
    }
  } catch (error) {
    console.log(`❌ GET /api/menu/restaurant/${restaurantId} (filtered): ${error.message}`);
  }

  // Test search
  try {
    const result = await makeRequest(`/api/menu/restaurant/${restaurantId}?search=pizza`);
    console.log(`✅ GET /api/menu/restaurant/${restaurantId} (search): ${result.statusCode}`);
    
    if (result.data.success) {
      console.log(`   Search results: ${result.data.data.stats.totalItems} items`);
    }
  } catch (error) {
    console.log(`❌ GET /api/menu/restaurant/${restaurantId} (search): ${error.message}`);
  }

  console.log('');
}

async function testMenuItemUpdate(menuItemIds, restaurantToken) {
  console.log('🧪 Testing Menu Item Update...\n');

  if (!menuItemIds.length || !restaurantToken) {
    console.log('❌ Missing menu item IDs or token');
    return;
  }

  const menuItemId = menuItemIds[0]; // Update first item
  const updateData = {
    name: "Updated Margherita Pizza",
    description: "Updated description: Premium pizza with the finest ingredients",
    price: 14.99,
    preparationTime: 25,
    spiceLevel: "Medium"
  };

  try {
    const result = await makeRequest(`/api/menu/${menuItemId}`, 'PUT', updateData, restaurantToken);
    console.log(`✅ PUT /api/menu/${menuItemId}: ${result.statusCode}`);
    
    if (result.data.success) {
      console.log(`   Updated: ${result.data.data.name}`);
      console.log(`   New price: $${result.data.data.price}`);
      console.log(`   New preparation time: ${result.data.data.preparationTime} mins`);
    } else {
      console.log(`   Error: ${result.data.message}`);
    }
  } catch (error) {
    console.log(`❌ PUT /api/menu/${menuItemId}: ${error.message}`);
  }

  console.log('');
}

async function testMenuItemToggle(menuItemIds, restaurantToken) {
  console.log('🧪 Testing Menu Item Toggle...\n');

  if (!menuItemIds.length || !restaurantToken) {
    console.log('❌ Missing menu item IDs or token');
    return;
  }

  const menuItemId = menuItemIds[1]; // Toggle second item

  try {
    const result = await makeRequest(`/api/menu/${menuItemId}/toggle`, 'PUT', null, restaurantToken);
    console.log(`✅ PUT /api/menu/${menuItemId}/toggle: ${result.statusCode}`);
    
    if (result.data.success) {
      console.log(`   ${result.data.data.name}: ${result.data.data.isAvailable ? 'Available' : 'Unavailable'}`);
    }
  } catch (error) {
    console.log(`❌ PUT /api/menu/${menuItemId}/toggle: ${error.message}`);
  }

  // Toggle back
  try {
    const result = await makeRequest(`/api/menu/${menuItemId}/toggle`, 'PUT', null, restaurantToken);
    console.log(`✅ PUT /api/menu/${menuItemId}/toggle (back): ${result.statusCode}`);
    
    if (result.data.success) {
      console.log(`   ${result.data.data.name}: ${result.data.data.isAvailable ? 'Available' : 'Unavailable'}`);
    }
  } catch (error) {
    console.log(`❌ PUT /api/menu/${menuItemId}/toggle (back): ${error.message}`);
  }

  console.log('');
}

async function testBulkToggle(menuItemIds, restaurantToken) {
  console.log('🧪 Testing Bulk Menu Item Toggle...\n');

  if (!menuItemIds.length || !restaurantToken) {
    console.log('❌ Missing menu item IDs or token');
    return;
  }

  const bulkData = {
    menuItemIds: menuItemIds.slice(0, 2), // First two items
    isAvailable: false
  };

  try {
    const result = await makeRequest('/api/menu/bulk/toggle', 'PUT', bulkData, restaurantToken);
    console.log(`✅ PUT /api/menu/bulk/toggle: ${result.statusCode}`);
    
    if (result.data.success) {
      console.log(`   Updated ${result.data.data.modifiedCount} items`);
      console.log(`   Set availability to: ${result.data.data.isAvailable}`);
    }
  } catch (error) {
    console.log(`❌ PUT /api/menu/bulk/toggle: ${error.message}`);
  }

  // Toggle back to available
  bulkData.isAvailable = true;
  try {
    const result = await makeRequest('/api/menu/bulk/toggle', 'PUT', bulkData, restaurantToken);
    console.log(`✅ PUT /api/menu/bulk/toggle (back): ${result.statusCode}`);
    
    if (result.data.success) {
      console.log(`   Updated ${result.data.data.modifiedCount} items back to available`);
    }
  } catch (error) {
    console.log(`❌ PUT /api/menu/bulk/toggle (back): ${error.message}`);
  }

  console.log('');
}

async function testUnauthorizedAccess(menuItemIds, studentToken) {
  console.log('🧪 Testing Unauthorized Access...\n');

  if (!menuItemIds.length) {
    console.log('❌ No menu item IDs available');
    return;
  }

  const menuItemId = menuItemIds[0];

  // Test student trying to update menu item
  try {
    const result = await makeRequest(`/api/menu/${menuItemId}`, 'PUT', 
      { name: "Hacked Menu Item" }, studentToken);
    console.log(`✅ Unauthorized update test: ${result.statusCode} (Expected 403)`);
    if (result.statusCode === 403) {
      console.log(`   Correctly blocked: ${result.data.message}`);
    }
  } catch (error) {
    console.log(`❌ Unauthorized update test: ${error.message}`);
  }

  // Test accessing without token
  try {
    const result = await makeRequest(`/api/menu/${menuItemId}`, 'PUT', 
      { name: "Hacked Menu Item" });
    console.log(`✅ No token test: ${result.statusCode} (Expected 401)`);
    if (result.statusCode === 401) {
      console.log(`   Correctly blocked: ${result.data.message}`);
    }
  } catch (error) {
    console.log(`❌ No token test: ${error.message}`);
  }

  console.log('');
}

async function testValidationErrors(restaurantToken, restaurantId) {
  console.log('🧪 Testing Validation Errors...\n');

  if (!restaurantToken || !restaurantId) {
    console.log('❌ Missing restaurant token or ID');
    return;
  }

  const invalidData = {
    restaurantId,
    name: "A", // Too short
    description: "A".repeat(301), // Too long
    price: -5, // Negative price
    category: "Invalid Category", // Invalid category
    preparationTime: 150, // Too long
    allergens: ["Invalid Allergen"], // Invalid allergen
    spiceLevel: "Super Hot" // Invalid spice level
  };

  try {
    const result = await makeRequest('/api/menu', 'POST', invalidData, restaurantToken);
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

async function testMenuItemDeletion(menuItemIds, restaurantToken) {
  console.log('🧪 Testing Menu Item Deletion...\n');

  if (!menuItemIds.length || !restaurantToken) {
    console.log('❌ Missing menu item IDs or token');
    return;
  }

  const menuItemId = menuItemIds[menuItemIds.length - 1]; // Delete last item

  try {
    const result = await makeRequest(`/api/menu/${menuItemId}`, 'DELETE', null, restaurantToken);
    console.log(`✅ DELETE /api/menu/${menuItemId}: ${result.statusCode}`);
    
    if (result.data.success) {
      console.log(`   Deleted: ${result.data.data.name}`);
    }
  } catch (error) {
    console.log(`❌ DELETE /api/menu/${menuItemId}: ${error.message}`);
  }

  console.log('');
}

// Main test runner
async function runAllTests() {
  console.log('🚀 FODYYY Menu Routes Test Suite\n');
  console.log('=' .repeat(60));
  
  try {
    // Setup
    const { restaurantToken, studentToken, restaurantId } = await setupTestData();
    
    // Test menu item creation
    const menuItemIds = await testMenuItemCreation(restaurantToken, restaurantId);
    
    // Test getting menu items
    await testGetMenuItems(restaurantId);
    
    // Test menu item update
    await testMenuItemUpdate(menuItemIds, restaurantToken);
    
    // Test menu item toggle
    await testMenuItemToggle(menuItemIds, restaurantToken);
    
    // Test bulk toggle
    await testBulkToggle(menuItemIds, restaurantToken);
    
    // Test unauthorized access
    await testUnauthorizedAccess(menuItemIds, studentToken);
    
    // Test validation errors
    await testValidationErrors(restaurantToken, restaurantId);
    
    // Test menu item deletion
    await testMenuItemDeletion(menuItemIds, restaurantToken);
    
    console.log('🎉 All menu tests completed!');
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
    console.log('Then run this test with: node test-menu.js');
    return;
  }
  
  console.log('✅ Server is running, starting tests...\n');
  await runAllTests();
}

startTests();