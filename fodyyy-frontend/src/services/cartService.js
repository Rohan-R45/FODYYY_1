import api from './api';

const cartService = {
  // Get current cart
  getCart: async () => {
    try {
      const response = await api.get('/cart');
      return response.data;
    } catch (error) {
      console.error('Error getting cart:', error);
      return { success: false, message: error.message };
    }
  },

  // Add item to cart
  addToCart: async (cartItem) => {
    try {
      const response = await api.post('/cart/add', cartItem);
      return response.data;
    } catch (error) {
      console.error('Error adding to cart:', error);
      return { success: false, message: error.message };
    }
  },

  // Update cart item quantity
  updateCartItem: async (itemId, updates) => {
    try {
      const response = await api.put(`/cart/item/${itemId}`, updates);
      return response.data;
    } catch (error) {
      console.error('Error updating cart item:', error);
      return { success: false, message: error.message };
    }
  },

  // Remove item from cart
  removeFromCart: async (itemId) => {
    try {
      const response = await api.delete(`/cart/item/${itemId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing from cart:', error);
      return { success: false, message: error.message };
    }
  },

  // Clear entire cart
  clearCart: async () => {
    try {
      const response = await api.delete('/cart');
      return response.data;
    } catch (error) {
      console.error('Error clearing cart:', error);
      return { success: false, message: error.message };
    }
  },

  // Apply coupon to cart
  applyCoupon: async (couponCode) => {
    try {
      const response = await api.post('/cart/coupon', { couponCode });
      return response.data;
    } catch (error) {
      console.error('Error applying coupon:', error);
      return { success: false, message: error.message };
    }
  },

  // Remove coupon from cart
  removeCoupon: async () => {
    try {
      const response = await api.delete('/cart/coupon');
      return response.data;
    } catch (error) {
      console.error('Error removing coupon:', error);
      return { success: false, message: error.message };
    }
  },

  // Get cart summary (totals, taxes, etc.)
  getCartSummary: async () => {
    try {
      const response = await api.get('/cart/summary');
      return response.data;
    } catch (error) {
      console.error('Error getting cart summary:', error);
      return { success: false, message: error.message };
    }
  },

  // Validate cart before checkout
  validateCart: async () => {
    try {
      const response = await api.post('/cart/validate');
      return response.data;
    } catch (error) {
      console.error('Error validating cart:', error);
      return { success: false, message: error.message };
    }
  }
};

export default cartService;