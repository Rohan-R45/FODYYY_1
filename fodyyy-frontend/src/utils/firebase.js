// Firebase configuration and initialization
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import api from '../services/api';

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Check if we should use Firebase emulator (for development without billing)
const USE_EMULATOR = import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true';

// Validate Firebase config
const validateConfig = () => {
  const required = ['apiKey', 'authDomain', 'projectId', 'appId'];
  const missing = required.filter(key => !firebaseConfig[key]);

  if (missing.length > 0) {
    console.error('Missing Firebase config:', missing);
    throw new Error(`Missing Firebase configuration: ${missing.join(', ')}`);
  }
};

validateConfig();

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging only (keeping for push notifications)
let messaging = null;
let fcmSupported = false;

// Check if FCM is supported and initialize
const initializeMessaging = async () => {
  try {
    fcmSupported = await isSupported();
    if (fcmSupported) {
      messaging = getMessaging(app);
      console.log('✅ Firebase Cloud Messaging initialized');
    } else {
      console.log('ℹ️ Firebase Cloud Messaging not supported in this browser');
    }
  } catch (error) {
    console.log('ℹ️ Firebase Cloud Messaging initialization failed:', error.message);
    fcmSupported = false;
  }
};

// Initialize messaging on module load
initializeMessaging();



/**
 * Send OTP to email address
 * @param {string} email - Email address to send OTP to
 * @returns {Promise<object>} - Result with success status
 */
export const sendEmailOTP = async (email) => {
  try {
    console.log('📧 Starting email OTP send process...');

    // Validate email
    if (!email) {
      throw new Error('Email is required');
    }

    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Please provide a valid email address');
    }

    console.log('📧 Sending OTP to:', email);

    // Call backend API to send email OTP
    const response = await api.post('/auth/send-email-otp', { email });

    if (response.data.success) {
      console.log('✓ Email OTP sent successfully!');
      return {
        success: true,
        message: response.data.message,
        expiresIn: response.data.expiresIn
      };
    } else {
      throw new Error(response.data.message || 'Failed to send OTP email');
    }

  } catch (error) {
    console.error('✗ Error sending email OTP:', error);

    // Handle different types of errors
    let errorMessage = 'Failed to send OTP. Please try again.';

    if (error.response) {
      // Backend returned an error
      const status = error.response.status;
      const errorData = error.response.data;

      switch (status) {
        case 400:
          errorMessage = errorData.message || 'Invalid email address';
          break;
        case 429:
          errorMessage = errorData.message || 'Too many requests. Please wait before trying again.';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later.';
          break;
        default:
          errorMessage = errorData.message || 'Failed to send OTP';
      }
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = 'Request timed out. Please check your connection and try again.';
    } else if (!navigator.onLine) {
      errorMessage = 'No internet connection. Please check your connection and try again.';
    } else if (error.message) {
      errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage
    };
  }
};

/**
 * Verify email OTP code
 * @param {string} email - Email address
 * @param {string} otpCode - 6-digit OTP code entered by user
 * @returns {Promise<object>} - Result with success status
 */
export const verifyEmailOTP = async (email, otpCode) => {
  try {
    console.log('🔐 Verifying email OTP code...');

    // Validate inputs
    if (!email) {
      throw new Error('Email is required');
    }

    if (!otpCode) {
      throw new Error('OTP code is required');
    }

    // Clean OTP code (remove spaces, dashes)
    const cleanedOTP = otpCode.trim().replace(/[\s\-]/g, '');

    if (cleanedOTP.length !== 6 || !/^\d{6}$/.test(cleanedOTP)) {
      throw new Error('Please enter a valid 6-digit OTP code');
    }

    console.log('🔐 Verifying OTP for:', email);

    // Call backend API to verify email OTP
    const response = await api.post('/auth/verify-email-otp', {
      email: email.toLowerCase(),
      otp: cleanedOTP
    });

    if (response.data.success) {
      console.log('✓ Email OTP verified successfully!');
      return {
        success: true,
        message: response.data.message,
        email: response.data.email
      };
    } else {
      throw new Error(response.data.message || 'Invalid OTP code');
    }

  } catch (error) {
    console.error('✗ Error verifying email OTP:', error);

    // Handle different types of errors
    let errorMessage = 'Invalid OTP code. Please try again.';

    if (error.response) {
      // Backend returned an error
      const status = error.response.status;
      const errorData = error.response.data;

      switch (status) {
        case 400:
          errorMessage = errorData.message || 'Invalid OTP code or email';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later.';
          break;
        default:
          errorMessage = errorData.message || 'Failed to verify OTP';
      }
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = 'Request timed out. Please check your connection and try again.';
    } else if (!navigator.onLine) {
      errorMessage = 'No internet connection. Please check your connection and try again.';
    } else if (error.message) {
      errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage
    };
  }
};



/**
 * Request permission for push notifications and get FCM token
 * @returns {Promise<object>} - Result with success status and token
 */
export const requestNotificationPermission = async () => {
  try {
    if (!fcmSupported || !messaging) {
      return {
        success: false,
        error: 'Firebase Cloud Messaging is not supported in this browser'
      };
    }

    // Register service worker first
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
          scope: '/'
        });
        console.log('✅ Service Worker registered:', registration);
      } catch (error) {
        console.error('❌ Service Worker registration failed:', error);
        throw error;
      }
    }

    // Request permission
    const permission = await Notification.requestPermission();

    if (permission !== 'granted') {
      return {
        success: false,
        error: 'Notification permission denied'
      };
    }

    // Get FCM token with service worker
    const registration = await navigator.serviceWorker.ready;
    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration
    });

    if (!token) {
      return {
        success: false,
        error: 'Failed to get FCM token'
      };
    }

    console.log('✅ FCM token obtained:', token.substring(0, 20) + '...');

    return {
      success: true,
      token: token,
      permission: permission
    };

  } catch (error) {
    console.error('❌ Error requesting notification permission:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Listen for incoming push messages
 * @param {function} callback - Callback function to handle incoming messages
 * @returns {function} - Unsubscribe function
 */
export const onMessageListener = (callback) => {
  if (!fcmSupported || !messaging) {
    console.log('ℹ️ FCM not supported, cannot listen for messages');
    return () => {};
  }

  try {
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('📨 Message received:', payload);

      // Play notification sound if enabled
      if (payload.notification && payload.data?.soundEnabled !== 'false') {
        playNotificationSound();
      }

      // Call the callback with the message data
      if (callback) {
        callback(payload);
      }
    });

    return unsubscribe;
  } catch (error) {
    console.error('❌ Error setting up message listener:', error);
    return () => {};
  }
};

/**
 * Register FCM token with the backend
 * @param {string} token - FCM token
 * @param {string} deviceId - Device identifier
 * @returns {Promise<object>} - API response
 */
export const registerFCMToken = async (token, deviceId) => {
  try {
    const response = await api.post('/auth/register-fcm-token', {
      token,
      deviceId,
      deviceType: 'web'
    });

    if (response.data.success) {
      console.log('✅ FCM token registered with backend');
      return { success: true, data: response.data };
    } else {
      console.error('❌ Failed to register FCM token:', response.data.message);
      return { success: false, error: response.data.message };
    }

  } catch (error) {
    console.error('❌ Error registering FCM token:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Unregister FCM token from the backend
 * @param {string} deviceId - Device identifier
 * @returns {Promise<object>} - API response
 */
export const unregisterFCMToken = async (deviceId) => {
  try {
    const response = await api.post('/auth/unregister-fcm-token', {
      deviceId
    });

    if (response.data.success) {
      console.log('✅ FCM token unregistered from backend');
      return { success: true, data: response.data };
    } else {
      console.error('❌ Failed to unregister FCM token:', response.data.message);
      return { success: false, error: response.data.message };
    }

  } catch (error) {
    console.error('❌ Error unregistering FCM token:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Update notification preferences
 * @param {object} preferences - Notification preferences
 * @returns {Promise<object>} - API response
 */
export const updateNotificationPreferences = async (preferences) => {
  try {
    const response = await api.put('/auth/notification-preferences', preferences);

    if (response.data.success) {
      console.log('✅ Notification preferences updated');
      return { success: true, data: response.data };
    } else {
      console.error('❌ Failed to update notification preferences:', response.data.message);
      return { success: false, error: response.data.message };
    }

  } catch (error) {
    console.error('❌ Error updating notification preferences:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Play notification sound
 */
const playNotificationSound = () => {
  try {
    const audio = new Audio('/sounds/mixkit-software-interface-back-2575.wav');
    audio.volume = 0.5;
    audio.play().catch(error => {
      console.log('Could not play notification sound:', error);
    });
  } catch (error) {
    console.log('Notification sound not available');
  }
};

/**
 * Check if FCM is supported
 * @returns {boolean} - Whether FCM is supported
 */
export const isFCMSupported = () => {
  return fcmSupported;
};

// Export Firebase app and auth
export default app;