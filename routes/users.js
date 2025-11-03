const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { User } = require('../models');

const router = express.Router();

// OTP Session store (in production, use Redis)
const otpSessions = new Map();

// Clean up expired sessions every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [token, session] of otpSessions.entries()) {
    if (session.expires < now) {
      otpSessions.delete(token);
    }
  }
}, 5 * 60 * 1000);

// Simple JWT verification middleware (copied from auth-simple.js)
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'User not found or inactive'
        });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
  } else {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided'
    });
  }
};

// @desc    Get all users (admin only)
// @route   GET /api/users
// @access  Private/Admin
router.get('/', protect, async (req, res) => {
  try {
    // Only allow admin users to see all users
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const users = await User.find().select('-password');
    
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('❌ Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve users'
    });
  }
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    // Users can only see their own profile unless they're admin
    if (req.user._id.toString() !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own profile.'
      });
    }

    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('❌ Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user'
    });
  }
});

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    // Users can only update their own profile unless they're admin
    if (req.user._id.toString() !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own profile.'
      });
    }

    const { name, phone, address } = req.body;
    
    // Build update object with only allowed fields
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { 
        new: true, 
        runValidators: true 
      }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    console.error('❌ Update user error:', error);
    
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
      message: 'Failed to update user profile'
    });
  }
});

// @desc    Delete user (admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
router.delete('/:id', protect, async (req, res) => {
  try {
    // Only allow admin users to delete users
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Instead of deleting, deactivate the user
    user.isActive = false;
    await user.save();

    res.json({
      success: true,
      message: 'User deactivated successfully'
    });
  } catch (error) {
    console.error('❌ Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to deactivate user'
    });
  }
});

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private/Admin
router.get('/stats', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const studentUsers = await User.countDocuments({ role: 'student' });
    const restaurantUsers = await User.countDocuments({ role: 'restaurant' });

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        inactiveUsers: totalUsers - activeUsers,
        studentUsers,
        restaurantUsers,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('❌ Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user statistics'
    });
  }
});

// @desc    Verify OTP session after Firebase verification
// @route   POST /api/user/verify-otp-session
// @access  Public
router.post('/verify-otp-session', async (req, res) => {
  console.log('🔐 OTP session verification attempt:', req.body.phoneNumber);

  try {
    const { phoneNumber } = req.body;

    // Basic validation
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    // Check if user exists
    const user = await User.findOne({ phone: phoneNumber });
    if (!user) {
      console.log('❌ OTP session verification failed: User not found -', phoneNumber);
      return res.status(404).json({
        success: false,
        message: 'No account found with this phone number'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      console.log('❌ OTP session verification failed: Account inactive -', phoneNumber);
      return res.status(400).json({
        success: false,
        message: 'Account has been deactivated. Please contact support.'
      });
    }

    // Generate session token
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expires = Date.now() + (10 * 60 * 1000); // 10 minutes

    otpSessions.set(sessionToken, {
      phoneNumber,
      userId: user._id,
      expires
    });

    console.log(`✅ OTP session created for user: ${user.email} (${phoneNumber})`);

    res.json({
      success: true,
      message: 'OTP session verified successfully',
      sessionToken
    });

  } catch (error) {
    console.error('❌ OTP session verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Session verification failed',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
});

// @desc    Reset password using phone number after OTP verification
// @route   POST /api/user/reset-password-by-phone
// @access  Public (after OTP verification)
router.post('/reset-password-by-phone', async (req, res) => {
  console.log('🔐 Password reset attempt:', req.body.phoneNumber);

  try {
    const { phoneNumber, newPassword, sessionToken } = req.body;

    // Basic validation
    if (!phoneNumber || !newPassword || !sessionToken) {
      return res.status(400).json({
        success: false,
        message: 'Phone number, new password, and session token are required'
      });
    }

    // Validate session token
    const session = otpSessions.get(sessionToken);
    if (!session) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session token'
      });
    }

    if (session.expires < Date.now()) {
      otpSessions.delete(sessionToken);
      return res.status(401).json({
        success: false,
        message: 'Session token has expired'
      });
    }

    if (session.phoneNumber !== phoneNumber) {
      return res.status(401).json({
        success: false,
        message: 'Session token does not match phone number'
      });
    }

    // Password strength validation
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long'
      });
    }

    // Check password complexity (uppercase, lowercase, number)
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumbers = /\d/.test(newPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      });
    }

    // Find user by phone number
    const user = await User.findOne({ phone: phoneNumber });

    if (!user) {
      console.log('❌ Password reset failed: User not found -', phoneNumber);
      return res.status(404).json({
        success: false,
        message: 'No account found with this phone number'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      console.log('❌ Password reset failed: Account inactive -', phoneNumber);
      return res.status(400).json({
        success: false,
        message: 'Account has been deactivated. Please contact support.'
      });
    }

    // Hash the new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update user password using updateOne to bypass pre-save hooks
    await User.updateOne(
      { _id: user._id },
      {
        password: hashedPassword,
        updatedAt: new Date()
      }
    );

    console.log(`✅ Password reset successful for user: ${user.email} (${phoneNumber})`);

    // Clean up session token
    otpSessions.delete(sessionToken);

    res.json({
      success: true,
      message: 'Password reset successfully. You can now login with your new password.'
    });

  } catch (error) {
    console.error('❌ Password reset error:', error);

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
      message: 'Password reset failed due to server error',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
});

module.exports = router;