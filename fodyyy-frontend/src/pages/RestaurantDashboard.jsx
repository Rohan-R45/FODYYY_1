import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useRestaurant } from '../context/RestaurantContext';
import { formatCurrency, formatDate, getRelativeTime, safeNumber } from '../utils/helpers';
import { validateOrderData } from '../utils/validation';
import orderService from '../services/orderService';
import RestaurantSetup from '../components/RestaurantSetup';
import { 
  GlassCard, 
  StatsCard, 
  StatusBadge, 
  EmptyState,
  GradientButton 
} from '../components/ui';
import { 
  ShoppingBag, 
  DollarSign, 
  Clock, 
  CheckCircle,
  Plus,
  ClipboardList,
  ChevronRight,
  User,
  MapPin,
  Phone,
  Star
} from 'lucide-react';
import toast from 'react-hot-toast';

const RestaurantDashboard = () => {
  const { user } = useAuth();
  const { restaurant, restaurantId, isLoading: restaurantLoading, requiresSetup, refreshRestaurant } = useRestaurant();
  const [dashboardData, setDashboardData] = useState({
    todayStats: {
      orders: 0,
      revenue: 0,
      pendingOrders: 0,
      completedOrders: 0
    },
    recentOrders: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (restaurantId && !requiresSetup) {
      if (typeof restaurantId === 'string' && restaurantId.length === 24 && /^[0-9a-fA-F]{24}$/.test(restaurantId)) {
        loadDashboardData();
        
        const interval = setInterval(() => {
          if (restaurantId && typeof restaurantId === 'string' && restaurantId.length === 24) {
            loadDashboardData();
          }
        }, 60000);
        
        return () => clearInterval(interval);
      } else {
        console.error('Invalid restaurant ID format:', restaurantId);
        toast.error('Invalid restaurant ID. Please refresh the page.');
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, [restaurantId, requiresSetup]);

  const loadDashboardData = async () => {
    try {
      const statsResponse = await orderService.getOrderAnalytics({ period: 'today' });
      const ordersResponse = await orderService.getRestaurantOrders({ limit: 10, sort: '-createdAt' });

      if (statsResponse.success) {
        const backendData = statsResponse.data;
        const mappedStats = {
          orders: backendData.today?.todayOrders || 0,
          revenue: backendData.today?.todayRevenue || 0,
          pendingOrders: (backendData.statusBreakdown?.pending || 0) + 
                        (backendData.statusBreakdown?.confirmed || 0) + 
                        (backendData.statusBreakdown?.preparing || 0) + 
                        (backendData.statusBreakdown?.ready || 0),
          completedOrders: backendData.statusBreakdown?.delivered || 0
        };
        
        setDashboardData(prev => ({
          ...prev,
          todayStats: mappedStats
        }));
      }

      if (ordersResponse.success) {
        const rawOrders = ordersResponse.data.orders || ordersResponse.data || [];
        const validOrders = rawOrders
          .map(order => validateOrderData(order))
          .filter(order => order !== null);
        
        setDashboardData(prev => ({
          ...prev,
          recentOrders: validOrders
        }));
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      const errorMessage = error.response?.data?.message || error.message || '';
      const isIdFormatError = errorMessage.includes('Invalid') && errorMessage.includes('ID format');
      
      if (!isIdFormatError) {
        if (error.response?.status === 404) {
          toast.error('Restaurant profile not found. Please complete your profile setup.');
        } else if (error.response?.status === 401) {
          toast.error('Authentication failed. Please log in again.');
        } else {
          toast.error('Failed to load dashboard data. Please try again.');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetupComplete = (restaurantData) => {
    toast.success('Restaurant setup completed! Welcome to your dashboard.');
    refreshRestaurant();
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const response = await orderService.updateOrderStatus(orderId, newStatus);
      
      if (response.success) {
        toast.success(`Order status updated to ${newStatus}`);
        loadDashboardData();
      } else {
        toast.error(response.message || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
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
    return ['pending', 'confirmed', 'preparing', 'ready'].includes(status);
  };

  // Loading state
  if (restaurantLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFF8F0] via-orange-50 to-[#FFC857] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-700 font-medium">Loading restaurant dashboard...</p>
        </motion.div>
      </div>
    );
  }

  // Setup required
  if (requiresSetup) {
    return <RestaurantSetup onSetupComplete={handleSetupComplete} />;
  }

  // Error state
  if (!restaurant || !restaurantId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFF8F0] via-orange-50 to-[#FFC857] flex items-center justify-center">
        <GlassCard className="max-w-md p-8 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Restaurant Not Found</h2>
          <p className="text-gray-600 mb-6">Unable to load your restaurant information.</p>
          <GradientButton onClick={refreshRestaurant}>
            Try Again
          </GradientButton>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8F0] via-orange-50 to-[#FFC857] relative overflow-hidden">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 pt-8 pb-6"
      >
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                <span className="bg-gradient-to-r from-orange-600 via-red-500 to-orange-600 bg-clip-text text-transparent">
                  Restaurant Dashboard 🏪
                </span>
              </h1>
              <p className="text-lg text-gray-700">
                Welcome back, <span className="font-semibold">{restaurant?.name || user?.name}</span>
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Link to="/restaurant/menu">
                <GradientButton icon={<Plus className="w-5 h-5" />} iconPosition="left">
                  Add Menu Item
                </GradientButton>
              </Link>
              
              <Link to="/restaurant/orders">
                <GradientButton variant="outline" icon={<ClipboardList className="w-5 h-5" />} iconPosition="left">
                  View All Orders
                </GradientButton>
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-12 relative z-10">
        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          <StatsCard
            title="Today's Orders"
            value={safeNumber(dashboardData.todayStats.orders, 0)}
            icon={<ShoppingBag className="w-6 h-6" />}
            gradient="blue"
            delay={0.1}
          />
          <StatsCard
            title="Today's Revenue"
            value={formatCurrency(safeNumber(dashboardData.todayStats.revenue, 0))}
            icon={<DollarSign className="w-6 h-6" />}
            gradient="green"
            delay={0.2}
          />
          <StatsCard
            title="Pending Orders"
            value={safeNumber(dashboardData.todayStats.pendingOrders, 0)}
            icon={<Clock className="w-6 h-6" />}
            gradient="yellow"
            delay={0.3}
          />
          <StatsCard
            title="Completed"
            value={safeNumber(dashboardData.todayStats.completedOrders, 0)}
            icon={<CheckCircle className="w-6 h-6" />}
            gradient="purple"
            delay={0.4}
          />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-500 bg-clip-text text-transparent">
                  Recent Orders 📋
                </h2>
                <Link
                  to="/restaurant/orders"
                  className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-semibold group"
                >
                  View all
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {dashboardData.recentOrders.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.recentOrders.map((order, index) => (
                    <motion.div
                      key={order._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                    >
                      <GlassCard hover className="p-6">
                        <div className="flex items-start justify-between flex-wrap gap-4">
                          <div className="flex items-start gap-4 flex-1 min-w-0">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-400 to-red-400 flex items-center justify-center flex-shrink-0">
                              <ShoppingBag className="w-7 h-7 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-bold text-gray-900">
                                  Order #{order.orderNumber}
                                </h3>
                                <StatusBadge status={order.status} size="sm" animated />
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                                <User className="w-4 h-4" />
                                <span>{order.customer?.name}</span>
                                <span>•</span>
                                <span>{getRelativeTime(order.createdAt)}</span>
                              </div>
                              <p className="text-sm text-gray-600">
                                {(order.itemsCount ?? order.items?.length ?? 0)} item{((order.itemsCount ?? order.items?.length ?? 0) !== 1) ? 's' : ''} • 
                                {order.paymentMethod === 'upi' ? ' UPI' : ' Cash on Delivery'}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-3">
                            <p className="text-2xl font-bold text-gray-900">
                              {formatCurrency((typeof order.total === 'number') ? order.total : (Number(order.totalAmount || order.subtotal || 0) + Number(order.deliveryFee || 0) + Number(order.tax || 0) - (typeof order.discount === 'number' ? order.discount : Number(order?.discount?.amount || 0))))}
                            </p>
                            <div className="flex items-center gap-2">
                              {canUpdateStatus(order.status) && order._id && (
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleStatusUpdate(order._id, getNextStatus(order.status))}
                                  className="text-sm bg-gradient-to-r from-orange-600 to-red-500 text-white px-4 py-2 rounded-full hover:shadow-lg transition-all font-semibold"
                                >
                                  Mark as {getNextStatus(order.status)}
                                </motion.button>
                              )}
                              {order._id && (
                                <Link
                                  to={`/restaurant/orders/${order._id}`}
                                  className="text-sm text-orange-600 hover:text-orange-700 font-semibold"
                                >
                                  Details →
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      </GlassCard>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <GlassCard className="p-12">
                  <EmptyState
                    icon="📋"
                    title="No orders yet"
                    description="Orders will appear here once customers start ordering from your restaurant."
                  />
                </GlassCard>
              )}
            </motion.div>
          </div>

          {/* Restaurant Profile Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Restaurant Profile</h3>
                  <Link
                    to="/restaurant/profile"
                    className="text-orange-600 hover:text-orange-700 text-sm font-semibold"
                  >
                    Edit
                  </Link>
                </div>
                
                {/* Restaurant Image */}
                <div className="mb-6">
                  {restaurant.image ? (
                    <img
                      src={restaurant.image}
                      alt={restaurant.name}
                      className="w-full h-40 object-cover rounded-xl"
                    />
                  ) : (
                    <div className="w-full h-40 bg-gradient-to-br from-orange-400 to-red-400 rounded-xl flex items-center justify-center">
                      <ShoppingBag className="w-16 h-16 text-white/50" />
                    </div>
                  )}
                </div>

                {/* Restaurant Info */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-lg text-gray-900 mb-1">{restaurant.name}</h4>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {restaurant.description || 'No description available'}
                    </p>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-3 text-gray-700">
                      <MapPin className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                      <span className="flex-1">{restaurant.address || 'No address provided'}</span>
                    </div>
                    
                    <div className="flex items-center gap-3 text-gray-700">
                      <Phone className="w-5 h-5 text-orange-500 flex-shrink-0" />
                      <span>{restaurant.phone || 'No phone number'}</span>
                    </div>
                    
                    <div className="flex items-center gap-3 text-gray-700">
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                      <span className="font-semibold">{restaurant.rating?.toFixed(1) || 'No ratings yet'}</span>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="pt-4 border-t border-orange-100 space-y-2">
                    <Link to="/restaurant/menu" className="block">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-orange-50 text-orange-600 px-4 py-3 rounded-xl hover:bg-orange-100 transition-colors font-semibold text-sm"
                      >
                        Manage Menu
                      </motion.button>
                    </Link>
                    <Link to="/restaurant/profile" className="block">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-orange-50 text-orange-600 px-4 py-3 rounded-xl hover:bg-orange-100 transition-colors font-semibold text-sm"
                      >
                        Edit Profile
                      </motion.button>
                    </Link>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDashboard;