import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Package, 
  Truck, 
  ChefHat,
  MapPin,
  ArrowRight,
  RotateCcw,
  Eye,
  X as XIcon,
  TrendingUp,
  Calendar,
  DollarSign
} from 'lucide-react';
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
      pending: <Clock className="w-4 h-4" />,
      confirmed: <CheckCircle className="w-4 h-4" />,
      preparing: <ChefHat className="w-4 h-4" />,
      ready: <Package className="w-4 h-4" />,
      out_for_delivery: <Truck className="w-4 h-4" />,
      delivered: <CheckCircle className="w-4 h-4" />,
      cancelled: <XCircle className="w-4 h-4" />,
    };
    return icons[status] || <ShoppingBag className="w-4 h-4" />;
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
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-white flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 mx-auto mb-4 border-4 border-orange-500 border-t-transparent rounded-full"
          />
          <p className="text-lg font-medium text-gray-700">Loading your orders...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-white">
      {/* Premium Hero Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-orange-500 to-yellow-400 rounded-b-[3rem] shadow-2xl mb-8"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <ShoppingBag className="w-10 h-10" />
                My Orders
              </h1>
              <p className="text-white/90 text-lg">
                {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''} found
              </p>
            </div>
            <Link 
              to="/restaurants" 
              className="group px-6 py-3 rounded-full bg-white text-orange-600 font-semibold flex items-center gap-2 hover:scale-105 hover:shadow-xl transition-all duration-300"
            >
              <ShoppingBag className="w-5 h-5" />
              Order Again
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Filter Pills */}
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            {[
              { key: 'all', label: 'All Orders', count: stats.total, icon: ShoppingBag },
              { key: 'active', label: 'Active', count: stats.active, icon: Clock },
              { key: 'completed', label: 'Completed', count: stats.completed, icon: CheckCircle },
              { key: 'cancelled', label: 'Cancelled', count: stats.cancelled, icon: XCircle }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <motion.button 
                  key={tab.key} 
                  onClick={() => setFilter(tab.key)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap flex items-center gap-2 transition-all duration-300 ${
                    filter === tab.key 
                      ? 'bg-white text-orange-600 shadow-lg' 
                      : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    filter === tab.key ? 'bg-orange-100 text-orange-600' : 'bg-white/20'
                  }`}>
                    {tab.count}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </motion.div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Premium Stats Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8"
        >
          {[
            { label: 'Total Orders', value: stats.total, icon: ShoppingBag, color: 'from-gray-500 to-gray-600' },
            { label: 'Active', value: stats.active, icon: Clock, color: 'from-orange-500 to-yellow-400' },
            { label: 'Completed', value: stats.completed, icon: CheckCircle, color: 'from-green-500 to-emerald-600' },
            { label: 'Cancelled', value: stats.cancelled, icon: XCircle, color: 'from-red-500 to-rose-600' },
            { label: 'Total Spent', value: formatCurrency(stats.totalSpent), icon: DollarSign, color: 'from-blue-500 to-indigo-600' }
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-white rounded-3xl shadow-xl p-6 text-center relative overflow-hidden group"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} mb-3`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Sort Dropdown */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-end mb-6"
        >
          <div className="relative">
            <select
              className="appearance-none bg-white rounded-full px-6 py-3 pr-10 text-sm font-medium text-gray-700 shadow-lg border-2 border-orange-200 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200 transition-all cursor-pointer"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">📅 Newest First</option>
              <option value="oldest">📅 Oldest First</option>
              <option value="amount_high">💰 Amount: High to Low</option>
              <option value="amount_low">💰 Amount: Low to High</option>
            </select>
            <TrendingUp className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </motion.div>

        {/* Premium Orders List */}
        {filteredOrders.length > 0 ? (
          <div className="space-y-6">
            {filteredOrders.map((order, index) => (
              <motion.div 
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-3xl shadow-xl p-6 border-2 border-orange-100 hover:border-orange-300 transition-all duration-300 group"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-yellow-400 flex items-center justify-center">
                        <ShoppingBag className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                          {order.restaurant.name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="font-medium">#{order.orderNumber}</span>
                          <span>•</span>
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{getRelativeTime(order.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border-2 ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {formatOrderStatus(order.status)}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent mb-1">
                      {formatCurrency((typeof order.total === 'number') ? order.total : (Number(order.subtotal || order.totalAmount || 0) + Number(order.deliveryFee || 0) + Number(order.tax || 0) - (typeof order.discount === 'number' ? order.discount : Number(order?.discount?.amount || 0))))}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-4 bg-orange-50 rounded-2xl p-4 border-2 border-orange-100">
                  <div className="space-y-3">
                    {order.items.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-orange-500 to-yellow-400" />
                          <span className="text-gray-900 font-medium">{item.menuItem.name}</span>
                          <span className="px-2 py-0.5 rounded-full bg-orange-200 text-orange-700 text-xs font-bold">
                            × {item.quantity}
                          </span>
                        </div>
                        <span className="text-gray-900 font-bold">
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div className="text-sm text-orange-600 font-medium pt-2 border-t border-orange-200">
                        +{order.items.length - 3} more item{order.items.length - 3 !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t-2 border-gray-100">
                  <div className="flex items-center gap-3">
                    <Link
                      to={`/orders/${order._id}/track`}
                      className="group/btn px-5 py-2.5 rounded-full bg-gradient-to-r from-orange-500 to-yellow-400 text-white font-semibold flex items-center gap-2 hover:shadow-lg hover:scale-105 transition-all duration-300"
                    >
                      <MapPin className="w-4 h-4" />
                      Track Order
                    </Link>
                    
                    {order.status === 'delivered' && (
                      <button
                        onClick={() => reorderItems(order)}
                        className="px-5 py-2.5 rounded-full bg-green-100 text-green-700 font-semibold flex items-center gap-2 hover:bg-green-200 hover:scale-105 transition-all duration-300"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Reorder
                      </button>
                    )}
                    
                    {['pending', 'confirmed'].includes(order.status) && (
                      <button
                        onClick={() => cancelOrder(order._id)}
                        className="px-5 py-2.5 rounded-full bg-red-100 text-red-700 font-semibold flex items-center gap-2 hover:bg-red-200 hover:scale-105 transition-all duration-300"
                      >
                        <XIcon className="w-4 h-4" />
                        Cancel
                      </button>
                    )}
                  </div>

                  <Link
                    to={`/orders/${order._id}`}
                    className="group/link px-5 py-2.5 rounded-full bg-gray-100 text-gray-700 font-semibold flex items-center gap-2 hover:bg-gray-200 hover:scale-105 transition-all duration-300"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                    <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 bg-white rounded-3xl shadow-xl border-2 border-orange-100"
          >
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="text-8xl mb-6"
            >
              {filter === 'all' ? '�' : 
               filter === 'active' ? '⏳' :
               filter === 'completed' ? '✅' : '❌'}
            </motion.div>
            <h3 className="text-3xl font-bold text-gray-900 mb-3">
              {filter === 'all' ? 'No orders yet' :
               filter === 'active' ? 'No active orders' :
               filter === 'completed' ? 'No completed orders' :
               'No cancelled orders'}
            </h3>
            <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
              {filter === 'all' 
                ? "Start by browsing restaurants and placing your first order!"
                : `You don't have any ${filter} orders at the moment.`
              }
            </p>
            {filter === 'all' && (
              <Link
                to="/restaurants"
                className="group inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-orange-500 to-yellow-400 text-white font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300"
              >
                <ShoppingBag className="w-6 h-6" />
                Browse Restaurants
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
            {filter !== 'all' && (
              <button
                onClick={() => setFilter('all')}
                className="group inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gray-100 text-gray-700 font-bold text-lg hover:bg-gray-200 hover:scale-105 transition-all duration-300"
              >
                <ShoppingBag className="w-6 h-6" />
                View All Orders
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;