import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import orderService from '../services/orderService';
import { formatCurrency, formatDateTime, getRelativeTime } from '../utils/helpers';
import toast from 'react-hot-toast';

const MyOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, active, completed, cancelled
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, amount_high, amount_low

  useEffect(() => {
    loadOrders();
  }, [filter, sortBy]);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      
      const params = {
        sortBy: sortBy === 'newest' ? 'createdAt' : 
                sortBy === 'oldest' ? 'createdAt' :
                sortBy === 'amount_high' ? 'totalAmount' : 'totalAmount',
        sortOrder: sortBy === 'oldest' || sortBy === 'amount_low' ? 'asc' : 'desc',
        limit: 50
      };

      if (filter !== 'all') {
        if (filter === 'active') {
          params.status = 'pending,confirmed,preparing,ready,out_for_delivery';
        } else if (filter === 'completed') {
          params.status = 'delivered';
        } else if (filter === 'cancelled') {
          params.status = 'cancelled';
        }
      }

      const response = await orderService.getOrders(params);
      
      if (response.success) {
        setOrders(response.data);
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
      confirmed: 'Confirmed',
      preparing: 'Being Prepared',
      ready: 'Ready',
      out_for_delivery: 'Out for Delivery',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
    };
    return statusMap[status] || status;
  };

  const reorderItems = async (order) => {
    try {
      const response = await orderService.reorder(order._id);
      
      if (response.success) {
        toast.success('Items added to cart! Redirecting to checkout...');
        // Redirect to checkout or cart page
        window.location.href = '/checkout';
      } else {
        toast.error(response.message || 'Failed to reorder items');
      }
    } catch (error) {
      console.error('Error reordering:', error);
      toast.error('Failed to reorder items');
    }
  };

  const cancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      const response = await orderService.cancelOrder(orderId);
      
      if (response.success) {
        toast.success('Order cancelled successfully');
        loadOrders(); // Reload orders
      } else {
        toast.error(response.message || 'Failed to cancel order');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error('Failed to cancel order');
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    if (filter === 'active') return ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery'].includes(order.status);
    if (filter === 'completed') return order.status === 'delivered';
    if (filter === 'cancelled') return order.status === 'cancelled';
    return true;
  });

  const getOrderStats = () => {
    const stats = {
      total: orders.length,
      active: orders.filter(o => ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery'].includes(o.status)).length,
      completed: orders.filter(o => o.status === 'delivered').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length,
      totalSpent: orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + o.totalAmount, 0)
    };
    return stats;
  };

  const stats = getOrderStats();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading w-12 h-12 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">My Orders</h1>
            <p className="text-gray-600 text-sm">{filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''} found</p>
          </div>
          <Link to="/restaurants" className="px-3 h-9 rounded-lg bg-orange-500 text-white text-sm font-medium flex items-center hover:bg-orange-700">Order Again</Link>
        </div>
        <div className="max-w-3xl mx-auto px-4 pb-3 overflow-x-auto no-scrollbar">
          <div className="flex gap-2">
            {[
              { key: 'all', label: 'All Orders', count: stats.total },
              { key: 'active', label: 'Active', count: stats.active },
              { key: 'completed', label: 'Completed', count: stats.completed },
              { key: 'cancelled', label: 'Cancelled', count: stats.cancelled }
            ].map((tab) => (
              <button key={tab.key} onClick={() => setFilter(tab.key)} className={`px-3 h-9 rounded-full text-sm whitespace-nowrap ${filter === tab.key ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
                {tab.label}
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${filter === tab.key ? 'bg-white/20' : 'bg-gray-200'}`}>{tab.count}</span>
              </button>
            ))}
            <div className="ml-auto">
              <select className="h-9 text-sm rounded-full bg-gray-100 px-3 text-gray-700" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="amount_high">Amount: High to Low</option>
                <option value="amount_low">Amount: Low to High</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Orders</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.active}</div>
            <div className="text-sm text-gray-600">Active Orders</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
            <div className="text-sm text-gray-600">Cancelled</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-primary-blue">{formatCurrency(stats.totalSpent)}</div>
            <div className="text-sm text-gray-600">Total Spent</div>
          </div>
        </div>

        {/* Filters and Sort */}
        <div className="card p-6 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: 'All Orders', count: stats.total },
                { key: 'active', label: 'Active', count: stats.active },
                { key: 'completed', label: 'Completed', count: stats.completed },
                { key: 'cancelled', label: 'Cancelled', count: stats.cancelled }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === tab.key
                      ? 'bg-primary-blue text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <select
              className="input"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="amount_high">Amount: High to Low</option>
              <option value="amount_low">Amount: Low to High</option>
            </select>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order._id} className="card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {order.restaurant.name}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                        <span className="mr-1">{getStatusIcon(order.status)}</span>
                        {formatOrderStatus(order.status)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>Order #{order.orderNumber}</span>
                      <span>•</span>
                      <span>{formatDateTime(order.createdAt)}</span>
                      <span>•</span>
                      <span>{getRelativeTime(order.createdAt)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900 mb-1">
                      {formatCurrency((typeof order.total === 'number') ? order.total : (Number(order.subtotal || order.totalAmount || 0) + Number(order.deliveryFee || 0) + Number(order.tax || 0) - (typeof order.discount === 'number' ? order.discount : Number(order?.discount?.amount || 0))))}
                    </div>
                    <div className="text-sm text-gray-600">
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-4">
                  <div className="space-y-2">
                    {order.items.slice(0, 3).map((item, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <div className="flex-1">
                          <span className="text-gray-900">{item.menuItem.name}</span>
                          <span className="text-gray-600 ml-2">× {item.quantity}</span>
                        </div>
                        <span className="text-gray-900 font-medium">
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div className="text-sm text-gray-500">
                        +{order.items.length - 3} more item{order.items.length - 3 !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-3">
                    <Link
                      to={`/orders/${order._id}/track`}
                      className="btn btn-outline btn-sm"
                    >
                      Track Order
                    </Link>
                    
                    {order.status === 'delivered' && (
                      <button
                        onClick={() => reorderItems(order)}
                        className="btn btn-ghost btn-sm"
                      >
                        Reorder
                      </button>
                    )}
                    
                    {['pending', 'confirmed'].includes(order.status) && (
                      <button
                        onClick={() => cancelOrder(order._id)}
                        className="btn btn-outline-red btn-sm"
                      >
                        Cancel
                      </button>
                    )}
                  </div>

                  <Link
                    to={`/orders/${order._id}`}
                    className="text-sm text-primary-600 hover:text-primary-500 font-medium"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">
              {filter === 'all' ? '📋' : 
               filter === 'active' ? '⏳' :
               filter === 'completed' ? '✅' : '❌'}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {filter === 'all' ? 'No orders yet' :
               filter === 'active' ? 'No active orders' :
               filter === 'completed' ? 'No completed orders' :
               'No cancelled orders'}
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all' 
                ? "Start by browsing restaurants and placing your first order!"
                : `You don't have any ${filter} orders at the moment.`
              }
            </p>
            {filter === 'all' && (
              <Link
                to="/restaurants"
                className="btn btn-primary"
              >
                Browse Restaurants
              </Link>
            )}
            {filter !== 'all' && (
              <button
                onClick={() => setFilter('all')}
                className="btn btn-ghost"
              >
                View All Orders
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;