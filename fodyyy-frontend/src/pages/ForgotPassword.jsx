import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { sendOTP, verifyOTP, clearRecaptcha } from '../utils/firebase';
import toast from 'react-hot-toast';
import {
  Phone,
  ArrowLeft,
  MessageSquare,
  Lock,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Home,
  RefreshCw
} from 'lucide-react';

// Forgot Password Modal Component
const ForgotPasswordModal = ({ isOpen, onClose, onPhoneVerified }) => {
  const [step, setStep] = useState('phone'); // 'phone' or 'otp'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otpInputs, setOtpInputs] = useState(['', '', '', '', '', '']);

  // Handle resend cooldown timer
  useEffect(() => {
    let interval;
    if (resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Reset modal when closed
  useEffect(() => {
    if (!isOpen) {
      setStep('phone');
      setPhoneNumber('');
      setOtp('');
      setConfirmationResult(null);
      setError('');
      setResendCooldown(0);
      setOtpInputs(['', '', '', '', '', '']);
      clearRecaptcha();
    }
  }, [isOpen]);

  // Handle OTP input changes
  const handleOtpChange = (index, value) => {
    if (value.length > 1) return; // Only allow single digit

    const newOtpInputs = [...otpInputs];
    newOtpInputs[index] = value;
    setOtpInputs(newOtpInputs);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }

    // Update OTP string
    const otpString = newOtpInputs.join('');
    setOtp(otpString);
  };

  // Handle OTP input backspace
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpInputs[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  // Send OTP to phone number
  const handleSendOTP = async () => {
    if (!phoneNumber.trim()) {
      setError('Please enter a phone number');
      return;
    }

    // Basic phone validation
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phoneNumber.replace(/\D/g, ''))) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await sendOTP(phoneNumber);
      if (result.success) {
        setConfirmationResult(result.confirmationResult);
        setStep('otp');
        setResendCooldown(60); // 60 seconds cooldown
        toast.success('OTP sent successfully!');
      } else {
        setError(result.error || 'Failed to send OTP');
      }
    } catch (err) {
      console.error('OTP send error:', err);
      let errorMessage = 'Failed to send OTP. Please try again.';

      // Handle specific Firebase errors
      if (err.code === 'auth/invalid-phone-number') {
        errorMessage = 'Invalid phone number format. Please check and try again.';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please wait a few minutes before trying again.';
      } else if (err.code === 'auth/quota-exceeded') {
        errorMessage = 'SMS quota exceeded. Please try again later.';
      } else if (!navigator.onLine) {
        errorMessage = 'No internet connection. Please check your connection and try again.';
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await verifyOTP(confirmationResult, otp);
      if (result.success) {
        toast.success('Phone number verified successfully!');
        onPhoneVerified(phoneNumber);
        // Modal will close automatically when step changes to 'new-password'
      } else {
        setError(result.error || 'Invalid OTP. Please try again.');
      }
    } catch (err) {
      console.error('OTP verification error:', err);
      let errorMessage = 'Failed to verify OTP. Please try again.';

      // Handle specific Firebase errors
      if (err.code === 'auth/invalid-verification-code') {
        errorMessage = 'Invalid verification code. Please check the code and try again.';
      } else if (err.code === 'auth/code-expired') {
        errorMessage = 'Verification code has expired. Please request a new code.';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Too many verification attempts. Please wait before trying again.';
      } else if (!navigator.onLine) {
        errorMessage = 'No internet connection. Please check your connection and try again.';
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;

    setIsLoading(true);
    setError('');

    try {
      const result = await sendOTP(phoneNumber);
      if (result.success) {
        setConfirmationResult(result.confirmationResult);
        setResendCooldown(60);
        toast.success('OTP resent successfully!');
      } else {
        setError(result.error || 'Failed to resend OTP');
      }
    } catch (err) {
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Reset Password</h2>
                  <p className="text-blue-100 text-sm">Verify your phone number</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {step === 'phone' ? (
              /* Phone Number Step */
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="Enter your phone number"
                      className="w-full pl-12 pr-4 py-3 rounded-xl border-2 transition-all duration-300 outline-none text-center font-mono text-lg tracking-wider"
                      disabled={isLoading}
                      maxLength="10"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1 text-center">
                    Enter 10-digit mobile number (without +91)
                  </p>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </motion.div>
                )}

                <button
                  onClick={handleSendOTP}
                  disabled={isLoading || !phoneNumber.trim()}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="w-4 h-4" />
                      Send OTP
                    </>
                  )}
                </button>
              </div>
            ) : (
              /* OTP Verification Step */
              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-8 h-8 text-blue-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Enter Verification Code</h3>
                  <p className="text-gray-600 text-sm">
                    We've sent a 6-digit code to <strong>+91 {phoneNumber}</strong>
                  </p>
                </div>

                {/* OTP Input */}
                <div className="flex justify-center gap-2">
                  {otpInputs.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value.replace(/\D/g, ''))}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-300 outline-none"
                      maxLength="1"
                      disabled={isLoading}
                    />
                  ))}
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </motion.div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={handleVerifyOTP}
                    disabled={isLoading || otp.length !== 6}
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Verify OTP
                      </>
                    )}
                  </button>
                </div>

                <div className="text-center">
                  <button
                    onClick={handleResendOTP}
                    disabled={isLoading || resendCooldown > 0}
                    className="text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend OTP'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* reCAPTCHA container (invisible) */}
          <div id="recaptcha-container" className="hidden"></div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// New Password Form Component
const NewPasswordForm = ({ phoneNumber, sessionToken, onSuccess }) => {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

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

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Call backend API to reset password
      const response = await fetch(`${import.meta.env.VITE_API_URL}/user/reset-password-by-phone`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber,
          newPassword: formData.password,
          sessionToken: sessionToken
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Password reset successfully!');
        onSuccess();
      } else {
        toast.error(result.message || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      toast.error('Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto"
    >
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Set New Password</h2>
        <p className="text-gray-600">Create a strong password for your account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* New Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter new password"
              className={`w-full pl-12 pr-12 py-3 rounded-xl border-2 transition-all duration-300 outline-none ${
                errors.password
                  ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                  : 'border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100'
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
              placeholder="Confirm new password"
              className={`w-full pl-12 pr-12 py-3 rounded-xl border-2 transition-all duration-300 outline-none ${
                errors.confirmPassword
                  ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                  : 'border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100'
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

        {/* Password Requirements */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li className={formData.password.length >= 8 ? 'text-green-600' : ''}>
              ✓ At least 8 characters
            </li>
            <li className={/(?=.*[a-z])/.test(formData.password) ? 'text-green-600' : ''}>
              ✓ One lowercase letter
            </li>
            <li className={/(?=.*[A-Z])/.test(formData.password) ? 'text-green-600' : ''}>
              ✓ One uppercase letter
            </li>
            <li className={/(?=.*\d)/.test(formData.password) ? 'text-green-600' : ''}>
              ✓ One number
            </li>
          </ul>
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={isLoading}
          className="w-full py-3.5 bg-gradient-to-r from-green-600 to-blue-500 text-white font-semibold text-base rounded-xl shadow-lg shadow-green-500/50 hover:shadow-xl hover:shadow-green-500/60 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Resetting Password...</span>
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              <span>Reset Password</span>
            </>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
};

const ForgotPassword = () => {
  const [step, setStep] = useState('phone'); // 'phone', 'otp', 'new-password'
  const [verifiedPhoneNumber, setVerifiedPhoneNumber] = useState('');
  const [sessionToken, setSessionToken] = useState('');
  const navigate = useNavigate();

  const handlePhoneVerified = async (phoneNumber) => {
    try {
      // Create OTP session with backend
      const response = await fetch(`${import.meta.env.VITE_API_URL}/user/verify-otp-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber
        }),
      });

      const result = await response.json();

      if (result.success) {
        setVerifiedPhoneNumber(phoneNumber);
        setSessionToken(result.sessionToken);
        setStep('new-password');
      } else {
        toast.error(result.message || 'Failed to verify session');
        // Reset to phone step if session creation fails
        setStep('phone');
      }
    } catch (error) {
      console.error('Session verification error:', error);
      toast.error('Failed to create reset session');
      setStep('phone');
    }
  };

  const handlePasswordResetSuccess = () => {
    toast.success('Password reset successfully! Please login with your new password.');
    navigate('/login');
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#FFF8F0] via-blue-50 to-[#E0F2FE]">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-300/30 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-300/20 rounded-full blur-3xl"
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
          className="w-full max-w-md"
        >
          {/* Logo & Branding */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-block group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center justify-center gap-3 mb-3"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
                  <span className="text-2xl">🔐</span>
                </div>
                <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-500 to-cyan-500 bg-clip-text text-transparent font-display">
                  Reset Password
                </h1>
              </motion.div>
            </Link>
            <p className="text-sm text-gray-600 font-medium">FOODY - IIT & IISER Tirupati</p>
          </div>

          {/* Content Based on Step */}
          {step === 'phone' && (
            <ForgotPasswordModal
              isOpen={true}
              onClose={() => navigate('/login')}
              onPhoneVerified={handlePhoneVerified}
            />
          )}

          {step === 'new-password' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="backdrop-blur-xl bg-white/80 border border-blue-100 shadow-2xl rounded-3xl p-8 md:p-10"
            >
              <NewPasswordForm
                phoneNumber={verifiedPhoneNumber}
                sessionToken={sessionToken}
                onSuccess={handlePasswordResetSuccess}
              />
            </motion.div>
          )}

          {/* Back to Login Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-6 text-center"
          >
            <Link to="/login">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/90 backdrop-blur-sm text-blue-600 rounded-full font-semibold shadow-lg border-2 border-blue-200 hover:border-blue-400 hover:bg-white transition-all duration-300"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Login
              </motion.button>
            </Link>
          </motion.div>

          {/* Back to Home Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="mt-4 text-center"
          >
            <Link to="/">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/90 backdrop-blur-sm text-gray-600 rounded-full font-semibold shadow-lg border-2 border-gray-200 hover:border-gray-400 hover:bg-white transition-all duration-300"
              >
                <Home className="w-5 h-5" />
                Back to Home
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPassword;