const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User, Restaurant, OTP } = require('../models');
const { generateOTP, sendOTPEmail } = require('../utils/emailService');
const { registerFCMToken, unregisterFCMToken, updateNotificationPreferences } = require('../services/notificationService');

const router = express.Router();

// Test route to verify auth routes are working
router.get('/test', (req, res) => {
  console.log('🧪 Auth test route hit!');
  res.json({
    success: true,
    message: 'Auth routes are working!',
    timestamp: new Date().toISOString(),
    route: '/api/auth/test'
  });
});



// Simple test login route
router.post('/test-login', (req, res) => {
  console.log('🧪 Auth test login route hit!', req.body);
  res.json({
    success: true,
    message: 'Auth test login route is working!',
    body: req.body,
    timestamp: new Date().toISOString()
  });
});

// Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign(
    { id, role }, 
    process.env.JWT_SECRET, 
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

// Helper function to create user response (without password)
const createUserResponse = (user, token) => {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    address: user.address,
    isActive: user.isActive,
    createdAt: user.createdAt,
    token
  };
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
  console.log('🔐 Registration attempt:', req.body.email);
  
  try {
    const { 
      name, 
      email, 
      password, 
      role, 
      phone, 
      address,
      // Restaurant specific fields
      restaurantName,
      description,
      cuisineTypes,
      ownerName,
      registrationCode
    } = req.body;

    // Basic validation
    if (!name || !email || !password || !role || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, password, role, phone'
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Password length validation
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Role validation
    if (!['student', 'restaurant'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be either student or restaurant'
      });
    }

    // Address validation for students
    if (role === 'student' && !address) {
      return res.status(400).json({
        success: false,
        message: 'Address is required for students'
      });
    }

    // Restaurant specific validation
    if (role === 'restaurant') {
      if (!restaurantName || !description || !cuisineTypes || !Array.isArray(cuisineTypes) || cuisineTypes.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Restaurant name, description, and at least one cuisine type are required for restaurants'
        });
      }
      
      if (description.length < 20) {
        return res.status(400).json({
          success: false,
          message: 'Restaurant description must be at least 20 characters long'
        });
      }
      
      if (!address) {
        return res.status(400).json({
          success: false,
          message: 'Restaurant address is required'
        });
      }

      // Registration code validation for restaurants
      if (!registrationCode) {
        return res.status(400).json({
          success: false,
          message: 'Restaurant registration code is required'
        });
      }

      // Validate registration code (trim whitespace and check exact match)
      const cleanCode = registrationCode.toString().trim();
      if (cleanCode !== '2904') {
        return res.status(400).json({
          success: false,
          message: 'Invalid registration code. Please contact support if you do not have the code.'
        });
      }
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Check if phone number is already in use
    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return res.status(409).json({
        success: false,
        message: 'User with this phone number already exists'
      });
    }

    // Create user data object
    const userData = {
      name,
      email: email.toLowerCase(),
      password,
      role,
      phone,
      isActive: true
    };

    // Add address for students
    if (role === 'student') {
      userData.address = address;
    }

    // Track registration method for restaurants
    if (role === 'restaurant') {
      userData.registrationMethod = 'code_2904';
      userData.registeredViaCode = true;
    }

    // Create user (password will be hashed by the User model pre-save hook)
    const user = await User.create(userData);

    // If user is a restaurant, create restaurant profile
    let restaurant = null;
    if (role === 'restaurant') {
      try {
        // Check if restaurant name is already taken
        const existingRestaurant = await Restaurant.findOne({ 
          name: { $regex: new RegExp(`^${restaurantName}$`, 'i') }
        });
        
        if (existingRestaurant) {
          // If restaurant name exists, delete the user we just created and return error
          await User.findByIdAndDelete(user._id);
          return res.status(409).json({
            success: false,
            message: 'Restaurant name is already taken. Please choose a different name.'
          });
        }

        // Create restaurant profile with comprehensive data
        restaurant = await Restaurant.create({
          ownerId: user._id,
          name: restaurantName.trim(),
          description: description.trim(),
          address: address.trim(),
          phone: phone.trim(),
          cuisine: Array.isArray(cuisineTypes) ? cuisineTypes : [cuisineTypes],
          deliveryTime: '30-45 mins',
          priceRange: '$$',
          isActive: true,
          rating: 0,
          totalRatings: 0
        });

        console.log(`✅ Restaurant profile created: ${restaurantName} for ${email}`);
      } catch (restaurantError) {
        console.error('❌ Restaurant creation error:', restaurantError);
        // If restaurant creation fails, delete the user and return error
        await User.findByIdAndDelete(user._id);
        return res.status(500).json({
          success: false,
          message: 'Failed to create restaurant profile. Please try again.'
        });
      }
    }

    // Generate token
    const token = generateToken(user._id, user.role);

    console.log(`✅ User registered successfully: ${email} (${role})`);

    // Create response data
    const responseData = createUserResponse(user, token);
    
    // Add restaurant info to response if applicable
    if (restaurant) {
      responseData.restaurant = {
        _id: restaurant._id,
        name: restaurant.name,
        description: restaurant.description,
        address: restaurant.address,
        cuisine: restaurant.cuisine,
        isActive: restaurant.isActive
      };
    }

    res.status(201).json({
      success: true,
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} registered successfully`,
      data: responseData
    });

  } catch (error) {
    console.error('❌ Registration error:', error);

    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({
        success: false,
        message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Registration failed due to server error',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  console.log('🔐 Login attempt:', req.body.email);
  
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user and include password for comparison
    const user = await User.findOne({ 
      email: email.toLowerCase() 
    }).select('+password');

    if (!user) {
      console.log('❌ Login failed: User not found -', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      console.log('❌ Login failed: Account inactive -', email);
      return res.status(401).json({
        success: false,
        message: 'Account has been deactivated. Please contact support.'
      });
    }

    // Verify password using the User model method
    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      console.log('❌ Login failed: Invalid password -', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken(user._id, user.role);

    // Update last login (optional)
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    console.log(`✅ Login successful: ${email} (${user.role})`);

    res.json({
      success: true,
      message: 'Login successful',
      data: createUserResponse(user, token)
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed due to server error',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
});

// Simple JWT verification middleware
const protect = async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from database
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found, token invalid'
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'User account is deactivated'
        });
      }

      // Add user to request object
      req.user = user;
      next();

    } catch (error) {
      console.error('❌ Token verification failed:', error.message);
      
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid token'
        });
      }
      
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token expired'
        });
      }

      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided'
    });
  }
};

// @desc    Validate token
// @route   GET /api/auth/validate
// @access  Private
router.get('/validate', protect, async (req, res) => {
  console.log('🔍 Token validation for user:', req.user.email);
  
  try {
    res.json({
      success: true,
      message: 'Token is valid',
      data: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        phone: req.user.phone,
        address: req.user.address,
        isActive: req.user.isActive,
        createdAt: req.user.createdAt,
        updatedAt: req.user.updatedAt
      }
    });

  } catch (error) {
    console.error('❌ Token validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Token validation failed',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  console.log('👤 Profile request for user:', req.user.email);
  
  try {
    res.json({
      success: true,
      message: 'User profile retrieved successfully',
      data: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        phone: req.user.phone,
        address: req.user.address,
        isActive: req.user.isActive,
        createdAt: req.user.createdAt,
        updatedAt: req.user.updatedAt
      }
    });

  } catch (error) {
    console.error('❌ Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user profile',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
});

// @desc    Get user profile (alternative route)
// @route   GET /api/auth/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  console.log('👤 Profile request (alt route) for user:', req.user.email);
  
  try {
    res.json({
      success: true,
      message: 'User profile retrieved successfully',
      data: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        phone: req.user.phone,
        address: req.user.address,
        isActive: req.user.isActive,
        createdAt: req.user.createdAt,
        updatedAt: req.user.updatedAt
      }
    });

  } catch (error) {
    console.error('❌ Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user profile',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  console.log('📝 Profile update for user:', req.user.email);
  
  try {
    const { name, phone, address } = req.body;

    // Build update object with only provided fields
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;

    // Check if phone number is already in use by another user
    if (phone && phone !== req.user.phone) {
      const existingPhone = await User.findOne({ 
        phone, 
        _id: { $ne: req.user._id } 
      });
      
      if (existingPhone) {
        return res.status(409).json({
          success: false,
          message: 'Phone number is already in use'
        });
      }
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { 
        new: true, 
        runValidators: true 
      }
    );

    console.log(`✅ Profile updated for user: ${req.user.email}`);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        address: updatedUser.address,
        updatedAt: updatedUser.updatedAt
      }
    });

  } catch (error) {
    console.error('❌ Profile update error:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Profile update failed',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
router.put('/change-password', protect, async (req, res) => {
  console.log('🔒 Password change request for user:', req.user.email);
  
  try {
    const { currentPassword, newPassword } = req.body;

    // Basic validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current password and new password'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');

    // Verify current password
    const isCurrentPasswordValid = await user.matchPassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password (will be hashed by pre-save hook)
    user.password = newPassword;
    await user.save();

    console.log(`✅ Password changed for user: ${user.email}`);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('❌ Password change error:', error);
    res.status(500).json({
      success: false,
      message: 'Password change failed',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
});

// @desc    Logout user (client-side token removal)
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', protect, (req, res) => {
  console.log(`✅ User logged out: ${req.user.email}`);
  
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// @desc    Refresh token
// @route   POST /api/auth/refresh
// @access  Private
router.post('/refresh', protect, (req, res) => {
  try {
    // Generate new token
    const token = generateToken(req.user._id, req.user.role);

    console.log(`🔄 Token refreshed for user: ${req.user.email}`);

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: { token }
    });

  } catch (error) {
    console.error('❌ Token refresh error:', error);
    res.status(500).json({
      success: false,
      message: 'Token refresh failed',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
});

// Rate limiting store for email OTP (simple in-memory store)
const otpRequests = new Map();

// Send Email OTP
router.post('/send-email-otp', async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email) {
      console.log('❌ Email is missing from request');
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Rate limiting: max 3 requests per email per hour
    const now = Date.now();
    const emailKey = email.toLowerCase();
    const requests = otpRequests.get(emailKey) || [];

    // Filter out requests older than 1 hour
    const recentRequests = requests.filter(time => now - time < 60 * 60 * 1000);

    if (recentRequests.length >= 3) {
      return res.status(429).json({
        success: false,
        message: 'Too many OTP requests. Please try again after 1 hour.'
      });
    }

    // Generate OTP
    const otp = generateOTP();

    // Save OTP to database
    const otpDoc = new OTP({
      email: email.toLowerCase(),
      otp: otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
    });

    await otpDoc.save();

    // Send email
    const emailResult = await sendOTPEmail(email, otp);

    if (!emailResult.success) {
      // Clean up the OTP if email failed
      await OTP.findByIdAndDelete(otpDoc._id);
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP email. Please try again.'
      });
    }

    // Update rate limiting
    recentRequests.push(now);
    otpRequests.set(emailKey, recentRequests);

    console.log(`✅ OTP sent to ${email}: ${otp}`);

    res.json({
      success: true,
      message: 'OTP sent successfully to your email',
      expiresIn: 300 // 5 minutes in seconds
    });

  } catch (error) {
    console.error('❌ Send email OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP. Please try again.',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
});

// Verify Email OTP
router.post('/verify-email-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Validate inputs
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required'
      });
    }

    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid 6-digit OTP'
      });
    }

    // Find valid OTP
    const otpDoc = await OTP.findValidOTP(email.toLowerCase(), otp);

    if (!otpDoc) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP. Please try again.'
      });
    }

    // Mark OTP as verified and delete it
    await OTP.findByIdAndDelete(otpDoc._id);

    console.log(`✅ OTP verified for ${email}`);

    res.json({
      success: true,
      message: 'Email verified successfully',
      email: email.toLowerCase()
    });

  } catch (error) {
    console.error('❌ Verify email OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP. Please try again.',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
});

router.post('/register-fcm-token', protect, async (req, res) => {
  try {
    const { token, deviceId, deviceType } = req.body;

    if (!token || !deviceId) {
      return res.status(400).json({
        success: false,
        message: 'FCM token and device ID are required'
      });
    }

    const result = await registerFCMToken(req.user._id, token, deviceId, deviceType || 'web');

    res.json(result);
  } catch (error) {
    console.error('❌ Register FCM token error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register FCM token',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
});

router.post('/unregister-fcm-token', protect, async (req, res) => {
  try {
    const { deviceId } = req.body;

    if (!deviceId) {
      return res.status(400).json({
        success: false,
        message: 'Device ID is required'
      });
    }

    const result = await unregisterFCMToken(req.user._id, deviceId);

    res.json(result);
  } catch (error) {
    console.error('❌ Unregister FCM token error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unregister FCM token',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
});

router.put('/notification-preferences', protect, async (req, res) => {
  try {
    const { orderNotifications, statusUpdates, soundEnabled } = req.body;

    const result = await updateNotificationPreferences(req.user._id, {
      orderNotifications,
      statusUpdates,
      soundEnabled
    });

    res.json(result);
  } catch (error) {
    console.error('❌ Update notification preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update notification preferences',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
});

module.exports = router;