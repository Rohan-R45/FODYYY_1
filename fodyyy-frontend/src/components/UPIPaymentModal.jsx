import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import toast from 'react-hot-toast';

const UPIPaymentModal = ({ 
  isOpen, 
  onClose, 
  orderData, 
  onPaymentConfirm 
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);

  useEffect(() => {
    if (isOpen && orderData) {
      generateQRCode();
    }
  }, [isOpen, orderData]);

  const generateQRCode = async () => {
    try {
      setIsGeneratingQR(true);
      
      // Create UPI payment URL
      const amount = orderData.totalAmount ?? orderData.total ?? 0;
      const upiUrl = `upi://pay?pa=${orderData.upiDetails.upiId}&pn=Restaurant&am=${amount}&cu=INR&tn=${orderData.upiDetails.note}`;
      
      // Generate QR code
      const qrCodeDataUrl = await QRCode.toDataURL(upiUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      setQrCodeUrl(qrCodeDataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error('Failed to generate QR code');
    } finally {
      setIsGeneratingQR(false);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`${label} copied to clipboard!`);
    }).catch(() => {
      toast.error('Failed to copy to clipboard');
    });
  };

  const handlePaymentConfirm = () => {
    onPaymentConfirm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Complete Payment
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Order Summary */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Order Summary</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Order Number:</span>
                <span className="font-medium">{orderData.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Amount:</span>
                <span className="font-bold text-green-600">₹{orderData.totalAmount}</span>
              </div>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="mb-6 text-center">
            <h4 className="font-semibold text-gray-900 mb-3">
              Scan QR Code to Pay
            </h4>
            
            {isGeneratingQR ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Generating QR Code...</span>
              </div>
            ) : qrCodeUrl ? (
              <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block">
                <img 
                  src={qrCodeUrl} 
                  alt="UPI Payment QR Code" 
                  className="w-48 h-48 mx-auto"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                Failed to generate QR code
              </div>
            )}
            
            <p className="text-sm text-gray-600 mt-2">
              Open any UPI app and scan this QR code to pay
            </p>
          </div>

          {/* Manual Payment Details */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">
              Or Pay Manually
            </h4>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="text-sm text-gray-600">UPI ID:</span>
                  <p className="font-mono font-medium">{orderData.upiDetails.upiId}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(orderData.upiDetails.upiId, 'UPI ID')}
                  className="text-blue-600 hover:text-blue-800 p-1"
                  title="Copy UPI ID"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="text-sm text-gray-600">Amount:</span>
                  <p className="font-semibold text-green-600">₹{orderData.totalAmount}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(orderData.totalAmount.toString(), 'Amount')}
                  className="text-blue-600 hover:text-blue-800 p-1"
                  title="Copy Amount"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="text-sm text-gray-600">Note:</span>
                  <p className="font-mono text-sm">{orderData.upiDetails.note}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(orderData.upiDetails.note, 'Note')}
                  className="text-blue-600 hover:text-blue-800 p-1"
                  title="Copy Note"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h5 className="font-semibold text-blue-900 mb-2">Payment Instructions:</h5>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. Open your UPI app (PhonePe, Google Pay, Paytm, etc.)</li>
              <li>2. Scan the QR code or enter the UPI ID manually</li>
              <li>3. Enter the exact amount: ₹{orderData.totalAmount}</li>
              <li>4. Add the note: "{orderData.upiDetails.note}"</li>
              <li>5. Complete the payment</li>
              <li>6. Come back and confirm your payment below</li>
            </ol>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handlePaymentConfirm}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              I've Made the Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UPIPaymentModal;