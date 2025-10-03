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
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  EyeOff,
  Image as ImageIcon,
  X,
  Check,
  AlertTriangle,
  Search,
  ChefHat,
  Utensils,
  Coffee,
  Cake,
  Filter,
  Leaf
} from 'lucide-react';

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
    <div className="flex justify-center items-center py-12">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full"
      />
    </div>
  );

  // Empty state component
  const EmptyState = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="text-center py-16 bg-white rounded-3xl shadow-xl border-2 border-orange-100"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-orange-100 to-yellow-100 mb-6"
      >
        <ChefHat className="w-10 h-10 text-orange-500" />
      </motion.div>
      <h3 className="text-2xl font-bold text-gray-900 mb-2">No menu items yet</h3>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        Get started by creating your first delicious menu item and showcase your culinary offerings!
      </p>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleAddItem}
        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-yellow-400 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all"
      >
        <Plus className="w-5 h-5" />
        Add Your First Menu Item
      </motion.button>
    </motion.div>
  );

  // Delete confirmation modal
  const DeleteConfirmModal = ({ item, onConfirm, onCancel }) => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border-2 border-red-100 p-8"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4"
          >
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </motion.div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Delete Menu Item?</h3>
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete <span className="font-semibold text-gray-900">"{item.name}"</span>? This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onCancel}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-full hover:bg-gray-200 transition-colors"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onConfirm(item._id)}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-full hover:shadow-lg transition-all"
            >
              Delete
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-white">
      {/* Premium Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-orange-500 to-yellow-400 rounded-b-[3rem] shadow-2xl mb-8"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-3">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center"
                >
                  <ChefHat className="w-8 h-8 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-4xl font-bold text-white">Menu Management</h1>
                  <p className="text-white/90 text-lg mt-1">
                    Craft and manage your culinary masterpieces
                  </p>
                </div>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddItem}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-orange-600 font-semibold rounded-full shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="w-5 h-5" />
              Add Menu Item
            </motion.button>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">

      {/* Premium Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8 flex flex-col sm:flex-row gap-4"
      >
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-400" />
          <input
            type="text"
            placeholder="Search your delicious menu items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border-2 border-orange-200 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-400 pointer-events-none" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="pl-12 pr-8 py-3 bg-white border-2 border-orange-200 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 appearance-none cursor-pointer font-medium text-gray-700 min-w-[200px]"
          >
            <option value="all">🍽️ All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'Breakfast' ? '🌅' : 
                 category === 'Lunch' ? '🍱' :
                 category === 'Dinner' ? '🍽️' :
                 category === 'Snacks' ? '🍿' :
                 category === 'Beverages' ? '☕' : '🍰'} {category}
              </option>
            ))}
          </select>
        </div>
      </motion.div>

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
        /* Premium Menu Items Grid */
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              className="bg-white overflow-hidden rounded-3xl shadow-xl border-2 border-orange-100 hover:border-orange-300 transition-all"
            >
              {/* Item Image */}
              <div className="h-48 relative overflow-hidden">
                <ImageDisplay
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  fallbackClassName="w-full h-full"
                  iconSize="h-12 w-12"
                />
                
                {/* Availability Badge */}
                <div className="absolute top-3 right-3">
                  <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm ${
                    item.isAvailable 
                      ? 'bg-green-500/90 text-white' 
                      : 'bg-red-500/90 text-white'
                  }`}>
                    {item.isAvailable ? (
                      <>
                        <Eye className="w-3 h-3" />
                        Available
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3 h-3" />
                        Unavailable
                      </>
                    )}
                  </span>
                </div>

                {/* Vegetarian Badge */}
                {item.isVegetarian && (
                  <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-green-500/90 text-white backdrop-blur-sm">
                      <Leaf className="w-3 h-3" />
                      Veg
                    </span>
                  </div>
                )}
              </div>

              {/* Item Details */}
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-bold text-gray-900 flex-1 line-clamp-1">
                    {item.name}
                  </h3>
                  <p className="text-xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent ml-2">
                    {formatCurrency(item.price)}
                  </p>
                </div>
                
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                  {item.description}
                </p>
                
                <div className="mb-4">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 border border-orange-200">
                    <Utensils className="w-3 h-3" />
                    {item.category}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleEditItem(item)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-100 text-orange-700 font-semibold rounded-full hover:bg-orange-200 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setDeleteConfirm(item)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-100 text-red-700 font-semibold rounded-full hover:bg-red-200 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleToggleAvailability(item._id, item.isAvailable)}
                    className={`px-4 py-2.5 font-semibold rounded-full transition-colors ${
                      item.isAvailable
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {item.isAvailable ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Premium Add/Edit Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border-2 border-orange-100"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-orange-500 to-yellow-400 rounded-t-3xl px-8 py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <ChefHat className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">
                      {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
                    </h3>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      setShowAddModal(false);
                      resetForm();
                      setEditingItem(null);
                    }}
                    className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </motion.button>
                </div>
              </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Item Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`block w-full px-4 py-3 border-2 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all ${
                    formErrors.name ? 'border-red-300 bg-red-50' : 'border-orange-200 focus:border-orange-500'
                  }`}
                  placeholder="e.g., Margherita Pizza"
                />
                {formErrors.name && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" />
                    {formErrors.name}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className={`block w-full px-4 py-3 border-2 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all resize-none ${
                    formErrors.description ? 'border-red-300 bg-red-50' : 'border-orange-200 focus:border-orange-500'
                  }`}
                  placeholder="Describe your delicious dish..."
                />
                {formErrors.description && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" />
                    {formErrors.description}
                  </p>
                )}
              </div>

              {/* Price and Category Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Price */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Price ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    className={`block w-full px-4 py-3 border-2 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all ${
                      formErrors.price ? 'border-red-300 bg-red-50' : 'border-orange-200 focus:border-orange-500'
                    }`}
                    placeholder="0.00"
                  />
                  {formErrors.price && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" />
                      {formErrors.price}
                    </p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className={`block w-full px-4 py-3 border-2 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all cursor-pointer ${
                      formErrors.category ? 'border-red-300 bg-red-50' : 'border-orange-200 focus:border-orange-500'
                    }`}
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category === 'Breakfast' ? '🌅' : 
                         category === 'Lunch' ? '🍱' :
                         category === 'Dinner' ? '🍽️' :
                         category === 'Snacks' ? '🍿' :
                         category === 'Beverages' ? '☕' : '🍰'} {category}
                      </option>
                    ))}
                  </select>
                  {formErrors.category && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" />
                      {formErrors.category}
                    </p>
                  )}
                </div>
              </div>

              {/* Image */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Menu Item Image
                </label>
                <div className="border-2 border-orange-200 rounded-2xl p-4 bg-orange-50/30">
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
                </div>
                {formErrors.image && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" />
                    {formErrors.image}
                  </p>
                )}
              </div>

              {/* Checkboxes */}
              <div className="flex gap-4">
                <label className="flex items-center gap-3 px-4 py-3 bg-green-50 border-2 border-green-200 rounded-2xl cursor-pointer hover:bg-green-100 transition-colors flex-1">
                  <input
                    type="checkbox"
                    id="isVegetarian"
                    checked={formData.isVegetarian}
                    onChange={(e) => handleInputChange('isVegetarian', e.target.checked)}
                    className="w-5 h-5 text-green-600 focus:ring-2 focus:ring-green-500 border-green-300 rounded"
                  />
                  <div className="flex items-center gap-2">
                    <Leaf className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-gray-700">Vegetarian</span>
                  </div>
                </label>
                
                <label className="flex items-center gap-3 px-4 py-3 bg-blue-50 border-2 border-blue-200 rounded-2xl cursor-pointer hover:bg-blue-100 transition-colors flex-1">
                  <input
                    type="checkbox"
                    id="isAvailable"
                    checked={formData.isAvailable}
                    onChange={(e) => handleInputChange('isAvailable', e.target.checked)}
                    className="w-5 h-5 text-blue-600 focus:ring-2 focus:ring-blue-500 border-blue-300 rounded"
                  />
                  <div className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-gray-700">Available</span>
                  </div>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-6 border-t-2 border-orange-100">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                    setEditingItem(null);
                  }}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-full hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                  whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-yellow-400 text-white font-semibold rounded-full hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                      {editingItem ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      {editingItem ? 'Update Item' : 'Create Item'}
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <DeleteConfirmModal
            item={deleteConfirm}
            onConfirm={handleDeleteItem}
            onCancel={() => setDeleteConfirm(null)}
          />
        )}
      </AnimatePresence>
      
      </div>
    </div>
  );
};

export default MenuManagement;