import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatCurrency, formatDateTime, getRelativeTime } from '../utils/helpers';
import orderService from '../services/orderService';
import PaymentStatusBadge from '../components/PaymentStatusBadge';
import toast from 'react-hot-toast';

// Payment Verification Dialog Component
const PaymentVerificationDialog = ({ isOpen, onClose, order, onVerify }) => {
  const [notes, setNotes] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async () => {
    try {
      setIsVerifying(true);
      await onVerify(order._id, notes);
      setNotes('');
      onClose();
    } catch (error) {
      console.error('Error verifying payment:', error);
    } finally {
      setIsVerifying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Verify Payment
          </h3>
          
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Order Details</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Order Number:</span>
                <span className="font-medium">{order.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Customer:</span>
                <span className="font-medium">{order.student?.name || order.customer?.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Amount:</span>
                <span className="font-bold text-green-600">{formatCurrency((typeof order.total === 'number') ? order.total : (Number(order.subtotal || order.totalAmount || 0) + Number(order.deliveryFee || 0) + Number(order.tax || 0) - (typeof order.discount === 'number' ? order.discount : Number(order?.discount?.amount || 0))))}</span>
              </div>
              {order.upiTransactionId && (
                <div className="flex justify-between">
                  <span>Transaction ID:</span>
                  <span className="font-mono text-xs">{order.upiTransactionId}</span>
                </div>
              )}
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="verificationNotes" className="block text-sm font-medium text-gray-700 mb-2">
              Verification Notes (Optional)
            </label>
            <textarea
              id="verificationNotes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Add any notes about the payment verification..."
            />
          </div>

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={isVerifying}
            >
              Cancel
            </button>
            <button
              onClick={handleVerify}
              disabled={isVerifying}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center"
            >
              {isVerifying ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Verifying...
                </>
              ) : (
                'Verify Payment'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Status Change Dialog Component
const StatusChangeDialog = ({ isOpen, onClose, order, onConfirm }) => {
  const [selectedStatus, setSelectedStatus] = useState('');
  const [notes, setNotes] = useState('');

  const getNextStatuses = (currentStatus) => {
    const transitions = {
      'pending': [
        { value: 'confirmed', label: 'Confirm Order', color: 'blue' },
        { value: 'cancelled', label: 'Cancel Order', color: 'red' }
      ],
      'confirmed': [
        { value: 'preparing', label: 'Start Preparing', color: 'orange' },
        { value: 'cancelled', label: 'Cancel Order', color: 'red' }
      ],
      'preparing': [
        { value: 'ready', label: 'Mark as Ready', color: 'purple' },
        { value: 'cancelled', label: 'Cancel Order', color: 'red' }
      ],
      'ready': [
        { value: 'delivered', label: 'Mark as Delivered', color: 'green' }
      ]
    };
    return transitions[currentStatus] || [];
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedStatus) return;
    
    onConfirm(selectedStatus, notes);
    setSelectedStatus('');
    setNotes('');
    onClose();
  };

  if (!isOpen) return null;

  const nextStatuses = getNextStatuses(order.status);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Update Order Status
        </h3>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            Order #{order.orderNumber} - Current Status: 
            <span className="font-semibold ml-1 capitalize">{order.status}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Status
            </label>
            <div className="space-y-2">
              {nextStatuses.map((status) => (
                <label key={status.value} className="flex items-center">
                  <input
                    type="radio"
                    name="status"
                    value={status.value}
                    checked={selectedStatus === status.value}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="mr-3"
                  />
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    status.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                    status.color === 'orange' ? 'bg-orange-100 text-orange-800' :
                    status.color === 'purple' ? 'bg-purple-100 text-purple-800' :
                    status.color === 'green' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {status.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
              placeholder="Add any notes about this status change..."
            />
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedStatus}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Update Status
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Order Details Card Component
const OrderDetailsCard = ({ order, onStatusUpdate, onViewTracking, onPaymentVerification }) => {
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

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

  const getStatusIcon = (status) => {
    const icons = {
      pending: '⏳',
      confirmed: '✅',
      preparing: '👨‍🍳',
      ready: '🎒',
      delivered: '🎉',
      cancelled: '❌',
    };
    return icons[status] || '📋';
  };

  const getUrgencyLevel = () => {
    const orderTime = new Date(order.createdAt);
    const now = new Date();
    const diffInMinutes = Math.floor((now - orderTime) / (1000 * 60));
    
    if (order.status === 'pending' && diffInMinutes > 10) return 'high';
    if (order.status === 'confirmed' && diffInMinutes > 20) return 'high';
    if (order.status === 'preparing' && diffInMinutes > 30) return 'medium';
    return 'low';
  };

  const handleStatusUpdate = async (newStatus, notes) => {
    setIsUpdating(true);
    try {
      await onStatusUpdate(order._id, newStatus, notes);
    } finally {
      setIsUpdating(false);
    }
  };

  const urgency = getUrgencyLevel();
  const canUpdate = !['delivered', 'cancelled'].includes(order.status);

  return (
    <>
      <div className={`bg-white rounded-lg shadow-md border-l-4 p-6 ${
        urgency === 'high' ? 'border-red-500' : 
        urgency === 'medium' ? 'border-yellow-500' : 'border-green-500'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-semibold text-gray-900">
              Order #{order.orderNumber}
            </h3>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
              <span className="mr-2">{getStatusIcon(order.status)}</span>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </div>
            {urgency === 'high' && (
              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full animate-pulse">
                Urgent
              </span>
            )}
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-green-600">
              {formatCurrency((typeof order.total === 'number') ? order.total : (Number(order.totalAmount || order.subtotal || 0) + Number(order.deliveryFee || 0) + Number(order.tax || 0) - (typeof order.discount === 'number' ? order.discount : Number(order?.discount?.amount || 0))))}
            </p>
            <p className="text-sm text-gray-500">
              {getRelativeTime(order.createdAt)}
            </p>
          </div>
        </div>

        {/* Customer Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Customer Details</h4>
            <div className="space-y-1">
              <p className="text-sm">
                <span className="font-medium">Name:</span> {order.student.name}
              </p>
              <p className="text-sm">
                <span className="font-medium">Phone:</span> 
                <a href={`tel:${order.student.phone}`} className="text-blue-600 hover:underline ml-1">
                  {order.student.phone}
                </a>
              </p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Order Info</h4>
            <div className="space-y-1">
              <p className="text-sm">
                <span className="font-medium">Items:</span> {order.totalItems} items
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Payment:</span>
                <PaymentStatusBadge 
                  paymentStatus={order.paymentStatus}
                  isVerified={!!order.paymentDetails?.verifiedAt}
                  size="sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="mb-4">
          <h4 className="font-semibold text-gray-900 mb-2">Items Ordered</h4>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="space-y-2">
              {order.items?.map((item, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span>
                    {item.menuItem?.name || item.name} × {item.quantity}
                  </span>
                  <span className="font-medium">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              )) || (
                <p className="text-sm text-gray-500">
                  {order.itemsCount} items - {formatCurrency(order.totalAmount)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Estimated Delivery Time */}
        {order.estimatedDeliveryTime && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <span className="font-medium">Estimated Delivery:</span> 
              {formatDateTime(order.estimatedDeliveryTime)}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          {canUpdate && (
            <button
              onClick={() => setShowStatusDialog(true)}
              disabled={isUpdating}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center"
            >
              {isUpdating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                <>
                  <span className="mr-2">🔄</span>
                  Update Status
                </>
              )}
            </button>
          )}

          {/* Payment Verification Button */}
          {order.paymentStatus === 'paid' && !order.paymentDetails?.verifiedAt && (
            <button
              onClick={() => onPaymentVerification(order)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
            >
              <span className="mr-2">✅</span>
              Verify Payment
            </button>
          )}
          
          <button
            onClick={() => onViewTracking(order._id)}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center"
          >
            <span className="mr-2">👁️</span>
            View Tracking
          </button>

          <a
            href={`tel:${order.student.phone}`}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            <span className="mr-2">📞</span>
            Call Customer
          </a>
        </div>
      </div>

      {/* Status Change Dialog */}
      <StatusChangeDialog
        isOpen={showStatusDialog}
        onClose={() => setShowStatusDialog(false)}
        order={order}
        onConfirm={handleStatusUpdate}
      />
    </>
  );
};

const RestaurantOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState(null);
  const audioRef = useRef(null);

  const statusOptions = [
    { value: 'all', label: 'All Orders', icon: '📋' },
    { value: 'pending', label: 'Pending', icon: '⏳' },
    { value: 'confirmed', label: 'Confirmed', icon: '✅' },
    { value: 'preparing', label: 'Preparing', icon: '👨‍🍳' },
    { value: 'ready', label: 'Ready', icon: '🎒' },
    { value: 'delivered', label: 'Delivered', icon: '🎉' }
  ];

  useEffect(() => {
    loadOrders();
    
    // Set up polling for real-time updates
    const interval = setInterval(() => {
      loadOrders(true); // Silent reload
    }, 15000); // Poll every 15 seconds
    
    return () => clearInterval(interval);
  }, [selectedStatus]);

  // Initialize audio for notifications
  useEffect(() => {
    audioRef.current = new Audio('/sounds/notification.mp3');
    audioRef.current.volume = 0.5;
  }, []);

  const loadOrders = async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      
      const params = {};
      if (selectedStatus !== 'all') params.status = selectedStatus;

      const response = await orderService.getRestaurantOrders(params);
      
      if (response.success) {
        const newOrders = response.data.orders;
        const newStats = response.data.stats;
        
        // Check for new orders (only if not initial load)
        if (orders.length > 0 && !silent) {
          const newOrdersReceived = newOrders.filter(newOrder => 
            !orders.find(existingOrder => existingOrder._id === newOrder._id) &&
            newOrder.status === 'pending'
          );
          
          if (newOrdersReceived.length > 0) {
            setNewOrdersCount(prev => prev + newOrdersReceived.length);
            playNotificationSound();
            toast.success(`${newOrdersReceived.length} new order${newOrdersReceived.length > 1 ? 's' : ''} received!`);
          }
        }
        
        setOrders(newOrders);
        setStats(newStats);
      } else {
        if (!silent) toast.error('Failed to load orders');
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      if (!silent) toast.error('Failed to load orders');
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  const playNotificationSound = () => {
    try {
      audioRef.current?.play().catch(e => console.log('Audio play failed:', e));
    } catch (error) {
      console.log('Audio notification failed:', error);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus, notes = '') => {
    try {
      const response = await orderService.updateOrderStatus(orderId, { status: newStatus, notes });
      
      if (response.success) {
        setOrders(prev => prev.map(order => 
          order._id === orderId 
            ? { ...order, status: newStatus, updatedAt: new Date().toISOString() }
            : order
        ));
        toast.success(`Order status updated to ${newStatus}`);
        
        // Clear new orders count if we're updating pending orders
        if (newStatus !== 'pending') {
          setNewOrdersCount(0);
        }
      } else {
        toast.error(response.message || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const handleViewTracking = (orderId) => {
    navigate(`/order-tracking/${orderId}`);
  };

  const handlePaymentVerification = (order) => {
    setSelectedOrderForPayment(order);
    setShowPaymentDialog(true);
  };

  const handleVerifyPayment = async (orderId, notes) => {
    try {
      const response = await orderService.verifyPayment(orderId, notes);
      
      if (response.success) {
        setOrders(prev => prev.map(order => 
          order._id === orderId 
            ? { 
                ...order, 
                paymentDetails: {
                  ...order.paymentDetails,
                  verifiedAt: new Date().toISOString(),
                  notes
                }
              }
            : order
        ));
        toast.success('Payment verified successfully!');
      } else {
        toast.error(response.message || 'Failed to verify payment');
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      toast.error('Failed to verify payment');
    }
  };

  const getFilteredOrders = () => {
    if (selectedStatus === 'all') return orders;
    return orders.filter(order => order.status === selectedStatus);
  };

  const filteredOrders = getFilteredOrders();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/restaurant')}
                className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-900">Restaurant Orders</h1>
                  {newOrdersCount > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                      {newOrdersCount} new
                    </span>
                  )}
                  <div className="flex items-center text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                    <span className="text-sm">Live updates</span>
                  </div>
                </div>
                <p className="text-gray-600 mt-1">
                  {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''} found
                </p>
              </div>
            </div>
            
            <button
              onClick={() => loadOrders()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {statusOptions.map((status) => {
            const count = status.value === 'all' ? orders.length : (stats[status.value] || 0);
            return (
              <button
                key={status.value}
                onClick={() => {
                  setSelectedStatus(status.value);
                  if (status.value === 'pending') setNewOrdersCount(0);
                }}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedStatus === status.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-2">{status.icon}</div>
                <div className="text-2xl font-bold text-gray-900">{count}</div>
                <div className="text-sm text-gray-600">{status.label}</div>
              </button>
            );
          })}
        </div>

        {/* Orders List */}
        {filteredOrders.length > 0 ? (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <OrderDetailsCard
                key={order._id}
                order={order}
                onStatusUpdate={handleStatusUpdate}
                onViewTracking={handleViewTracking}
                onPaymentVerification={handlePaymentVerification}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600">
              {selectedStatus === 'all' 
                ? "No orders received yet. Orders will appear here when customers place them."
                : `No orders found with status "${selectedStatus}".`
              }
            </p>
          </div>
        )}
      </div>

      {/* Payment Verification Dialog */}
      {selectedOrderForPayment && (
        <PaymentVerificationDialog
          isOpen={showPaymentDialog}
          onClose={() => {
            setShowPaymentDialog(false);
            setSelectedOrderForPayment(null);
          }}
          order={selectedOrderForPayment}
          onVerify={handleVerifyPayment}
        />
      )}
    </div>
  );
};

export default RestaurantOrders;