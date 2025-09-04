import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRestaurant } from '../context/RestaurantContext';
import { formatCurrency, formatDate, getRelativeTime, safeNumber } from '../utils/helpers';
import { validateOrderData, filterValidItems } from '../utils/validation';
import orderService from '../services/orderService';
import RestaurantSetup from '../components/RestaurantSetup';
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
    // Only load dashboard data if we have a valid restaurant ID
    if (restaurantId && !requiresSetup) {
      // Validate restaurant ID format before making API calls
      if (typeof restaurantId === 'string' && restaurantId.length === 24 && /^[0-9a-fA-F]{24}$/.test(restaurantId)) {
        loadDashboardData();
        
        // Set up polling for real-time updates (reduced frequency to prevent error spam)
        const interval = setInterval(() => {
          // Only poll if we still have a valid restaurant ID
          if (restaurantId && typeof restaurantId === 'string' && restaurantId.length === 24) {
            loadDashboardData();
          }
        }, 60000); // Poll every 60 seconds instead of 30
        
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
      console.log('🔍 Loading dashboard data...');
      console.log('Restaurant ID:', restaurantId);
      console.log('Restaurant object:', restaurant);
      
      // Load dashboard data (restaurant info is handled by context)
      console.log('📊 Calling order analytics API...');
      const statsResponse = await orderService.getOrderAnalytics({ period: 'today' });
      console.log('📊 Order analytics response:', statsResponse);
      
      console.log('📋 Calling restaurant orders API...');
      const ordersResponse = await orderService.getRestaurantOrders({ limit: 10, sort: '-createdAt' });
      console.log('📋 Restaurant orders response:', ordersResponse);

      if (statsResponse.success) {
        const backendData = statsResponse.data;
        console.log('📊 Raw backend data:', backendData);
        
        // Map backend data to frontend format
        const mappedStats = {
          orders: backendData.today?.todayOrders || 0,
          revenue: backendData.today?.todayRevenue || 0,
          pendingOrders: (backendData.statusBreakdown?.pending || 0) + 
                        (backendData.statusBreakdown?.confirmed || 0) + 
                        (backendData.statusBreakdown?.preparing || 0) + 
                        (backendData.statusBreakdown?.ready || 0),
          completedOrders: backendData.statusBreakdown?.delivered || 0
        };
        
        console.log('📊 Mapped stats:', mappedStats);
        
        setDashboardData(prev => ({
          ...prev,
          todayStats: mappedStats
        }));
      }

      if (ordersResponse.success) {
        const rawOrders = ordersResponse.data.orders || ordersResponse.data || [];
        // Filter out orders with invalid IDs to prevent "invalid order ID format" errors
        const validOrders = rawOrders
          .map(order => validateOrderData(order))
          .filter(order => order !== null);
        
        if (validOrders.length !== rawOrders.length) {
          console.warn(`Filtered out ${rawOrders.length - validOrders.length} orders with invalid IDs`);
        }
        
        setDashboardData(prev => ({
          ...prev,
          recentOrders: validOrders
        }));
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      
      // Don't show toast errors for ID format issues (they're now handled gracefully)
      const errorMessage = error.response?.data?.message || error.message || '';
      const isIdFormatError = errorMessage.includes('Invalid') && errorMessage.includes('ID format');
      
      if (!isIdFormatError) {
        // Provide more specific error messages for non-ID-format errors
        if (error.response?.status === 404) {
          toast.error('Restaurant profile not found. Please complete your profile setup.');
        } else if (error.response?.status === 401) {
          toast.error('Authentication failed. Please log in again.');
        } else {
          toast.error('Failed to load dashboard data. Please try again.');
        }
      } else {
        console.warn('ID format error handled gracefully:', errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetupComplete = (restaurantData) => {
    toast.success('Restaurant setup completed! Welcome to your dashboard.');
    refreshRestaurant(); // This will update the restaurant context and trigger data loading
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const response = await orderService.updateOrderStatus(orderId, newStatus);
      
      if (response.success) {
        toast.success(`Order status updated to ${newStatus}`);
        loadDashboardData(); // Refresh data
      } else {
        toast.error(response.message || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
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

  // Show loading state while restaurant is being loaded
  if (restaurantLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading restaurant information...</p>
        </div>
      </div>
    );
  }

  // Show setup component if restaurant setup is required
  if (requiresSetup) {
    return <RestaurantSetup onSetupComplete={handleSetupComplete} />;
  }

  // Show error if no restaurant found (shouldn't happen after setup)
  if (!restaurant || !restaurantId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Restaurant Not Found</h2>
          <p className="text-gray-600 mb-4">Unable to load your restaurant information.</p>
          <button
            onClick={refreshRestaurant}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
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
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Restaurant Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Welcome back, {restaurant?.name || user?.name}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Link
                to="/restaurant/menu"
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Menu Item
              </Link>
              
              <Link
                to="/restaurant/orders"
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                View All Orders
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Today's Orders</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {safeNumber(dashboardData.todayStats.orders, 0)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Today's Revenue</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {formatCurrency(safeNumber(dashboardData.todayStats.revenue, 0))}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {safeNumber(dashboardData.todayStats.pendingOrders, 0)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {safeNumber(dashboardData.todayStats.completedOrders, 0)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
                  <Link
                    to="/restaurant/orders"
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    View All
                  </Link>
                </div>
              </div>

              <div className="divide-y divide-gray-100">
                {dashboardData.recentOrders.length > 0 ? (
                  dashboardData.recentOrders.map((order) => (
                    <div key={order._id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-4">
                          <div>
                            <h4 className="font-medium text-gray-900">
                              Order #{order.orderNumber}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {order.customer?.name} • {getRelativeTime(order.createdAt)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          {getStatusBadge(order.status)}
                          <span className="font-semibold text-gray-900">
                            {formatCurrency((typeof order.total === 'number') ? order.total : (Number(order.totalAmount || order.subtotal || 0) + Number(order.deliveryFee || 0) + Number(order.tax || 0) - (typeof order.discount === 'number' ? order.discount : Number(order?.discount?.amount || 0))))}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          {(order.itemsCount ?? order.items?.length ?? 0)} item{((order.itemsCount ?? order.items?.length ?? 0) !== 1) ? 's' : ''} • 
                          {order.paymentMethod === 'upi' ? ' UPI' : ' Cash on Delivery'}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {canUpdateStatus(order.status) && order._id && (
                            <button
                              onClick={() => handleStatusUpdate(order._id, getNextStatus(order.status))}
                              className="text-sm bg-primary-600 text-white px-3 py-1 rounded-lg hover:bg-primary-700 transition-colors"
                            >
                              Mark as {getNextStatus(order.status)}
                            </button>
                          )}
                          
                          {order._id ? (
                            <Link
                              to={`/restaurant/orders/${order._id}`}
                              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                            >
                              View Details
                            </Link>
                          ) : (
                            <span className="text-sm text-gray-400">
                              Invalid Order
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                    <p className="text-gray-600">Orders will appear here once customers start ordering.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Restaurant Profile Summary */}
            {dashboardData.restaurantInfo && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Restaurant Profile</h3>
                  <Link
                    to="/restaurant/profile"
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    Edit
                  </Link>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      {dashboardData.restaurantInfo.image ? (
                        <img
                          src={dashboardData.restaurantInfo.image}
                          alt={dashboardData.restaurantInfo.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h6m-6 4h6m-6 4h6" />
                        </svg>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{dashboardData.restaurantInfo.name}</h4>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {dashboardData.restaurantInfo.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{dashboardData.restaurantInfo.address}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-gray-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span>{dashboardData.restaurantInfo.phone}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-gray-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>
                        {dashboardData.restaurantInfo.operatingHours?.open} - {dashboardData.restaurantInfo.operatingHours?.close}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                <Link
                  to="/restaurant/menu"
                  className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Manage Menu</p>
                    <p className="text-sm text-gray-600">Add, edit, or remove menu items</p>
                  </div>
                </Link>
                
                <Link
                  to="/restaurant/orders"
                  className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">View Orders</p>
                    <p className="text-sm text-gray-600">Manage incoming orders</p>
                  </div>
                </Link>
                
                <Link
                  to="/restaurant/profile"
                  className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Edit Profile</p>
                    <p className="text-sm text-gray-600">Update restaurant information</p>
                  </div>
                </Link>
                
                <Link
                  to="/restaurant/analytics"
                  className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Analytics</p>
                    <p className="text-sm text-gray-600">View performance insights</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDashboard;