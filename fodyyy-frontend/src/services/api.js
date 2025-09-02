import axios from 'axios';
import toast from 'react-hot-toast';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 30000, // Increased timeout to 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle network errors
    if (!error.response) {
      toast.error('Network error. Please check your connection.');
      return Promise.reject(error);
    }

    const { status, data } = error.response;

    switch (status) {
      case 401:
        // Skip automatic handling for auth endpoints - let authService handle them
        if (originalRequest.url.includes('/auth/login') || originalRequest.url.includes('/auth/register')) {
          return Promise.reject(error);
        }
        
        // Unauthorized - token expired or invalid
        if (!originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            // Try to refresh token
            const refreshResponse = await api.post('/auth/refresh');
            
            // Backend returns { success: true, data: { token } }
            let token;
            if (refreshResponse.data.success && refreshResponse.data.data) {
              token = refreshResponse.data.data.token;
            } else {
              throw new Error('Invalid refresh response format');
            }
            
            // Update token in localStorage
            localStorage.setItem('token', token);
            
            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          } catch (refreshError) {
            // Refresh failed, redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        } else {
          // Already tried to refresh, redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        break;

      case 403:
        // Forbidden - insufficient permissions
        toast.error(data?.message || 'You don\'t have permission to perform this action.');
        break;

      case 404:
        // Not found
        if (!originalRequest.url.includes('/auth/validate')) {
          // Avoid duplicate toasts for student orders list page
          if (!originalRequest.url.includes('/orders/student')) {
            toast.error(data?.message || 'Resource not found.');
          }
        }
        break;

      case 400:
        // Bad request - skip automatic handling for auth endpoints
        if (originalRequest.url.includes('/auth/login') || originalRequest.url.includes('/auth/register')) {
          return Promise.reject(error);
        }
        toast.error(data?.message || 'Bad request.');
        break;

      case 422:
        // Validation error - skip automatic handling for auth endpoints
        if (originalRequest.url.includes('/auth/login') || originalRequest.url.includes('/auth/register')) {
          return Promise.reject(error);
        }
        if (data?.errors) {
          // Handle validation errors
          Object.values(data.errors).forEach(error => {
            if (Array.isArray(error)) {
              error.forEach(msg => toast.error(msg));
            } else {
              toast.error(error);
            }
          });
        } else {
          toast.error(data?.message || 'Validation error.');
        }
        break;

      case 429:
        // Too many requests
        toast.error('Too many requests. Please try again later.');
        break;

      case 500:
        // Server error
        // Avoid duplicate toasts on student orders page to let screen-level error render once
        if (!originalRequest.url.includes('/orders/student')) {
          toast.error('Server error. Please try again later.');
        }
        break;

      case 503:
        // Service unavailable
        toast.error('Service temporarily unavailable. Please try again later.');
        break;

      default:
        // Other errors
        toast.error(data?.message || 'An unexpected error occurred.');
    }

    return Promise.reject(error);
  }
);

// Helper functions for common API patterns
export const apiHelpers = {
  // GET request with error handling
  get: async (url, config = {}) => {
    try {
      const response = await api.get(url, config);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Request failed' 
      };
    }
  },

  // POST request with error handling
  post: async (url, data = {}, config = {}) => {
    try {
      const response = await api.post(url, data, config);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Request failed' 
      };
    }
  },

  // PUT request with error handling
  put: async (url, data = {}, config = {}) => {
    try {
      const response = await api.put(url, data, config);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Request failed' 
      };
    }
  },

  // DELETE request with error handling
  delete: async (url, config = {}) => {
    try {
      const response = await api.delete(url, config);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Request failed' 
      };
    }
  },

  // Upload file with progress
  upload: async (url, formData, onProgress = null) => {
    try {
      const response = await api.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        },
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Upload failed' 
      };
    }
  },
};

export default api;