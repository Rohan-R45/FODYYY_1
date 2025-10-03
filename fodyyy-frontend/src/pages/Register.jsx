import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { isValidEmail, isValidPhone } from '../utils/helpers';
import toast from 'react-hot-toast';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  User,
  Phone,
  Home,
  Store,
  CheckCircle,
  GraduationCap,
  Shield,
  Zap,
  MessageCircle
} from 'lucide-react';

// Trust Badge Component
const TrustBadge = ({ icon: Icon, text, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    whileHover={{ scale: 1.05, y: -2 }}
    className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-orange-100"
  >
    <Icon className="w-4 h-4 text-orange-500" />
    <span className="text-sm font-medium text-gray-700">{text}</span>
  </motion.div>
);

// Password Strength Indicator
const PasswordStrength = ({ password }) => {
  const getStrength = () => {
    if (!password) return { level: 0, text: '', color: '' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    if (strength <= 2) return { level: 33, text: 'Weak', color: 'bg-red-500' };
    if (strength <= 3) return { level: 66, text: 'Medium', color: 'bg-yellow-500' };
    return { level: 100, text: 'Strong', color: 'bg-green-500' };
  };

  const strength = getStrength();

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-600">Password strength:</span>
        <span className={`text-xs font-semibold ${
          strength.text === 'Weak' ? 'text-red-500' :
          strength.text === 'Medium' ? 'text-yellow-500' :
          'text-green-500'
        }`}>
          {strength.text}
        </span>
      </div>
      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${strength.level}%` }}
          transition={{ duration: 0.3 }}
          className={`h-full ${strength.color} rounded-full`}
        />
      </div>
    </div>
  );
};

const Register = () => {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') || 'student';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: initialRole,
    hostelAddress: '',
    roomNumber: '',
    restaurantName: '',
    restaurantAddress: '',
    acceptTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const { register: registerUser, isLoading, isAuthenticated, isStudent } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const redirectTo = isStudent() ? '/student' : '/restaurant';
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, navigate, isStudent]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Common validations
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!isValidPhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Role-specific validations
    if (formData.role === 'student') {
      if (!formData.hostelAddress.trim()) {
        newErrors.hostelAddress = 'Hostel address is required';
      }
    } else if (formData.role === 'restaurant') {
      if (!formData.restaurantName.trim()) {
        newErrors.restaurantName = 'Restaurant name is required';
      }
      if (!formData.restaurantAddress.trim()) {
        newErrors.restaurantAddress = 'Restaurant address is required';
      }
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'You must accept the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const registrationData = {
      name: formData.name.trim(),
      email: formData.email.toLowerCase().trim(),
      password: formData.password,
      phone: formData.phone.trim(),
      role: formData.role,
    };

    if (formData.role === 'student') {
      registrationData.hostelAddress = formData.hostelAddress.trim();
      registrationData.roomNumber = formData.roomNumber.trim();
    } else {
      registrationData.restaurantName = formData.restaurantName.trim();
      registrationData.restaurantAddress = formData.restaurantAddress.trim();
    }

    try {
      const result = await registerUser(registrationData);
      
      if (result?.success) {
        toast.success('Registration successful! Welcome to FOODY! 🎉');
        const redirectPath = result.data.role === 'student' ? '/student' : '/restaurant';
        navigate(redirectPath, { replace: true });
      }
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#FFF8F0] via-orange-50 to-[#FFC857]">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 w-96 h-96 bg-orange-300/30 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-yellow-300/30 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-300/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-2xl"
        >
          {/* Logo & Branding */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-block group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center justify-center gap-3 mb-3"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg">
                  <span className="text-2xl">🍽️</span>
                </div>
                <h1 className="text-4xl font-extrabold bg-gradient-to-r from-orange-600 via-red-500 to-yellow-500 bg-clip-text text-transparent font-display">
                  FOODY
                </h1>
              </motion.div>
            </Link>
            <p className="text-sm text-gray-600 font-medium">IIT & IISER Tirupati</p>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/login')}
              className="px-8 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 bg-white text-orange-600 border-2 border-orange-200 hover:border-orange-300"
            >
              Login
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/50"
            >
              Register
            </motion.button>
          </div>

          {/* Glassmorphism Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="backdrop-blur-xl bg-white/80 border border-orange-100 shadow-2xl rounded-3xl p-8 md:p-10"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-2 font-display">
              Create Your Account 🎉
            </h2>
            <p className="text-gray-600 mb-6">Join FOODY and start ordering delicious food!</p>

            {/* User Type Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                I am a
              </label>
              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setFormData(prev => ({ ...prev, role: 'student' }))}
                  className={`p-4 rounded-3xl border-2 transition-all duration-300 ${
                    formData.role === 'student'
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 bg-white hover:border-orange-300'
                  }`}
                >
                  <GraduationCap className={`w-8 h-8 mx-auto mb-2 ${
                    formData.role === 'student' ? 'text-orange-500' : 'text-gray-400'
                  }`} />
                  <div className="font-semibold text-sm text-gray-900">Student</div>
                  <div className="text-xs text-gray-500 mt-1">Order food to hostel</div>
                </motion.button>

                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setFormData(prev => ({ ...prev, role: 'restaurant' }))}
                  className={`p-4 rounded-3xl border-2 transition-all duration-300 ${
                    formData.role === 'restaurant'
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 bg-white hover:border-orange-300'
                  }`}
                >
                  <Store className={`w-8 h-8 mx-auto mb-2 ${
                    formData.role === 'restaurant' ? 'text-orange-500' : 'text-gray-400'
                  }`} />
                  <div className="font-semibold text-sm text-gray-900">Restaurant Owner</div>
                  <div className="text-xs text-gray-500 mt-1">List your restaurant</div>
                </motion.button>
              </div>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 transition-all duration-300 outline-none ${
                      errors.name
                        ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                        : 'border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100'
                    }`}
                    disabled={isLoading}
                  />
                </div>
                {errors.name && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-500 mt-1 font-medium"
                  >
                    {errors.name}
                  </motion.p>
                )}
              </div>

              {/* Email & Phone in Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your.email@iitt.ac.in"
                      className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 transition-all duration-300 outline-none ${
                        errors.email
                          ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                          : 'border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100'
                      }`}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.email && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-500 mt-1 font-medium"
                    >
                      {errors.email}
                    </motion.p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 XXXXX XXXXX"
                      className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 transition-all duration-300 outline-none ${
                        errors.phone
                          ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                          : 'border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100'
                      }`}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.phone && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-500 mt-1 font-medium"
                    >
                      {errors.phone}
                    </motion.p>
                  )}
                </div>
              </div>

              {/* Conditional Fields - Student */}
              {formData.role === 'student' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hostel & Room Number
                    </label>
                    <div className="relative">
                      <Home className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        name="hostelAddress"
                        value={formData.hostelAddress}
                        onChange={handleChange}
                        placeholder="e.g., Godavari A-201"
                        className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 transition-all duration-300 outline-none ${
                          errors.hostelAddress
                            ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                            : 'border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100'
                        }`}
                        disabled={isLoading}
                      />
                    </div>
                    {errors.hostelAddress && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-red-500 mt-1 font-medium"
                      >
                        {errors.hostelAddress}
                      </motion.p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Conditional Fields - Restaurant */}
              {formData.role === 'restaurant' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Restaurant Name
                    </label>
                    <div className="relative">
                      <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        name="restaurantName"
                        value={formData.restaurantName}
                        onChange={handleChange}
                        placeholder="Your restaurant name"
                        className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 transition-all duration-300 outline-none ${
                          errors.restaurantName
                            ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                            : 'border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100'
                        }`}
                        disabled={isLoading}
                      />
                    </div>
                    {errors.restaurantName && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-red-500 mt-1 font-medium"
                      >
                        {errors.restaurantName}
                      </motion.p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Restaurant Address
                    </label>
                    <textarea
                      name="restaurantAddress"
                      value={formData.restaurantAddress}
                      onChange={handleChange}
                      placeholder="Full restaurant address"
                      rows={3}
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 outline-none resize-none ${
                        errors.restaurantAddress
                          ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                          : 'border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100'
                      }`}
                      disabled={isLoading}
                    />
                    {errors.restaurantAddress && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-red-500 mt-1 font-medium"
                      >
                        {errors.restaurantAddress}
                      </motion.p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Password Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Create strong password"
                      className={`w-full pl-12 pr-12 py-3 rounded-xl border-2 transition-all duration-300 outline-none ${
                        errors.password
                          ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                          : 'border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100'
                      }`}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <PasswordStrength password={formData.password} />
                  {errors.password && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-500 mt-1 font-medium"
                    >
                      {errors.password}
                    </motion.p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Re-enter your password"
                      className={`w-full pl-12 pr-12 py-3 rounded-xl border-2 transition-all duration-300 outline-none ${
                        errors.confirmPassword
                          ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                          : 'border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100'
                      }`}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-500 mt-1 font-medium"
                    >
                      {errors.confirmPassword}
                    </motion.p>
                  )}
                </div>
              </div>

              {/* Terms & Conditions */}
              <div>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    name="acceptTerms"
                    checked={formData.acceptTerms}
                    onChange={handleChange}
                    className="mt-1 w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-600 leading-relaxed">
                    I agree to the{' '}
                    <Link to="/terms" className="text-orange-600 hover:text-orange-700 underline font-medium">
                      Terms of Service
                    </Link>
                    {' '}and{' '}
                    <Link to="/privacy" className="text-orange-600 hover:text-orange-700 underline font-medium">
                      Privacy Policy
                    </Link>
                  </span>
                </label>
                {errors.acceptTerms && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-500 mt-1 font-medium"
                  >
                    {errors.acceptTerms}
                  </motion.p>
                )}
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isLoading}
                className="w-full py-3.5 bg-gradient-to-r from-orange-600 to-red-500 text-white font-semibold text-base rounded-xl shadow-lg shadow-orange-500/50 hover:shadow-xl hover:shadow-orange-500/60 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <CheckCircle className="w-5 h-5" />
                  </>
                )}
              </motion.button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white/80 text-gray-500">or</span>
                </div>
              </div>

              {/* Alternative Action */}
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="text-orange-600 font-semibold hover:text-orange-700 transition-colors"
                  >
                    Login here
                  </Link>
                </p>
              </div>
            </form>
          </motion.div>

          {/* Back to Home Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-6 text-center"
          >
            <Link to="/">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/90 backdrop-blur-sm text-orange-600 rounded-full font-semibold shadow-lg border-2 border-orange-200 hover:border-orange-400 hover:bg-white transition-all duration-300"
              >
                <Home className="w-5 h-5" />
                Back to Home
              </motion.button>
            </Link>
          </motion.div>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
            <TrustBadge icon={Shield} text="Campus Secure" delay={0.3} />
            <TrustBadge icon={Zap} text="Fast Delivery" delay={0.4} />
            <TrustBadge icon={MessageCircle} text="24/7 Support" delay={0.5} />
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 py-6 text-center bg-gradient-to-t from-gray-900/50 to-transparent backdrop-blur-sm">
        <p className="text-sm text-gray-700 font-medium">
          Made with <span className="text-red-500">❤️</span> for IIT & IISER Tirupati
        </p>
      </div>
    </div>
  );
};

export default Register;