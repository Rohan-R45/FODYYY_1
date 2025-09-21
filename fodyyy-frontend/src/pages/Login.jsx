import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isValidEmail } from '../utils/helpers';
import toast from 'react-hot-toast';

// Floating Input Component
const FloatingInput = React.memo(({ 
  id, 
  name, 
  type = 'text', 
  value, 
  onChange, 
  placeholder, 
  required = false, 
  error = '', 
  disabled = false,
  icon = null,
  showPassword = false,
  onTogglePassword = null
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value && value.length > 0;
  const isFloating = isFocused || hasValue;

  return (
    <div className="relative mb-6">
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10">
            {icon}
          </div>
        )}
        
        <input
          key={`input-${id}`}
          id={id}
          name={name}
          type={type}
          value={value || ''}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          required={required}
          disabled={disabled}
          className={`
            w-full h-14 text-base bg-white border-2 rounded-xl 
            transition-all duration-300 ease-in-out outline-none
            ${icon ? 'pl-12 pr-10' : 'pl-6 pr-6'}
            ${type === 'password' && onTogglePassword ? 'pr-14' : ''}
            py-3
            ${error 
              ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
              : 'border-gray-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-100'
            }
            ${isFocused ? 'shadow-lg border-orange-500' : 'shadow-sm hover:shadow-md hover:border-gray-400'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            placeholder-transparent
          `}
          placeholder={placeholder}
        />
        
        <label
          htmlFor={id}
          className={`
            absolute transition-all duration-300 ease-in-out cursor-text pointer-events-none
            ${icon ? 'left-12' : 'left-4'}
            ${isFloating 
              ? 'top-2 text-xs font-semibold text-orange-600' 
              : 'top-1/2 -translate-y-1/2 text-base text-gray-500'
            }
            ${isFocused && !error ? 'text-orange-600' : ''}
            ${error ? 'text-red-500' : ''}
          `}
        >
          {placeholder}
        </label>

        {type === 'password' && onTogglePassword && (
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
            disabled={disabled}
          >
            {showPassword ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        )}
      </div>
      
      {error && (
        <div className="absolute -bottom-5 left-0 text-sm text-red-500 animate-fade-in font-medium">
          {error}
        </div>
      )}
    </div>
  );
});

FloatingInput.displayName = 'FloatingInput';

// Food Loading Spinner Component
const FoodLoadingSpinner = () => (
  <div className="flex items-center justify-center">
    <div className="relative">
      <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg animate-bounce">🍽️</span>
      </div>
    </div>
  </div>
);

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userType: 'student', // student or restaurant
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const { login, isLoading, isAuthenticated, isStudent, isRestaurantOwner } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || (isStudent() ? '/student' : '/restaurant');
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location, isStudent]);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        if (prev[name]) {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        }
        return prev;
      });
    }
  }, [errors]);

  const handlePasswordToggle = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const loginData = {
      email: formData.email.toLowerCase().trim(),
      password: formData.password,
      expectedRole: formData.userType, // Send expected role to backend for validation
    };

    console.log('🚀 Login form submitted with data:', loginData);
    
    try {
      const result = await login(loginData);
      
      console.log('📋 Login result:', result);
      
      if (result?.success) {
        // Verify the user role matches the selected type
        if (result.data.role !== formData.userType) {
          toast.error(`This account is registered as a ${result.data.role}, not a ${formData.userType}`);
          return;
        }

        const redirectPath = location.state?.from?.pathname || 
          (result.data.role === 'student' ? '/student' : '/restaurant');
        navigate(redirectPath, { replace: true });
      } else {
        console.log('❌ Login failed:', result?.message || 'Unknown error');
        // Error toast is already shown by the AuthContext
        // Clear any form errors to allow retry
        setErrors({});
      }
    } catch (error) {
      console.error('❌ Unexpected error during login:', error);
      toast.error('An unexpected error occurred. Please try again.');
    }
  };

  const handleUserTypeChange = (type) => {
    setFormData(prev => ({
      ...prev,
      userType: type
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Layout - Split Screen */}
      <div className="hidden lg:grid lg:grid-cols-2 min-h-screen">
        {/* Left Side - Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-orange-400 via-orange-500 to-yellow-400">
          {/* Animated Food Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 left-20 text-6xl animate-bounce opacity-70">🍕</div>
            <div className="absolute top-40 right-32 text-5xl animate-pulse opacity-60">🍔</div>
            <div className="absolute bottom-40 left-16 text-4xl animate-bounce opacity-70" style={{animationDelay: '0.5s'}}>🍜</div>
            <div className="absolute bottom-20 right-20 text-5xl animate-pulse opacity-60" style={{animationDelay: '1s'}}>🍛</div>
            <div className="absolute top-60 left-1/2 -translate-x-1/2 text-3xl animate-bounce opacity-50" style={{animationDelay: '1.5s'}}>🥘</div>
          </div>
          
          {/* Content - Perfectly Centered */}
          <div className="relative z-10 h-full flex items-center justify-center px-12">
            <div className="max-w-lg text-white text-center lg:text-left">
              <h1 className="text-5xl font-bold mb-6 font-poppins leading-tight">
                Welcome Back to <br />
                <span className="text-yellow-200">IIT & IISER Tirupati's</span><br />
                Favorite Food App
              </h1>
              <p className="text-xl mb-8 text-orange-100 leading-relaxed">
                Join 500+ students ordering delicious food daily from the comfort of their hostels
              </p>
              
              {/* Social Proof */}
              <div className="flex items-center justify-center lg:justify-start space-x-4 mb-8">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-sm">👨‍🎓</div>
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-sm">👩‍🎓</div>
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-sm">👨‍🎓</div>
                  <div className="w-8 h-8 bg-yellow-200 rounded-full flex items-center justify-center text-sm font-bold text-orange-600">+</div>
                </div>
                <div className="text-sm text-orange-100">
                  <div className="font-semibold">500+ Happy Students</div>
                  <div className="text-xs">Ordered this week</div>
                </div>
              </div>
              
              {/* Trust Indicators */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-6 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 bg-green-400 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-orange-100">IIT Verified</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 bg-blue-400 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-orange-100">Secure</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 bg-purple-400 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-orange-100">Quick Setup</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="bg-white flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Logo & Header */}
            <div className="text-center mb-8">
              <Link to="/" className="inline-block group">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent font-poppins">
                  FOODY
                </h1>
                <p className="text-sm text-gray-600 mt-1">IIT & IISER Tirupati Food Delivery</p>
              </Link>
              <div className="mt-6">
                <h2 className="text-3xl font-bold text-gray-900 font-poppins">
                  Sign in to your account
                </h2>
                <p className="mt-2 text-gray-600">
                  Choose your role and enter your credentials
                </p>
              </div>
            </div>

            {/* Login Form */}
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* User Type Toggle */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-4 text-center">
                  I am signing in as:
                </label>
                <div className="relative bg-gray-100 rounded-2xl p-1">
                  <div className={`absolute top-1 bottom-1 w-1/2 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl transition-all duration-300 ease-in-out ${
                    formData.userType === 'student' ? 'left-1' : 'left-1/2'
                  }`}></div>
                  
                  <div className="relative grid grid-cols-2">
                    <button
                      type="button"
                      className={`relative z-10 flex items-center justify-center h-12 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
                        formData.userType === 'student'
                          ? 'text-white'
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                      onClick={() => handleUserTypeChange('student')}
                      disabled={isLoading}
                    >
                      <span className="text-lg mr-2">🎓</span>
                      Student Login
                    </button>
                    <button
                      type="button"
                      className={`relative z-10 flex items-center justify-center h-12 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
                        formData.userType === 'restaurant'
                          ? 'text-white'
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                      onClick={() => handleUserTypeChange('restaurant')}
                      disabled={isLoading}
                    >
                      <span className="text-lg mr-2">🏪</span>
                      Restaurant Owner
                    </button>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                {/* Email Field */}
                <FloatingInput
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email Address"
                  required
                  error={errors.email}
                  disabled={isLoading}
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  }
                />

                {/* Password Field */}
                <FloatingInput
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  required
                  error={errors.password}
                  disabled={isLoading}
                  showPassword={showPassword}
                  onTogglePassword={handlePasswordToggle}
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  }
                />
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input
                      id="rememberMe"
                      name="rememberMe"
                      type="checkbox"
                      className="sr-only"
                      checked={formData.rememberMe}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                    <div className={`w-5 h-5 rounded-md border-2 transition-all duration-200 flex items-center justify-center ${
                      formData.rememberMe 
                        ? 'bg-gradient-to-r from-orange-500 to-yellow-500 border-orange-500' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}>
                      {formData.rememberMe && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="ml-3 text-sm text-gray-700">Remember me</span>
                </label>

                <Link 
                  to="/forgot-password" 
                  className="text-sm font-medium text-orange-600 hover:text-orange-500 hover:underline transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold rounded-xl 
                         transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg 
                         focus:outline-none focus:ring-4 focus:ring-orange-200 disabled:opacity-50 disabled:cursor-not-allowed
                         active:scale-95 mt-6"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <FoodLoadingSpinner />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <span>Sign In</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                  </div>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">Don't have an account?</span>
                </div>
              </div>

              <div className="mt-6 text-center">
                <Link
                  to={`/register?role=${formData.userType}`}
                  className="inline-flex items-center space-x-2 font-medium text-orange-600 hover:text-orange-500 transition-colors"
                >
                  <span>Create a new account</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-8">
              <Link 
                to="/" 
                className="inline-flex items-center space-x-2 text-sm text-gray-600 hover:text-orange-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Back to Home</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden min-h-screen bg-gradient-to-br from-orange-400 via-orange-500 to-yellow-400 relative">
        {/* Mobile Background Elements */}
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <div className="absolute top-10 left-10 text-4xl animate-bounce">🍕</div>
          <div className="absolute top-20 right-10 text-3xl animate-pulse">🍔</div>
          <div className="absolute bottom-32 left-8 text-3xl animate-bounce" style={{animationDelay: '0.5s'}}>🍜</div>
          <div className="absolute bottom-40 right-12 text-4xl animate-pulse" style={{animationDelay: '1s'}}>🍛</div>
        </div>

        {/* Mobile Content */}
        <div className="relative z-10 min-h-screen flex flex-col">
          {/* Mobile Header */}
          <div className="text-center pt-12 pb-8 px-6">
            <h1 className="text-4xl font-bold text-white font-poppins mb-2">
              FOODY
            </h1>
            <p className="text-orange-100 text-lg">Welcome Back!</p>
            <p className="text-orange-200 text-sm mt-2">Sign in to continue ordering</p>
          </div>

          {/* Mobile Form Container */}
          <div className="flex-1 bg-white rounded-t-3xl px-6 py-8 mt-4">
            <div className="max-w-sm mx-auto">
              {/* Mobile Form Header */}
              <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 font-poppins">
                  Sign in to your account
                </h2>
                <p className="mt-2 text-gray-600 text-sm">
                  Choose your role and enter your credentials
                </p>
              </div>

              {/* Mobile Form */}
              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Mobile User Type Toggle */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-4 text-center">
                    I am signing in as:
                  </label>
                  <div className="relative bg-gray-100 rounded-2xl p-1">
                    <div className={`absolute top-1 bottom-1 w-1/2 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl transition-all duration-300 ease-in-out ${
                      formData.userType === 'student' ? 'left-1' : 'left-1/2'
                    }`}></div>
                    
                    <div className="relative grid grid-cols-2">
                      <button
                        type="button"
                        className={`relative z-10 flex flex-col items-center justify-center h-16 px-2 rounded-xl text-xs font-semibold transition-all duration-300 ${
                          formData.userType === 'student'
                            ? 'text-white'
                            : 'text-gray-600 hover:text-gray-800'
                        }`}
                        onClick={() => handleUserTypeChange('student')}
                        disabled={isLoading}
                      >
                        <span className="text-xl mb-1">🎓</span>
                        <span>Student</span>
                      </button>
                      <button
                        type="button"
                        className={`relative z-10 flex flex-col items-center justify-center h-16 px-2 rounded-xl text-xs font-semibold transition-all duration-300 ${
                          formData.userType === 'restaurant'
                            ? 'text-white'
                            : 'text-gray-600 hover:text-gray-800'
                        }`}
                        onClick={() => handleUserTypeChange('restaurant')}
                        disabled={isLoading}
                      >
                        <span className="text-xl mb-1">🏪</span>
                        <span>Restaurant</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Mobile Form Fields */}
                <div className="space-y-4">
                  <FloatingInput
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email Address"
                    required
                    error={errors.email}
                    disabled={isLoading}
                    icon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    }
                  />

                  <FloatingInput
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Password"
                    required
                    error={errors.password}
                    disabled={isLoading}
                    showPassword={showPassword}
                    onTogglePassword={handlePasswordToggle}
                    icon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    }
                  />
                </div>

                {/* Mobile Remember Me & Forgot Password */}
                <div className="flex items-center justify-between pt-2 text-sm">
                  <label className="flex items-center cursor-pointer">
                    <div className="relative">
                      <input
                        id="rememberMe"
                        name="rememberMe"
                        type="checkbox"
                        className="sr-only"
                        checked={formData.rememberMe}
                        onChange={handleChange}
                        disabled={isLoading}
                      />
                      <div className={`w-4 h-4 rounded border-2 transition-all duration-200 flex items-center justify-center ${
                        formData.rememberMe 
                          ? 'bg-gradient-to-r from-orange-500 to-yellow-500 border-orange-500' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}>
                        {formData.rememberMe && (
                          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className="ml-2 text-gray-700">Remember me</span>
                  </label>

                  <Link 
                    to="/forgot-password" 
                    className="font-medium text-orange-600 hover:text-orange-500 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Mobile Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold rounded-xl 
                           transition-all duration-300 ease-in-out transform active:scale-95 
                           focus:outline-none focus:ring-4 focus:ring-orange-200 disabled:opacity-50 disabled:cursor-not-allowed
                           mt-6"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <FoodLoadingSpinner />
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <span>Sign In</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                    </div>
                  )}
                </button>
              </form>

              {/* Mobile Footer Links */}
              <div className="mt-8 space-y-4 text-center">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">Don't have an account?</span>
                  </div>
                </div>

                <Link
                  to={`/register?role=${formData.userType}`}
                  className="inline-flex items-center space-x-2 font-medium text-orange-600 hover:text-orange-500 transition-colors"
                >
                  <span>Create a new account</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>

                <div className="pt-4">
                  <Link 
                    to="/" 
                    className="inline-flex items-center space-x-2 text-sm text-gray-600 hover:text-orange-600 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span>Back to Home</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;