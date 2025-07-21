// Route parameter validation utilities

/**
 * Validates if a string is a valid MongoDB ObjectId
 * @param {string} id - The ID to validate
 * @returns {boolean} - True if valid ObjectId format
 */
export const isValidObjectId = (id) => {
  if (!id || typeof id !== 'string') return false;
  
  // MongoDB ObjectId is 24 characters long and contains only hexadecimal characters
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  return objectIdRegex.test(id);
};

/**
 * Validates if a string is a valid UUID (alternative ID format)
 * @param {string} id - The ID to validate
 * @returns {boolean} - True if valid UUID format
 */
export const isValidUUID = (id) => {
  if (!id || typeof id !== 'string') return false;
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

/**
 * Validates if an ID is in any acceptable format
 * @param {string} id - The ID to validate
 * @returns {boolean} - True if valid ID format
 */
export const isValidId = (id) => {
  return isValidObjectId(id) || isValidUUID(id);
};

/**
 * Sanitizes and validates route parameters
 * @param {object} params - Route parameters object
 * @param {string[]} requiredParams - Array of required parameter names
 * @returns {object} - Validation result with isValid boolean and errors array
 */
export const validateRouteParams = (params, requiredParams = []) => {
  const errors = [];
  const validatedParams = {};

  // Check for required parameters
  for (const param of requiredParams) {
    if (!params[param]) {
      errors.push(`Missing required parameter: ${param}`);
      continue;
    }

    const value = params[param].trim();
    
    // Validate ID format for common ID parameters
    if (['id', 'restaurantId', 'orderId', 'userId', 'menuItemId'].includes(param)) {
      if (!isValidId(value)) {
        errors.push(`Invalid ${param} format`);
        continue;
      }
    }

    validatedParams[param] = value;
  }

  return {
    isValid: errors.length === 0,
    errors,
    params: validatedParams
  };
};

/**
 * Creates a route parameter validator hook
 * @param {string[]} requiredParams - Array of required parameter names
 * @returns {object} - Hook result with validation state
 */
export const useRouteValidation = (requiredParams = []) => {
  const [validationState, setValidationState] = useState({
    isValidating: true,
    isValid: false,
    errors: [],
    params: {}
  });

  return validationState;
};

/**
 * Validates restaurant ID specifically
 * @param {string} restaurantId - Restaurant ID to validate
 * @returns {object} - Validation result
 */
export const validateRestaurantId = (restaurantId) => {
  if (!restaurantId) {
    return {
      isValid: false,
      error: 'Restaurant ID is required'
    };
  }

  if (!isValidId(restaurantId)) {
    return {
      isValid: false,
      error: 'Invalid restaurant ID format'
    };
  }

  return {
    isValid: true,
    error: null
  };
};

/**
 * Validates order ID specifically
 * @param {string} orderId - Order ID to validate
 * @returns {object} - Validation result
 */
export const validateOrderId = (orderId) => {
  if (!orderId) {
    return {
      isValid: false,
      error: 'Order ID is required'
    };
  }

  if (!isValidId(orderId)) {
    return {
      isValid: false,
      error: 'Invalid order ID format'
    };
  }

  return {
    isValid: true,
    error: null
  };
};

/**
 * Creates safe navigation URLs with ID validation
 * @param {string} baseUrl - Base URL path
 * @param {string} id - ID to append
 * @returns {string|null} - Safe URL or null if invalid
 */
export const createSafeNavigationUrl = (baseUrl, id) => {
  if (!isValidId(id)) {
    console.warn(`Invalid ID format for navigation: ${id}`);
    return null;
  }
  
  return `${baseUrl}/${id}`;
};

/**
 * Filters out items with invalid IDs from an array
 * @param {Array} items - Array of items with _id property
 * @returns {Array} - Filtered array with only valid IDs
 */
export const filterValidItems = (items) => {
  if (!Array.isArray(items)) return [];
  
  return items.filter(item => {
    if (!item || !item._id) {
      console.warn('Item missing _id:', item);
      return false;
    }
    
    if (!isValidId(item._id)) {
      console.warn('Invalid item ID found:', item._id);
      return false;
    }
    
    return true;
  });
};

/**
 * Validates and cleans order data to prevent ID format errors
 * @param {Object} order - Order object
 * @returns {Object|null} - Cleaned order or null if invalid
 */
export const validateOrderData = (order) => {
  if (!order || !order._id) {
    console.warn('Order missing _id:', order);
    return null;
  }
  
  if (!isValidId(order._id)) {
    console.warn('Invalid order ID found:', order._id);
    return null;
  }
  
  // Clean order items if they exist
  if (order.items && Array.isArray(order.items)) {
    order.items = order.items.filter(item => {
      const menuItemId = item.menuItemId || item.menuItem?._id;
      if (menuItemId && !isValidId(menuItemId)) {
        console.warn('Invalid menu item ID in order:', menuItemId);
        return false;
      }
      return true;
    });
  }
  
  return order;
};