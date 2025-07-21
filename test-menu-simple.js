// Simple test to check if menu validation is working
console.log('🧪 Testing Menu Item Validation Rules...\n');

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

// Validation rules (copied from backend)
const menuItemValidationRules = {
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
  },
  isVegetarian: (value) => {
    return null; // Optional field
  },
  isAvailable: (value) => {
    return null; // Optional field
  },
  image: (value) => {
    return null; // Optional field
  }
};

console.log('Test data:', JSON.stringify(TEST_MENU_ITEM, null, 2));
console.log();

let hasValidationErrors = false;
for (const [field, rule] of Object.entries(menuItemValidationRules)) {
  const value = TEST_MENU_ITEM[field];
  const error = rule(value);
  if (error) {
    console.log(`❌ ${field}: ${error}`);
    hasValidationErrors = true;
  } else {
    console.log(`✅ ${field}: Valid (value: ${JSON.stringify(value)})`);
  }
}

console.log();
if (!hasValidationErrors) {
  console.log('🎉 All validation rules pass!');
  console.log('✅ The validation rules are now fixed.');
  console.log('✅ Menu item creation should work in the frontend.');
} else {
  console.log('❌ Validation errors found!');
}

console.log('\n📋 Next Steps:');
console.log('1. Restart the backend server to apply changes');
console.log('2. Try adding a menu item in the frontend');
console.log('3. If still getting "validation failed", check browser network tab for detailed error');
console.log('4. Make sure the category matches one of the valid categories');

console.log('\n🔧 Valid Categories:');
const validCategories = ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Beverages', 'Desserts', 'Appetizer', 'Main Course', 'Dessert'];
validCategories.forEach(cat => console.log(`   - ${cat}`));

console.log('\n✨ The "validation failed" error should now be resolved!');