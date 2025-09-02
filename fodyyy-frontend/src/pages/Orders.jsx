import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency, formatDate } from '../utils/helpers';
import { computeSubtotal, computeTotal, getItemPrice, getItemQty } from '../utils/orderTotals';
import { createSafeLinkProps } from '../utils/navigation';
import { isValidId } from '../utils/validation';
import orderService from '../services/orderService';
import toast from 'react-hot-toast';
import { PageLoading } from '../components/LoadingSpinner';

// Zomato-style mobile-first Orders page for students
const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [error, setError] = useState('');

  const statusOptions = [
    { value: 'all', label: 'All Orders', count: 0 },
    { value: 'pending', label: 'Pending', count: 0 },
    { value: 'confirmed', label: 'Confirmed', count: 0 },
    { value: 'preparing', label: 'Preparing', count: 0 },
    { value: 'ready', label: 'Ready', count: 0 },
    { value: 'delivered', label: 'Delivered', count: 0 },
    { value: 'cancelled', label: 'Cancelled', count: 0 }
  ];

  const dateRangeOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' }
  ];

  useEffect(() => {
    loadOrders();
  }, [selectedStatus, dateRange]);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      setError('');
      const params = {};
      if (selectedStatus !== 'all') params.status = selectedStatus;
      if (dateRange !== 'all') params.dateRange = dateRange;
      const response = await orderService.getStudentOrders(params);
      if (response.success) {
        const payload = response.data;
        const array = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
            ? payload.data
            : Array.isArray(payload?.orders)
              ? payload.orders
              : [];
        setOrders(array);
        if (!array.length && selectedStatus !== 'all') {
          // no toast for empty filtered lists
        }
      } else {
        const msg = response.message || 'Failed to load orders';
        setError(msg);
        toast.error(msg);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      const msg = error?.response?.data?.message || 'Could not load orders. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReorder = async (order) => {
    try {
      const response = await orderService.reorder(order._id);
      if (response.success) {
        toast.success('Items added to cart!');
      } else {
        toast.error(response.message || 'Failed to reorder');
      }
    } catch (error) {
      console.error('Error reordering:', error);
      toast.error('Failed to reorder');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '⏳' },
      confirmed: { bg: 'bg-blue-100', text: 'text-blue-800', icon: '✅' },
      preparing: { bg: 'bg-orange-100', text: 'text-orange-800', icon: '👨‍🍳' },
      ready: { bg: 'bg-green-100', text: 'text-green-800', icon: '🎉' },
      delivered: { bg: 'bg-green-100', text: 'text-green-800', icon: '✅' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', icon: '❌' }
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <span className="mr-1">{config.icon}</span>
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </span>
    );
  };

  const filteredOrders = orders.filter((o) => (selectedStatus === 'all' ? true : o.status === selectedStatus));

  const statusCounts = statusOptions.map((option) => ({
    ...option,
    count: option.value === 'all' ? orders.length : orders.filter((order) => order.status === option.value).length,
  }));

  if (isLoading) return <PageLoading text="Loading your orders..." />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">My Orders</h1>
            <p className="text-gray-600 text-sm">{filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''} found</p>
          </div>
          <Link to="/restaurants" className="px-3 h-9 rounded-lg bg-orange-600 text-white text-sm font-medium flex items-center hover:bg-orange-700">
            Order Again
          </Link>
        </div>
        <div className="max-w-3xl mx-auto px-4 pb-3 overflow-x-auto no-scrollbar">
          <div className="flex gap-2">
            {statusCounts.map((status) => (
              <button
                key={status.value}
                onClick={() => setSelectedStatus(status.value)}
                className={`px-3 h-9 rounded-full text-sm whitespace-nowrap ${
                  selectedStatus === status.value ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'
                }`}
              >
                {status.label}
                {status.count > 0 && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${selectedStatus === status.value ? 'bg-white/20' : 'bg-gray-200'}`}>
                    {status.count}
                  </span>
                )}
              </button>
            ))}
            <div className="ml-auto">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="h-9 text-sm rounded-full bg-gray-100 px-3 text-gray-700"
              >
                {dateRangeOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        {error ? (
          <div className="bg-white rounded-xl shadow-sm border border-red-200 p-8 text-center">
            <h3 className="text-lg font-semibold text-red-700 mb-2">Couldn’t load your orders</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button onClick={loadOrders} className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
              Retry
            </button>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                isExpanded={expandedOrder === order._id}
                onToggleExpand={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                onReorder={() => handleReorder(order)}
                getStatusBadge={getStatusBadge}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600 mb-6">{selectedStatus === 'all' ? "You haven't placed any orders yet." : `No orders found with status "${selectedStatus}".`}</p>
            <Link to="/restaurants" className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
              Browse Restaurants
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

// Card component
const OrderCard = ({ order, isExpanded, onToggleExpand, onReorder, getStatusBadge }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-between gap-3 mb-1">
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">Order #{order.orderNumber}</h3>
            <p className="text-sm text-gray-600 truncate">{formatDate(order.createdAt)} • {order.restaurant?.name}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {getStatusBadge(order.status)}
            <span className="font-semibold text-gray-900">{formatCurrency(order.totalAmount)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>{order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}</span>
            <span>•</span>
            <span>{String(order.paymentMethod).toLowerCase().includes('upi') ? 'UPI' : 'Cash on Delivery'}</span>
          </div>
          <div className="flex items-center gap-2">
            {order.status === 'delivered' && (
              <button onClick={onReorder} className="text-sm text-rose-600 hover:text-rose-700 font-medium">Reorder</button>
            )}
            <button onClick={onToggleExpand} className="p-2 hover:bg-gray-100 rounded-full">
              <svg className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isValidId(order._id) ? (
              <Link {...createSafeLinkProps.order(order._id)} className="text-sm text-rose-600 hover:text-rose-700 font-medium">
                View Details
              </Link>
            ) : (
              <span className="text-sm text-gray-400 font-medium cursor-not-allowed">Invalid Order</span>
            )}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-gray-100 p-4 bg-gray-50 animate-slide-down">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Items */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Order Items</h4>
              <div className="space-y-2">
                {order.items?.map((item, index) => {
                  const qty = getItemQty(item);
                  const price = getItemPrice(item);
                  return (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 bg-gray-200 rounded text-xs flex items-center justify-center">{qty}</span>
                        <span className="text-gray-900">{item.name || item?.menuItem?.name}</span>
                      </div>
                      <span className="text-gray-600">{formatCurrency(price * qty)}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Delivery info */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Delivery Information</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>{typeof order.deliveryAddress === 'string' ? order.deliveryAddress : (order.deliveryAddress?.street || '')}</p>
                {order.deliveryAddress && typeof order.deliveryAddress !== 'string' && order.deliveryAddress?.landmark && (
                  <p>Near {order.deliveryAddress.landmark}</p>
                )}
                {order.deliveryAddress && typeof order.deliveryAddress !== 'string' && (
                  <p>
                    {order.deliveryAddress?.city}{order.deliveryAddress?.pincode ? `, ${order.deliveryAddress.pincode}` : ''}
                  </p>
                )}
                <p className="mt-2">
                  <span className="font-medium">Phone:</span> {order.phone || order.phoneNumber}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;