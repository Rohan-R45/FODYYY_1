import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import restaurantService from '../services/restaurantService';
import orderService from '../services/orderService';
import { formatCurrency, formatDateTime, getRelativeTime, safeNumber } from '../utils/helpers';
import { createSafeLinkProps } from '../utils/navigation';
import { 
  GlassCard, 
  StatsCard, 
  SearchBar, 
  FloatingFood, 
  EmptyState,
  StatusBadge 
} from '../components/ui';
import { 
  ShoppingBag, 
  DollarSign, 
  TrendingUp, 
  Package,
  Star,
  Clock,
  ChevronRight,
  Utensils
} from 'lucide-react';
import toast from 'react-hot-toast';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredRestaurants, setFeaturedRestaurants] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [orderStats, setOrderStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load featured restaurants (top rated)
      const restaurantsResponse = await restaurantService.getRestaurants({
        limit: 100,
        sortBy: 'rating',
        sortOrder: 'desc',
        isActive: true
      });
      
      if (restaurantsResponse.success) {
        setFeaturedRestaurants(restaurantsResponse.data.restaurants || restaurantsResponse.data);
      }

      // Load recent orders
      try {
        const ordersResponse = await orderService.getRecentOrders('student', 5);
        if (ordersResponse.success) {
          setRecentOrders(ordersResponse.data.orders || ordersResponse.data);
          setOrderStats(ordersResponse.data.stats || ordersResponse.stats);
        }
      } catch (orderError) {
        console.log('Orders not available yet:', orderError);
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (query) => {
    if (query.trim()) {
      navigate(`/restaurants?search=${encodeURIComponent(query.trim())}`);
    } else {
      navigate('/restaurants');
    }
  };

  const handleQuickFilter = (cuisine) => {
    navigate(`/restaurants?cuisine=${encodeURIComponent(cuisine)}`);
  };

  const searchSuggestions = [
    'Biryani', 'Pizza', 'Burger', 'Dosa', 'Pasta', 
    'North Indian', 'South Indian', 'Chinese'
  ].filter(item => 
    item.toLowerCase().includes(searchQuery.toLowerCase()) && searchQuery.length > 0
  ).slice(0, 5);

  if (isLoading) {
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
          <p className="text-gray-700 font-medium">Loading your dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8F0] via-orange-50 to-[#FFC857] relative overflow-hidden">
      {/* Floating Food Emojis */}
      <FloatingFood emoji="🍔" position="top-20 left-10" delay={0} duration={4} />
      <FloatingFood emoji="🍕" position="top-40 right-20" delay={0.5} duration={3.5} />
      <FloatingFood emoji="🍜" position="bottom-40 left-20" delay={1} duration={4.5} />
      <FloatingFood emoji="🍰" position="bottom-20 right-10" delay={1.5} duration={3} />
      <FloatingFood emoji="☕" position="top-1/2 right-40" delay={2} duration={4} />

      {/* Hero Section with Search */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 pt-8 pb-12"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            {/* Welcome Message */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-3">
                <span className="bg-gradient-to-r from-orange-600 via-red-500 to-orange-600 bg-clip-text text-transparent">
                  Hey {user?.name?.split(' ')[0]}! 
        
                </span>
                <span className="inline-block">👋</span>
              </h1>
              <p className="text-xl text-gray-700 font-medium">
                What are you craving today? 🍽️
              </p>
            </motion.div>
            
            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="mb-6"
            >
              <SearchBar
                placeholder="Search restaurants, cuisines, or dishes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onSearch={handleSearch}
                suggestions={searchSuggestions}
                large
              />
            </motion.div>

            {/* Quick Filter Pills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap justify-center gap-3"
            >
              {[
                { name: '🍛 North Indian', value: 'North Indian' },
                { name: '🥘 South Indian', value: 'South Indian' },
                { name: '🍜 Chinese', value: 'Chinese' },
                { name: '🍝 Italian', value: 'Italian' },
                { name: '🍔 Fast Food', value: 'Fast Food' }
              ].map((cuisine, index) => (
                <motion.button
                  key={cuisine.value}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleQuickFilter(cuisine.value)}
                  className="px-5 py-2.5 bg-white/90 backdrop-blur-lg text-orange-600 rounded-full hover:bg-white hover:shadow-lg transition-all duration-300 text-sm font-semibold border-2 border-orange-200 hover:border-orange-400"
                >
                  {cuisine.name}
                </motion.button>
              ))}
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-12 relative z-10">
        {/* Stats Cards */}
        {orderStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          >
            <StatsCard
              title="Total Orders"
              value={safeNumber(orderStats.totalOrders, 0)}
              icon={<ShoppingBag className="w-6 h-6" />}
              gradient="orange"
              delay={0.1}
            />
            <StatsCard
              title="Total Spent"
              value={formatCurrency(safeNumber(orderStats.totalSpent, 0))}
              icon={<DollarSign className="w-6 h-6" />}
              gradient="green"
              delay={0.2}
            />
            <StatsCard
              title="Average Order"
              value={formatCurrency(safeNumber(orderStats.averageOrderValue, 0))}
              icon={<TrendingUp className="w-6 h-6" />}
              gradient="blue"
              delay={0.3}
            />
            <StatsCard
              title="Delivered"
              value={safeNumber(orderStats.statusCounts?.delivered, 0)}
              icon={<Package className="w-6 h-6" />}
              gradient="purple"
              delay={0.4}
            />
          </motion.div>
        )}

        {/* Featured Restaurants */}
        <div className="mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="flex items-center justify-between mb-6"
          >
            <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-500 bg-clip-text text-transparent">
              Featured Restaurants <span className="inline-block">🌟</span>
  
            </h2>
      
            <Link
              to="/restaurants"
              className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-semibold group"
            >
              View all
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {featuredRestaurants.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {featuredRestaurants.slice(0, 8).map((restaurant, index) => {
                const linkProps = createSafeLinkProps.restaurant(restaurant._id);
                
                return (
                  <motion.div
                    key={restaurant._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                  >
                    <Link {...linkProps}>
                      <GlassCard hover className="overflow-hidden group h-full">
                        {/* Restaurant Image */}
                        <div className="relative h-48 overflow-hidden rounded-t-2xl">
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10" />
                          {restaurant.image ? (
                            <img
                              src={restaurant.image}
                              alt={restaurant.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-orange-400 to-red-400 flex items-center justify-center">
                              <Utensils className="w-16 h-16 text-white/50" />
                            </div>
                          )}
                          
                          {/* Rating Badge */}
                          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg z-20">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span className="font-bold text-gray-900">
                              {restaurant.rating?.toFixed(1) || 'New'}
                            </span>
                          </div>
                        </div>
                        
                        {/* Restaurant Info */}
                        <div className="p-5">
                          <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-orange-600 transition-colors line-clamp-1">
                            {restaurant.name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {restaurant.description || restaurant.cuisine?.join(', ') || 'Delicious food awaits!'}
                          </p>
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-1 text-gray-600">
                              <Clock className="w-4 h-4" />
                              <span>{restaurant.deliveryTime || '30-40'} </span>
                            </div>
                            <span className="text-orange-600 font-semibold">
                              Order Now →
                            </span>
                          </div>
                        </div>
                      </GlassCard>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon="🍽️"
              title="No restaurants available"
              description="Check back soon for delicious options!"
            />
          )}
        </div>

        {/* Recent Orders */}
        {recentOrders.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-500 bg-clip-text text-transparent">
                Recent Orders 📦
              </h2>
              <Link
                to="/orders"
                className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-semibold group"
              >
                View all
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="space-y-4">
              {recentOrders.map((order, index) => (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.1 + index * 0.1 }}
                >
                  <Link to={`/orders/${order._id}`}>
                    <GlassCard hover className="p-6">
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-orange-400 to-red-400 flex items-center justify-center flex-shrink-0">
                            <ShoppingBag className="w-8 h-8 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 mb-1 truncate">
                              {order.restaurant?.name || 'Restaurant'}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">
                              {order.items?.length || 0} items • {getRelativeTime(order.createdAt)}
                            </p>
                            <StatusBadge status={order.status} size="sm" />
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">
                            {formatCurrency(order.totalAmount || 0)}
                          </p>
                          <p className="text-sm text-orange-600 font-medium">
                            View Details →
                          </p>
                        </div>
                      </div>
                    </GlassCard>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;