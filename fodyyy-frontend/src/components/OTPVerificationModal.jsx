import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, MessageSquare, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { sendOTP, verifyOTP, clearRecaptcha } from '../utils/firebase';
import toast from 'react-hot-toast';

const OTPVerificationModal = ({ isOpen, onClose, onVerificationSuccess, phoneNumber: initialPhoneNumber }) => {
  const [step, setStep] = useState('phone'); // 'phone' or 'otp'
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber || '');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otpInputs, setOtpInputs] = useState(['', '', '', '', '', '']);

  const otpRefs = useRef([]);
  const recaptchaRef = useRef(null);

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
      setPhoneNumber(initialPhoneNumber || '');
      setOtp('');
      setConfirmationResult(null);
      setError('');
      setResendCooldown(0);
      setOtpInputs(['', '', '', '', '', '']);
      clearRecaptcha();
    }
  }, [isOpen, initialPhoneNumber]);

  // Handle OTP input changes
  const handleOtpChange = (index, value) => {
    if (value.length > 1) return; // Only allow single digit

    const newOtpInputs = [...otpInputs];
    newOtpInputs[index] = value;
    setOtpInputs(newOtpInputs);

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    // Update OTP string
    const otpString = newOtpInputs.join('');
    setOtp(otpString);
  };

  // Handle OTP input backspace
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpInputs[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
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
        onVerificationSuccess(phoneNumber);
        onClose();
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
          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Verify Phone Number</h2>
                  <p className="text-orange-100 text-sm">Secure your order with OTP</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <X className="w-4 h-4" />
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
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
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
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-8 h-8 text-orange-500" />
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
                      ref={(el) => (otpRefs.current[index] = el)}
                      type="text"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value.replace(/\D/g, ''))}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all duration-300 outline-none"
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
                    className="text-orange-600 hover:text-orange-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend OTP'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* reCAPTCHA container (invisible) */}
          <div id="recaptcha-container" ref={recaptchaRef} className="hidden"></div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OTPVerificationModal;