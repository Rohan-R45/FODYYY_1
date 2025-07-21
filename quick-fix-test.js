const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// UPDATE THESE WITH YOUR ACTUAL RESTAURANT CREDENTIALS
const TEST_CREDENTIALS = {
  email: 'restaurant@test.com', // CHANGE THIS
  password: 'password123' // CHANGE THIS
};

async function quickFixTest() {
  console.log('🚀 QUICK FIX TEST - Testing both primary issues\n');

  try {
    // Step 1: Login
    console.log('1️⃣ Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, TEST_CREDENTIALS);
    
    if (!loginResponse.data.success) {
      console.log('❌ LOGIN FAILED - Please update TEST_CREDENTIALS in this script');
      console.log('   Your restaurant email:', '?');
      console.log('   Your restaurant password:', '?');
      return;
    }
    
    const authToken = loginResponse.data.data.token;
    console.log('✅ Login successful');

    // Step 2: Test Issue #1 - "Invalid menu item ID format" when loading menu page
    console.log('\n2️⃣ TESTING ISSUE #1: Menu loading (invalid menu item ID format)');
    try {
      const menuResponse = await axios.get(`${BASE_URL}/menu`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      if (menuResponse.data.success) {
        console.log('✅ ISSUE #1 FIXED! Menu loads without "invalid menu item ID format" error');
        console.log(`   Found ${menuResponse.data.data.items?.length || 0} menu items`);
      } else {
        console.log('❌ Issue #1 still exists:', menuResponse.data.message);
      }
    } catch (error) {
      console.log('❌ Issue #1 still exists:', error.response?.data?.message || error.message);
      if (error.response?.data?.message?.includes('Restaurant profile not found')) {
        console.log('   🚨 ROOT CAUSE: Restaurant profile not found!');
        console.log('   💡 SOLUTION: Complete restaurant setup first');
        return;
      }
    }

    // Step 3: Test Issue #2 - "Validation failed" when adding menu items
    console.log('\n3️⃣ TESTING ISSUE #2: Menu item creation (validation failed)');
    
    const testMenuItem = {
      name: 'Quick Test Burger',
      description: 'A test burger to verify the fix',
      price: 15.99,
      category: 'Snacks',
      isVegetarian: false,
      isAvailable: true
    };

    try {
      console.log('📝 Attempting to create menu item:', testMenuItem);
      
      const createResponse = await axios.post(`${BASE_URL}/menu`, testMenuItem, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      if (createResponse.data.success) {
        console.log('✅ ISSUE #2 FIXED! Menu item created successfully');
        console.log(`   Created item: ${createResponse.data.data.name} (ID: ${createResponse.data.data._id})`);
        
        // Clean up test item
        try {
          await axios.delete(`${BASE_URL}/menu/${createResponse.data.data._id}`, {
            headers: { Authorization: `Bearer ${authToken}` }
          });
          console.log('🧹 Test item cleaned up');
        } catch (cleanupError) {
          console.log('⚠️  Could not clean up test item (not critical)');
        }
        
      } else {
        console.log('❌ Issue #2 still exists:', createResponse.data.message);
        if (createResponse.data.errors) {
          console.log('   Validation errors:');
          createResponse.data.errors.forEach(err => {
            console.log(`   - ${err.field}: ${err.message}`);
          });
        }
      }
    } catch (error) {
      console.log('❌ Issue #2 still exists:', error.response?.data?.message || error.message);
      if (error.response?.data?.errors) {
        console.log('   Validation errors:');
        error.response.data.errors.forEach(err => {
          console.log(`   - ${err.field}: ${err.message}`);
        });
      }
    }

    // Step 4: Final status
    console.log('\n🎯 QUICK TEST COMPLETE!');
    console.log('\nIf both issues show ✅ FIXED, you can now:');
    console.log('1. Open Menu Management page without errors');
    console.log('2. Add menu items successfully');
    console.log('3. See items stored in database');
    
    console.log('\nIf any issues still show ❌, check the specific error messages above.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Instructions
console.log('📝 QUICK SETUP:');
console.log('1. Update TEST_CREDENTIALS above with your restaurant login');
console.log('2. Make sure backend is running');
console.log('3. Run: node quick-fix-test.js');
console.log('4. Look for ✅ FIXED messages');
console.log('');

// Run the test
quickFixTest();