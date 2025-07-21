import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import restaurantService from '../services/restaurantService';
import { createSafeLinkProps } from '../utils/navigation';
import { isValidId } from '../utils/validation';
import toast from 'react-hot-toast';

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

  useEffect(() => {
    loadRestaurants();
  }, [searchParams]);

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
    setSearchParams({});
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(Boolean).length + (searchQuery ? 1 : 0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Restaurants</h1>
              <p className="text-gray-600 mt-1">
                {pagination.totalItems > 0 
                  ? `${pagination.totalItems} restaurant${pagination.totalItems !== 1 ? 's' : ''} available`
                  : `${restaurants.length} restaurant${restaurants.length !== 1 ? 's' : ''} available`
                }
              </p>
            </div>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search restaurants, cuisines..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-10"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                {getActiveFiltersCount() > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Clear all ({getActiveFiltersCount()})
                  </button>
                )}
              </div>

              {/* Sort By */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Cuisine Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cuisine Type
                </label>
                <select
                  value={filters.cuisine}
                  onChange={(e) => handleFilterChange('cuisine', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Cuisines</option>
                  {cuisineTypes.map((cuisine) => (
                    <option key={cuisine} value={cuisine}>
                      {cuisine}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rating Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Rating
                </label>
                <select
                  value={filters.rating}
                  onChange={(e) => handleFilterChange('rating', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Any Rating</option>
                  {ratingOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Delivery Time Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Time
                </label>
                <select
                  value={filters.deliveryTime}
                  onChange={(e) => handleFilterChange('deliveryTime', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Any Time</option>
                  {deliveryTimeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range
                </label>
                <select
                  value={filters.priceRange}
                  onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Any Price</option>
                  {priceRangeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Restaurant Grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="grid-responsive-3">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="w-full h-48 skeleton"></div>
                    <div className="p-4">
                      <div className="h-4 skeleton rounded mb-2"></div>
                      <div className="h-3 skeleton rounded mb-3 w-3/4"></div>
                      <div className="flex justify-between">
                        <div className="h-3 skeleton rounded w-1/4"></div>
                        <div className="h-3 skeleton rounded w-1/4"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : restaurants.length > 0 ? (
              <div className="grid-responsive-3 animate-fade-in">
                {restaurants.map((restaurant, index) => {
                  const linkProps = createSafeLinkProps.restaurant(restaurant._id);
                  
                  return (
                    <Link
                      key={restaurant._id}
                      {...linkProps}
                      className="bg-white rounded-xl shadow-sm hover-lift hover-glow transition-all duration-300 overflow-hidden group border border-gray-100 animate-slide-up"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                    <div className="relative">
                      {restaurant.image ? (
                        <img
                          src={restaurant.image}
                          alt={restaurant.name}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                          <svg className="w-12 h-12 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h6m-6 4h6m-6 4h6" />
                          </svg>
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          restaurant.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {restaurant.isActive ? 'Open' : 'Closed'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                        {restaurant.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {restaurant.description || restaurant.cuisine?.join(', ') || 'Delicious food awaits!'}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm mb-3">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="text-gray-700 font-medium">
                            {restaurant.rating?.toFixed(1) || 'New'}
                          </span>
                          {restaurant.reviewCount && (
                            <span className="text-gray-500 ml-1">
                              ({restaurant.reviewCount})
                            </span>
                          )}
                        </div>
                        <span className="text-gray-500">
                          {restaurant.deliveryTime || '30-45 min'}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          {restaurant.priceRange || '₹₹'}
                        </span>
                        <div className="flex items-center text-primary-600 group-hover:text-primary-700">
                          <span className="text-sm font-medium">View Menu</span>
                          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No restaurants found</h3>
                <p className="text-gray-600 mb-4">
                  {getActiveFiltersCount() > 0 
                    ? 'Try adjusting your filters to see more results.'
                    : 'No restaurants are available at the moment.'
                  }
                </p>
                {getActiveFiltersCount() > 0 && (
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantList;