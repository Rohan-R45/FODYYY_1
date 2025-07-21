import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency, formatDate } from '../utils/helpers';
import { createSafeLinkProps } from '../utils/navigation';
import { isValidId } from '../utils/validation';
import orderService from '../services/orderService';
import toast from 'react-hot-toast';
import { PageLoading } from '../components/LoadingSpinner';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [expandedOrder, setExpandedOrder] = useState(null);

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
      const params = {};
      
      if (selectedStatus !== 'all') {
        params.status = selectedStatus;
      }
      
      if (dateRange !== 'all') {
        params.dateRange = dateRange;
      }

      const response = await orderService.getStudentOrders(params);
      
      if (response.success) {
        setOrders(response.data.orders || response.data);
      } else {
        toast.error('Failed to load orders');
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReorder = async (order) => {
    try {
      const response = await orderService.reorder(order._id);
      
      if (response.success) {
        toast.success('Items added to cart!');
        // Optionally redirect to cart or restaurant page
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
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getFilteredOrders = () => {
    return orders.filter(order => {
      if (selectedStatus !== 'all' && order.status !== selectedStatus) {
        return false;
      }
      return true;
    });
  };

  const filteredOrders = getFilteredOrders();

  // Update status counts
  const statusCounts = statusOptions.map(option => ({
    ...option,
    count: option.value === 'all' ? orders.length : orders.filter(order => order.status === option.value).length
  }));

  if (isLoading) {
    return <PageLoading text="Loading your orders..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
              <p className="text-gray-600 mt-1">
                {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''} found
              </p>
            </div>
            
            <Link
              to="/restaurants"
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Order Again
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Status Filter */}
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Filter by Status</h3>
              <div className="flex flex-wrap gap-2">
                {statusCounts.map((status) => (
                  <button
                    key={status.value}
                    onClick={() => setSelectedStatus(status.value)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedStatus === status.value
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status.label}
                    {status.count > 0 && (
                      <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                        selectedStatus === status.value
                          ? 'bg-white bg-opacity-20'
                          : 'bg-gray-200'
                      }`}>
                        {status.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Range Filter */}
            <div className="lg:w-48">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Date Range</h3>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="input w-full"
              >
                {dateRangeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length > 0 ? (
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
            <p className="text-gray-600 mb-6">
              {selectedStatus === 'all' 
                ? "You haven't placed any orders yet."
                : `No orders found with status "${selectedStatus}".`
              }
            </p>
            <Link
              to="/restaurants"
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Browse Restaurants
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

// Order Card Component
const OrderCard = ({ order, isExpanded, onToggleExpand, onReorder, getStatusBadge }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      {/* Order Header */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div>
              <h3 className="font-semibold text-gray-900">
                Order #{order.orderNumber}
              </h3>
              <p className="text-sm text-gray-600">
                {formatDate(order.createdAt)} • {order.restaurant?.name}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {getStatusBadge(order.status)}
            <span className="font-semibold text-gray-900">
              {formatCurrency(order.totalAmount)}
            </span>
          </div>
        </div>

        {/* Quick Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>{order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}</span>
            <span>•</span>
            <span>{order.paymentMethod === 'upi' ? 'UPI' : 'Cash on Delivery'}</span>
          </div>
          
          <div className="flex items-center gap-2">
            {order.status === 'delivered' && (
              <button
                onClick={onReorder}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Reorder
              </button>
            )}
            
            <button
              onClick={onToggleExpand}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg 
                className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {isValidId(order._id) ? (
              <Link
                {...createSafeLinkProps.order(order._id)}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                View Details
              </Link>
            ) : (
              <span className="text-sm text-gray-400 font-medium cursor-not-allowed">
                Invalid Order
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-gray-100 p-6 bg-gray-50 animate-slide-down">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Order Items */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Order Items</h4>
              <div className="space-y-2">
                {order.items?.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 bg-gray-200 rounded text-xs flex items-center justify-center">
                        {item.quantity}
                      </span>
                      <span className="text-gray-900">{item.name}</span>
                    </div>
                    <span className="text-gray-600">{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Info */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Delivery Information</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>{order.deliveryAddress?.street}</p>
                {order.deliveryAddress?.landmark && (
                  <p>Near {order.deliveryAddress.landmark}</p>
                )}
                <p>{order.deliveryAddress?.city}, {order.deliveryAddress?.pincode}</p>
                <p className="mt-2">
                  <span className="font-medium">Phone:</span> {order.phoneNumber}
                </p>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center text-sm">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="text-gray-900">{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Fee:</span>
                  <span className="text-gray-900">
                    {order.deliveryFee === 0 ? 'Free' : formatCurrency(order.deliveryFee)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax:</span>
                  <span className="text-gray-900">{formatCurrency(order.tax)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;