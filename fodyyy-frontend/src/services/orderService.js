import api from './api';
import { isValidId } from '../utils/validation';

const orderService = {
  // Create new order
  createOrder: async (orderData) => {
    try {
      const response = await api.post('/orders', orderData);
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create order'
      };
    }
  },

  // Get student orders
  getStudentOrders: async (params = {}) => {
    try {
      const response = await api.get('/orders/student', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching student orders:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch orders'
      };
    }
  },



  // Get single order details
  getOrderDetails: async (orderId) => {
    try {
      // Validate order ID format
      if (!orderId) {
        return {
          success: false,
          message: 'Order ID is required'
        };
      }

      if (!isValidId(orderId)) {
        return {
          success: false,
          message: 'Invalid order ID format'
        };
      }

      const response = await api.get(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching order details:', error);
      
      // Handle specific error cases
      if (error.response?.status === 404) {
        return {
          success: false,
          message: 'Order not found'
        };
      }
      
      if (error.response?.status === 400) {
        return {
          success: false,
          message: 'Invalid order ID format'
        };
      }

      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch order details'
      };
    }
  },

  // Get order by ID (alias for getOrderDetails)
  getOrder: async (orderId) => {
    return orderService.getOrderDetails(orderId);
  },

  // Update order status (restaurant owners only)
  updateOrderStatus: async (orderId, statusData) => {
    try {
      // Validate order ID format
      if (!orderId || !isValidId(orderId)) {
        return {
          success: false,
          message: 'Invalid order ID format'
        };
      }

      const response = await api.put(`/orders/${orderId}/status`, statusData);
      return response.data;
    } catch (error) {
      console.error('Error updating order status:', error);
      
      if (error.response?.status === 404) {
        return {
          success: false,
          message: 'Order not found'
        };
      }

      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update order status'
      };
    }
  },

  // Get order tracking details
  getOrderTracking: async (orderId) => {
    try {
      // Validate order ID format
      if (!orderId || !isValidId(orderId)) {
        return {
          success: false,
          message: 'Invalid order ID format'
        };
      }

      const response = await api.get(`/orders/${orderId}/tracking`);
      return response.data;
    } catch (error) {
      console.error('Error fetching order tracking:', error);
      
      if (error.response?.status === 404) {
        return {
          success: false,
          message: 'Order not found'
        };
      }
      
      if (error.response?.status === 403) {
        return {
          success: false,
          message: 'Access denied. You can only view your own orders.'
        };
      }

      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch order tracking'
      };
    }
  },

  // Get restaurant orders for management
  getRestaurantOrders: async (params = {}) => {
    try {
      const response = await api.get('/orders/restaurant/manage', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching restaurant orders:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch restaurant orders'
      };
    }
  },

  // Get payment details for order
  getPaymentDetails: async (orderId) => {
    try {
      // Validate order ID format
      if (!orderId || !isValidId(orderId)) {
        return {
          success: false,
          message: 'Invalid order ID format'
        };
      }

      const response = await api.get(`/orders/${orderId}/payment`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payment details:', error);
      
      if (error.response?.status === 404) {
        return {
          success: false,
          message: 'Order not found'
        };
      }
      
      if (error.response?.status === 403) {
        return {
          success: false,
          message: 'Access denied. You can only view your own orders.'
        };
      }

      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch payment details'
      };
    }
  },

  // Confirm payment (students only)
  confirmPayment: async (orderId, paymentData) => {
    try {
      // Validate order ID format
      if (!orderId || !isValidId(orderId)) {
        return {
          success: false,
          message: 'Invalid order ID format'
        };
      }

      // Validate payment data
      if (!paymentData.transactionId) {
        return {
          success: false,
          message: 'Transaction ID is required'
        };
      }

      const response = await api.put(`/orders/${orderId}/payment`, paymentData);
      return response.data;
    } catch (error) {
      console.error('Error confirming payment:', error);
      
      if (error.response?.status === 400) {
        return {
          success: false,
          message: error.response.data.message || 'Invalid payment data'
        };
      }
      
      if (error.response?.status === 403) {
        return {
          success: false,
          message: 'Access denied. You can only confirm payment for your own orders.'
        };
      }

      return {
        success: false,
        message: error.response?.data?.message || 'Failed to confirm payment'
      };
    }
  },

  // Verify payment (restaurant owners only)
  verifyPayment: async (orderId, notes = '') => {
    try {
      // Validate order ID format
      if (!orderId || !isValidId(orderId)) {
        return {
          success: false,
          message: 'Invalid order ID format'
        };
      }

      const response = await api.put(`/orders/${orderId}/payment/verify`, { notes });
      return response.data;
    } catch (error) {
      console.error('Error verifying payment:', error);
      
      if (error.response?.status === 400) {
        return {
          success: false,
          message: error.response.data.message || 'Payment cannot be verified'
        };
      }
      
      if (error.response?.status === 403) {
        return {
          success: false,
          message: 'Access denied. Only restaurant owners can verify payments.'
        };
      }

      return {
        success: false,
        message: error.response?.data?.message || 'Failed to verify payment'
      };
    }
  },

  // Cancel order
  cancelOrder: async (orderId, reason = '') => {
    try {
      // Validate order ID format
      if (!orderId || !isValidId(orderId)) {
        return {
          success: false,
          message: 'Invalid order ID format'
        };
      }

      const response = await api.put(`/orders/${orderId}/cancel`, {
        reason
      });
      return response.data;
    } catch (error) {
      console.error('Error cancelling order:', error);
      
      if (error.response?.status === 404) {
        return {
          success: false,
          message: 'Order not found'
        };
      }

      return {
        success: false,
        message: error.response?.data?.message || 'Failed to cancel order'
      };
    }
  },

  // Update payment information
  updatePayment: async (orderId, paymentData) => {
    try {
      const response = await api.put(`/orders/${orderId}/payment`, paymentData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating payment:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update payment'
      };
    }
  },

  // Reorder (add items to cart)
  reorder: async (orderId) => {
    try {
      const response = await api.post(`/orders/${orderId}/reorder`);
      return response.data;
    } catch (error) {
      console.error('Error reordering:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to reorder'
      };
    }
  },

  // Get order statistics (for dashboard)
  getOrderStats: async (params = {}) => {
    try {
      const response = await api.get('/orders/stats', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching order stats:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch order statistics'
      };
    }
  },

  // Track order (real-time status)
  trackOrder: async (orderId) => {
    try {
      const response = await api.get(`/orders/${orderId}/track`);
      return response.data;
    } catch (error) {
      console.error('Error tracking order:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to track order'
      };
    }
  },

  // Get delivery estimate
  getDeliveryEstimate: async (restaurantId, deliveryAddress) => {
    try {
      const response = await api.post('/orders/delivery-estimate', {
        restaurantId,
        deliveryAddress
      });
      return response.data;
    } catch (error) {
      console.error('Error getting delivery estimate:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get delivery estimate'
      };
    }
  },

  // Rate order
  rateOrder: async (orderId, rating, review = '') => {
    try {
      const response = await api.post(`/orders/${orderId}/rate`, {
        rating,
        review
      });
      return response.data;
    } catch (error) {
      console.error('Error rating order:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to rate order'
      };
    }
  },

  // Get order receipt
  getOrderReceipt: async (orderId) => {
    try {
      const response = await api.get(`/orders/${orderId}/receipt`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error getting order receipt:', error);
      throw error;
    }
  },

  // Search orders
  searchOrders: async (query, filters = {}) => {
    try {
      const params = { search: query, ...filters };
      const response = await api.get('/orders/search', { params });
      return response.data;
    } catch (error) {
      console.error('Error searching orders:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to search orders'
      };
    }
  },

  // Get order analytics (for restaurant dashboard)
  getOrderAnalytics: async (params = {}) => {
    try {
      const response = await api.get('/orders/stats/dashboard', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching order analytics:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch order analytics'
      };
    }
  },



  // Bulk update orders (for restaurant owners)
  bulkUpdateOrders: async (orderIds, updates) => {
    try {
      const response = await api.put('/orders/bulk-update', {
        orderIds,
        updates
      });
      return response.data;
    } catch (error) {
      console.error('Error bulk updating orders:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to bulk update orders'
      };
    }
  },

  // Export orders (for restaurant owners)
  exportOrders: async (params = {}) => {
    try {
      const response = await api.get('/orders/export', {
        params,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting orders:', error);
      throw error;
    }
  },

  // Get recent orders for students with stats
  getRecentOrders: async (userType = 'student', limit = 5) => {
    try {
      const endpoint = userType === 'student' ? '/orders/student' : '/orders/restaurant/manage';
      const response = await api.get(endpoint, { 
        params: { limit, sortBy: 'createdAt', sortOrder: 'desc' } 
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching recent orders:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch recent orders',
        data: {
          orders: [],
          stats: {
            totalOrders: 0,
            totalSpent: 0,
            averageOrderValue: 0,
            statusCounts: {}
          }
        }
      };
    }
  }
};

export default orderService;