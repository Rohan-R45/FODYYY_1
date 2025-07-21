import { isValidId, validateRestaurantId, validateOrderId } from './validation';
import { createSafeUrl, createSafeLinkProps } from './navigation';

/**
 * Navigation testing utilities
 */
export const navigationTest = {
  // Test ID validation
  testIdValidation: () => {
    const testCases = [
      { id: '507f1f77bcf86cd799439011', expected: true, description: 'Valid MongoDB ObjectId' },
      { id: '507f1f77bcf86cd79943901', expected: false, description: 'Invalid ObjectId (too short)' },
      { id: '507f1f77bcf86cd7994390111', expected: false, description: 'Invalid ObjectId (too long)' },
      { id: 'invalid-id', expected: false, description: 'Invalid format' },
      { id: '', expected: false, description: 'Empty string' },
      { id: null, expected: false, description: 'Null value' },
      { id: undefined, expected: false, description: 'Undefined value' }
    ];

    console.log('🧪 Testing ID Validation:');
    testCases.forEach(({ id, expected, description }) => {
      const result = isValidId(id);
      const status = result === expected ? '✅' : '❌';
      console.log(`${status} ${description}: ${id} -> ${result}`);
    });
  },

  // Test restaurant URL generation
  testRestaurantUrls: () => {
    const testCases = [
      { id: '507f1f77bcf86cd799439011', expected: '/restaurants/507f1f77bcf86cd799439011' },
      { id: 'invalid-id', expected: '/restaurants' },
      { id: null, expected: '/restaurants' },
      { id: undefined, expected: '/restaurants' }
    ];

    console.log('\n🧪 Testing Restaurant URL Generation:');
    testCases.forEach(({ id, expected }) => {
      const result = createSafeUrl.restaurant(id);
      const status = result === expected ? '✅' : '❌';
      console.log(`${status} ID: ${id} -> ${result} (expected: ${expected})`);
    });
  },

  // Test order URL generation
  testOrderUrls: () => {
    const testCases = [
      { id: '507f1f77bcf86cd799439011', expected: '/orders/507f1f77bcf86cd799439011' },
      { id: 'invalid-id', expected: '/orders' },
      { id: null, expected: '/orders' },
      { id: undefined, expected: '/orders' }
    ];

    console.log('\n🧪 Testing Order URL Generation:');
    testCases.forEach(({ id, expected }) => {
      const result = createSafeUrl.order(id);
      const status = result === expected ? '✅' : '❌';
      console.log(`${status} ID: ${id} -> ${result} (expected: ${expected})`);
    });
  },

  // Test Link props generation
  testLinkProps: () => {
    const validId = '507f1f77bcf86cd799439011';
    const invalidId = 'invalid-id';

    console.log('\n🧪 Testing Link Props Generation:');
    
    // Valid restaurant link
    const validRestaurantProps = createSafeLinkProps.restaurant(validId);
    console.log(`✅ Valid restaurant props:`, validRestaurantProps);
    
    // Invalid restaurant link
    const invalidRestaurantProps = createSafeLinkProps.restaurant(invalidId);
    console.log(`✅ Invalid restaurant props:`, invalidRestaurantProps);
    
    // Valid order link
    const validOrderProps = createSafeLinkProps.order(validId);
    console.log(`✅ Valid order props:`, validOrderProps);
    
    // Invalid order link
    const invalidOrderProps = createSafeLinkProps.order(invalidId);
    console.log(`✅ Invalid order props:`, invalidOrderProps);
  },

  // Test validation functions
  testValidationFunctions: () => {
    const validId = '507f1f77bcf86cd799439011';
    const invalidId = 'invalid-id';

    console.log('\n🧪 Testing Validation Functions:');
    
    // Restaurant validation
    const restaurantValidation = validateRestaurantId(validId);
    console.log(`✅ Restaurant validation (valid):`, restaurantValidation);
    
    const invalidRestaurantValidation = validateRestaurantId(invalidId);
    console.log(`✅ Restaurant validation (invalid):`, invalidRestaurantValidation);
    
    // Order validation
    const orderValidation = validateOrderId(validId);
    console.log(`✅ Order validation (valid):`, orderValidation);
    
    const invalidOrderValidation = validateOrderId(invalidId);
    console.log(`✅ Order validation (invalid):`, invalidOrderValidation);
  },

  // Run all tests
  runAllTests: () => {
    console.log('🚀 Running Navigation Tests...\n');
    navigationTest.testIdValidation();
    navigationTest.testRestaurantUrls();
    navigationTest.testOrderUrls();
    navigationTest.testLinkProps();
    navigationTest.testValidationFunctions();
    console.log('\n✨ Navigation tests completed!');
  }
};

// Auto-run tests in development
if (process.env.NODE_ENV === 'development') {
  // Uncomment to run tests automatically
  // navigationTest.runAllTests();
}

export default navigationTest;