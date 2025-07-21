// Comprehensive test script for order management routes
const http = require('http');

// Test data
const testData = {
  restaurantOwner: {
    name: "Order Test Owner",
    email: "orderowner@restaurant.com",
    password: "password123",
    role: "restaurant",
    phone: "+1234567890"
  },
  student: {
    name: "Order Test Student",
    email: "orderstudent@test.com",
    password: "password123",
    role: "student",
    phone: "+1987654321",
    address: "123 Student Street, Campus City"
  },
  restaurant: {
    name: "Order Test Restaurant",
    description: "A test restaurant for order testing",
    address: "123 Order Street, Test District, City Center",
    phone: "+1555123456",
    deliveryTime: "25-35 mins",
    cuisine: ["Italian", "American"],
    priceRange: "$$"
  },
  menuItems: [
    {
      name: "Test Pizza",
      description: "Delicious test pizza",
      price: 15.99,
      category: "Main Course",
      preparationTime: 20,
      ingredients: ["Cheese", "Tomato", "Dough"],
      isVegetarian: true,
      isVegan: false
    },
    {
      name: "Test Burger",
      description: "Juicy test burger",
      price: 12.50,
      category: "Main Course",
      preparationTime: 15,
      ingredients: ["Beef", "Bun", "Lettuce"],
      isVegetarian: false,
      isVegan: false
    },
    {
      name: "Test Salad",
      description: "Fresh test salad",
      price: 8.99,
      category: "Appetizer",
      preparationTime: 10,
      ingredients: ["Lettuce", "Tomato", "Cucumber"],
      isVegetarian: true,
      isVegan: true
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
  console.log('🔧 Setting up test data for orders...\n');
  
  let restaurantToken = null;
  let studentToken = null;
  let restaurantId = null;
  let menuItemIds = [];

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
        // Restaurant already exists, find it
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

    // Create menu items
    if (restaurantToken && restaurantId) {
      for (const menuItem of testData.menuItems) {
        const menuItemData = { ...menuItem, restaurantId };
        const result = await makeRequest('/api/menu', 'POST', menuItemData, restaurantToken);
        if (result.statusCode === 201) {
          menuItemIds.push(result.data.data._id);
          console.log(`✅ Menu item created: ${menuItem.name}`);
        } else if (result.statusCode === 409) {
          // Item already exists, find it
          const menuResult = await makeRequest(`/api/menu/restaurant/${restaurantId}`);
          if (menuResult.data.success) {
            const allItems = Object.values(menuResult.data.data.menuItems).flat();
            const existingItem = allItems.find(item => item.name === menuItem.name);
            if (existingItem) {
              menuItemIds.push(existingItem._id);
              console.log(`✅ Menu item found: ${menuItem.name}`);
            }
          }
        }
      }
    }

  } catch (error) {
    console.log('❌ Setup error:', error.message);
  }

  console.log('');
  return { restaurantToken, studentToken, restaurantId, menuItemIds };
}

async function testOrderPlacement(studentToken, restaurantId, menuItemIds) {
  console.log('🧪 Testing Order Placement...\n');

  if (!studentToken || !restaurantId || menuItemIds.length === 0) {
    console.log('❌ Missing required data for order placement');
    return null;
  }

  const orderData = {
    restaurantId,
    items: [
      {
        menuItemId: menuItemIds[0], // Pizza
        quantity: 2,
        specialInstructions: "Extra cheese please"
      },
      {
        menuItemId: menuItemIds[1], // Burger
        quantity: 1,
        specialInstructions: "No onions"
      },
      {
        menuItemId: menuItemIds[2], // Salad
        quantity: 1
      }
    ],
    deliveryAddress: "123 Test Delivery Address, Campus City, State 12345",
    phoneNumber: "+1987654321",
    paymentMethod: "upi",
    specialInstructions: "Please ring the doorbell twice"
  };

  try {
    const result = await makeRequest('/api/orders', 'POST', orderData, studentToken);
    console.log(`✅ POST /api/orders: ${result.statusCode}`);
    
    if (result.data.success) {
      const order = result.data.data;
      console.log(`   Order placed: ${order.orderNumber}`);
      console.log(`   Total amount: $${order.totalAmount}`);
      console.log(`   Status: ${order.status}`);
      console.log(`   Items: ${order.items.length}`);
      console.log(`   Estimated delivery: ${new Date(order.estimatedDeliveryTime).toLocaleTimeString()}`);
      return order._id;
    } else {
      console.log(`   Error: ${result.data.message}`);
      if (result.data.errors) {
        result.data.errors.forEach(err => {
          console.log(`   - ${err.field}: ${err.message}`);
        });
      }
    }
  } catch (error) {
    console.log(`❌ POST /api/orders: ${error.message}`);
  }

  console.log('');
  return null;
}

async function testStudentOrderHistory(studentToken) {
  console.log('🧪 Testing Student Order History...\n');

  if (!studentToken) {
    console.log('❌ No student token available');
    return;
  }

  try {
    const result = await makeRequest('/api/orders/student', 'GET', null, studentToken);
    console.log(`✅ GET /api/orders/student: ${result.statusCode}`);
    
    if (result.data.success) {
      console.log(`   Total orders: ${result.data.data.length}`);
      console.log(`   Statistics:`);
      console.log(`     - Total orders: ${result.data.stats.totalOrders}`);
      console.log(`     - Total spent: $${result.data.stats.totalSpent}`);
      console.log(`     - Average order value: $${result.data.stats.averageOrderValue}`);
      console.log(`     - Status breakdown:`, result.data.stats.statusCounts);
      
      if (result.data.data.length > 0) {
        const firstOrder = result.data.data[0];
        console.log(`   Latest order: ${firstOrder.orderNumber} - $${firstOrder.totalAmount}`);
      }
    }
  } catch (error) {
    console.log(`❌ GET /api/orders/student: ${error.message}`);
  }

  // Test with filters
  try {
    const result = await makeRequest('/api/orders/student?status=pending&limit=5', 'GET', null, studentToken);
    console.log(`✅ GET /api/orders/student (filtered): ${result.statusCode}`);
    
    if (result.data.success) {
      console.log(`   Pending orders: ${result.data.data.length}`);
    }
  } catch (error) {
    console.log(`❌ GET /api/orders/student (filtered): ${error.message}`);
  }

  console.log('');
}

async function testRestaurantOrders(restaurantToken) {
  console.log('🧪 Testing Restaurant Orders...\n');

  if (!restaurantToken) {
    console.log('❌ No restaurant token available');
    return;
  }

  try {
    const result = await makeRequest('/api/orders/restaurant', 'GET', null, restaurantToken);
    console.log(`✅ GET /api/orders/restaurant: ${result.statusCode}`);
    
    if (result.data.success) {
      console.log(`   Total orders: ${result.data.data.length}`);
      console.log(`   Restaurant: ${result.data.restaurant.name}`);
      console.log(`   Statistics:`);
      console.log(`     - Total orders: ${result.data.stats.totalOrders}`);
      console.log(`     - Total revenue: $${result.data.stats.totalRevenue}`);
      console.log(`     - Average order value: $${result.data.stats.averageOrderValue}`);
      console.log(`     - Status breakdown:`, result.data.stats.statusCounts);
      
      if (result.data.data.length > 0) {
        const firstOrder = result.data.data[0];
        console.log(`   Latest order: ${firstOrder.orderNumber} - $${firstOrder.totalAmount}`);
        console.log(`   Customer: ${firstOrder.student.name}`);
      }
    }
  } catch (error) {
    console.log(`❌ GET /api/orders/restaurant: ${error.message}`);
  }

  console.log('');
}

async function testOrderStatusUpdate(orderId, restaurantToken) {
  console.log('🧪 Testing Order Status Updates...\n');

  if (!orderId || !restaurantToken) {
    console.log('❌ Missing order ID or restaurant token');
    return;
  }

  const statusFlow = ['confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered'];

  for (const status of statusFlow) {
    try {
      const result = await makeRequest(`/api/orders/${orderId}/status`, 'PUT', { status }, restaurantToken);
      console.log(`✅ PUT /api/orders/${orderId}/status (${status}): ${result.statusCode}`);
      
      if (result.data.success) {
        console.log(`   Status updated to: ${result.data.data.status}`);
        if (result.data.data.estimatedDeliveryTime) {
          console.log(`   Estimated delivery: ${new Date(result.data.data.estimatedDeliveryTime).toLocaleTimeString()}`);
        }
        if (result.data.data.deliveredAt) {
          console.log(`   Delivered at: ${new Date(result.data.data.deliveredAt).toLocaleTimeString()}`);
        }
      } else {
        console.log(`   Error: ${result.data.message}`);
      }
      
      // Small delay between status updates
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.log(`❌ PUT /api/orders/${orderId}/status (${status}): ${error.message}`);
    }
  }

  console.log('');
}

async function testPaymentUpdate(orderId, studentToken) {
  console.log('🧪 Testing Payment Updates...\n');

  if (!orderId || !studentToken) {
    console.log('❌ Missing order ID or student token');
    return;
  }

  // First, place a new UPI order for payment testing
  const orderData = {
    restaurantId: "test", // This will be replaced with actual restaurant ID
    items: [
      {
        menuItemId: "test", // This will be replaced with actual menu item ID
        quantity: 1
      }
    ],
    deliveryAddress: "123 Payment Test Address",
    phoneNumber: "+1987654321",
    paymentMethod: "upi"
  };

  try {
    const paymentData = {
      paymentStatus: "completed",
      transactionId: "UPI123456789"
    };

    const result = await makeRequest(`/api/orders/${orderId}/payment`, 'PUT', paymentData, studentToken);
    console.log(`✅ PUT /api/orders/${orderId}/payment: ${result.statusCode}`);
    
    if (result.data.success) {
      console.log(`   Payment status: ${result.data.data.paymentStatus}`);
      console.log(`   Transaction ID: ${result.data.data.transactionId}`);
      if (result.data.data.paidAt) {
        console.log(`   Paid at: ${new Date(result.data.data.paidAt).toLocaleTimeString()}`);
      }
    } else {
      console.log(`   Error: ${result.data.message}`);
    }
  } catch (error) {
    console.log(`❌ PUT /api/orders/${orderId}/payment: ${error.message}`);
  }

  console.log('');
}

async function testOrderDetails(orderId, studentToken, restaurantToken) {
  console.log('🧪 Testing Order Details Access...\n');

  if (!orderId) {
    console.log('❌ No order ID available');
    return;
  }

  // Test student access
  if (studentToken) {
    try {
      const result = await makeRequest(`/api/orders/${orderId}`, 'GET', null, studentToken);
      console.log(`✅ GET /api/orders/${orderId} (student): ${result.statusCode}`);
      
      if (result.data.success) {
        const order = result.data.data;
        console.log(`   Order: ${order.orderNumber}`);
        console.log(`   Status: ${order.status}`);
        console.log(`   Total: $${order.totalAmount}`);
        console.log(`   Items: ${order.items.length}`);
        console.log(`   Restaurant: ${order.restaurant.name}`);
        // Student view should not include customer details
        console.log(`   Student info included: ${order.student ? 'Yes' : 'No'}`);
      }
    } catch (error) {
      console.log(`❌ GET /api/orders/${orderId} (student): ${error.message}`);
    }
  }

  // Test restaurant owner access
  if (restaurantToken) {
    try {
      const result = await makeRequest(`/api/orders/${orderId}`, 'GET', null, restaurantToken);
      console.log(`✅ GET /api/orders/${orderId} (restaurant): ${result.statusCode}`);
      
      if (result.data.success) {
        const order = result.data.data;
        console.log(`   Order: ${order.orderNumber}`);
        console.log(`   Status: ${order.status}`);
        console.log(`   Total: $${order.totalAmount}`);
        console.log(`   Customer: ${order.student ? order.student.name : 'N/A'}`);
        console.log(`   Customer phone: ${order.student ? order.student.phone : 'N/A'}`);
      }
    } catch (error) {
      console.log(`❌ GET /api/orders/${orderId} (restaurant): ${error.message}`);
    }
  }

  console.log('');
}

async function testUnauthorizedAccess(orderId, studentToken, restaurantToken) {
  console.log('🧪 Testing Unauthorized Access...\n');

  if (!orderId) {
    console.log('❌ No order ID available');
    return;
  }

  // Test restaurant owner trying to update payment (should fail)
  if (restaurantToken) {
    try {
      const result = await makeRequest(`/api/orders/${orderId}/payment`, 'PUT', 
        { paymentStatus: "completed" }, restaurantToken);
      console.log(`✅ Unauthorized payment update test: ${result.statusCode} (Expected 403)`);
      if (result.statusCode === 403) {
        console.log(`   Correctly blocked: ${result.data.message}`);
      }
    } catch (error) {
      console.log(`❌ Unauthorized payment update test: ${error.message}`);
    }
  }

  // Test student trying to update order status (should fail)
  if (studentToken) {
    try {
      const result = await makeRequest(`/api/orders/${orderId}/status`, 'PUT', 
        { status: "delivered" }, studentToken);
      console.log(`✅ Unauthorized status update test: ${result.statusCode} (Expected 403)`);
      if (result.statusCode === 403) {
        console.log(`   Correctly blocked: ${result.data.message}`);
      }
    } catch (error) {
      console.log(`❌ Unauthorized status update test: ${error.message}`);
    }
  }

  // Test accessing without token
  try {
    const result = await makeRequest(`/api/orders/${orderId}`);
    console.log(`✅ No token test: ${result.statusCode} (Expected 401)`);
    if (result.statusCode === 401) {
      console.log(`   Correctly blocked: ${result.data.message}`);
    }
  } catch (error) {
    console.log(`❌ No token test: ${error.message}`);
  }

  console.log('');
}

async function testValidationErrors(studentToken, restaurantId, menuItemIds) {
  console.log('🧪 Testing Validation Errors...\n');

  if (!studentToken || !restaurantId || menuItemIds.length === 0) {
    console.log('❌ Missing required data for validation testing');
    return;
  }

  const invalidOrderData = {
    restaurantId,
    items: [
      {
        menuItemId: menuItemIds[0],
        quantity: 15, // Too many
        specialInstructions: "A".repeat(250) // Too long
      }
    ],
    deliveryAddress: "Short", // Too short
    phoneNumber: "123", // Invalid
    paymentMethod: "invalid_method" // Invalid
  };

  try {
    const result = await makeRequest('/api/orders', 'POST', invalidOrderData, studentToken);
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

async function testDashboardStats(restaurantToken) {
  console.log('🧪 Testing Dashboard Statistics...\n');

  if (!restaurantToken) {
    console.log('❌ No restaurant token available');
    return;
  }

  try {
    const result = await makeRequest('/api/orders/stats/dashboard', 'GET', null, restaurantToken);
    console.log(`✅ GET /api/orders/stats/dashboard: ${result.statusCode}`);
    
    if (result.data.success) {
      const stats = result.data.data;
      console.log(`   Overall Statistics:`);
      console.log(`     - Total orders: ${stats.overall.totalOrders}`);
      console.log(`     - Total revenue: $${stats.overall.totalRevenue}`);
      console.log(`     - Average order value: $${stats.overall.averageOrderValue}`);
      
      console.log(`   Today's Statistics:`);
      console.log(`     - Orders: ${stats.today.todayOrders}`);
      console.log(`     - Revenue: $${stats.today.todayRevenue}`);
      
      console.log(`   This Week:`);
      console.log(`     - Orders: ${stats.thisWeek.weekOrders}`);
      console.log(`     - Revenue: $${stats.thisWeek.weekRevenue}`);
      
      console.log(`   This Month:`);
      console.log(`     - Orders: ${stats.thisMonth.monthOrders}`);
      console.log(`     - Revenue: $${stats.thisMonth.monthRevenue}`);
      
      console.log(`   Status Breakdown:`, stats.statusBreakdown);
      
      console.log(`   Recent Orders: ${stats.recentOrders.length}`);
      stats.recentOrders.forEach(order => {
        console.log(`     - ${order.orderNumber}: ${order.customerName} - $${order.totalAmount} (${order.status})`);
      });
    }
  } catch (error) {
    console.log(`❌ GET /api/orders/stats/dashboard: ${error.message}`);
  }

  console.log('');
}

// Main test runner
async function runAllTests() {
  console.log('🚀 FODYYY Order Management Test Suite\n');
  console.log('=' .repeat(60));
  
  try {
    // Setup
    const { restaurantToken, studentToken, restaurantId, menuItemIds } = await setupTestData();
    
    // Test order placement
    const orderId = await testOrderPlacement(studentToken, restaurantId, menuItemIds);
    
    // Test student order history
    await testStudentOrderHistory(studentToken);
    
    // Test restaurant orders
    await testRestaurantOrders(restaurantToken);
    
    // Test order status updates
    if (orderId) {
      await testOrderStatusUpdate(orderId, restaurantToken);
    }
    
    // Test payment updates
    if (orderId) {
      await testPaymentUpdate(orderId, studentToken);
    }
    
    // Test order details access
    if (orderId) {
      await testOrderDetails(orderId, studentToken, restaurantToken);
    }
    
    // Test unauthorized access
    if (orderId) {
      await testUnauthorizedAccess(orderId, studentToken, restaurantToken);
    }
    
    // Test validation errors
    await testValidationErrors(studentToken, restaurantId, menuItemIds);
    
    // Test dashboard statistics
    await testDashboardStats(restaurantToken);
    
    console.log('🎉 All order management tests completed!');
    console.log('=' .repeat(60));
    
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  }
}

// Check if server is running
async function checkServer() {
  try {
    await makeRequest('/');
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
    console.log('Then run this test with: node test-orders.js');
    return;
  }
  
  console.log('✅ Server is running, starting tests...\n');
  await runAllTests();
}

startTests();