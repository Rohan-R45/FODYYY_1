import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isValidEmail, isValidPhone } from '../utils/helpers';
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
  onTogglePassword = null,
  isTextarea = false,
  rows = 4
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value && value.length > 0;
  const isFloating = isFocused || hasValue;

  const InputComponent = isTextarea ? 'textarea' : 'input';

  return (
    <div className="relative mb-4">
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-4 text-gray-400 z-10">
            {icon}
          </div>
        )}
        
        <InputComponent
          key={`input-${id}`}
          id={id}
          name={name}
          type={isTextarea ? undefined : type}
          value={value || ''}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          required={required}
          disabled={disabled}
          rows={isTextarea ? rows : undefined}
          className={`
            w-full text-base bg-white border-2 rounded-xl 
            transition-all duration-300 ease-in-out outline-none resize-none
            ${icon ? 'pl-12' : 'pl-4'} 
            ${type === 'password' && onTogglePassword ? 'pr-12' : 'pr-4'}
            ${isTextarea ? 'py-3 px-4 h-auto min-h-[100px]' : 'h-14 py-3 px-4'}
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
              : `${isTextarea ? 'top-4' : 'top-1/2 -translate-y-1/2'} text-base text-gray-500`
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

const Register = () => {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') || 'student';

  const [formData, setFormData] = useState({
    // Common fields
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: initialRole,
    
    // Student specific
    hostelAddress: '',
    roomNumber: '',
    
    // Restaurant specific
    restaurantName: '',
    restaurantAddress: '',
    description: '',
    cuisineTypes: [],
    ownerName: '',
    registrationCode: '',
    
    // Terms and conditions
    acceptTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [availableCuisines] = useState([
    'North Indian', 'South Indian', 'Chinese', 'Italian', 'Fast Food',
    'Beverages', 'Desserts', 'Snacks', 'Continental', 'Mexican'
  ]);

  const { register, isLoading, isAuthenticated, isStudent } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const redirectTo = isStudent() ? '/student' : '/restaurant';
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, navigate, isStudent]);

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

  const handleConfirmPasswordToggle = useCallback(() => {
    setShowConfirmPassword(prev => !prev);
  }, []);

  const handleCuisineToggle = (cuisine) => {
    setFormData(prev => ({
      ...prev,
      cuisineTypes: prev.cuisineTypes.includes(cuisine)
        ? prev.cuisineTypes.filter(c => c !== cuisine)
        : [...prev.cuisineTypes, cuisine]
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Common validations
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters long';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!isValidPhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Student specific validations
    if (formData.role === 'student') {
      if (!formData.hostelAddress.trim()) {
        newErrors.hostelAddress = 'Hostel address is required';
      }
      if (!formData.roomNumber.trim()) {
        newErrors.roomNumber = 'Room number is required';
      }
    }

    // Restaurant specific validations
    if (formData.role === 'restaurant') {
      if (!formData.ownerName.trim()) {
        newErrors.ownerName = 'Owner name is required';
      }
      if (!formData.restaurantName.trim()) {
        newErrors.restaurantName = 'Restaurant name is required';
      }
      if (!formData.restaurantAddress.trim()) {
        newErrors.restaurantAddress = 'Restaurant address is required';
      }
      if (!formData.description.trim()) {
        newErrors.description = 'Restaurant description is required';
      } else if (formData.description.trim().length < 20) {
        newErrors.description = 'Description must be at least 20 characters long';
      }
      if (formData.cuisineTypes.length === 0) {
        newErrors.cuisineTypes = 'Please select at least one cuisine type';
      }
      // Registration code validation
      if (!formData.registrationCode.trim()) {
        newErrors.registrationCode = 'Restaurant registration code is required';
      } else if (formData.registrationCode.trim() !== '2904') {
        newErrors.registrationCode = 'Invalid registration code. Please contact support if you do not have the code.';
      }
    }

    // Terms and conditions validation
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'You must accept the terms and conditions to continue';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Prepare registration data
    const { confirmPassword, acceptTerms, ...registrationData } = formData;
    registrationData.email = registrationData.email.toLowerCase().trim();
    
    // For students, combine hostelAddress and roomNumber into a single address field
    if (registrationData.role === 'student') {
      registrationData.address = `${registrationData.hostelAddress}, Room: ${registrationData.roomNumber}`;
      // Remove the separate fields as backend expects only 'address'
      delete registrationData.hostelAddress;
      delete registrationData.roomNumber;
    }
    
    // For restaurants, prepare restaurant-specific data
    if (registrationData.role === 'restaurant') {
      registrationData.address = registrationData.restaurantAddress;
      // Keep restaurant-specific fields for backend processing
      // The backend now expects these fields for restaurant registration
      // Remove the separate hostel fields that don't apply to restaurants
      delete registrationData.hostelAddress;
      delete registrationData.roomNumber;
      delete registrationData.restaurantAddress; // Already moved to address
    }
    
    const result = await register(registrationData);
    
    if (result.success) {
      toast.success('Registration successful! Please log in to continue.');
      navigate('/login', { 
        state: { 
          email: registrationData.email,
          userType: registrationData.role 
        } 
      });
    }
  };

  const handleRoleChange = (role) => {
    setFormData(prev => ({
      ...prev,
      role
    }));
    setErrors({});
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
                Join IIT Tirupati's <br />
                <span className="text-yellow-200">Food Community</span>
              </h1>
              <p className="text-xl mb-8 text-orange-100 leading-relaxed">
                Connect with 20+ local restaurants and become part of our growing food community
              </p>
              
              {/* Social Proof */}
              <div className="flex items-center justify-center lg:justify-start space-x-4 mb-8">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-sm">👨‍🎓</div>
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-sm">👩‍🎓</div>
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-sm">🏪</div>
                  <div className="w-8 h-8 bg-yellow-200 rounded-full flex items-center justify-center text-sm font-bold text-orange-600">+</div>
                </div>
                <div className="text-sm text-orange-100">
                  <div className="font-semibold">500+ Happy Users</div>
                  <div className="text-xs">Join today</div>
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

        {/* Right Side - Registration Form */}
        <div className="bg-white flex items-center justify-center p-8 overflow-y-auto">
          <div className="w-full max-w-md">
            {/* Logo & Header */}
            <div className="text-center mb-8">
              <Link to="/" className="inline-block group">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent font-poppins">
                  FODYYY
                </h1>
                <p className="text-sm text-gray-600 mt-1">IIT Tirupati Food Delivery</p>
              </Link>
              <div className="mt-6">
                <h2 className="text-3xl font-bold text-gray-900 font-poppins">
                  Create your account
                </h2>
                <p className="mt-2 text-gray-600">
                  Join FODYYY and start {formData.role === 'student' ? 'ordering delicious food' : 'serving hungry students'}
                </p>
              </div>
            </div>

            {/* Registration Form */}
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Role Selection Toggle */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-4 text-center">
                  I want to join as:
                </label>
                <div className="relative bg-gray-100 rounded-2xl p-1">
                  <div className={`absolute top-1 bottom-1 w-1/2 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl transition-all duration-300 ease-in-out ${
                    formData.role === 'student' ? 'left-1' : 'left-1/2'
                  }`}></div>
                  
                  <div className="relative grid grid-cols-2">
                    <button
                      type="button"
                      className={`relative z-10 flex items-center justify-center h-12 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
                        formData.role === 'student'
                          ? 'text-white'
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                      onClick={() => handleRoleChange('student')}
                      disabled={isLoading}
                    >
                      <span className="text-lg mr-2">🎓</span>
                      Student Registration
                    </button>
                    <button
                      type="button"
                      className={`relative z-10 flex items-center justify-center h-12 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
                        formData.role === 'restaurant'
                          ? 'text-white'
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                      onClick={() => handleRoleChange('restaurant')}
                      disabled={isLoading}
                    >
                      <span className="text-lg mr-2">🏪</span>
                      Restaurant Registration
                    </button>
                  </div>
                </div>
              </div>

              {/* Common Fields */}
              <div className="space-y-4">
                {/* Name Field */}
                <FloatingInput
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={formData.role === 'student' ? 'Full Name' : 'Contact Person Name'}
                  required
                  error={errors.name}
                  disabled={isLoading}
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  }
                />

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

                {/* Confirm Password Field */}
                <FloatingInput
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm Password"
                  required
                  error={errors.confirmPassword}
                  disabled={isLoading}
                  showPassword={showConfirmPassword}
                  onTogglePassword={handleConfirmPasswordToggle}
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  }
                />

                {/* Phone Field */}
                <FloatingInput
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone Number"
                  required
                  error={errors.phone}
                  disabled={isLoading}
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  }
                />
              </div>

              {/* Student Specific Fields */}
              {formData.role === 'student' && (
                <div className="space-y-4">
                  {/* Hostel Address Field */}
                  <FloatingInput
                    id="hostelAddress"
                    name="hostelAddress"
                    type="text"
                    value={formData.hostelAddress}
                    onChange={handleChange}
                    placeholder="Hostel/Room Address"
                    required
                    error={errors.hostelAddress}
                    disabled={isLoading}
                    icon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    }
                  />

                  {/* Room Number Field */}
                  <FloatingInput
                    id="roomNumber"
                    name="roomNumber"
                    type="text"
                    value={formData.roomNumber}
                    onChange={handleChange}
                    placeholder="Room Number"
                    required
                    error={errors.roomNumber}
                    disabled={isLoading}
                    icon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    }
                  />
                </div>
              )}

              {/* Restaurant Specific Fields */}
              {formData.role === 'restaurant' && (
                <div className="space-y-4">
                  {/* Restaurant Name Field */}
                  <FloatingInput
                    id="restaurantName"
                    name="restaurantName"
                    type="text"
                    value={formData.restaurantName}
                    onChange={handleChange}
                    placeholder="Restaurant Name"
                    required
                    error={errors.restaurantName}
                    disabled={isLoading}
                    icon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    }
                  />

                  {/* Owner Name Field */}
                  <FloatingInput
                    id="ownerName"
                    name="ownerName"
                    type="text"
                    value={formData.ownerName}
                    onChange={handleChange}
                    placeholder="Owner Name"
                    required
                    error={errors.ownerName}
                    disabled={isLoading}
                    icon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    }
                  />

                  {/* Restaurant Address Field */}
                  <FloatingInput
                    id="restaurantAddress"
                    name="restaurantAddress"
                    value={formData.restaurantAddress}
                    onChange={handleChange}
                    placeholder="Restaurant Address"
                    required
                    error={errors.restaurantAddress}
                    disabled={isLoading}
                    isTextarea={true}
                    rows={3}
                    icon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    }
                  />

                  {/* Restaurant Description Field */}
                  <FloatingInput
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Restaurant Description"
                    required
                    error={errors.description}
                    disabled={isLoading}
                    isTextarea={true}
                    rows={4}
                    icon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    }
                  />

                  {/* Restaurant Registration Code Field */}
                  <FloatingInput
                    id="registrationCode"
                    name="registrationCode"
                    type="text"
                    value={formData.registrationCode}
                    onChange={handleChange}
                    placeholder="Restaurant Registration Code *"
                    required
                    error={errors.registrationCode}
                    disabled={isLoading}
                    icon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m0 0a2 2 0 012 2m-2-2a2 2 0 00-2 2m2-2a2 2 0 00-2-2m0 0a2 2 0 012-2m0 0a2 2 0 00-2 2m2 2v.01M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    }
                  />

                  {/* Cuisine Types */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-4">
                      Cuisine Types
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {availableCuisines.map((cuisine) => (
                        <label key={cuisine} className="flex items-center cursor-pointer group">
                          <div className="relative">
                            <input
                              type="checkbox"
                              className="sr-only"
                              checked={formData.cuisineTypes.includes(cuisine)}
                              onChange={() => handleCuisineToggle(cuisine)}
                              disabled={isLoading}
                            />
                            <div className={`w-5 h-5 rounded border-2 transition-all duration-200 flex items-center justify-center ${
                              formData.cuisineTypes.includes(cuisine)
                                ? 'bg-gradient-to-r from-orange-500 to-yellow-500 border-orange-500' 
                                : 'border-gray-300 hover:border-gray-400 group-hover:border-orange-300'
                            }`}>
                              {formData.cuisineTypes.includes(cuisine) && (
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                          </div>
                          <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900 transition-colors">{cuisine}</span>
                        </label>
                      ))}
                    </div>
                    {errors.cuisineTypes && <p className="mt-2 text-sm text-red-500 font-medium">{errors.cuisineTypes}</p>}
                  </div>
                </div>
              )}

              {/* Terms and Conditions */}
              <div className="pt-4">
                <label className="flex items-start cursor-pointer group">
                  <div className="relative">
                    <input
                      id="acceptTerms"
                      name="acceptTerms"
                      type="checkbox"
                      className="sr-only"
                      checked={formData.acceptTerms}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                    <div className={`w-5 h-5 rounded border-2 transition-all duration-200 flex items-center justify-center ${
                      formData.acceptTerms 
                        ? 'bg-gradient-to-r from-orange-500 to-yellow-500 border-orange-500' 
                        : `border-gray-300 hover:border-gray-400 group-hover:border-orange-300 ${errors.acceptTerms ? 'border-red-400' : ''}`
                    }`}>
                      {formData.acceptTerms && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="ml-3 text-sm text-gray-700 leading-5">
                    I agree to the{' '}
                    <Link to="/terms" className="text-orange-600 hover:text-orange-500 font-medium">
                      Terms and Conditions
                    </Link>
                    {' '}and{' '}
                    <Link to="/privacy" className="text-orange-600 hover:text-orange-500 font-medium">
                      Privacy Policy
                    </Link>
                  </span>
                </label>
                {errors.acceptTerms && (
                  <p className="mt-2 text-sm text-red-500 font-medium animate-fade-in">
                    {errors.acceptTerms}
                  </p>
                )}
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
                    <span>Creating Account...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <span>Create Account</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
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
                  <span className="px-4 bg-white text-gray-500">Already have an account?</span>
                </div>
              </div>

              <div className="mt-6 text-center">
                <Link
                  to={`/login?userType=${formData.role}`}
                  className="inline-flex items-center space-x-2 font-medium text-orange-600 hover:text-orange-500 transition-colors"
                >
                  <span>Sign in</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
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
              FODYYY
            </h1>
            <p className="text-orange-100 text-lg">Join Our Community!</p>
            <p className="text-orange-200 text-sm mt-2">Create your account to get started</p>
          </div>

          {/* Mobile Form Container */}
          <div className="flex-1 bg-white rounded-t-3xl px-6 py-8 mt-4 overflow-y-auto">
            <div className="max-w-sm mx-auto">
              {/* Mobile Form Header */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 font-poppins">
                  Create your account
                </h2>
                <p className="mt-2 text-gray-600 text-sm">
                  Join FODYYY and start {formData.role === 'student' ? 'ordering delicious food' : 'serving hungry students'}
                </p>
              </div>

              {/* Mobile Form */}
              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Mobile Role Selection Toggle */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-4 text-center">
                    I want to join as:
                  </label>
                  <div className="relative bg-gray-100 rounded-2xl p-1">
                    <div className={`absolute top-1 bottom-1 w-1/2 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl transition-all duration-300 ease-in-out ${
                      formData.role === 'student' ? 'left-1' : 'left-1/2'
                    }`}></div>
                    
                    <div className="relative grid grid-cols-2">
                      <button
                        type="button"
                        className={`relative z-10 flex flex-col items-center justify-center h-16 px-2 rounded-xl text-xs font-semibold transition-all duration-300 ${
                          formData.role === 'student'
                            ? 'text-white'
                            : 'text-gray-600 hover:text-gray-800'
                        }`}
                        onClick={() => handleRoleChange('student')}
                        disabled={isLoading}
                      >
                        <span className="text-xl mb-1">🎓</span>
                        <span>Student</span>
                      </button>
                      <button
                        type="button"
                        className={`relative z-10 flex flex-col items-center justify-center h-16 px-2 rounded-xl text-xs font-semibold transition-all duration-300 ${
                          formData.role === 'restaurant'
                            ? 'text-white'
                            : 'text-gray-600 hover:text-gray-800'
                        }`}
                        onClick={() => handleRoleChange('restaurant')}
                        disabled={isLoading}
                      >
                        <span className="text-xl mb-1">🏪</span>
                        <span>Restaurant</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Mobile Form Fields - Same as Desktop */}
                <div className="space-y-4">
                  {/* Name Field */}
                  <FloatingInput
                    id="name-mobile"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={formData.role === 'student' ? 'Full Name' : 'Contact Person Name'}
                    required
                    error={errors.name}
                    disabled={isLoading}
                    icon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    }
                  />

                  {/* Email Field */}
                  <FloatingInput
                    id="email-mobile"
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
                    id="password-mobile"
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

                  {/* Confirm Password Field */}
                  <FloatingInput
                    id="confirmPassword-mobile"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm Password"
                    required
                    error={errors.confirmPassword}
                    disabled={isLoading}
                    showPassword={showConfirmPassword}
                    onTogglePassword={handleConfirmPasswordToggle}
                    icon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    }
                  />

                  {/* Phone Field */}
                  <FloatingInput
                    id="phone-mobile"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Phone Number"
                    required
                    error={errors.phone}
                    disabled={isLoading}
                    icon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    }
                  />
                </div>

                {/* Mobile Student Specific Fields */}
                {formData.role === 'student' && (
                  <div className="space-y-4">
                    <FloatingInput
                      id="hostelAddress-mobile"
                      name="hostelAddress"
                      type="text"
                      value={formData.hostelAddress}
                      onChange={handleChange}
                      placeholder="Hostel/Room Address"
                      required
                      error={errors.hostelAddress}
                      disabled={isLoading}
                      icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      }
                    />

                    <FloatingInput
                      id="roomNumber-mobile"
                      name="roomNumber"
                      type="text"
                      value={formData.roomNumber}
                      onChange={handleChange}
                      placeholder="Room Number"
                      required
                      error={errors.roomNumber}
                      disabled={isLoading}
                      icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                      }
                    />
                  </div>
                )}

                {/* Mobile Restaurant Specific Fields */}
                {formData.role === 'restaurant' && (
                  <div className="space-y-4">
                    <FloatingInput
                      id="restaurantName-mobile"
                      name="restaurantName"
                      type="text"
                      value={formData.restaurantName}
                      onChange={handleChange}
                      placeholder="Restaurant Name"
                      required
                      error={errors.restaurantName}
                      disabled={isLoading}
                      icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      }
                    />

                    <FloatingInput
                      id="ownerName-mobile"
                      name="ownerName"
                      type="text"
                      value={formData.ownerName}
                      onChange={handleChange}
                      placeholder="Owner Name"
                      required
                      error={errors.ownerName}
                      disabled={isLoading}
                      icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      }
                    />

                    <FloatingInput
                      id="restaurantAddress-mobile"
                      name="restaurantAddress"
                      value={formData.restaurantAddress}
                      onChange={handleChange}
                      placeholder="Restaurant Address"
                      required
                      error={errors.restaurantAddress}
                      disabled={isLoading}
                      isTextarea={true}
                      rows={3}
                      icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      }
                    />

                    <FloatingInput
                      id="description-mobile"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Restaurant Description"
                      required
                      error={errors.description}
                      disabled={isLoading}
                      isTextarea={true}
                      rows={4}
                      icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      }
                    />

                    {/* Mobile Restaurant Registration Code Field */}
                    <FloatingInput
                      id="registrationCode-mobile"
                      name="registrationCode"
                      type="text"
                      value={formData.registrationCode}
                      onChange={handleChange}
                      placeholder="Restaurant Registration Code *"
                      required
                      error={errors.registrationCode}
                      disabled={isLoading}
                      icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m0 0a2 2 0 012 2m-2-2a2 2 0 00-2 2m2-2a2 2 0 00-2-2m0 0a2 2 0 012-2m0 0a2 2 0 00-2 2m2 2v.01M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      }
                    />

                    {/* Mobile Cuisine Types */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-4">
                        Cuisine Types
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {availableCuisines.map((cuisine) => (
                          <label key={cuisine} className="flex items-center cursor-pointer group">
                            <div className="relative">
                              <input
                                type="checkbox"
                                className="sr-only"
                                checked={formData.cuisineTypes.includes(cuisine)}
                                onChange={() => handleCuisineToggle(cuisine)}
                                disabled={isLoading}
                              />
                              <div className={`w-4 h-4 rounded border-2 transition-all duration-200 flex items-center justify-center ${
                                formData.cuisineTypes.includes(cuisine)
                                  ? 'bg-gradient-to-r from-orange-500 to-yellow-500 border-orange-500' 
                                  : 'border-gray-300 hover:border-gray-400 group-hover:border-orange-300'
                              }`}>
                                {formData.cuisineTypes.includes(cuisine) && (
                                  <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </div>
                            </div>
                            <span className="ml-2 text-xs text-gray-700 group-hover:text-gray-900 transition-colors">{cuisine}</span>
                          </label>
                        ))}
                      </div>
                      {errors.cuisineTypes && <p className="mt-2 text-sm text-red-500 font-medium">{errors.cuisineTypes}</p>}
                    </div>
                  </div>
                )}

                {/* Mobile Terms and Conditions */}
                <div className="pt-4">
                  <label className="flex items-start cursor-pointer group">
                    <div className="relative">
                      <input
                        id="acceptTerms-mobile"
                        name="acceptTerms"
                        type="checkbox"
                        className="sr-only"
                        checked={formData.acceptTerms}
                        onChange={handleChange}
                        disabled={isLoading}
                      />
                      <div className={`w-4 h-4 rounded border-2 transition-all duration-200 flex items-center justify-center ${
                        formData.acceptTerms 
                          ? 'bg-gradient-to-r from-orange-500 to-yellow-500 border-orange-500' 
                          : `border-gray-300 hover:border-gray-400 group-hover:border-orange-300 ${errors.acceptTerms ? 'border-red-400' : ''}`
                      }`}>
                        {formData.acceptTerms && (
                          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className="ml-2 text-xs text-gray-700 leading-4">
                      I agree to the{' '}
                      <Link to="/terms" className="text-orange-600 hover:text-orange-500 font-medium">
                        Terms and Conditions
                      </Link>
                      {' '}and{' '}
                      <Link to="/privacy" className="text-orange-600 hover:text-orange-500 font-medium">
                        Privacy Policy
                      </Link>
                    </span>
                  </label>
                  {errors.acceptTerms && (
                    <p className="mt-2 text-sm text-red-500 font-medium animate-fade-in">
                      {errors.acceptTerms}
                    </p>
                  )}
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
                      <span>Creating Account...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <span>Create Account</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
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
                    <span className="px-4 bg-white text-gray-500">Already have an account?</span>
                  </div>
                </div>

                <Link
                  to={`/login?userType=${formData.role}`}
                  className="inline-flex items-center space-x-2 font-medium text-orange-600 hover:text-orange-500 transition-colors"
                >
                  <span>Sign in</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
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

export default Register;