const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test menu item data (similar to what frontend sends)
const TEST_MENU_ITEM = {
  name: 'Test Menu Item',
  description: 'A delicious test item to debug validation',
  price: 15.99,
  category: 'Snacks', // This should match the updated validation rules
  image: '',
  isVegetarian: true,
  isAvailable: true
};

async function debugMenuValidation() {
  try {
    console.log('🔍 Debugging Menu Item Validation...\n');

    // First, we need to authenticate
    console.log('1. Attempting to create menu item without authentication...');
    try {
      const response = await axios.post(`${BASE_URL}/menu`, TEST_MENU_ITEM);
      console.log('❌ Unexpected success - should require authentication');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly requires authentication');
      } else {
        console.log('❌ Unexpected error:', error.response?.status, error.response?.data?.message);
      }
    }

    console.log('\n2. Testing validation rules individually...');
    
    // Test each validation rule
    const validationRules = {
      name: (value) => {
        if (!value || value.trim().length < 2) {
          return 'Menu item name must be at least 2 characters long';
        }
        if (value.length > 100) {
          return 'Menu item name cannot exceed 100 characters';
        }
        return null;
      },
      description: (value) => {
        if (value && value.length > 300) {
          return 'Description cannot exceed 300 characters';
        }
        return null;
      },
      price: (value) => {
        if (value === undefined || value === null) {
          return 'Price is required';
        }
        const price = parseFloat(value);
        if (isNaN(price) || price < 0) {
          return 'Price must be a positive number';
        }
        if (price > 10000) {
          return 'Price cannot exceed $10,000';
        }
        if (!Number.isInteger(price * 100)) {
          return 'Price must have at most 2 decimal places';
        }
        return null;
      },
      category: (value) => {
        const validCategories = ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Beverages', 'Desserts', 'Appetizer', 'Main Course', 'Dessert'];
        if (!value) {
          return 'Category is required';
        }
        if (!validCategories.includes(value)) {
          return `Category must be one of: ${validCategories.join(', ')}`;
        }
        return null;
      }
    };

    console.log('Testing validation rules with test data:');
    console.log('Test data:', JSON.stringify(TEST_MENU_ITEM, null, 2));
    console.log();

    let hasValidationErrors = false;
    for (const [field, rule] of Object.entries(validationRules)) {
      const value = TEST_MENU_ITEM[field];
      const error = rule(value);
      if (error) {
        console.log(`❌ ${field}: ${error}`);
        hasValidationErrors = true;
      } else {
        console.log(`✅ ${field}: Valid`);
      }
    }

    if (!hasValidationErrors) {
      console.log('\n🎉 All validation rules pass! The issue might be:');
      console.log('1. Authentication/Authorization problem');
      console.log('2. Restaurant ownership verification issue');
      console.log('3. Database connection problem');
      console.log('4. Other middleware interference');
    } else {
      console.log('\n❌ Validation errors found! Fix the data being sent from frontend.');
    }

    console.log('\n📋 Manual Testing Steps:');
    console.log('1. Login to the restaurant account');
    console.log('2. Open browser developer tools (F12)');
    console.log('3. Go to Network tab');
    console.log('4. Try to add a menu item');
    console.log('5. Check the request payload in Network tab');
    console.log('6. Check the response for detailed error message');
    console.log('7. Compare the payload with validation rules above');

    console.log('\n🔧 Common Issues:');
    console.log('- Category name mismatch (frontend vs backend)');
    console.log('- Price format issues (string vs number)');
    console.log('- Missing required fields');
    console.log('- Extra fields causing validation errors');
    console.log('- Authentication token issues');

  } catch (error) {
    console.error('❌ Debug script failed:', error.message);
  }
}

// Run the debug script
debugMenuValidation();const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test menu item data (similar to what frontend sends)
const TEST_MENU_ITEM = {
  name: 'Test Menu Item',
  description: 'A delicious test item to debug validation',
  price: 15.99,
  category: 'Snacks', // This should match the updated validation rules
  image: '',
  isVegetarian: true,
  isAvailable: true
};

async function debugMenuValidation() {
  try {
    console.log('🔍 Debugging Menu Item Validation...\n');

    // First, we need to authenticate
    console.log('1. Attempting to create menu item without authentication...');
    try {
      const response = await axios.post(`${BASE_URL}/menu`, TEST_MENU_ITEM);
      console.log('❌ Unexpected success - should require authentication');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly requires authentication');
      } else {
        console.log('❌ Unexpected error:', error.response?.status, error.response?.data?.message);
      }
    }

    console.log('\n2. Testing validation rules individually...');
    
    // Test each validation rule
    const validationRules = {
      name: (value) => {
        if (!value || value.trim().length < 2) {
          return 'Menu item name must be at least 2 characters long';
        }
        if (value.length > 100) {
          return 'Menu item name cannot exceed 100 characters';
        }
        return null;
      },
      description: (value) => {
        if (value && value.length > 300) {
          return 'Description cannot exceed 300 characters';
        }
        return null;
      },
      price: (value) => {
        if (value === undefined || value === null) {
          return 'Price is required';
        }
        const price = parseFloat(value);
        if (isNaN(price) || price < 0) {
          return 'Price must be a positive number';
        }
        if (price > 10000) {
          return 'Price cannot exceed $10,000';
        }
        if (!Number.isInteger(price * 100)) {
          return 'Price must have at most 2 decimal places';
        }
        return null;
      },
      category: (value) => {
        const validCategories = ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Beverages', 'Desserts', 'Appetizer', 'Main Course', 'Dessert'];
        if (!value) {
          return 'Category is required';
        }
        if (!validCategories.includes(value)) {
          return `Category must be one of: ${validCategories.join(', ')}`;
        }
        return null;
      }
    };

    console.log('Testing validation rules with test data:');
    console.log('Test data:', JSON.stringify(TEST_MENU_ITEM, null, 2));
    console.log();

    let hasValidationErrors = false;
    for (const [field, rule] of Object.entries(validationRules)) {
      const value = TEST_MENU_ITEM[field];
      const error = rule(value);
      if (error) {
        console.log(`❌ ${field}: ${error}`);
        hasValidationErrors = true;
      } else {
        console.log(`✅ ${field}: Valid`);
      }
    }

    if (!hasValidationErrors) {
      console.log('\n🎉 All validation rules pass! The issue might be:');
      console.log('1. Authentication/Authorization problem');
      console.log('2. Restaurant ownership verification issue');
      console.log('3. Database connection problem');
      console.log('4. Other middleware interference');
    } else {
      console.log('\n❌ Validation errors found! Fix the data being sent from frontend.');
    }

    console.log('\n📋 Manual Testing Steps:');
    console.log('1. Login to the restaurant account');
    console.log('2. Open browser developer tools (F12)');
    console.log('3. Go to Network tab');
    console.log('4. Try to add a menu item');
    console.log('5. Check the request payload in Network tab');
    console.log('6. Check the response for detailed error message');
    console.log('7. Compare the payload with validation rules above');

    console.log('\n🔧 Common Issues:');
    console.log('- Category name mismatch (frontend vs backend)');
    console.log('- Price format issues (string vs number)');
    console.log('- Missing required fields');
    console.log('- Extra fields causing validation errors');
    console.log('- Authentication token issues');

  } catch (error) {
    console.error('❌ Debug script failed:', error.message);
  }
}

// Run the debug script
debugMenuValidation();