import React, { useState } from 'react';
import toast from 'react-hot-toast';

const PaymentConfirmationForm = ({ 
  isOpen, 
  onClose, 
  orderData, 
  onSubmit,
  isSubmitting = false 
}) => {
  const [formData, setFormData] = useState({
    transactionId: '',
    paymentProof: null
  });
  const [errors, setErrors] = useState({});

  const validateTransactionId = (id) => {
    if (!id) return 'Transaction ID is required';
    if (id.length < 12) return 'Transaction ID must be at least 12 characters';
    if (!/^[A-Za-z0-9]+$/.test(id)) return 'Transaction ID can only contain letters and numbers';
    return null;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload a valid image file (JPEG, PNG, WebP)');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      setFormData(prev => ({
        ...prev,
        paymentProof: file
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate form
    const newErrors = {};
    const transactionIdError = validateTransactionId(formData.transactionId);
    if (transactionIdError) {
      newErrors.transactionId = transactionIdError;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Submit form
    onSubmit(formData);
  };

  const handleClose = () => {
    setFormData({ transactionId: '', paymentProof: null });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Confirm Payment
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Order Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Order Details</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Order Number:</span>
                <span className="font-medium">{orderData.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Amount Paid:</span>
                <span className="font-bold text-green-600">₹{orderData.totalAmount}</span>
              </div>
            </div>
          </div>

          {/* Transaction ID Input */}
          <div className="mb-4">
            <label htmlFor="transactionId" className="block text-sm font-medium text-gray-700 mb-2">
              UPI Transaction ID *
            </label>
            <input
              type="text"
              id="transactionId"
              name="transactionId"
              value={formData.transactionId}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.transactionId ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter your UPI transaction ID"
              disabled={isSubmitting}
            />
            {errors.transactionId && (
              <p className="mt-1 text-sm text-red-600">{errors.transactionId}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              You can find this in your UPI app's transaction history
            </p>
          </div>

          {/* Payment Proof Upload */}
          <div className="mb-6">
            <label htmlFor="paymentProof" className="block text-sm font-medium text-gray-700 mb-2">
              Payment Screenshot (Optional)
            </label>
            <input
              type="file"
              id="paymentProof"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isSubmitting}
            />
            <p className="mt-1 text-xs text-gray-500">
              Upload a screenshot of your payment confirmation (JPEG, PNG, WebP - Max 5MB)
            </p>
            {formData.paymentProof && (
              <p className="mt-1 text-sm text-green-600">
                ✓ File selected: {formData.paymentProof.name}
              </p>
            )}
          </div>

          {/* Important Note */}
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex">
              <svg className="w-5 h-5 text-yellow-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <h5 className="font-semibold text-yellow-800">Important:</h5>
                <p className="text-sm text-yellow-700 mt-1">
                  Please ensure you've completed the payment before submitting this form. 
                  Your order will be processed only after payment verification.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.transactionId}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Confirming...
                </>
              ) : (
                'Confirm Payment'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentConfirmationForm;