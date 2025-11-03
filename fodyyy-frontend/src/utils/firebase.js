// Firebase configuration and initialization
import { initializeApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

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

// Export Firebase app and auth
export default app;