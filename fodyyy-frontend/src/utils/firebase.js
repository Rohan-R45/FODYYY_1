// Firebase configuration and initialization
import { initializeApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';

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

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Firebase Cloud Messaging
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

// Store recaptcha verifier
let recaptchaVerifier = null;

/**
 * Setup reCAPTCHA verifier for phone authentication
 * @param {string} containerId - ID of the DOM element for reCAPTCHA
 * @returns {RecaptchaVerifier} - The initialized verifier
 */
export const setupRecaptcha = (containerId = 'recaptcha-container') => {
  try {
    // Clear existing verifier
    if (recaptchaVerifier) {
      try {
        recaptchaVerifier.clear();
      } catch (e) {
        console.log('Previous verifier already cleared');
      }
      recaptchaVerifier = null;
    }

    // Check if container exists
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`reCAPTCHA container with ID "${containerId}" not found in DOM`);
    }

    // CORRECT ORDER: auth, containerId, options
    recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: (response) => {
        console.log('✓ reCAPTCHA solved successfully');
      },
      'expired-callback': () => {
        console.warn('⚠ reCAPTCHA expired, please try again');
        recaptchaVerifier = null;
      }
    });

    console.log('✓ reCAPTCHA verifier initialized');
    return recaptchaVerifier;

  } catch (error) {
    console.error('✗ Error setting up reCAPTCHA:', error);
    throw new Error(`Failed to initialize reCAPTCHA: ${error.message}`);
  }
};

/**
 * Format phone number to international format
 * @param {string} phoneNumber - Phone number to format
 * @returns {string} - Formatted phone number with +91 prefix
 */
const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) {
    throw new Error('Phone number is required');
  }

  // Remove spaces, dashes, parentheses
  let cleaned = phoneNumber.trim().replace(/[\s\-\(\)]/g, '');

  // Remove any leading zeros
  cleaned = cleaned.replace(/^0+/, '');

  // Add +91 if not present
  if (!cleaned.startsWith('+')) {
    if (cleaned.startsWith('91') && cleaned.length === 12) {
      cleaned = '+' + cleaned;
    } else if (cleaned.length === 10 && /^[6-9]/.test(cleaned)) {
      cleaned = '+91' + cleaned;
    } else {
      throw new Error('Invalid phone number format. Must be 10 digits starting with 6-9');
    }
  }

  // Validate final format
  if (!/^\+91[6-9]\d{9}$/.test(cleaned)) {
    throw new Error('Invalid Indian phone number format');
  }

  return cleaned;
};

/**
 * Send OTP to phone number
 * @param {string} phoneNumber - Phone number to send OTP to
 * @returns {Promise<object>} - Result with success status and confirmationResult
 */
export const sendOTP = async (phoneNumber) => {
  try {
    console.log('📱 Starting OTP send process...');

    // Format and validate phone number
    const formattedPhone = formatPhoneNumber(phoneNumber);
    console.log('📱 Formatted phone:', formattedPhone);

    // Ensure reCAPTCHA container exists
    const container = document.getElementById('recaptcha-container');
    if (!container) {
      throw new Error('reCAPTCHA container not found. Please refresh the page.');
    }

    // Setup reCAPTCHA verifier
    console.log('🔒 Setting up reCAPTCHA...');
    const appVerifier = setupRecaptcha('recaptcha-container');

    // Small delay to ensure reCAPTCHA is ready
    await new Promise(resolve => setTimeout(resolve, 300));

    // Send OTP via Firebase
    console.log('📤 Sending OTP via Firebase...');
    const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);

    console.log('✓ OTP sent successfully!');

    return {
      success: true,
      confirmationResult,
      message: 'OTP sent successfully to your phone'
    };

  } catch (error) {
    console.error('✗ Error sending OTP:', error);

    // Clear verifier on error
    clearRecaptcha();

    // Map Firebase errors to user-friendly messages
    let errorMessage = 'Failed to send OTP. Please try again.';

    switch (error.code) {
      case 'auth/invalid-phone-number':
        errorMessage = 'Invalid phone number. Please enter a valid 10-digit mobile number.';
        break;
      case 'auth/too-many-requests':
        errorMessage = 'Too many requests. Please wait a few minutes before trying again.';
        break;
      case 'auth/quota-exceeded':
        errorMessage = 'SMS quota exceeded. Please contact support or try again later.';
        break;
      case 'auth/captcha-check-failed':
        errorMessage = 'reCAPTCHA verification failed. Please refresh the page and try again.';
        break;
      case 'auth/missing-phone-number':
        errorMessage = 'Phone number is required.';
        break;
      case 'auth/operation-not-allowed':
        errorMessage = 'Phone authentication is not enabled. Please contact support.';
        break;
      default:
        if (error.message.includes('reCAPTCHA container')) {
          errorMessage = error.message;
        } else if (error.message.includes('Invalid')) {
          errorMessage = error.message;
        } else if (!navigator.onLine) {
          errorMessage = 'No internet connection. Please check your connection and try again.';
        }
    }

    return {
      success: false,
      error: errorMessage,
      code: error.code
    };
  }
};

/**
 * Verify OTP code
 * @param {object} confirmationResult - The confirmation result from sendOTP
 * @param {string} otpCode - 6-digit OTP code entered by user
 * @returns {Promise<object>} - Result with success status and user data
 */
export const verifyOTP = async (confirmationResult, otpCode) => {
  try {
    console.log('🔐 Verifying OTP code...');

    // Validate inputs
    if (!confirmationResult) {
      throw new Error('No confirmation result available. Please request a new OTP.');
    }

    if (!otpCode) {
      throw new Error('OTP code is required');
    }

    // Clean OTP code (remove spaces, dashes)
    const cleanedOTP = otpCode.trim().replace(/[\s\-]/g, '');

    if (cleanedOTP.length !== 6 || !/^\d{6}$/.test(cleanedOTP)) {
      throw new Error('Please enter a valid 6-digit OTP code');
    }

    // Verify OTP with Firebase
    const result = await confirmationResult.confirm(cleanedOTP);

    console.log('✓ OTP verified successfully!');

    return {
      success: true,
      user: result.user,
      message: 'Phone number verified successfully',
      phoneNumber: result.user.phoneNumber
    };

  } catch (error) {
    console.error('✗ Error verifying OTP:', error);

    // Map Firebase errors to user-friendly messages
    let errorMessage = 'Invalid OTP code. Please try again.';

    switch (error.code) {
      case 'auth/invalid-verification-code':
        errorMessage = 'Invalid OTP code. Please check the code and try again.';
        break;
      case 'auth/code-expired':
        errorMessage = 'OTP has expired. Please request a new code.';
        break;
      case 'auth/session-expired':
        errorMessage = 'Session expired. Please request a new OTP.';
        break;
      case 'auth/too-many-requests':
        errorMessage = 'Too many failed attempts. Please try again after some time.';
        break;
      case 'auth/missing-verification-code':
        errorMessage = 'Verification code is required.';
        break;
      default:
        if (error.message.includes('valid 6-digit')) {
          errorMessage = error.message;
        } else if (error.message.includes('confirmation result')) {
          errorMessage = error.message;
        } else if (!navigator.onLine) {
          errorMessage = 'No internet connection. Please check your connection and try again.';
        }
    }

    return {
      success: false,
      error: errorMessage,
      code: error.code
    };
  }
};

/**
 * Clear reCAPTCHA verifier and reset state
 */
export const clearRecaptcha = () => {
  if (recaptchaVerifier) {
    try {
      recaptchaVerifier.clear();
      console.log('✓ reCAPTCHA verifier cleared');
    } catch (error) {
      console.log('Note: Verifier already cleared or not initialized');
    }
    recaptchaVerifier = null;
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

    // Request permission
    const permission = await Notification.requestPermission();

    if (permission !== 'granted') {
      return {
        success: false,
        error: 'Notification permission denied'
      };
    }

    // Get FCM token
    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
    });

    if (!token) {
      return {
        success: false,
        error: 'Failed to get FCM token'
      };
    }

    console.log('✅ FCM token obtained:', token);

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
    const response = await fetch('/api/auth/register-fcm-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        token,
        deviceId,
        deviceType: 'web'
      })
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ FCM token registered with backend');
      return { success: true, data };
    } else {
      console.error('❌ Failed to register FCM token:', data.message);
      return { success: false, error: data.message };
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
    const response = await fetch('/api/auth/unregister-fcm-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        deviceId
      })
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ FCM token unregistered from backend');
      return { success: true, data };
    } else {
      console.error('❌ Failed to unregister FCM token:', data.message);
      return { success: false, error: data.message };
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
    const response = await fetch('/api/auth/notification-preferences', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(preferences)
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Notification preferences updated');
      return { success: true, data };
    } else {
      console.error('❌ Failed to update notification preferences:', data.message);
      return { success: false, error: data.message };
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