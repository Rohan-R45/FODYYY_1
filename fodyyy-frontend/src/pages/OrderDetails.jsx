 import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import orderService from '../services/orderService';
import { formatCurrency, formatDateTime, getRelativeTime } from '../utils/helpers';
import { computeSubtotal, computeTotal, getItemPrice, getItemQty } from '../utils/orderTotals';
import { validateOrderId, isValidId } from '../utils/validation';
import { useSafeNavigation } from '../utils/navigation';
import { OrderRouteGuard } from '../components/RouteGuard';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const OrderDetailsContent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const safeNav = useSafeNavigation(navigate);
  const { user, isStudent, isRestaurantOwner } = useAuth();
  
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (id) {
      loadOrderDetails();
    }
  }, [id]);

  const loadOrderDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Validate order ID first
      const validation = validateOrderId(id);
      if (!validation.isValid) {
        setError(validation.error);
        toast.error(validation.error);
        setTimeout(() => {
          if (isStudent()) {
            navigate('/orders', { replace: true });
          } else if (isRestaurantOwner()) {
            navigate('/restaurant/orders', { replace: true });
          } else {
            navigate('/', { replace: true });
          }
        }, 2000);
        return;
      }

      const response = await orderService.getOrder(id);
      if (response.success && response.data) {
        setOrder(response.data);
      } else {
        setError('Order not found');
        toast.error('Order not found');
        setTimeout(() => {
          if (isStudent()) {
            navigate('/orders', { replace: true });
          } else if (isRestaurantOwner()) {
            navigate('/restaurant/orders', { replace: true });
          } else {
            navigate('/', { replace: true });
          }
        }, 2000);
      }
    } catch (error) {
      console.error('Error loading order details:', error);
      setError('Failed to load order details');
      toast.error('Failed to load order details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!order || !isValidId(order._id)) {
      toast.error('Invalid order');
      return;
    }

    try {
      setIsUpdating(true);
      const response = await orderService.updateOrderStatus(order._id, newStatus);
      if (response.success) {
        toast.success(`Order status updated to ${newStatus}`);
        loadOrderDetails(); // Reload to get updated data
      } else {
        toast.error(response.message || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order || !isValidId(order._id)) {
      toast.error('Invalid order');
      return;
    }

    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      setIsUpdating(true);
      const response = await orderService.cancelOrder(order._id);
      if (response.success) {
        toast.success('Order cancelled successfully');
        loadOrderDetails();
      } else {
        toast.error(response.message || 'Failed to cancel order');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error('Failed to cancel order');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
      preparing: 'bg-orange-100 text-orange-800 border-orange-200',
      ready: 'bg-green-100 text-green-800 border-green-200',
      delivered: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      pending: 'confirmed',
      confirmed: 'preparing',
      preparing: 'ready',
      ready: 'delivered'
    };
    return statusFlow[currentStatus];
  };

  const canUpdateStatus = (status) => {
    if (!isRestaurantOwner()) return false;
    return ['pending', 'confirmed', 'preparing', 'ready'].includes(status);
  };

  const canCancelOrder = (status) => {
    return ['pending', 'confirmed'].includes(status);
  };

  const handleBackNavigation = () => {
    if (isStudent()) {
      navigate('/orders');
    } else if (isRestaurantOwner()) {
      navigate('/restaurant/orders');
    } else {
      navigate('/');
    }
  };

  const handleRestaurantNavigation = () => {
    if (order?.restaurant?._id && isValidId(order.restaurant._id)) {
      safeNav.toRestaurant(order.restaurant._id);
    } else {
      toast.error('Restaurant information not available');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={handleBackNavigation}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {isStudent() ? 'View Orders' : isRestaurantOwner() ? 'View Restaurant Orders' : 'Go Home'}
          </button>
        </div>
      </div>
    );
  }

  // No order data
  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.5-.816-6.207-2.175.193-.39.398-.774.618-1.15A8.962 8.962 0 0112 13.5c2.34 0 4.5-.816 6.207-2.175-.193-.39-.398-.774-.618-1.15A7.962 7.962 0 0112 12z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Order Not Available</h2>
          <p className="text-gray-600 mb-6">This order is not available or has been removed.</p>
          <button 
            onClick={handleBackNavigation}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {isStudent() ? 'View Orders' : isRestaurantOwner() ? 'View Restaurant Orders' : 'Go Home'}
          </button>
        </div>
      </div>
    );
  }

  // Compute robust totals using shared utils
  const computedSubtotal = typeof order?.subtotal === 'number' ? order.subtotal : computeSubtotal(order?.items);
  const deliveryFeeNum = Number(order?.deliveryFee || 0);
  const taxNum = Number(order?.tax || 0);
  const discountNum = typeof order?.discount === 'number' ? order.discount : Number(order?.discountDetails?.amount || order?.discount?.amount || 0);
  const computedTotal = Math.max(0, computedSubtotal + deliveryFeeNum + taxNum - discountNum);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <button onClick={handleBackNavigation} className="mr-3 p-2 hover:bg-gray-100 rounded-full">
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Order Details</h1>
              <p className="text-gray-600 text-sm">Order #{order._id?.slice(-8) || 'Unknown'}</p>
            </div>
          </div>
          <span className={`inline-flex items-center px-2.5 h-8 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
            {order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Unknown'}
          </span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Timeline */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Timeline</h2>
              <div className="space-y-4">
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-gray-400 rounded-full mr-3"></div>
                  <span className="text-gray-600">Order placed</span>
                  <span className="ml-auto text-gray-500">{formatDateTime(order.createdAt)}</span>
                </div>
                
                {order.confirmedAt && (
                  <div className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    <span className="text-gray-600">Order confirmed</span>
                    <span className="ml-auto text-gray-500">{formatDateTime(order.confirmedAt)}</span>
                  </div>
                )}
                
                {order.preparingAt && (
                  <div className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                    <span className="text-gray-600">Preparation started</span>
                    <span className="ml-auto text-gray-500">{formatDateTime(order.preparingAt)}</span>
                  </div>
                )}
                
                {order.readyAt && (
                  <div className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-gray-600">Order ready</span>
                    <span className="ml-auto text-gray-500">{formatDateTime(order.readyAt)}</span>
                  </div>
                )}
                
                {order.deliveredAt && (
                  <div className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-green-600 rounded-full mr-3"></div>
                    <span className="text-gray-600">Order delivered</span>
                    <span className="ml-auto text-gray-500">{formatDateTime(order.deliveredAt)}</span>
                  </div>
                )}
                
                {order.cancelledAt && (
                  <div className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                    <span className="text-gray-600">Order cancelled</span>
                    <span className="ml-auto text-gray-500">{formatDateTime(order.cancelledAt)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Restaurant Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Restaurant</h2>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0">
                  {order.restaurant?.image ? (
                    <img
                      src={order.restaurant.image}
                      alt={order.restaurant.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0h2M7 7h10M7 11h10M7 15h10" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{order.restaurant?.name || 'Unknown Restaurant'}</h3>
                  <p className="text-sm text-gray-600 mb-2">{order.restaurant?.address}</p>
                  <p className="text-sm text-gray-600 mb-3">{order.restaurant?.phone}</p>
                  
                  {isStudent() && order.restaurant?._id && isValidId(order.restaurant._id) && (
                    <button
                      onClick={handleRestaurantNavigation}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View Restaurant →
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
              <div className="space-y-4">
                {order.items?.map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0">
                        {(item?.menuItem?.image || item?.menuItemId?.image) ? (
                          <img
                            src={item?.menuItem?.image || item?.menuItemId?.image}
                            alt={getItemName(item)}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{getItemName(item)}</h4>
                        <p className="text-sm text-gray-600">Quantity: {getItemQty(item)}</p>
                        {item.specialInstructions && (
                          <p className="text-xs text-gray-500 mt-1">Note: {item.specialInstructions}</p>
                        )}
                      </div>
                    </div>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(getItemPrice(item) * getItemQty(item))}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Item Total</span>
                  <span className="text-gray-900">{formatCurrency((typeof order?.itemTotal === 'number' && order.itemTotal > 0) ? order.itemTotal : (typeof order?.subtotal === 'number' ? order.subtotal : computeSubtotal(order?.items || [])))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery Charge</span>
                  <span className="text-gray-900">{formatCurrency(typeof order?.deliveryCharge === 'number' ? order.deliveryCharge : deliveryFeeNum)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Packing Charge</span>
                  <span className="text-gray-900">{formatCurrency(order?.packingCharge || 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Platform Fee</span>
                  <span className="text-gray-900">{formatCurrency(order?.platformFee || 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">GST ({order?.gstPercentage || 5}%)</span>
                  <span className="text-gray-900">{formatCurrency(typeof order?.gstAmount === 'number' ? order.gstAmount : taxNum)}</span>
                </div>
                {discountNum > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Discount</span>
                    <span className="text-green-600">-{formatCurrency(discountNum)}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(typeof order?.totalAmount === 'number' ? order.totalAmount : computedTotal)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Information (for restaurant owners) */}
            {isRestaurantOwner() && order.customer && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h2>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Name</span>
                    <span className="text-gray-900">{order.customer.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Phone</span>
                    <span className="text-gray-900">{order.customer.phone}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Email</span>
                    <span className="text-gray-900">{order.customer.email}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Delivery Information */}
            {order.deliveryAddress && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Delivery Address</h2>
                <p className="text-gray-600">{order.deliveryAddress}</p>
                {order.deliveryInstructions && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Delivery Instructions:</strong> {order.deliveryInstructions}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Payment Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment</h2>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Method</span>
                  <span className="text-gray-900">{order.paymentMethod || 'Cash on Delivery'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Status</span>
                  <span className={`font-medium ${
                    order.paymentStatus === 'paid' ? 'text-green-600' : 
                    order.paymentStatus === 'failed' ? 'text-red-600' : 'text-yellow-600'
                  }`}>
                    {order.paymentStatus?.charAt(0).toUpperCase() + order.paymentStatus?.slice(1) || 'Pending'}
                  </span>
                </div>
                {order.transactionId && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Transaction ID</span>
                    <span className="text-gray-900 font-mono text-xs">{order.transactionId}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-white/95 backdrop-blur">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-600">Total</div>
            <div className="text-lg font-semibold text-gray-900">{formatCurrency(computedTotal)}</div>
          </div>
          <div className="flex items-center gap-2">
            {isStudent() && isValidId(order._id) && (
              <button onClick={() => navigate(`/orders/${order._id}/track`)} className="px-4 h-10 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-black">
                Track Order
              </button>
            )}

            {isRestaurantOwner() && canCancelOrder(order.status) && (
              <button onClick={handleCancelOrder} disabled={isUpdating} className="px-4 h-10 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50">
                Cancel
              </button>
            )}

            {isRestaurantOwner() && canUpdateStatus(order.status) && (
              <button onClick={() => handleStatusUpdate(getNextStatus(order.status))} disabled={isUpdating} className="px-4 h-10 rounded-lg bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700 disabled:opacity-50 flex items-center gap-2">
                {isUpdating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Updating
                  </>
                ) : (
                  <>Update to {getNextStatus(order.status)?.charAt(0).toUpperCase() + getNextStatus(order.status)?.slice(1)}</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

// Main component with route guard
const OrderDetails = () => {
  return (
    <OrderRouteGuard>
      <OrderDetailsContent />
    </OrderRouteGuard>
  );
};

export default OrderDetails;