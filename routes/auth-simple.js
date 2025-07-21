const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User, Restaurant } = require('../models');

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

// Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign(
    { id, role }, 
    process.env.JWT_SECRET || 'fallback-secret', 
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
      restaurantAddress
    } = req.body;

    // Basic validation
    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, password, and phone'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      email: email.toLowerCase() 
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password, // Will be hashed by pre-save hook
      role: role || 'student',
      phone: phone.trim(),
      address: address ? address.trim() : undefined
    });

    console.log(`✅ User created: ${email} (${user.role})`);

    // Create restaurant profile if role is restaurant
    let restaurant = null;
    if (user.role === 'restaurant') {
      try {
        restaurant = await Restaurant.create({
          ownerId: user._id,
          name: restaurantName ? restaurantName.trim() : `${name}'s Restaurant`,
          description: description ? description.trim() : 'A great restaurant',
          address: restaurantAddress ? restaurantAddress.trim() : address.trim(),
          phone: phone.trim(),
          cuisine: Array.isArray(cuisineTypes) ? cuisineTypes : [cuisineTypes || 'Multi-cuisine'],
          deliveryTime: '30-45 mins',
          priceRange: '$$',
          isActive: true,
          rating: 0,
          totalRatings: 0
        });

        console.log(`✅ Restaurant profile created: ${restaurantName || name} for ${email}`);
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

    console.log(`✅ User registered successfully: ${email} (${role || 'student'})`);

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
      message: `${(role || 'student').charAt(0).toUpperCase() + (role || 'student').slice(1)} registered successfully`,
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
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');

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

module.exports = router;