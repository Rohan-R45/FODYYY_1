const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { createValidator } = require('../middleware/validation');
const { registerFCMToken, unregisterFCMToken, updateNotificationPreferences } = require('../services/notificationService');
const User = require('../models/User');

const router = express.Router();

// Validation rules for FCM token registration
const fcmTokenValidationRules = {
  token: (value) => {
    if (!value || typeof value !== 'string' || value.length < 100) {
      return 'Valid FCM token is required';
    }
    return null;
  },
  deviceId: (value) => {
    if (!value || typeof value !== 'string' || value.length < 5) {
      return 'Valid device ID is required';
    }
    return null;
  },
  deviceType: (value) => {
    const validTypes = ['android', 'ios', 'web'];
    if (value && !validTypes.includes(value)) {
      return `Device type must be one of: ${validTypes.join(', ')}`;
    }
    return null;
  }
};

// Validation rules for notification preferences
const notificationPreferencesValidationRules = {
  orderNotifications: (value) => {
    if (typeof value !== 'boolean') {
      return 'orderNotifications must be a boolean';
    }
    return null;
  },
  statusUpdates: (value) => {
    if (typeof value !== 'boolean') {
      return 'statusUpdates must be a boolean';
    }
    return null;
  },
  soundEnabled: (value) => {
    if (typeof value !== 'boolean') {
      return 'soundEnabled must be a boolean';
    }
    return null;
  }
};

// @desc    Register FCM token for push notifications
// @route   POST /api/auth/register-fcm-token
// @access  Private (All authenticated users)
router.post('/register-fcm-token',
  protect,
  createValidator(fcmTokenValidationRules),
  async (req, res) => {
    try {
      const { token, deviceId, deviceType = 'web' } = req.body;
      const userId = req.user._id;

      console.log(`📱 Registering FCM token for user ${userId}, device ${deviceId}`);

      const result = await registerFCMToken(userId, token, deviceId, deviceType);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'FCM token registered successfully',
          data: result
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.error || 'Failed to register FCM token'
        });
      }

    } catch (error) {
      console.error('❌ Register FCM token error:', error);
      res.status(500).json({
        success: false,
        message: 'Error registering FCM token',
        ...(process.env.NODE_ENV === 'development' && { error: error.message })
      });
    }
  }
);

// @desc    Unregister FCM token
// @route   POST /api/auth/unregister-fcm-token
// @access  Private (All authenticated users)
router.post('/unregister-fcm-token',
  protect,
  async (req, res) => {
    try {
      const { deviceId } = req.body;
      const userId = req.user._id;

      if (!deviceId) {
        return res.status(400).json({
          success: false,
          message: 'Device ID is required'
        });
      }

      console.log(`📱 Unregistering FCM token for user ${userId}, device ${deviceId}`);

      const result = await unregisterFCMToken(userId, deviceId);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'FCM token unregistered successfully',
          data: result
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.error || 'Failed to unregister FCM token'
        });
      }

    } catch (error) {
      console.error('❌ Unregister FCM token error:', error);
      res.status(500).json({
        success: false,
        message: 'Error unregistering FCM token',
        ...(process.env.NODE_ENV === 'development' && { error: error.message })
      });
    }
  }
);

// @desc    Update notification preferences
// @route   PUT /api/auth/notification-preferences
// @access  Private (All authenticated users)
router.put('/notification-preferences',
  protect,
  createValidator(notificationPreferencesValidationRules),
  async (req, res) => {
    try {
      const { orderNotifications, statusUpdates, soundEnabled } = req.body;
      const userId = req.user._id;

      console.log(`⚙️ Updating notification preferences for user ${userId}`);

      const preferences = {
        orderNotifications: orderNotifications ?? true,
        statusUpdates: statusUpdates ?? true,
        soundEnabled: soundEnabled ?? true
      };

      const result = await updateNotificationPreferences(userId, preferences);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Notification preferences updated successfully',
          data: result
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.error || 'Failed to update notification preferences'
        });
      }

    } catch (error) {
      console.error('❌ Update notification preferences error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating notification preferences',
        ...(process.env.NODE_ENV === 'development' && { error: error.message })
      });
    }
  }
);

// @desc    Get notification preferences
// @route   GET /api/auth/notification-preferences
// @access  Private (All authenticated users)
router.get('/notification-preferences',
  protect,
  async (req, res) => {
    try {
      const userId = req.user._id;

      const user = await User.findById(userId).select('notificationPreferences');
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const preferences = user.notificationPreferences || {
        orderNotifications: true,
        statusUpdates: true,
        soundEnabled: true
      };

      res.status(200).json({
        success: true,
        data: preferences
      });

    } catch (error) {
      console.error('❌ Get notification preferences error:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving notification preferences',
        ...(process.env.NODE_ENV === 'development' && { error: error.message })
      });
    }
  }
);

// @desc    Get FCM tokens for user (for debugging)
// @route   GET /api/auth/fcm-tokens
// @access  Private (All authenticated users)
router.get('/fcm-tokens',
  protect,
  async (req, res) => {
    try {
      const userId = req.user._id;

      const user = await User.findById(userId).select('fcmTokens');
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.status(200).json({
        success: true,
        data: {
          tokensCount: user.fcmTokens?.length || 0,
          tokens: user.fcmTokens || []
        }
      });

    } catch (error) {
      console.error('❌ Get FCM tokens error:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving FCM tokens',
        ...(process.env.NODE_ENV === 'development' && { error: error.message })
      });
    }
  }
);

module.exports = router;