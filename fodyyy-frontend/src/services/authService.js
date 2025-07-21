import api from './api';

export const authService = {
  // Login user
  login: async (credentials) => {
    try {
      console.log('🔐 Attempting login with:', credentials.email);
      console.log('⏰ Login request starting...');
      
      const response = await api.post('/auth/login', credentials, {
        timeout: 15000 // 15 seconds timeout for login requests
      });
      console.log('✅ Login response received:', response.data);
      
      // Backend returns { success: true, data: { user + token } }
      if (response.data.success && response.data.data) {
        // Store token and user data
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data));
        
        return {
          success: true,
          data: response.data.data
        };
      } else {
        console.log('❌ Login failed - backend returned error:', response.data);
        return {
          success: false,
          message: response.data.message || 'Login failed'
        };
      }
    } catch (error) {
      console.error('❌ Login error caught:', error);
      console.error('❌ Error details:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config?.url
      });
      
      // Handle different types of errors
      if (error.code === 'ECONNABORTED') {
        console.log('⏰ Request timed out');
        return {
          success: false,
          message: 'Login request timed out. Please check your connection and try again.'
        };
      } else if (error.code === 'ECONNREFUSED') {
        console.log('🔌 Connection refused');
        return {
          success: false,
          message: 'Unable to connect to server. Please try again later.'
        };
      } else if (error.response) {
        // Handle specific HTTP status codes
        const status = error.response.status;
        const errorMessage = error.response.data?.message;
        
        console.log(`📊 HTTP ${status} error:`, errorMessage);
        
        if (status === 401) {
          return {
            success: false,
            message: errorMessage || 'Invalid email or password. Please check your credentials and try again.'
          };
        } else if (status === 400) {
          return {
            success: false,
            message: errorMessage || 'Invalid request. Please check your credentials and try again.'
          };
        } else if (status === 422) {
          return {
            success: false,
            message: errorMessage || 'Validation error. Please check your input and try again.'
          };
        } else if (status === 429) {
          return {
            success: false,
            message: 'Too many login attempts. Please wait a moment and try again.'
          };
        } else if (status >= 500) {
          return {
            success: false,
            message: 'Server error. Please try again in a moment.'
          };
        } else {
          return {
            success: false,
            message: errorMessage || 'Login failed. Please check your credentials and try again.'
          };
        }
      } else {
        console.log('🌐 Network error:', error.message);
        return {
          success: false,
          message: error.message || 'Network connection error. Please try again.'
        };
      }
    }
  },

  // Register user
  register: async (userData) => {
    try {
      console.log('📝 Attempting registration for:', userData.email);
      const response = await api.post('/auth/register', userData);
      console.log('✅ Registration response:', response.data);
      
      // Backend returns { success: true, data: { user + token } }
      if (response.data.success && response.data.data) {
        // Store token and user data
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data));
        
        return {
          success: true,
          data: response.data.data
        };
      } else {
        return {
          success: false,
          message: response.data.message || 'Registration failed'
        };
      }
    } catch (error) {
      console.error('❌ Registration error:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Network connection error. Please try again.'
      };
    }
  },

  // Logout user
  logout: async () => {
    try {
      await api.post('/auth/logout');
      return { success: true };
    } catch (error) {
      // Even if logout fails on server, we should clear local storage
      return { success: true };
    }
  },

  // Validate token
  validateToken: async () => {
    try {
      const response = await api.get('/auth/validate');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Token validation failed'
      };
    }
  },

  // Refresh token
  refreshToken: async () => {
    try {
      const response = await api.post('/auth/refresh');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Token refresh failed'
      };
    }
  },

  // Forgot password
  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send reset email'
      };
    }
  },

  // Reset password
  resetPassword: async (token, newPassword) => {
    try {
      const response = await api.post('/auth/reset-password', {
        token,
        password: newPassword
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Password reset failed'
      };
    }
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await api.post('/auth/change-password', {
        currentPassword,
        newPassword
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Password change failed'
      };
    }
  },

  // Update profile
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/auth/profile', profileData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Profile update failed'
      };
    }
  },

  // Get user profile
  getProfile: async () => {
    try {
      const response = await api.get('/auth/profile');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch profile'
      };
    }
  },

  // Verify email
  verifyEmail: async (token) => {
    try {
      const response = await api.post('/auth/verify-email', { token });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Email verification failed'
      };
    }
  },

  // Resend verification email
  resendVerification: async (email) => {
    try {
      const response = await api.post('/auth/resend-verification', { email });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to resend verification email'
      };
    }
  }
};