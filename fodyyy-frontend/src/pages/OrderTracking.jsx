import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import orderService from '../services/orderService';
import { formatCurrency, formatDateTime, getRelativeTime } from '../utils/helpers';
import UPIPaymentModal from '../components/UPIPaymentModal';
import PaymentConfirmationForm from '../components/PaymentConfirmationForm';
import PaymentStatusBadge from '../components/PaymentStatusBadge';
import toast from 'react-hot-toast';

// Order Status Stepper Component
const OrderStatusStepper = ({ statusTimeline, currentStep }) => {
  return (
    <div className="relative">
      <div className="flex items-center justify-between">
        {statusTimeline.map((step, index) => (
          <div key={step.status} className="flex flex-col items-center relative">
            {/* Step Circle */}
            <div className={`
              w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold border-2 transition-all duration-300
              ${step.completed 
                ? 'bg-green-500 border-green-500 text-white' 
                : index === currentStep 
                  ? 'bg-blue-500 border-blue-500 text-white animate-pulse'
                  : 'bg-gray-200 border-gray-300 text-gray-500'
              }
            `}>
              {step.completed ? '✓' : step.icon}
            </div>
            
            {/* Step Label */}
            <div className="mt-2 text-center">
              <p className={`text-sm font-medium ${
                step.completed ? 'text-green-600' : 
                index === currentStep ? 'text-blue-600' : 'text-gray-500'
              }`}>
                {step.label}
              </p>
              {step.timestamp && (
                <p className="text-xs text-gray-400 mt-1">
                  {formatDateTime(step.timestamp, { timeOnly: true })}
                </p>
              )}
            </div>
            
            {/* Connecting Line */}
            {index < statusTimeline.length - 1 && (
              <div className={`
                absolute top-6 left-12 w-full h-0.5 transition-all duration-300
                ${step.completed ? 'bg-green-500' : 'bg-gray-300'}
              `} style={{ width: 'calc(100vw / 5 - 48px)' }}></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Order Details Card Component
const OrderDetailsCard = ({ order, restaurant, items }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Details</h3>
      
      {/* Order Info */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-sm text-gray-600">Order Number</p>
          <p className="font-semibold text-gray-900">{order.orderNumber}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Order Date</p>
          <p className="font-semibold text-gray-900">
            {formatDateTime(order.createdAt)}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Payment Method</p>
          <p className="font-semibold text-gray-900 capitalize">{order.paymentMethod}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Payment Status</p>
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            order.paymentStatus === 'paid' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {order.paymentStatus}
          </span>
        </div>
      </div>

      {/* Restaurant Info */}
      <div className="border-t pt-4 mb-6">
        <h4 className="font-semibold text-gray-900 mb-2">Restaurant</h4>
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-red-500 rounded-lg flex items-center justify-center text-white">
            🏪
          </div>
          <div className="ml-3">
            <p className="font-medium text-gray-900">{restaurant.name}</p>
            <p className="text-sm text-gray-600">{restaurant.address}</p>
            {restaurant.phone && (
              <p className="text-sm text-blue-600">📞 {restaurant.phone}</p>
            )}
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="border-t pt-4">
        <h4 className="font-semibold text-gray-900 mb-3">Items Ordered</h4>
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center">
                {item.menuItem.image && (
                  <img 
                    src={item.menuItem.image} 
                    alt={item.menuItem.name}
                    className="w-12 h-12 rounded-lg object-cover mr-3"
                  />
                )}
                <div>
                  <p className="font-medium text-gray-900">{item.menuItem.name}</p>
                  <p className="text-sm text-gray-600">
                    {formatCurrency(item.price)} × {item.quantity}
                  </p>
                  {item.specialInstructions && (
                    <p className="text-xs text-gray-500 italic">
                      Note: {item.specialInstructions}
                    </p>
                  )}
                </div>
              </div>
              <p className="font-semibold text-gray-900">
                {formatCurrency(item.price * item.quantity)}
              </p>
            </div>
          ))}
        </div>
        
        {/* Total */}
        <div className="border-t mt-4 pt-4">
          <div className="flex justify-between items-center">
            <p className="text-lg font-semibold text-gray-900">Total</p>
            <p className="text-lg font-bold text-green-600">
              {formatCurrency((typeof order.total === 'number') ? order.total : (Number(order.subtotal || order.totalAmount || 0) + Number(order.deliveryFee || 0) + Number(order.tax || 0) - (typeof order.discount === 'number' ? order.discount : Number(order?.discount?.amount || 0))))}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// UPI Payment Instructions Component
const UPIPaymentInstructions = ({ paymentInstructions }) => {
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <h4 className="font-semibold text-yellow-800 mb-3 flex items-center">
        💳 Payment Required
      </h4>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-yellow-700">UPI ID:</span>
          <div className="flex items-center">
            <code className="bg-yellow-100 px-2 py-1 rounded text-sm">
              {paymentInstructions.upiId}
            </code>
            <button 
              onClick={() => copyToClipboard(paymentInstructions.upiId)}
              className="ml-2 text-yellow-600 hover:text-yellow-800"
            >
              📋
            </button>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-yellow-700">Amount:</span>
          <span className="font-semibold text-yellow-800">
            ₹{paymentInstructions.amount}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-yellow-700">Note:</span>
          <div className="flex items-center">
            <code className="bg-yellow-100 px-2 py-1 rounded text-sm">
              {paymentInstructions.note}
            </code>
            <button 
              onClick={() => copyToClipboard(paymentInstructions.note)}
              className="ml-2 text-yellow-600 hover:text-yellow-800"
            >
              📋
            </button>
          </div>
        </div>
      </div>
      <p className="text-xs text-yellow-600 mt-3">
        Please complete the payment to confirm your order. Your order will be processed once payment is received.
      </p>
    </div>
  );
};

const OrderTracking = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [trackingData, setTrackingData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showConfirmationForm, setShowConfirmationForm] = useState(false);
  const [isConfirmingPayment, setIsConfirmingPayment] = useState(false);

  useEffect(() => {
    loadTrackingData();
    loadPaymentData();
    
    // Set up polling for real-time updates every 30 seconds
    const interval = setInterval(() => {
      loadTrackingData();
      loadPaymentData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [id]);

  const loadTrackingData = async () => {
    try {
      setError(null);
      const response = await orderService.getOrderTracking(id);
      
      if (response.success) {
        setTrackingData(response.data);
      } else {
        setError(response.message || 'Failed to load order tracking data');
      }
    } catch (error) {
      console.error('Error loading tracking data:', error);
      setError('Failed to load order tracking data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPaymentData = async () => {
    try {
      const response = await orderService.getPaymentDetails(id);
      
      if (response.success) {
        setPaymentData(response.data);
      }
    } catch (error) {
      console.error('Error loading payment data:', error);
    }
  };

  const handlePaymentClick = () => {
    setShowPaymentModal(true);
  };

  const handlePaymentModalConfirm = () => {
    setShowPaymentModal(false);
    setShowConfirmationForm(true);
  };

  const handlePaymentConfirmation = async (formData) => {
    try {
      setIsConfirmingPayment(true);
      
      const response = await orderService.confirmPayment(id, {
        transactionId: formData.transactionId,
        paymentProof: formData.paymentProof
      });

      if (response.success) {
        toast.success('Payment confirmed successfully!');
        setShowConfirmationForm(false);
        
        // Reload data to reflect payment status
        await loadTrackingData();
        await loadPaymentData();
      } else {
        toast.error(response.message || 'Failed to confirm payment');
      }
    } catch (error) {
      console.error('Error confirming payment:', error);
      toast.error('Failed to confirm payment');
    } finally {
      setIsConfirmingPayment(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
      preparing: 'bg-orange-100 text-orange-800 border-orange-200',
      ready: 'bg-purple-100 text-purple-800 border-purple-200',
      delivered: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const cancelOrder = async () => {
    if (!trackingData?.order.canCancel) {
      toast.error('Order cannot be cancelled at this stage');
      return;
    }

    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      const response = await orderService.cancelOrder(id);
      
      if (response.success) {
        toast.success('Order cancelled successfully');
        loadTrackingData();
      } else {
        toast.error(response.message || 'Failed to cancel order');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error('Failed to cancel order');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order tracking...</p>
        </div>
      </div>
    );
  }

  if (error || !trackingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {error || 'Order not found'}
          </h3>
          <p className="text-gray-600 mb-6">
            The order you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Link to="/orders" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            View All Orders
          </Link>
        </div>
      </div>
    );
  }

  const { order, restaurant, items, statusTimeline, currentStep, paymentInstructions } = trackingData;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Order Tracking
              </h1>
              <p className="text-gray-600 mt-1">
                Track your order #{order.orderNumber}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Live indicator */}
              <div className="flex items-center text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                <span className="text-sm">Live tracking</span>
              </div>
              <Link
                to="/orders"
                className="text-gray-600 hover:text-gray-900 flex items-center"
              >
                ← All Orders
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Current Status Banner */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Current Status
              </h2>
              <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                <span className="mr-2 text-lg">
                  {statusTimeline[currentStep]?.icon || '📋'}
                </span>
                {statusTimeline[currentStep]?.label || order.status}
              </div>
            </div>
            {order.timeRemaining > 0 && order.status !== 'delivered' && order.status !== 'cancelled' && (
              <div className="text-right">
                <p className="text-sm text-gray-600">Estimated delivery in</p>
                <p className="text-2xl font-bold text-blue-600">
                  {order.timeRemaining} mins
                </p>
              </div>
            )}
          </div>

          {/* Payment Status and Actions */}
          {paymentData && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900">Payment Status</h4>
                <PaymentStatusBadge 
                  paymentStatus={paymentData.paymentStatus}
                  isVerified={!!paymentData.verifiedAt}
                />
              </div>
              
              {paymentData.canConfirmPayment && (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    Complete your payment to confirm the order
                  </p>
                  <button
                    onClick={handlePaymentClick}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Make Payment
                  </button>
                </div>
              )}
              
              {paymentData.paymentStatus === 'paid' && !paymentData.verifiedAt && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    ✅ Payment confirmed! Waiting for restaurant verification.
                  </p>
                </div>
              )}
              
              {paymentData.verifiedAt && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    ✅ Payment verified by restaurant. Your order is being processed.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Status Stepper */}
          {order.status !== 'cancelled' && (
            <div className="mt-8">
              <OrderStatusStepper 
                statusTimeline={statusTimeline} 
                currentStep={currentStep} 
              />
            </div>
          )}

          {/* Cancelled Status */}
          {order.status === 'cancelled' && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <span className="text-2xl mr-3">❌</span>
                <div>
                  <p className="font-semibold text-red-800">Order Cancelled</p>
                  <p className="text-sm text-red-600">
                    This order has been cancelled. If you have any questions, please contact the restaurant.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 flex space-x-4">
            {order.canCancel && (
              <button
                onClick={cancelOrder}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Cancel Order
              </button>
            )}
            {order.canRate && (
              <Link
                to={`/orders/${order._id}/rate`}
                className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
              >
                Rate Order
              </Link>
            )}
          </div>
        </div>

        {/* Order Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <OrderDetailsCard 
            order={order}
            restaurant={restaurant}
            items={items}
          />

          {/* Delivery Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Delivery Information
            </h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Delivery Address</p>
                <p className="font-medium text-gray-900">{order.deliveryAddress}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Contact Number</p>
                <p className="font-medium text-gray-900">{order.phone}</p>
              </div>

              {order.specialInstructions && (
                <div>
                  <p className="text-sm text-gray-600">Special Instructions</p>
                  <p className="font-medium text-gray-900">{order.specialInstructions}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-600">Estimated Delivery Time</p>
                <p className="font-medium text-gray-900">
                  {formatDateTime(order.estimatedDeliveryTime)}
                </p>
              </div>

              {order.actualDeliveryTime && (
                <div>
                  <p className="text-sm text-gray-600">Actual Delivery Time</p>
                  <p className="font-medium text-green-600">
                    {formatDateTime(order.actualDeliveryTime)}
                  </p>
                </div>
              )}
            </div>

            {/* Contact Restaurant */}
            <div className="mt-6 pt-6 border-t">
              <h4 className="font-semibold text-gray-900 mb-2">Need Help?</h4>
              <p className="text-sm text-gray-600 mb-3">
                Contact the restaurant directly for any order-related queries.
              </p>
              {restaurant.phone && (
                <a
                  href={`tel:${restaurant.phone}`}
                  className="inline-flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  📞 Call Restaurant
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {paymentData && (
        <UPIPaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          orderData={paymentData}
          onPaymentConfirm={handlePaymentModalConfirm}
        />
      )}

      {/* Payment Confirmation Form */}
      {paymentData && (
        <PaymentConfirmationForm
          isOpen={showConfirmationForm}
          onClose={() => setShowConfirmationForm(false)}
          orderData={paymentData}
          onSubmit={handlePaymentConfirmation}
          isSubmitting={isConfirmingPayment}
        />
      )}
    </div>
  );
};

export default OrderTracking;