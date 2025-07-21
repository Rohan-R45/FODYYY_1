import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import orderService from '../services/orderService';
import { formatCurrency, formatDateTime, getRelativeTime } from '../utils/helpers';
import toast from 'react-hot-toast';

const OrderTracking = () => {
  const { orderId } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [trackingHistory, setTrackingHistory] = useState([]);

  useEffect(() => {
    loadOrderDetails();
    
    // Set up polling for real-time updates
    const interval = setInterval(loadOrderDetails, 30000); // Poll every 30 seconds
    
    return () => clearInterval(interval);
  }, [orderId]);

  const loadOrderDetails = async () => {
    try {
      const response = await orderService.getOrder(orderId);
      
      if (response.success) {
        setOrder(response.data);
        setTrackingHistory(response.data.statusHistory || []);
      } else {
        toast.error('Order not found');
      }
    } catch (error) {
      console.error('Error loading order details:', error);
      toast.error('Failed to load order details');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
      preparing: 'bg-orange-100 text-orange-800 border-orange-200',
      ready: 'bg-purple-100 text-purple-800 border-purple-200',
      out_for_delivery: 'bg-indigo-100 text-indigo-800 border-indigo-200',
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
      ready: '📦',
      out_for_delivery: '🚚',
      delivered: '🎉',
      cancelled: '❌',
    };
    return icons[status] || '📋';
  };

  const formatOrderStatus = (status) => {
    const statusMap = {
      pending: 'Order Placed',
      confirmed: 'Order Confirmed',
      preparing: 'Being Prepared',
      ready: 'Ready for Pickup',
      out_for_delivery: 'Out for Delivery',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
    };
    return statusMap[status] || status;
  };

  const getStatusSteps = () => {
    const allSteps = [
      { key: 'pending', label: 'Order Placed', icon: '📝' },
      { key: 'confirmed', label: 'Confirmed', icon: '✅' },
      { key: 'preparing', label: 'Preparing', icon: '👨‍🍳' },
      { key: 'ready', label: 'Ready', icon: '📦' },
      { key: 'out_for_delivery', label: 'Out for Delivery', icon: '🚚' },
      { key: 'delivered', label: 'Delivered', icon: '🎉' }
    ];

    const currentStatusIndex = allSteps.findIndex(step => step.key === order?.status);
    
    return allSteps.map((step, index) => ({
      ...step,
      isCompleted: index <= currentStatusIndex,
      isCurrent: index === currentStatusIndex,
      isActive: order?.status !== 'cancelled' && index <= currentStatusIndex
    }));
  };

  const getEstimatedDeliveryTime = () => {
    if (!order) return null;
    
    const orderTime = new Date(order.createdAt);
    const estimatedMinutes = order.estimatedDeliveryTime || 45;
    const estimatedTime = new Date(orderTime.getTime() + estimatedMinutes * 60000);
    
    return estimatedTime;
  };

  const cancelOrder = async () => {
    if (!order || !['pending', 'confirmed'].includes(order.status)) {
      toast.error('Order cannot be cancelled at this stage');
      return;
    }

    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      const response = await orderService.cancelOrder(orderId);
      
      if (response.success) {
        toast.success('Order cancelled successfully');
        loadOrderDetails();
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
          <div className="loading w-12 h-12 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Order not found</h3>
          <p className="text-gray-600 mb-6">The order you're looking for doesn't exist.</p>
          <Link to="/orders" className="btn btn-primary">
            View All Orders
          </Link>
        </div>
      </div>
    );
  }

  const statusSteps = getStatusSteps();
  const estimatedDelivery = getEstimatedDeliveryTime();

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
            <Link
              to="/orders"
              className="btn btn-ghost"
            >
              ← All Orders
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Status */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Status Card */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">
                    Current Status
                  </h2>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                    <span className="mr-2">{getStatusIcon(order.status)}</span>
                    {formatOrderStatus(order.status)}
                  </div>
                </div>
                {order.status !== 'cancelled' && order.status !== 'delivered' && estimatedDelivery && (
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Estimated Delivery</p>
                    <p className="font-semibold text-gray-900">
                      {formatDateTime(estimatedDelivery, { timeOnly: true })}
                    </p>
                  </div>
                )}
              </div>

              {/* Status Progress */}
              {order.status !== 'cancelled' && (
                <div className="space-y-4">
                  {statusSteps.map((step, index) => (
                    <div key={step.key} className="flex items-center">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                        step.isActive 
                          ? 'bg-primary-blue text-white' 
                          : step.isCompleted 
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-500'
                      }`}>
                        {step.isCompleted ? '✓' : step.icon}
                      </div>
                      <div className="ml-4 flex-1">
                        <p className={`font-medium ${
                          step.isActive ? 'text-primary-blue' : step.isCompleted ? 'text-green-600' : 'text-gray-500'
                        }`}>
                          {step.label}
                        </p>
                        {step.isCurrent && (
                          <p className="text-sm text-gray-600">
                            {order.status === 'preparing' && 'Your food is being prepared with care'}
                            {order.status === 'ready' && 'Your order is ready for pickup/delivery'}
                            {order.status === 'out_for_delivery' && 'Your order is on the way'}
                          </p>
                        )}
                      </div>
                      {index < statusSteps.length - 1 && (
                        <div className={`absolute left-4 mt-8 w-0.5 h-6 ${
                          step.isCompleted ? 'bg-green-500' : 'bg-gray-200'
                        }`} style={{ marginLeft: '15px' }}></div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Cancel Order Button */}
              {['pending', 'confirmed'].includes(order.status) && (
                <div className="mt-6 pt-6 border-t">
                  <button
                    onClick={cancelOrder}
                    className="btn btn-outline-red"
                  >
                    Cancel Order
                  </button>
                </div>
              )}
            </div>

            {/* Order Timeline */}
            {trackingHistory.length > 0 && (
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Order Timeline
                </h3>
                <div className="space-y-4">
                  {trackingHistory.map((event, index) => (
                    <div key={index} className="flex items-start">
                      <div className="flex-shrink-0 w-2 h-2 bg-primary-blue rounded-full mt-2"></div>
                      <div className="ml-4">
                        <p className="font-medium text-gray-900">
                          {formatOrderStatus(event.status)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatDateTime(event.timestamp)}
                        </p>
                        {event.note && (
                          <p className="text-sm text-gray-500 mt-1">
                            {event.note}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Order Details Sidebar */}
          <div className="space-y-6">
            {/* Restaurant Info */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Restaurant Details
              </h3>
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-red-500 rounded-lg flex items-center justify-center text-white text-xl">
                  🏪
                </div>
                <div className="ml-3">
                  <h4 className="font-medium text-gray-900">
                    {order.restaurant.name}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {order.restaurant.cuisine?.join(', ')}
                  </p>
                </div>
              </div>
              {order.restaurant.phone && (
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {order.restaurant.phone}
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Order Summary
              </h3>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {item.menuItem.name}
                      </p>
                      <p className="text-gray-600">
                        {formatCurrency(item.price)} × {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium text-gray-900">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
              
              <div className="border-t mt-4 pt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">{formatCurrency(order.subtotal)}</span>
                </div>
                {order.deliveryFee > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span className="text-gray-900">{formatCurrency(order.deliveryFee)}</span>
                  </div>
                )}
                {order.tax > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Tax</span>
                    <span className="text-gray-900">{formatCurrency(order.tax)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between font-semibold text-gray-900 pt-2 border-t">
                  <span>Total</span>
                  <span>{formatCurrency(order.totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Delivery Info */}
            {order.deliveryAddress && (
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Delivery Address
                </h3>
                <div className="text-sm text-gray-600">
                  <p>{order.deliveryAddress.street}</p>
                  <p>{order.deliveryAddress.city}, {order.deliveryAddress.state}</p>
                  <p>{order.deliveryAddress.zipCode}</p>
                  {order.deliveryAddress.instructions && (
                    <p className="mt-2 text-gray-500">
                      <strong>Instructions:</strong> {order.deliveryAddress.instructions}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;