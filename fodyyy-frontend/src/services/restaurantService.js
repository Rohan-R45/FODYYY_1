import api from './api';
import { isValidId } from '../utils/validation';

const restaurantService = {
  // Get my restaurant (for authenticated restaurant owner)
  getMyRestaurant: async () => {
    try {
      const response = await api.get('/restaurants/my-restaurant');
      return response.data;
    } catch (error) {
      console.error('Error fetching my restaurant:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch restaurant',
        requiresSetup: error.response?.data?.requiresSetup || false
      };
    }
  },

  // Get restaurant profile (legacy - keeping for backward compatibility)
  getRestaurantProfile: async () => {
    try {
      const response = await api.get('/restaurants/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching restaurant profile:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch restaurant profile'
      };
    }
  },

  // Update restaurant profile
  updateRestaurantProfile: async (profileData) => {
    try {
      const response = await api.put('/restaurants/profile', profileData);
      return response.data;
    } catch (error) {
      console.error('Error updating restaurant profile:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update restaurant profile'
      };
    }
  },

  // Upload restaurant image
  uploadImage: async (formData) => {
    try {
      const response = await api.post('/restaurants/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading image:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to upload image'
      };
    }
  },

  // Get restaurant by ID
  getRestaurantById: async (restaurantId) => {
    try {
      // Validate restaurant ID format
      if (!restaurantId) {
        return {
          success: false,
          message: 'Restaurant ID is required'
        };
      }

      if (!isValidId(restaurantId)) {
        return {
          success: false,
          message: 'Invalid restaurant ID format'
        };
      }

      const response = await api.get(`/restaurants/${restaurantId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching restaurant:', error);
      
      // Handle specific error cases
      if (error.response?.status === 404) {
        return {
          success: false,
          message: 'Restaurant not found'
        };
      }
      
      if (error.response?.status === 400) {
        return {
          success: false,
          message: 'Invalid restaurant ID format'
        };
      }

      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch restaurant'
      };
    }
  },

  // Create restaurant setup (for first-time setup)
  createRestaurantSetup: async (setupData) => {
    try {
      const response = await api.post('/restaurants', setupData);
      return response.data;
    } catch (error) {
      console.error('Error creating restaurant setup:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create restaurant setup',
        errors: error.response?.data?.errors || []
      };
    }
  },

  // Get all restaurants (for student browsing)
  getRestaurants: async (params = {}) => {
    try {
      const response = await api.get('/restaurants', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch restaurants'
      };
    }
  },

  // Search restaurants
  searchRestaurants: async (query, filters = {}) => {
    try {
      const params = { search: query, ...filters };
      const response = await api.get('/restaurants/search', { params });
      return response.data;
    } catch (error) {
      console.error('Error searching restaurants:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to search restaurants'
      };
    }
  },

  // Get restaurant analytics
  getRestaurantAnalytics: async (params = {}) => {
    try {
      const response = await api.get('/restaurants/analytics', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching restaurant analytics:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch analytics'
      };
    }
  },

  // Update restaurant status (open/closed)
  updateRestaurantStatus: async (isOpen) => {
    try {
      const response = await api.put('/restaurants/status', { isOpen });
      return response.data;
    } catch (error) {
      console.error('Error updating restaurant status:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update restaurant status'
      };
    }
  },

  // Update operating hours
  updateOperatingHours: async (operatingHours) => {
    try {
      const response = await api.put('/restaurants/operating-hours', operatingHours);
      return response.data;
    } catch (error) {
      console.error('Error updating operating hours:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update operating hours'
      };
    }
  },

  // Update delivery settings
  updateDeliverySettings: async (deliverySettings) => {
    try {
      const response = await api.put('/restaurants/delivery-settings', deliverySettings);
      return response.data;
    } catch (error) {
      console.error('Error updating delivery settings:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update delivery settings'
      };
    }
  },

  // Get restaurant reviews
  getRestaurantReviews: async (restaurantId, params = {}) => {
    try {
      const response = await api.get(`/restaurants/${restaurantId}/reviews`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching restaurant reviews:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch reviews'
      };
    }
  },

  // Get restaurant dashboard data
  getDashboardData: async () => {
    try {
      const response = await api.get('/restaurants/dashboard');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch dashboard data'
      };
    }
  },

  // Get featured restaurants
  getFeaturedRestaurants: async (limit = 6) => {
    try {
      const response = await api.get('/restaurants/featured', { 
        params: { limit } 
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching featured restaurants:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch featured restaurants'
      };
    }
  },

  // Get restaurants by cuisine
  getRestaurantsByCuisine: async (cuisine, params = {}) => {
    try {
      const response = await api.get(`/restaurants/cuisine/${cuisine}`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching restaurants by cuisine:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch restaurants'
      };
    }
  },

  // Get nearby restaurants
  getNearbyRestaurants: async (latitude, longitude, radius = 5) => {
    try {
      const response = await api.get('/restaurants/nearby', {
        params: { latitude, longitude, radius }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching nearby restaurants:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch nearby restaurants'
      };
    }
  },

  // Get restaurant statistics
  getRestaurantStats: async (period = 'month') => {
    try {
      const response = await api.get('/restaurants/stats', {
        params: { period }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching restaurant stats:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch restaurant statistics'
      };
    }
  },

  // Update restaurant settings
  updateRestaurantSettings: async (settings) => {
    try {
      const response = await api.put('/restaurants/settings', settings);
      return response.data;
    } catch (error) {
      console.error('Error updating restaurant settings:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update restaurant settings'
      };
    }
  },

  // Delete restaurant (soft delete)
  deleteRestaurant: async () => {
    try {
      const response = await api.delete('/restaurants/profile');
      return response.data;
    } catch (error) {
      console.error('Error deleting restaurant:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete restaurant'
      };
    }
  },

  // Verify restaurant
  verifyRestaurant: async (verificationData) => {
    try {
      const response = await api.post('/restaurants/verify', verificationData);
      return response.data;
    } catch (error) {
      console.error('Error verifying restaurant:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to verify restaurant'
      };
    }
  },

  // Get restaurant verification status
  getVerificationStatus: async () => {
    try {
      const response = await api.get('/restaurants/verification-status');
      return response.data;
    } catch (error) {
      console.error('Error fetching verification status:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch verification status'
      };
    }
  },

  // Submit restaurant for approval
  submitForApproval: async () => {
    try {
      const response = await api.post('/restaurants/submit-approval');
      return response.data;
    } catch (error) {
      console.error('Error submitting for approval:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to submit for approval'
      };
    }
  },

  // Get restaurant categories/cuisines
  getRestaurantCategories: async () => {
    try {
      const response = await api.get('/restaurants/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching restaurant categories:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch categories'
      };
    }
  },

  // Update restaurant availability
  updateAvailability: async (isAvailable, reason = '') => {
    try {
      const response = await api.put('/restaurants/availability', {
        isAvailable,
        reason
      });
      return response.data;
    } catch (error) {
      console.error('Error updating availability:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update availability'
      };
    }
  },

  // Get restaurant performance metrics
  getPerformanceMetrics: async (startDate, endDate) => {
    try {
      const response = await api.get('/restaurants/performance', {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch performance metrics'
      };
    }
  },

  // Export restaurant data
  exportRestaurantData: async (format = 'csv', params = {}) => {
    try {
      const response = await api.get('/restaurants/export', {
        params: { format, ...params },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting restaurant data:', error);
      throw error;
    }
  },

  // Get restaurant notifications
  getNotifications: async (params = {}) => {
    try {
      const response = await api.get('/restaurants/notifications', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch notifications'
      };
    }
  },

  // Mark notification as read
  markNotificationRead: async (notificationId) => {
    try {
      const response = await api.put(`/restaurants/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to mark notification as read'
      };
    }
  },

  // Update notification preferences
  updateNotificationPreferences: async (preferences) => {
    try {
      const response = await api.put('/restaurants/notification-preferences', preferences);
      return response.data;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update notification preferences'
      };
    }
  }
};

export default restaurantService;