import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatCurrency, formatDateTime, getRelativeTime } from '../utils/helpers';
import orderService from '../services/orderService';
import PaymentStatusBadge from '../components/PaymentStatusBadge';
import toast from 'react-hot-toast';
import { playOrderNotificationSound, initializeAudio } from '../utils/notificationSound';

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
                <span className="font-bold text-green-600">{formatCurrency(order.totalAmount ?? order.total ?? 0)}</span>
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
        { value: 'delivered', label: 'Mark as Delivered', color: 'green' },
        { value: 'cancelled', label: 'Cancel Order', color: 'red' }
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

  const formatAddress = (student, deliveryAddress) => {
    if (deliveryAddress && typeof deliveryAddress === 'string' && deliveryAddress.trim()) {
      return deliveryAddress;
    }
    if (!student) return 'No delivery address provided';
    if (student.address?.hostel && student.address?.room) {
      return `${student.address.hostel}, Room ${student.address.room}`;
    }
    if (student.address?.hostel) {
      return student.address.hostel;
    }
    return student.address?.fullAddress || student.address?.line1 || 'No delivery address provided';
  };

  const getUrgencyLevel = () => {
    const orderTime = new Date(order.createdAt);
    const now = new Date();
    const diffInMinutes = Math.floor((now - orderTime) / (1000 * 60));
    
    if (order.status === 'pending' && diffInMinutes > 5) return 'high';
    if (order.status === 'confirmed' && diffInMinutes > 15) return 'high';
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
      <div className={`bg-white rounded-xl shadow-md border-l-4 p-5 sm:p-6 space-y-5 ${
        urgency === 'high' ? 'border-red-500' : 
        urgency === 'medium' ? 'border-yellow-500' : 'border-green-500'
      }`}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 whitespace-nowrap">
              Order #{order.orderNumber}
            </h3>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium border ${getStatusColor(order.status)}`}>
              <span className="mr-1 sm:mr-2">{getStatusIcon(order.status)}</span>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </div>
            {urgency === 'high' && (
              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full animate-pulse">
                Urgent
              </span>
            )}
          </div>
          <div className="text-left sm:text-right">
            <p className="text-lg sm:text-xl font-bold text-green-600">
              {formatCurrency(order.totalAmount ?? order.total ?? 0)}
            </p>
            <p className="text-sm text-gray-500">
              {getRelativeTime(order.createdAt)}
            </p>
          </div>
        </div>

        {/* Customer Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Customer Details</h4>
            <div className="space-y-1 text-sm text-gray-700">
              <p className="flex flex-wrap gap-1">
                <span className="font-medium">Name:</span>
                <span>{order.student?.name || order.customer?.name}</span>
              </p>
              {(order.student?.phone || order.customer?.phone) && (
                <p className="flex flex-wrap gap-1 items-center">
                  <span className="font-medium">Phone:</span>
                  <a
                    href={`tel:${order.student?.phone || order.customer?.phone}`}
                    className="text-blue-600 hover:underline"
                  >
                    {order.student?.phone || order.customer?.phone}
                  </a>
                </p>
              )}
              <p className="flex flex-col gap-1">
                <span className="font-medium">Delivery:</span>
                <span className="text-gray-600 text-sm leading-snug">
                  {formatAddress(order.student || order.customer, order.deliveryAddress)}
                </span>
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Order Info</h4>
            <div className="space-y-2 text-sm text-gray-700">
              <p>
                <span className="font-medium">Items:</span> {order.totalItems} item{order.totalItems !== 1 ? 's' : ''}
              </p>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium">Payment:</span>
                <PaymentStatusBadge 
                  paymentStatus={order.paymentStatus}
                  isVerified={!!order.paymentDetails?.verifiedAt}
                  size="sm"
                />
              </div>
              {order.scheduledFor && (
                <p className="flex flex-wrap gap-1">
                  <span className="font-medium">Scheduled:</span>
                  <span>{formatDateTime(order.scheduledFor)}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900">Items Ordered</h4>
          <div className="bg-gray-50 rounded-lg p-3 space-y-3">
            <div className="space-y-2">
              {order.items?.map((item, index) => (
                <div key={index} className="flex flex-wrap items-start justify-between gap-2 text-sm">
                  <div className="flex-1 min-w-[160px]">
                    <p className="font-medium text-gray-900">{item.menuItem?.name || item.name}</p>
                    <p className="text-gray-600 text-xs">
                      {item.quantity} × {formatCurrency(item.price)}
                    </p>
                    {item.customization && (
                      <p className="text-xs text-gray-500 mt-1 space-y-0.5">
                        {item.customization.size && (
                          <span>Size: {item.customization.size}</span>
                        )}
                        {item.customization.addons?.length && (
                          <span>
                            Add-ons: {item.customization.addons.map(a => a.name).join(', ')}
                          </span>
                        )}
                        {item.customization.instructions && (
                          <span>Notes: {item.customization.instructions}</span>
                        )}
                      </p>
                    )}
                  </div>
                  <span className="font-semibold text-gray-900 whitespace-nowrap">
                    {formatCurrency((item.price || 0) * (item.quantity || 1))}
                  </span>
                </div>
              ))}
              {!order.items?.length && (
                <p className="text-sm text-gray-500">
                  {order.itemsCount} items - {formatCurrency(order.totalAmount || 0)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Estimated Delivery Time */}
        {(order.estimatedDeliveryTime || order.estimatedDeliveryWindow) && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800 flex flex-col sm:flex-row sm:items-center sm:gap-1">
              <span className="font-medium">Estimated Delivery:</span>
              <span>
                {order.estimatedDeliveryWindow
                  ? `${formatDateTime(order.estimatedDeliveryWindow.start)} - ${formatDateTime(order.estimatedDeliveryWindow.end)}`
                  : formatDateTime(order.estimatedDeliveryTime)}
              </span>
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
            href={`tel:${order.student?.phone || order.customer?.phone || ''}`}
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
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0,
    hasNext: false,
    hasPrev: false
  });
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [soundVolume, setSoundVolume] = useState(0.5);
  const previousOrdersRef = useRef([]);
  const audioRef = useRef(null);

  const statusOptions = [
    { value: 'all', label: 'All Orders', icon: '📋' },
    { value: 'today', label: "Today's Orders", icon: '📅' },
    { value: 'confirmed', label: 'Confirmed', icon: '✅' },
    { value: 'delivered', label: 'Delivered', icon: '🎉' }
  ];

  useEffect(() => {
    loadOrders(false, 1); // Reset to page 1 when status changes

    // Set up polling for real-time updates every 2 minutes, but only when page is visible
    const interval = setInterval(() => {
      // Only poll if the page is visible (user is actively viewing it)
      if (!document.hidden) {
        loadOrders(true, pagination.currentPage); // Silent reload on current page
      }
    }, 120000);

    // Also poll immediately when page becomes visible again
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadOrders(true, pagination.currentPage);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [selectedStatus]);

  // Initialize audio for notifications
  useEffect(() => {
    audioRef.current = new Audio('/sounds/notification.mp3');
    audioRef.current.volume = 0.5;
  }, []);

  // Initialize audio context on first user interaction
  useEffect(() => {
    const handleFirstClick = () => {
      initializeAudio();
      document.removeEventListener('click', handleFirstClick);
    };
    document.addEventListener('click', handleFirstClick);

    return () => document.removeEventListener('click', handleFirstClick);
  }, []);

  // Load notification preferences from localStorage
  useEffect(() => {
    const savedEnabled = localStorage.getItem('notificationEnabled');
    const savedVolume = localStorage.getItem('notificationVolume');

    if (savedEnabled !== null) {
      setNotificationEnabled(savedEnabled === 'true');
    }
    if (savedVolume !== null) {
      setSoundVolume(parseFloat(savedVolume));
    }
  }, []);

  // Save preferences when changed
  useEffect(() => {
    localStorage.setItem('notificationEnabled', notificationEnabled);
    localStorage.setItem('notificationVolume', soundVolume);
  }, [notificationEnabled, soundVolume]);

  // Request browser notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('Notification permission:', permission);
      });
    }
  }, []);

  const loadOrders = async (silent = false, page = 1) => {
    try {
      if (!silent) setIsLoading(true);

      const params = { page };

      // Add today's date filter
      if (selectedStatus === 'today') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        params.startDate = today.toISOString();
        params.endDate = tomorrow.toISOString();
      } else if (selectedStatus !== 'all') {
        params.status = selectedStatus;
      }

      const response = await orderService.getRestaurantOrders(params);

      if (response.success) {
        const newOrders = response.data.orders;
        const newStats = response.data.stats;
        const newPagination = response.data.pagination;

        // ✅ DETECT NEW ORDERS AND PLAY SOUND
        if (previousOrdersRef.current.length > 0 && !silent && notificationEnabled) {
          const newOrdersReceived = newOrders.filter(newOrder =>
            !previousOrdersRef.current.find(
              existingOrder => existingOrder._id === newOrder._id
            ) && newOrder.status === 'pending'
          );

          if (newOrdersReceived.length > 0) {
            console.log(`🆕 ${newOrdersReceived.length} new order(s) detected!`);

            // ✅ PLAY NOTIFICATION SOUND
            playOrderNotificationSound();

            // ✅ VIBRATE ON MOBILE
            if ('vibrate' in navigator) {
              navigator.vibrate([200, 100, 200]);
            }

            // ✅ BROWSER NOTIFICATION
            if ('Notification' in window && Notification.permission === 'granted') {
              const totalAmount = newOrdersReceived.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
              new Notification('🍔 New Order Received!', {
                body: `${newOrdersReceived.length} new order${newOrdersReceived.length > 1 ? 's' : ''} • ${formatCurrency(totalAmount)}`,
                icon: '/logo.png',
                badge: '/badge.png',
                tag: 'new-order',
                requireInteraction: true
              });
            }

            setNewOrdersCount(prev => prev + newOrdersReceived.length);
            toast.success(
              `🔔 ${newOrdersReceived.length} new order${newOrdersReceived.length > 1 ? 's' : ''} received!`,
              { duration: 5000, icon: '🔔' }
            );
          }
        }

        // Update reference for next comparison
        previousOrdersRef.current = newOrders;

        setOrders(newOrders);
        setStats(newStats);
        setPagination(newPagination);
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

  const handlePageChange = (newPage) => {
    loadOrders(false, newPage);
  };

  const handlePrevPage = () => {
    if (pagination.hasPrev) {
      handlePageChange(pagination.currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (pagination.hasNext) {
      handlePageChange(pagination.currentPage + 1);
    }
  };

  const getFilteredOrders = () => {
    if (selectedStatus === 'today') {
      // Filter orders from today
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        orderDate.setHours(0, 0, 0, 0);
        return orderDate.getTime() === today.getTime();
      });
    }

    if (selectedStatus === 'all') return orders;
    return orders.filter(order => order.status === selectedStatus);
  };

  // Calculate today's stats
  const getTodayStats = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      orderDate.setHours(0, 0, 0, 0);
      return orderDate.getTime() === today.getTime();
    });

    const todayRevenue = todayOrders
      .filter(order => order.status === 'delivered')
      .reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    const pendingToday = todayOrders.filter(o => o.status === 'pending').length;
    const completedToday = todayOrders.filter(o => o.status === 'delivered').length;

    return {
      totalOrders: todayOrders.length,
      revenue: todayRevenue,
      pending: pendingToday,
      completed: completedToday,
      avgOrderValue: todayOrders.length > 0 ? todayRevenue / todayOrders.length : 0
    };
  };

  const groupOrdersByTime = (orders) => {
    const morning = []; // 6 AM - 12 PM
    const afternoon = []; // 12 PM - 5 PM
    const evening = []; // 5 PM - 9 PM
    const night = []; // 9 PM - 6 AM

    orders.forEach(order => {
      const hour = new Date(order.createdAt).getHours();

      if (hour >= 6 && hour < 12) morning.push(order);
      else if (hour >= 12 && hour < 17) afternoon.push(order);
      else if (hour >= 17 && hour < 21) evening.push(order);
      else night.push(order);
    });

    return { morning, afternoon, evening, night };
  };

  // eslint-disable-next-line no-unused-vars
  const getYesterdayComparison = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      orderDate.setHours(0, 0, 0, 0);
      return orderDate.getTime() === today.getTime();
    });

    const yesterdayOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      orderDate.setHours(0, 0, 0, 0);
      return orderDate.getTime() === yesterday.getTime();
    });

    const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const yesterdayRevenue = yesterdayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    const ordersDiff = todayOrders.length - yesterdayOrders.length;
    const revenueDiff = todayRevenue - yesterdayRevenue;

    return {
      ordersDiff,
      revenueDiff,
      ordersPercentage: yesterdayOrders.length > 0
        ? ((ordersDiff / yesterdayOrders.length) * 100).toFixed(1)
        : 0,
      revenuePercentage: yesterdayRevenue > 0
        ? ((revenueDiff / yesterdayRevenue) * 100).toFixed(1)
        : 0
    };
  };

  const filteredOrders = getFilteredOrders();
  const todayStats = getTodayStats();

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

  const NotificationSettingsPanel = () => (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-md p-4 mb-6 border-2 border-blue-200">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-2xl">🔔</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Order Notifications</h3>
            <p className="text-sm text-gray-600">
              {notificationEnabled ? 'Sound alerts enabled' : 'Sound alerts disabled'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Test Sound Button */}
          <button
            onClick={() => {
              playOrderNotificationSound();
              if ('vibrate' in navigator) {
                navigator.vibrate([200, 100, 200]);
              }
              toast.success('🔔 Test notification played!', { duration: 2000 });
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium flex items-center gap-2"
          >
            <span>🔊</span>
            Test Sound
          </button>

          {/* Enable/Disable Toggle */}
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={notificationEnabled}
              onChange={(e) => setNotificationEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-7 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
            <span className="ml-3 text-sm font-medium text-gray-900">
              {notificationEnabled ? 'ON' : 'OFF'}
            </span>
          </label>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start sm:items-center gap-3">
              <button
                onClick={() => navigate('/restaurant')}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Back to dashboard"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Restaurant Orders</h1>
                  {newOrdersCount > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                      {newOrdersCount} new
                    </span>
                  )}
                  <div className="flex items-center text-green-600 text-xs sm:text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1 sm:mr-2"></div>
                    <span>Live updates</span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm sm:text-base mt-1">
                  Showing {((pagination.currentPage - 1) * 100) + 1}-{Math.min(pagination.currentPage * 100, pagination.totalOrders)} of {pagination.totalOrders} orders
                </p>
              </div>
            </div>
            
            <button
              onClick={() => loadOrders(false, pagination.currentPage)}
              className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="text-sm font-semibold">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* ✅ ADD NOTIFICATION SETTINGS PANEL HERE */}
        <NotificationSettingsPanel />

        {/* Today's Overview Card */}
        <div className="bg-gradient-to-r from-orange-500 to-yellow-400 rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <span>📅</span>
                Today's Orders
              </h2>
              <p className="text-white/90 text-sm mt-1">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <button
              onClick={() => setSelectedStatus('today')}
              className="bg-white text-orange-600 px-4 py-2 rounded-lg font-semibold hover:bg-orange-50 transition-colors"
            >
              View All Today's Orders →
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
              <div className="text-white/80 text-sm mb-1">Total Orders</div>
              <div className="text-3xl font-bold text-white">{todayStats.totalOrders}</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
              <div className="text-white/80 text-sm mb-1">Revenue</div>
              <div className="text-3xl font-bold text-white">
                {formatCurrency(todayStats.revenue)}
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
              <div className="text-white/80 text-sm mb-1">Pending</div>
              <div className="text-3xl font-bold text-white">{todayStats.pending}</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
              <div className="text-white/80 text-sm mb-1">Completed</div>
              <div className="text-3xl font-bold text-white">{todayStats.completed}</div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-8">
          {statusOptions.map((status) => {
            let count = 0;

            if (status.value === 'all') {
              count = orders.length;
            } else if (status.value === 'today') {
              // Count today's orders
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              count = orders.filter(order => {
                const orderDate = new Date(order.createdAt);
                orderDate.setHours(0, 0, 0, 0);
                return orderDate.getTime() === today.getTime();
              }).length;
            } else {
              count = stats[status.value] || 0;
            }
            return (
              <button
                key={status.value}
                onClick={() => {
                  setSelectedStatus(status.value);
                  if (status.value === 'pending') setNewOrdersCount(0);
                }}
                className={`p-4 sm:p-5 rounded-xl border-2 transition-all text-left ${
                  selectedStatus === status.value
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl sm:text-3xl">{status.icon}</span>
                  {selectedStatus === status.value && (
                    <span className="text-xs font-semibold text-blue-600">Active</span>
                  )}
                </div>
                <div className="mt-3 text-2xl sm:text-3xl font-bold text-gray-900">{count}</div>
                <div className="text-sm text-gray-600 mt-1">{status.label}</div>
              </button>
            );
          })}
        </div>

        {/* Time-based grouping for today's orders */}
        {selectedStatus === 'today' && filteredOrders.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Orders by Time Period
            </h3>
            {(() => {
              const grouped = groupOrdersByTime(filteredOrders);
              return (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  <div className="bg-yellow-50 rounded-lg p-4 border-2 border-yellow-200">
                    <div className="text-sm text-yellow-800">🌅 Morning (6-12)</div>
                    <div className="text-2xl font-bold text-yellow-900">{grouped.morning.length}</div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4 border-2 border-orange-200">
                    <div className="text-sm text-orange-800">☀️ Afternoon (12-5)</div>
                    <div className="text-2xl font-bold text-orange-900">{grouped.afternoon.length}</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 border-2 border-purple-200">
                    <div className="text-sm text-purple-800">🌆 Evening (5-9)</div>
                    <div className="text-2xl font-bold text-purple-900">{grouped.evening.length}</div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
                    <div className="text-sm text-blue-800">🌙 Night (9-6)</div>
                    <div className="text-2xl font-bold text-blue-900">{grouped.night.length}</div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Orders List */}
        {filteredOrders.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6">
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

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={handlePrevPage}
              disabled={!pagination.hasPrev}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>

            <span className="text-sm text-gray-600">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>

            <button
              onClick={handleNextPage}
              disabled={!pagination.hasNext}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
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