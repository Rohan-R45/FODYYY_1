import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import restaurantService from '../services/restaurantService';
import { createSafeLinkProps } from '../utils/navigation';
import { isValidId } from '../utils/validation';
import { useRatingUpdates } from '../context/RatingContext';
import toast from 'react-hot-toast';
import OptimizedImage from '../components/OptimizedImage';
import RatingDisplay from '../components/RatingDisplay';
import { Search, Star, Clock, TrendingUp, Zap, Tag, X } from 'lucide-react';

const RestaurantList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [restaurants, setRestaurants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [filters, setFilters] = useState({
    cuisine: searchParams.get('cuisine') || '',
    rating: searchParams.get('rating') || '',
    deliveryTime: searchParams.get('deliveryTime') || '',
    priceRange: searchParams.get('priceRange') || ''
  });
  const [sortBy, setSortBy] = useState('rating');
  const [sortOrder, setSortOrder] = useState('desc');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNextPage: false,
    hasPrevPage: false
  });

  // Quick filter state
  const [activeQuickFilter, setActiveQuickFilter] = useState('all');
  
  // Rating updates subscription
  const { subscribeToRestaurant } = useRatingUpdates();

  const cuisineTypes = [
    'North Indian', 'South Indian', 'Chinese', 'Italian', 'Continental',
    'Fast Food', 'Street Food', 'Desserts', 'Beverages', 'Healthy'
  ];

  const ratingOptions = [
    { value: '4.5', label: '4.5+ Stars' },
    { value: '4.0', label: '4.0+ Stars' },
    { value: '3.5', label: '3.5+ Stars' },
    { value: '3.0', label: '3.0+ Stars' }
  ];

  const deliveryTimeOptions = [
    { value: '15', label: 'Under 15 min' },
    { value: '30', label: 'Under 30 min' },
    { value: '45', label: 'Under 45 min' },
    { value: '60', label: 'Under 1 hour' }
  ];

  const priceRangeOptions = [
    { value: '₹', label: 'Budget (₹)' },
    { value: '₹₹', label: 'Moderate (₹₹)' },
    { value: '₹₹₹', label: 'Premium (₹₹₹)' }
  ];

  const sortOptions = [
    { value: 'rating', label: 'Rating', order: 'desc' },
    { value: 'deliveryTime', label: 'Delivery Time', order: 'asc' },
    { value: 'name', label: 'Name', order: 'asc' },
    { value: 'createdAt', label: 'Newest', order: 'desc' }
  ];

  // Debounced fetch when URL params change
  useEffect(() => {
    const handle = setTimeout(() => {
      loadRestaurants();
    }, 300); // 300ms debounce
    return () => clearTimeout(handle);
  }, [searchParams]);

  // Subscribe to rating updates for all restaurants
  useEffect(() => {
    if (restaurants.length === 0) return;
    
    const unsubscribers = [];
    
    restaurants.forEach(restaurant => {
      // Create a stable callback for this restaurant
      const handleRatingUpdate = (updatedRating) => {
        // Update the restaurant's rating in the list
        setRestaurants(prev => prev.map(r => 
          r._id === restaurant._id 
            ? { 
                ...r, 
                rating: updatedRating.rating,
                totalReviews: updatedRating.totalReviews
              }
            : r
        ));
      };
      
      const unsubscribe = subscribeToRestaurant(restaurant._id, handleRatingUpdate);
      unsubscribers.push(unsubscribe);
    });
    
    // Cleanup: unsubscribe when restaurants list changes or component unmounts
    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, [restaurants.map(r => r._id).join(','), subscribeToRestaurant]);

  const loadRestaurants = async () => {
    try {
      setIsLoading(true);
      
      const params = {
        search: searchQuery,
        ...filters,
        sortBy,
        sortOrder,
        isActive: true,
        limit: 100 // Set a high limit to show all restaurants for now
      };

      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });

      const response = await restaurantService.getRestaurants(params);
      
      if (response.success) {
        setRestaurants(response.data.restaurants || response.data);
        // Update pagination info if available
        if (response.data.pagination) {
          setPagination(response.data.pagination);
        }
      } else {
        toast.error('Failed to load restaurants');
      }
    } catch (error) {
      console.error('Error loading restaurants:', error);
      toast.error('Failed to load restaurants');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    updateSearchParams({ search: searchQuery });
  };

  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);
    updateSearchParams(newFilters);
  };

  const handleSortChange = (value) => {
    const option = sortOptions.find(opt => opt.value === value);
    setSortBy(value);
    setSortOrder(option.order);
    updateSearchParams({ sortBy: value, sortOrder: option.order });
  };

  const updateSearchParams = (newParams) => {
    const params = new URLSearchParams(searchParams);
    
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    setSearchParams(params);
  };

  const clearFilters = () => {
    setFilters({
      cuisine: '',
      rating: '',
      deliveryTime: '',
      priceRange: ''
    });
    setSearchQuery('');
    setActiveQuickFilter('all');
    setSearchParams({});
  };

  const handleQuickFilter = (filterType) => {
    setActiveQuickFilter(filterType);
    
    if (filterType === 'all') {
      clearFilters();
    } else if (filterType === 'fast') {
      handleFilterChange('deliveryTime', '30');
    } else if (filterType === 'topRated') {
      handleFilterChange('rating', '4.5');
    } else if (filterType === 'veg') {
      // This would need backend support
      toast.info('Veg filter coming soon!');
    } else if (filterType === 'offers') {
      // This would need backend support
      toast.info('Offers filter coming soon!');
    }
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(Boolean).length + (searchQuery ? 1 : 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8F0] via-orange-50 to-[#FFC857]">
      {/* Hero Section with Search */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-orange-500 to-yellow-400 rounded-b-[3rem] shadow-2xl"
      >
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-3xl mx-auto">
            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-4xl font-bold text-white text-center mb-8"
            >
              Discover Amazing Restaurants 🍽️
            </motion.h1>

            {/* Search Bar */}
            <motion.form
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              onSubmit={handleSearch}
              className="relative"
            >
              <div className="relative bg-white rounded-full shadow-2xl overflow-hidden">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search restaurants, cuisines, or dishes..."
                  className="w-full pl-16 pr-32 py-5 text-lg focus:outline-none"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-orange-500 to-yellow-400 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
                  Search
                </button>
              </div>
            </motion.form>

            {/* Filter Pills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap justify-center gap-3 mt-6"
            >
              {[
                { id: 'all', label: 'All', icon: null },
                { id: 'fast', label: 'Fast Delivery', icon: <Zap className="w-4 h-4" /> },
                { id: 'topRated', label: 'Top Rated', icon: <Star className="w-4 h-4" /> },
                { id: 'veg', label: 'Veg', icon: null },
                { id: 'offers', label: 'Offers', icon: <Tag className="w-4 h-4" /> }
              ].map((filter, index) => (
                <motion.button
                  key={filter.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleQuickFilter(filter.id)}
                  className={`px-5 py-2.5 rounded-full font-semibold text-sm flex items-center gap-2 transition-all duration-300 ${
                    activeQuickFilter === filter.id
                      ? 'bg-gradient-to-r from-orange-500 to-yellow-400 text-white shadow-lg'
                      : 'bg-orange-50 text-orange-600 hover:bg-white'
                  }`}
                >
                  {filter.icon}
                  {filter.label}
                </motion.button>
              ))}
            </motion.div>

            {/* Active Filters Display */}
            {getActiveFiltersCount() > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 flex items-center justify-center gap-2 flex-wrap"
              >
                <span className="text-white text-sm font-medium">Active filters:</span>
                {searchQuery && (
                  <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    Search: {searchQuery}
                    <button onClick={() => setSearchQuery('')} className="hover:bg-white/20 rounded-full p-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {Object.entries(filters).map(([key, value]) => value && (
                  <span key={key} className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    {key}: {value}
                    <button onClick={() => handleFilterChange(key, '')} className="hover:bg-white/20 rounded-full p-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <button
                  onClick={clearFilters}
                  className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-semibold hover:bg-white/30 transition-colors"
                >
                  Clear All
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Restaurant Cards */}
      <div className="container mx-auto px-4 py-12">
        {/* Results Count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-8 text-center"
        >
          <p className="text-gray-700 text-lg">
            {pagination.totalItems > 0 
              ? `Found ${pagination.totalItems} amazing restaurant${pagination.totalItems !== 1 ? 's' : ''}`
              : `${restaurants.length} restaurant${restaurants.length !== 1 ? 's' : ''} available`
            }
          </p>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white rounded-3xl shadow-xl overflow-hidden">
                <div className="w-full h-64 bg-gray-200 animate-pulse"></div>
                <div className="p-6">
                  <div className="h-6 bg-gray-200 rounded animate-pulse mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-2 w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : restaurants.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {restaurants.map((restaurant, index) => {
              const linkProps = createSafeLinkProps.restaurant(restaurant._id);
              
              return (
                <motion.div
                  key={restaurant._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  className="group"
                >
                  <Link {...linkProps}>
                    <div className="bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 h-full">
                      {/* Restaurant Image */}
                      <div className="relative h-64 overflow-hidden">
                        {restaurant.image ? (
                          <img
                            src={restaurant.image}
                            alt={restaurant.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-orange-400 to-yellow-400 flex items-center justify-center">
                            <svg className="w-20 h-20 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h6m-6 4h6m-6 4h6" />
                            </svg>
                          </div>
                        )}
                        
                        {/* Overlay Badges */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        
                        {/* Status Badge */}
                        <div className="absolute top-4 left-4">
                          <span className={`px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-sm ${
                            restaurant.isActive 
                              ? 'bg-green-500/90 text-white' 
                              : 'bg-red-500/90 text-white'
                          }`}>
                            {restaurant.isActive ? '🚀 Fast' : 'Closed'}
                          </span>
                        </div>

                        {/* Offer Badge (if applicable) */}
                        {restaurant.hasOffer && (
                          <div className="absolute top-4 right-4">
                            <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-yellow-400 text-gray-900 backdrop-blur-sm">
                              🎉 OFFER
                            </span>
                          </div>
                        )}

                        {/* Rating Badge */}
                        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
                          <RatingDisplay 
                            rating={restaurant.rating || 0}
                            totalReviews={restaurant.totalReviews || 0}
                            size="sm"
                            showCount={true}
                            animated={true}
                          />
                        </div>

                        {/* Hover CTA */}
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          whileHover={{ opacity: 1, y: 0 }}
                          className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300"
                        >
                          <span className="bg-gradient-to-r from-orange-500 to-yellow-400 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                            View Menu →
                          </span>
                        </motion.div>
                      </div>
                      
                      {/* Restaurant Info */}
                      <div className="p-6">
                        <h3 className="font-bold text-2xl text-gray-900 mb-2 group-hover:text-orange-600 transition-colors line-clamp-1">
                          {restaurant.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {restaurant.cuisine?.join(', ') || restaurant.description || 'Delicious food awaits!'}
                        </p>
                        
                        {/* Meta Info */}
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1 text-gray-600">
                            <Clock className="w-4 h-4 text-orange-500" />
                            <span className="font-medium">{restaurant.deliveryTime || '30-40'} </span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-600">
                            <TrendingUp className="w-4 h-4 text-green-500" />
                            <span className="font-medium">{restaurant.priceRange || '₹₹'}</span>
                          </div>
                        </div>

                        {/* Delivery Fee */}
                        {restaurant.deliverySettings?.freeDeliveryAbove && (
                          <div className="mt-3 text-xs text-green-600 font-medium">
                            Free delivery on orders above ₹{restaurant.deliverySettings.freeDeliveryAbove}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 bg-white/90 backdrop-blur-sm rounded-3xl border-2 border-orange-200"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No restaurants found</h3>
            <p className="text-gray-600 mb-6">
              {getActiveFiltersCount() > 0 
                ? 'Try adjusting your filters to see more results.'
                : 'No restaurants are available at the moment.'
              }
            </p>
            {getActiveFiltersCount() > 0 && (
              <button
                onClick={clearFilters}
                className="bg-gradient-to-r from-orange-500 to-yellow-400 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                Clear Filters
              </button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default RestaurantList;