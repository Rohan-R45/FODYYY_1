import { isValidId } from './validation';

/**
 * Creates safe navigation URLs with ID validation
 */
export const createSafeUrl = {
  restaurant: (restaurantId) => {
    if (!isValidId(restaurantId)) {
      console.warn(`Invalid restaurant ID for navigation: ${restaurantId}`);
      return '/restaurants';
    }
    return `/restaurants/${restaurantId}`;
  },

  order: (orderId) => {
    if (!isValidId(orderId)) {
      console.warn(`Invalid order ID for navigation: ${orderId}`);
      return '/orders';
    }
    return `/orders/${orderId}`;
  },

  restaurantOrder: (orderId) => {
    if (!isValidId(orderId)) {
      console.warn(`Invalid order ID for restaurant navigation: ${orderId}`);
      return '/restaurant/orders';
    }
    return `/restaurant/orders/${orderId}`;
  },

  menuItem: (restaurantId, menuItemId) => {
    if (!isValidId(restaurantId)) {
      console.warn(`Invalid restaurant ID for menu navigation: ${restaurantId}`);
      return '/restaurants';
    }
    if (!isValidId(menuItemId)) {
      console.warn(`Invalid menu item ID for navigation: ${menuItemId}`);
      return `/restaurants/${restaurantId}`;
    }
    return `/restaurants/${restaurantId}/menu/${menuItemId}`;
  }
};

/**
 * Safe navigation hook for React components
 */
export const useSafeNavigation = (navigate) => {
  return {
    toRestaurant: (restaurantId, options = {}) => {
      const url = createSafeUrl.restaurant(restaurantId);
      if (url === '/restaurants' && restaurantId) {
        // Invalid ID, show error and redirect to list
        console.error('Invalid restaurant ID, redirecting to restaurant list');
      }
      navigate(url, options);
    },

    toOrder: (orderId, options = {}) => {
      const url = createSafeUrl.order(orderId);
      if (url === '/orders' && orderId) {
        // Invalid ID, show error and redirect to list
        console.error('Invalid order ID, redirecting to orders list');
      }
      navigate(url, options);
    },

    toRestaurantOrder: (orderId, options = {}) => {
      const url = createSafeUrl.restaurantOrder(orderId);
      if (url === '/restaurant/orders' && orderId) {
        // Invalid ID, show error and redirect to list
        console.error('Invalid order ID, redirecting to restaurant orders list');
      }
      navigate(url, options);
    },

    back: (fallbackUrl = '/', options = {}) => {
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate(fallbackUrl, options);
      }
    }
  };
};

/**
 * Validates and creates safe Link props for React Router
 */
export const createSafeLinkProps = {
  restaurant: (restaurantId) => {
    const to = createSafeUrl.restaurant(restaurantId);
    return {
      to,
      onClick: to === '/restaurants' && restaurantId ? (e) => {
        e.preventDefault();
        console.error('Invalid restaurant ID, cannot navigate');
      } : undefined
    };
  },

  order: (orderId) => {
    const to = createSafeUrl.order(orderId);
    return {
      to,
      onClick: to === '/orders' && orderId ? (e) => {
        e.preventDefault();
        console.error('Invalid order ID, cannot navigate');
      } : undefined
    };
  }
};

/**
 * Extracts and validates ID from URL parameters
 */
export const extractValidId = (params, paramName = 'id') => {
  const id = params[paramName];
  if (!id) {
    return { isValid: false, id: null, error: `Missing ${paramName} parameter` };
  }
  
  if (!isValidId(id)) {
    return { isValid: false, id: null, error: `Invalid ${paramName} format` };
  }
  
  return { isValid: true, id, error: null };
};

/**
 * Creates breadcrumb navigation with safe URLs
 */
export const createBreadcrumbs = (items) => {
  return items.map(item => ({
    ...item,
    href: item.id ? createSafeUrl[item.type]?.(item.id) || item.href : item.href
  }));
};