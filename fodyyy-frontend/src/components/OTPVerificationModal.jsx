import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, MessageSquare, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { sendEmailOTP, verifyEmailOTP } from '../utils/firebase';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const OTPVerificationModal = ({ isOpen, onClose, onVerificationSuccess }) => {
  const { user } = useAuth();
  const userEmail = user?.email || '';

  const [step, setStep] = useState('email'); // 'email' or 'otp'
  const [email, setEmail] = useState(userEmail);
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otpInputs, setOtpInputs] = useState(['', '', '', '', '', '']);

  const otpRefs = useRef([]);

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
      setStep('email');
      setEmail(userEmail);
      setOtp('');
      setError('');
      setResendCooldown(0);
      setOtpInputs(['', '', '', '', '', '']);
    }
  }, [isOpen, userEmail]);

  // Auto-send OTP when modal opens with userEmail
  useEffect(() => {
    if (isOpen && userEmail && step === 'email') {
      setStep('otp');
      handleSendEmailOTP();
    }
  }, [isOpen, userEmail]); // Removed step from dependencies to avoid re-triggering

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

  // Send OTP to email address
  const handleSendEmailOTP = async () => {
    // Use userEmail from profile
    const emailToUse = userEmail;

    if (!emailToUse.trim()) {
      setError('Email address not found in your profile. Please update your profile.');
      return;
    }

    // Basic email validation
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(emailToUse)) {
      setError('Invalid email address in your profile. Please update your profile.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await sendEmailOTP(emailToUse);
      if (result.success) {
        setStep('otp');
        setResendCooldown(60); // 60 seconds cooldown
        toast.success('OTP sent successfully!');
      } else {
        setError(result.error || 'Failed to send OTP');
      }
    } catch (err) {
      console.error('Email OTP send error:', err);
      let errorMessage = 'Failed to send OTP. Please try again.';

      if (!navigator.onLine) {
        errorMessage = 'No internet connection. Please check your connection and try again.';
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyEmailOTP = async () => {
    if (otp.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await verifyEmailOTP(email, otp);
      if (result.success) {
        toast.success('Email verified successfully!');
        onVerificationSuccess(email);
        onClose();
      } else {
        setError(result.error || 'Invalid OTP. Please try again.');
      }
    } catch (err) {
      console.error('Email OTP verification error:', err);
      let errorMessage = 'Failed to verify OTP. Please try again.';

      if (!navigator.onLine) {
        errorMessage = 'No internet connection. Please check your connection and try again.';
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendEmailOTP = async () => {
    if (resendCooldown > 0) return;

    setIsLoading(true);
    setError('');

    try {
      const result = await sendEmailOTP(userEmail);
      if (result.success) {
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
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Verify Email Address</h2>
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
            {step === 'email' ? (
              userEmail ? (
                /* Profile Email Display Step */
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address (from your profile)
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={userEmail}
                        readOnly
                        className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-gray-700 transition-all duration-300 outline-none text-center font-mono text-lg cursor-not-allowed"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1 text-center">
                      We'll send a 6-digit OTP to this email
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
                    onClick={handleSendEmailOTP}
                    disabled={isLoading}
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
                /* Email Address Input Step */
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                        className="w-full pl-12 pr-4 py-3 rounded-xl border-2 transition-all duration-300 outline-none text-center font-mono text-lg"
                        disabled={isLoading}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1 text-center">
                      We'll send a 6-digit OTP to this email
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
                    onClick={handleSendEmailOTP}
                    disabled={isLoading || !email.trim()}
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
              )
            ) : (
              /* OTP Verification Step */
              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-8 h-8 text-orange-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Enter Verification Code</h3>
                  <p className="text-gray-600 text-sm">
                    We've sent a 6-digit code to <strong>{userEmail}</strong>
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
                    onClick={handleVerifyEmailOTP}
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
                    onClick={handleResendEmailOTP}
                    disabled={isLoading || resendCooldown > 0}
                    className="text-orange-600 hover:text-orange-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend OTP'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OTPVerificationModal;