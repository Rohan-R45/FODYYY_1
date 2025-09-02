import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRestaurant } from '../context/RestaurantContext';
import menuService from '../services/menuService';
import { formatCurrency } from '../utils/helpers';
import { filterValidItems } from '../utils/validation';
import RestaurantSetup from '../components/RestaurantSetup';
import ImageInput from '../components/ImageInput';
import ImageDisplay from '../components/ImageDisplay';
import toast from 'react-hot-toast';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  EyeIcon, 
  EyeSlashIcon,
  PhotoIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const MenuManagement = () => {
  const navigate = useNavigate();
  const { restaurant, restaurantId, isLoading: restaurantLoading, requiresSetup, refreshRestaurant } = useRestaurant();
  
  // State management
  const [menuItems, setMenuItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Snacks',
    image: '',
    isVegetarian: false,
    isAvailable: true
  });

  const [formErrors, setFormErrors] = useState({});

  // Categories for dropdown
  const categories = ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Beverages', 'Desserts'];

  useEffect(() => {
    // Only load menu items if we have a valid restaurant
    if (restaurantId && !requiresSetup) {
      // Validate restaurant ID format before making API calls
      if (typeof restaurantId === 'string' && restaurantId.length === 24 && /^[0-9a-fA-F]{24}$/.test(restaurantId)) {
        loadMenuItems();
      } else {
        console.error('Invalid restaurant ID format in MenuManagement:', restaurantId);
        toast.error('Invalid restaurant ID. Please refresh the page or complete restaurant setup.');
        setIsLoading(false);
      }
    } else if (requiresSetup) {
      console.log('Restaurant setup required, skipping menu loading');
      setIsLoading(false);
    } else {
      console.log('No restaurant ID available, skipping menu loading');
      setIsLoading(false);
    }
  }, [restaurantId, requiresSetup]);

  // Load menu items from API
  const loadMenuItems = async () => {
    try {
      setIsLoading(true);
      console.log('🍽️ Loading menu items...');
      console.log('Restaurant ID:', restaurantId);
      
      const response = await menuService.getMenuItems();
      console.log('🍽️ Menu items response:', response);
      
      if (response.success) {
        console.log('🔍 Raw response data:', response.data);
        
        // Handle different response formats safely
        let rawItems = [];
        if (response.data && response.data.items && Array.isArray(response.data.items)) {
          rawItems = response.data.items;
        } else if (response.data && Array.isArray(response.data)) {
          rawItems = response.data;
        } else if (response.data && response.data.menuItems && Array.isArray(response.data.menuItems)) {
          rawItems = response.data.menuItems;
        } else {
          console.warn('Unexpected response format:', response.data);
          rawItems = [];
        }
        
        console.log('📋 Raw items array:', rawItems, 'Length:', rawItems.length);
        
        // Ensure rawItems is an array before filtering
        if (!Array.isArray(rawItems)) {
          console.error('rawItems is not an array:', typeof rawItems, rawItems);
          rawItems = [];
        }
        
        // Filter out menu items with invalid IDs to prevent "invalid menu item ID format" errors
        const validItems = filterValidItems(rawItems);
        
        if (validItems.length !== rawItems.length) {
          console.warn(`Filtered out ${rawItems.length - validItems.length} menu items with invalid IDs`);
        }
        
        console.log('✅ Setting valid menu items:', validItems.length);
        setMenuItems(validItems);
      } else {
        console.warn('Failed to load menu items:', response.message);
        if (response.message?.includes('Restaurant profile not found')) {
          toast.error('Please complete your restaurant profile setup first');
        } else {
          toast.error('Failed to load menu items');
        }
        setMenuItems([]);
      }
    } catch (error) {
      console.error('Error loading menu items:', error);
      const errorMessage = error.response?.data?.message || error.message;
      
      if (errorMessage?.includes('Restaurant profile not found')) {
        toast.error('Please complete your restaurant profile setup first');
      } else if (error.response?.status === 401) {
        toast.error('Authentication failed. Please login again.');
      } else {
        toast.error('Failed to load menu items. Please try again.');
      }
      setMenuItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Form validation
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      errors.description = 'Description must be at least 10 characters';
    }
    
    if (!formData.price) {
      errors.price = 'Price is required';
    } else {
      const price = parseFloat(formData.price);
      if (isNaN(price) || price <= 0) {
        errors.price = 'Price must be a positive number';
      } else if (price > 10000) {
        errors.price = 'Price cannot exceed $10,000';
      }
    }
    
    if (!formData.category) {
      errors.category = 'Category is required';
    }

    // Validate image URL if provided
    if (formData.image && formData.image.trim()) {
      const isValidUrl = (string) => {
        try {
          const url = new URL(string);
          return url.protocol === 'http:' || url.protocol === 'https:';
        } catch (_) {
          return false;
        }
      };

      const isValidImageUrl = (url) => {
        if (!isValidUrl(url)) return false;
        const imageExtensions = /\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?.*)?$/i;
        return imageExtensions.test(url) || url.includes('cloudinary') || url.includes('imgur') || url.includes('unsplash');
      };

      if (!isValidImageUrl(formData.image.trim())) {
        errors.image = 'Please enter a valid image URL';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: 'Snacks',
      image: '',
      isVegetarian: false,
      isAvailable: true
    });
    setFormErrors({});
  };

  // Handle add new item
  const handleAddItem = () => {
    resetForm();
    setEditingItem(null);
    setShowAddModal(true);
  };

  // Handle edit item
  const handleEditItem = (item) => {
    setFormData({
      name: item.name || '',
      description: item.description || '',
      price: item.price?.toString() || '',
      category: item.category || 'Snacks',
      image: item.image || '',
      isVegetarian: Boolean(item.isVegetarian),
      isAvailable: Boolean(item.isAvailable)
    });
    setFormErrors({});
    setEditingItem(item);
    setShowAddModal(true);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Prepare data with proper types
      const submitData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        category: formData.category,
        image: formData.image.trim() || '',
        isVegetarian: Boolean(formData.isVegetarian),
        isAvailable: Boolean(formData.isAvailable)
      };
      
      console.log('🍽️ Submitting menu item:', submitData);
      
      let response;
      if (editingItem) {
        response = await menuService.updateMenuItem(editingItem._id, submitData);
      } else {
        response = await menuService.createMenuItem(submitData);
      }
      
      if (response.success) {
        toast.success(`Menu item ${editingItem ? 'updated' : 'created'} successfully!`);
        setShowAddModal(false);
        resetForm();
        setEditingItem(null);
        await loadMenuItems(); // Refresh the list
      } else {
        console.error('Menu item operation failed:', response);
        
        // Handle validation errors
        if (response.errors && Array.isArray(response.errors)) {
          console.log('📋 Validation errors from server:', response.errors);
          const errorMessages = response.errors.map(err => `${err.field}: ${err.message}`).join(', ');
          toast.error(`Validation failed: ${errorMessages}`);
          
          // Set form errors
          const newFormErrors = {};
          response.errors.forEach(err => {
            newFormErrors[err.field] = err.message;
          });
          setFormErrors(newFormErrors);
        } else {
          console.log('❌ Menu item operation failed:', response.message);
          toast.error(response.message || `Failed to ${editingItem ? 'update' : 'create'} menu item`);
        }
      }
    } catch (error) {
      console.error('Error submitting menu item:', error);
      
      // Handle different types of errors
      if (error.response?.status === 401) {
        toast.error('Authentication failed. Please login again.');
      } else if (error.response?.status === 404 && error.response?.data?.message?.includes('Restaurant profile')) {
        toast.error('Please complete your restaurant profile setup first');
      } else if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        const errorMessages = error.response.data.errors.map(err => `${err.field}: ${err.message}`).join(', ');
        toast.error(`Validation failed: ${errorMessages}`);
        
        // Set form errors
        const newFormErrors = {};
        error.response.data.errors.forEach(err => {
          newFormErrors[err.field] = err.message;
        });
        setFormErrors(newFormErrors);
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(`Failed to ${editingItem ? 'update' : 'create'} menu item. Please try again.`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete item
  const handleDeleteItem = async (itemId) => {
    try {
      setIsLoading(true);
      console.log('🗑️ Deleting menu item:', itemId);
      
      const response = await menuService.deleteMenuItem(itemId);
      
      if (response.success) {
        toast.success('Menu item deleted successfully!');
        setMenuItems(prev => prev.filter(item => item._id !== itemId));
      } else {
        toast.error(response.message || 'Failed to delete menu item');
      }
    } catch (error) {
      console.error('Error deleting menu item:', error);
      
      if (error.response?.status === 401) {
        toast.error('Authentication failed. Please login again.');
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to delete menu item. Please try again.');
      }
    } finally {
      setIsLoading(false);
      setDeleteConfirm(null);
    }
  };

  // Handle toggle availability
  const handleToggleAvailability = async (itemId, currentStatus) => {
    try {
      console.log('🔄 Toggling availability for item:', itemId, 'Current:', currentStatus);

      // Optimistic UI update for snappy UX
      setMenuItems(prev => prev.map(item =>
        item._id === itemId ? { ...item, isAvailable: !currentStatus } : item
      ));

      const response = await menuService.toggleAvailability(itemId);

      if (!response.success) {
        // Revert on failure
        setMenuItems(prev => prev.map(item =>
          item._id === itemId ? { ...item, isAvailable: currentStatus } : item
        ));
        toast.error(response.message || 'Failed to update item availability');
        return;
      }

      toast.success(`Item ${!currentStatus ? 'enabled' : 'disabled'} successfully!`);
    } catch (error) {
      console.error('Error toggling availability:', error);
      // Revert on error
      setMenuItems(prev => prev.map(item =>
        item._id === itemId ? { ...item, isAvailable: currentStatus } : item
      ));

      if (error.response?.status === 401) {
        toast.error('Authentication failed. Please login again.');
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to update item availability. Please try again.');
      }
    }
  };

  // Filter menu items based on search and category
  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Show restaurant setup if required
  if (requiresSetup) {
    return <RestaurantSetup />;
  }

  // Loading spinner component
  const LoadingSpinner = () => (
    <div className="flex justify-center items-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );

  // Empty state component
  const EmptyState = () => (
    <div className="text-center py-12">
      <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-sm font-medium text-gray-900">No menu items</h3>
      <p className="mt-1 text-sm text-gray-500">
        Get started by creating your first menu item.
      </p>
      <div className="mt-6">
        <button
          onClick={handleAddItem}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
          Add Menu Item
        </button>
      </div>
    </div>
  );

  // Delete confirmation modal
  const DeleteConfirmModal = ({ item, onConfirm, onCancel }) => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3 text-center">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-600" />
          <h3 className="text-lg font-medium text-gray-900 mt-2">Delete Menu Item</h3>
          <div className="mt-2 px-7 py-3">
            <p className="text-sm text-gray-500">
              Are you sure you want to delete "{item.name}"? This action cannot be undone.
            </p>
          </div>
          <div className="flex justify-center space-x-4 mt-4">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm(item._id)}
              className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Menu Management
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage your restaurant's menu items
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            onClick={handleAddItem}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Add Menu Item
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <LoadingSpinner />
      ) : filteredItems.length === 0 ? (
        searchTerm || selectedCategory !== 'all' ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No menu items match your search criteria.</p>
          </div>
        ) : (
          <EmptyState />
        )
      ) : (
        /* Menu Items Grid */
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <div key={item._id} className="bg-white overflow-hidden shadow rounded-lg">
              {/* Item Image */}
              <div className="h-48 relative">
                <ImageDisplay
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full"
                  fallbackClassName="w-full h-full"
                  iconSize="h-12 w-12"
                />
                
                {/* Availability Badge */}
                <div className="absolute top-2 right-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    item.isAvailable 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {item.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              </div>

              {/* Item Details */}
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900 truncate">
                    {item.name}
                  </h3>
                  <p className="text-lg font-bold text-green-600">
                    {formatCurrency(item.price)}
                  </p>
                </div>
                
                <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                  {item.description}
                </p>
                
                <div className="mt-2 flex items-center justify-between">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {item.category}
                  </span>
                  
                  {item.isVegetarian && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Vegetarian
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="mt-4 flex justify-between">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditItem(item)}
                      className="inline-flex items-center p-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    
                    <button
                      onClick={() => setDeleteConfirm(item)}
                      className="inline-flex items-center p-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <button
                    onClick={() => handleToggleAvailability(item._id, item.isAvailable)}
                    className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      item.isAvailable
                        ? 'text-red-700 bg-red-100 hover:bg-red-200 focus:ring-red-500'
                        : 'text-green-700 bg-green-100 hover:bg-green-200 focus:ring-green-500'
                    }`}
                  >
                    {item.isAvailable ? (
                      <>
                        <EyeSlashIcon className="h-4 w-4 mr-1" />
                        Disable
                      </>
                    ) : (
                      <>
                        <EyeIcon className="h-4 w-4 mr-1" />
                        Enable
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                  setEditingItem(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                    formErrors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter item name"
                />
                {formErrors.name && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                    formErrors.description ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter item description"
                />
                {formErrors.description && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
                )}
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Price ($) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                    formErrors.price ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
                {formErrors.price && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.price}</p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                    formErrors.category ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                {formErrors.category && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.category}</p>
                )}
              </div>

              {/* Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Menu Item Image
                </label>
                <ImageInput
                  value={formData.image}
                  onChange={(value) => handleInputChange('image', value)}
                  placeholder="Enter menu item image URL"
                  previewSize="w-24 h-24"
                  uploadText="Upload"
                  urlText="URL"
                  supportedFormats="PNG, JPG, JPEG, WebP"
                  maxSize="5MB"
                  showPreview={true}
                  error={formErrors.image}
                />
                {formErrors.image && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.image}</p>
                )}
              </div>

              {/* Checkboxes */}
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isVegetarian"
                    checked={formData.isVegetarian}
                    onChange={(e) => handleInputChange('isVegetarian', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isVegetarian" className="ml-2 block text-sm text-gray-900">
                    Vegetarian
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isAvailable"
                    checked={formData.isAvailable}
                    onChange={(e) => handleInputChange('isAvailable', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isAvailable" className="ml-2 block text-sm text-gray-900">
                    Available
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                    setEditingItem(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {editingItem ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <CheckIcon className="h-4 w-4 mr-2" />
                      {editingItem ? 'Update Item' : 'Create Item'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <DeleteConfirmModal
          item={deleteConfirm}
          onConfirm={handleDeleteItem}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
};

export default MenuManagement;