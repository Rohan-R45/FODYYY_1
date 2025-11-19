const admin = require('firebase-admin');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');

// Ensure admin is required at the top
if (!admin) {
  throw new Error('Firebase Admin SDK not installed. Run: npm install firebase-admin');
}

// Initialize Firebase Admin SDK
let firebaseInitialized = false;

const initializeFirebase = () => {
  if (firebaseInitialized) return;

  try {
    // Check if Firebase is already initialized
    if (!admin.apps.length) {
      const serviceAccount = {
        type: "service_account",
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
      };

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID
      });
    }

    firebaseInitialized = true;
    console.log('✅ Firebase Admin SDK initialized for notifications');
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', error);
    throw error;
  }
};

/**
 * Send push notification to a specific user
 * @param {string} userId - User ID to send notification to
 * @param {object} notification - Notification payload
 * @param {object} data - Additional data payload
 */
const sendNotificationToUser = async (userId, notification, data = {}) => {
  try {
    initializeFirebase();

    const user = await User.findById(userId);
    if (!user || !user.fcmTokens || user.fcmTokens.length === 0) {
      console.log(`ℹ️ No FCM tokens found for user ${userId}`);
      return { success: false, message: 'No FCM tokens found for user' };
    }

    // Check notification preferences
    if (!user.notificationPreferences?.orderNotifications && notification.type === 'new_order') {
      console.log(`ℹ️ Order notifications disabled for user ${userId}`);
      return { success: false, message: 'Order notifications disabled' };
    }

    if (!user.notificationPreferences?.statusUpdates && notification.type === 'status_update') {
      console.log(`ℹ️ Status update notifications disabled for user ${userId}`);
      return { success: false, message: 'Status update notifications disabled' };
    }

    const tokens = user.fcmTokens.map(token => token.token);

    const messages = tokens.map(token => ({
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: {
        type: notification.type,
        orderId: data.orderId || '',
        restaurantId: data.restaurantId || '',
        studentId: data.studentId || '',
        ...data
      },
      token: token,
      webpush: {
        headers: {
          Urgency: 'high'
        },
        notification: {
          requireInteraction: true,
          vibrate: '200,100,200'
        }
      }
    }));

    const response = await admin.messaging().sendEach(messages);

    console.log(`✅ Notification sent to user ${userId}:`, {
      successCount: response.successCount,
      failureCount: response.failureCount
    });

    // Clean up invalid tokens
    if (response.failureCount > 0) {
      const invalidTokens = [];
      response.responses.forEach((resp, index) => {
        if (!resp.success) {
          console.log(`❌ Failed to send to token ${index}:`, resp.error);
          if (resp.error.code === 'messaging/registration-token-not-registered' ||
              resp.error.code === 'messaging/invalid-registration-token') {
            invalidTokens.push(tokens[index]);
          }
        }
      });

      // Remove invalid tokens
      if (invalidTokens.length > 0) {
        await User.updateOne(
          { _id: userId },
          { $pull: { fcmTokens: { token: { $in: invalidTokens } } } }
        );
        console.log(`🧹 Removed ${invalidTokens.length} invalid FCM tokens for user ${userId}`);
      }
    }

    return {
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount
    };

  } catch (error) {
    console.error('❌ Error sending notification to user:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send new order notification to restaurant owner
 * @param {string} orderId - Order ID
 * @param {string} restaurantId - Restaurant ID
 * @param {string} studentId - Student ID who placed the order
 */
const sendNewOrderNotification = async (orderId, restaurantId, studentId) => {
  try {
    const restaurant = await Restaurant.findById(restaurantId).populate('ownerId', 'name');
    if (!restaurant) {
      throw new Error('Restaurant not found');
    }

    const student = await User.findById(studentId).select('name');
    if (!student) {
      throw new Error('Student not found');
    }

    const notification = {
      type: 'new_order',
      title: 'New Order Received! 🔔',
      body: `Order #${orderId.toString().slice(-8).toUpperCase()} from ${student.name}. Tap to view details.`
    };

    const data = {
      orderId: orderId.toString(),
      restaurantId: restaurantId.toString(),
      studentId: studentId.toString(),
      studentName: student.name,
      restaurantName: restaurant.name
    };

    return await sendNotificationToUser(restaurant.ownerId._id, notification, data);

  } catch (error) {
    console.error('❌ Error sending new order notification:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send order status update notification
 * @param {string} orderId - Order ID
 * @param {string} restaurantId - Restaurant ID
 * @param {string} status - New order status
 */
const sendOrderStatusNotification = async (orderId, restaurantId, status) => {
  try {
    const restaurant = await Restaurant.findById(restaurantId).populate('ownerId', 'name');
    if (!restaurant) {
      throw new Error('Restaurant not found');
    }

    const statusMessages = {
      confirmed: 'Order confirmed and being prepared',
      preparing: 'Your order is now being prepared',
      ready: 'Your order is ready for pickup/delivery',
      delivered: 'Your order has been delivered successfully',
      cancelled: 'Your order has been cancelled'
    };

    const notification = {
      type: 'status_update',
      title: 'Order Status Update 📦',
      body: `Order #${orderId.toString().slice(-8).toUpperCase()}: ${statusMessages[status] || 'Status updated'}`
    };

    const data = {
      orderId: orderId.toString(),
      restaurantId: restaurantId.toString(),
      status: status,
      restaurantName: restaurant.name
    };

    return await sendNotificationToUser(restaurant.ownerId._id, notification, data);

  } catch (error) {
    console.error('❌ Error sending status update notification:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Register FCM token for a user
 * @param {string} userId - User ID
 * @param {string} token - FCM token
 * @param {string} deviceId - Device identifier
 * @param {string} deviceType - Device type (android, ios, web)
 */
const registerFCMToken = async (userId, token, deviceId, deviceType = 'web') => {
  try {
    // Remove any existing token for this device
    await User.updateOne(
      { _id: userId },
      {
        $pull: { fcmTokens: { deviceId: deviceId } }
      }
    );

    // Add the new token
    const updateResult = await User.updateOne(
      { _id: userId },
      {
        $push: {
          fcmTokens: {
            token: token,
            deviceId: deviceId,
            deviceType: deviceType,
            lastUsed: new Date()
          }
        }
      }
    );

    if (updateResult.modifiedCount > 0) {
      console.log(`✅ FCM token registered for user ${userId}, device ${deviceId}`);
      return { success: true, message: 'FCM token registered successfully' };
    } else {
      return { success: false, message: 'Failed to register FCM token' };
    }

  } catch (error) {
    console.error('❌ Error registering FCM token:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Unregister FCM token for a user
 * @param {string} userId - User ID
 * @param {string} deviceId - Device identifier
 */
const unregisterFCMToken = async (userId, deviceId) => {
  try {
    const updateResult = await User.updateOne(
      { _id: userId },
      {
        $pull: { fcmTokens: { deviceId: deviceId } }
      }
    );

    if (updateResult.modifiedCount > 0) {
      console.log(`✅ FCM token unregistered for user ${userId}, device ${deviceId}`);
      return { success: true, message: 'FCM token unregistered successfully' };
    } else {
      return { success: false, message: 'FCM token not found or already unregistered' };
    }

  } catch (error) {
    console.error('❌ Error unregistering FCM token:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Update notification preferences for a user
 * @param {string} userId - User ID
 * @param {object} preferences - Notification preferences
 */
const updateNotificationPreferences = async (userId, preferences) => {
  try {
    const updateResult = await User.updateOne(
      { _id: userId },
      {
        $set: {
          'notificationPreferences.orderNotifications': preferences.orderNotifications ?? true,
          'notificationPreferences.statusUpdates': preferences.statusUpdates ?? true,
          'notificationPreferences.soundEnabled': preferences.soundEnabled ?? true
        }
      }
    );

    if (updateResult.modifiedCount > 0) {
      console.log(`✅ Notification preferences updated for user ${userId}`);
      return { success: true, message: 'Notification preferences updated successfully' };
    } else {
      return { success: false, message: 'Failed to update notification preferences' };
    }

  } catch (error) {
    console.error('❌ Error updating notification preferences:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendNewOrderNotification,
  sendOrderStatusNotification,
  registerFCMToken,
  unregisterFCMToken,
  updateNotificationPreferences,
  initializeFirebase
};