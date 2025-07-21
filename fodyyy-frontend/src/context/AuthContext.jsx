import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Initialize auth state on app load
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          // Validate token with backend
          const response = await authService.validateToken();
          if (response.success) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
          } else {
            // Token is invalid, clear storage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setToken(null);
            setUser(null);
          }
        } catch (error) {
          console.error('Token validation failed:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      }
      setIsInitializing(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    setIsLoading(true);
    try {
      const response = await authService.login(credentials);
      
      if (response.success) {
        // Backend returns user data with token in the same object
        const userData = response.data;
        const newToken = userData.token;
        
        // Create user object without token for storage
        const userForStorage = {
          _id: userData._id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          phone: userData.phone,
          address: userData.address,
          isActive: userData.isActive,
          createdAt: userData.createdAt,
          updatedAt: userData.updatedAt
        };
        
        // Store in localStorage
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userForStorage));
        
        // Update state
        setToken(newToken);
        setUser(userForStorage);
        
        toast.success(`Welcome back, ${userData.name}!`);
        setIsLoading(false); // Reset loading state immediately on success
        return { success: true, data: userForStorage };
      } else {
        // authService.login() returns the backend error message in response.message
        console.error('Login failed:', response.message);
        toast.error(response.message || 'Invalid credentials. Please try again.');
        setIsLoading(false); // Reset loading state immediately on error
        return { success: false, message: response.message };
      }
    } catch (error) {
      // This catch block handles unexpected errors (network issues, etc.)
      console.error('Login error in AuthContext:', error);
      const errorMessage = error.message || 'Login failed. Please try again.';
      toast.error(errorMessage);
      setIsLoading(false); // Reset loading state immediately on error
      return { success: false, message: errorMessage };
    }
  };

  const register = async (userData) => {
    setIsLoading(true);
    try {
      const response = await authService.register(userData);
      
      if (response.success) {
        toast.success('Registration successful! Please log in.');
        return { success: true, data: response.data };
      } else {
        toast.error(response.message || 'Registration failed');
        return { success: false, message: response.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Call logout endpoint to invalidate token on server
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage and state regardless of API call result
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
      toast.success('Logged out successfully');
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  // Helper functions for role-based access
  const isAuthenticated = !!token && !!user;
  const isStudent = () => user?.role === 'student';
  const isRestaurantOwner = () => user?.role === 'restaurant';
  const isAdmin = () => user?.role === 'admin';

  // Get user permissions
  const hasPermission = (permission) => {
    if (!user) return false;
    return user.permissions?.includes(permission) || false;
  };

  const value = {
    // State
    user,
    token,
    isLoading,
    isInitializing,
    isAuthenticated,
    
    // Actions
    login,
    register,
    logout,
    updateUser,
    
    // Role helpers
    isStudent,
    isRestaurantOwner,
    isAdmin,
    hasPermission,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};