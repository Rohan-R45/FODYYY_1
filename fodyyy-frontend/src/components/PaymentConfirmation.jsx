import React, { useState } from 'react';
import { formatCurrency } from '../utils/helpers';
import orderService from '../services/orderService';
import toast from 'react-hot-toast';

const PaymentConfirmation = ({ order, onPaymentUpdate, onClose }) => {
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [transactionId, setTransactionId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }

      setPaymentScreenshot(file);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleRemoveFile = () => {
    setPaymentScreenshot(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handleSubmitPayment = async () => {
    // Validation
    if (!paymentScreenshot) {
      toast.error('Please upload payment screenshot');
      return;
    }
    
    if (!transactionId.trim()) {
      toast.error('Please enter transaction ID');
      return;
    }

    if (transactionId.length < 8) {
      toast.error('Transaction ID should be at least 8 characters');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('paymentScreenshot', paymentScreenshot);
      formData.append('transactionId', transactionId.trim());
      formData.append('paymentMethod', 'upi');

      const response = await orderService.updatePayment(order._id, formData);
      
      if (response.success) {
        toast.success('Payment confirmation submitted successfully!');
        onPaymentUpdate && onPaymentUpdate(response.data);
        onClose();
      } else {
        toast.error(response.message || 'Failed to submit payment confirmation');
      }
    } catch (error) {
      console.error('Error submitting payment:', error);
      toast.error('Failed to submit payment confirmation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateQRCode = () => {
    // In a real app, you would generate a proper UPI QR code
    // For now, we'll show a placeholder
    const upiString = `upi://pay?pa=restaurant@upi&pn=Restaurant&am=${order.total}&cu=INR&tn=Order%20${order.orderNumber}`;
    return upiString;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Complete Payment</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Payment Details */}
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="bg-primary-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600 mb-2">Amount to Pay</p>
              <p className="text-2xl font-bold text-primary-600">{formatCurrency(order.total)}</p>
              <p className="text-sm text-gray-600 mt-1">Order #{order.orderNumber}</p>
            </div>
            
            {/* UPI Payment Instructions */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-gray-900 mb-2">Payment Instructions</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>1. Open any UPI app (GPay, PhonePe, Paytm)</p>
                <p>2. Scan the QR code or use UPI ID</p>
                <p>3. Enter amount: {formatCurrency(order.total)}</p>
                <p>4. Complete the payment</p>
                <p>5. Upload screenshot and transaction ID below</p>
              </div>
            </div>
            
            {/* QR Code Placeholder */}
            <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-6 mb-4">
              <div className="w-32 h-32 bg-gray-100 rounded-lg mx-auto flex items-center justify-center mb-3">
                <div className="text-center">
                  <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                  <p className="text-xs text-gray-500">QR Code</p>
                </div>
              </div>
              <p className="text-xs text-gray-500">Scan with any UPI app</p>
              <p className="text-xs text-gray-600 mt-2 font-mono">
                UPI ID: restaurant@upi
              </p>
            </div>
          </div>
          
          {/* Payment Confirmation Form */}
          <div className="space-y-4">
            {/* Screenshot Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Payment Screenshot *
              </label>
              
              {!paymentScreenshot ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="screenshot-upload"
                  />
                  <label
                    htmlFor="screenshot-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span className="text-sm text-gray-600">Click to upload screenshot</span>
                    <span className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</span>
                  </label>
                </div>
              ) : (
                <div className="border border-gray-300 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {previewUrl && (
                        <img
                          src={previewUrl}
                          alt="Payment screenshot"
                          className="w-12 h-12 object-cover rounded border"
                        />
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">{paymentScreenshot.name}</p>
                        <p className="text-xs text-gray-500">
                          {(paymentScreenshot.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleRemoveFile}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Transaction ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                UPI Transaction ID *
              </label>
              <input
                type="text"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="Enter 12-digit transaction ID"
                className="input w-full"
                maxLength={20}
              />
              <p className="text-xs text-gray-500 mt-1">
                You can find this in your UPI app's transaction history
              </p>
            </div>
            
            {/* Submit Button */}
            <button
              onClick={handleSubmitPayment}
              disabled={isSubmitting || !paymentScreenshot || !transactionId.trim()}
              className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Confirm Payment
                </>
              )}
            </button>
            
            {/* Skip Button */}
            <button
              onClick={onClose}
              className="w-full text-gray-600 py-2 text-sm hover:text-gray-800 transition-colors"
            >
              I'll upload payment details later
            </button>
          </div>
          
          {/* Help Text */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Need Help?</p>
                <p>Your order will be confirmed once we verify your payment. This usually takes 2-5 minutes.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentConfirmation;