import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import restaurantService from '../services/restaurantService';
import menuService from '../services/menuService';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/helpers';
import { validateRestaurantId, isValidId } from '../utils/validation';
import { RestaurantRouteGuard } from '../components/RouteGuard';
import toast from 'react-hot-toast';
import Cart from '../components/Cart';
import LoadingSpinner from '../components/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Heart, 
  Info, 
  Star, 
  Clock, 
  MapPin, 
  Phone, 
  Utensils, 
  Leaf, 
  Sparkles, 
  ShoppingCart,
  Plus,
  Minus,
  ChefHat,
  Filter,
  X
} from 'lucide-react';

const RestaurantDetailContent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cartItems, getCartItemQuantity, getCartTotal, updateQuantity } = useCart();
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCart, setShowCart] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const categories = [
    { id: 'all', name: 'All Items', icon: '🍽️' },
    { id: 'appetizer', name: 'Appetizers', icon: '🥗' },
    { id: 'main course', name: 'Main Course', icon: '🍛' },
    { id: 'snacks', name: 'Snacks', icon: '🍿' },
    { id: 'beverages', name: 'Beverages', icon: '🥤' },
    { id: 'dessert', name: 'Desserts', icon: '🍰' }
  ];

  useEffect(() => {
    if (id) {
      loadRestaurantData();
    }
  }, [id]);

  // Block body scroll when filter modal is open
  useEffect(() => {
    if (showFilterModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showFilterModal]);

  const loadRestaurantData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Validate restaurant ID first
      const validation = validateRestaurantId(id);
      if (!validation.isValid) {
        setError(validation.error);
        toast.error(validation.error);
        setTimeout(() => navigate('/restaurants', { replace: true }), 2000);
        return;
      }
      
      // Load restaurant details
      const restaurantResponse = await restaurantService.getRestaurantById(id);
      if (restaurantResponse.success && restaurantResponse.data) {
        // Handle nested restaurant data structure
        const restaurantData = restaurantResponse.data.restaurant || restaurantResponse.data;
        setRestaurant(restaurantData);
        
        // If menu items are included in restaurant response, use them
        if (restaurantResponse.data.menuItems) {
          const menuItemsArray = [];
          Object.values(restaurantResponse.data.menuItems).forEach(categoryItems => {
            menuItemsArray.push(...categoryItems);
          });
          setMenuItems(menuItemsArray);
        }
      } else {
        setError('Restaurant not found');
        toast.error('Restaurant not found');
        setTimeout(() => navigate('/restaurants', { replace: true }), 2000);
        return;
      }

      // Load menu items separately if not included in restaurant response
      if (menuItems.length === 0) {
        try {
          const menuResponse = await menuService.getMenuItemsByRestaurant(id);
          if (menuResponse.success && menuResponse.data) {
        // Handle different response structures
            let items = [];
            if (menuResponse.data.menuItems) {
              // If grouped by category, flatten them
              Object.values(menuResponse.data.menuItems).forEach(categoryItems => {
                items.push(...categoryItems);
              });
            } else if (Array.isArray(menuResponse.data.items)) {
              items = menuResponse.data.items;
            } else if (Array.isArray(menuResponse.data)) {
              items = menuResponse.data;
            }
            setMenuItems(items);
          } else {
                setMenuItems([]);
            console.warn('No menu items found for restaurant:', id);
          }
        } catch (menuError) {
          console.warn('Error loading menu items:', menuError);
          setMenuItems([]);
        }
      }

    } catch (error) {
      console.error('Error loading restaurant data:', error);
      setError('Failed to load restaurant data');
      toast.error('Failed to load restaurant data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = (menuItem) => {
    try {
      if (!restaurant || !menuItem) {
        toast.error('Unable to add item to cart');
        return;
      }

      const cartItem = {
        ...menuItem,
        restaurantId: restaurant._id,
        restaurantName: restaurant.name
      };

      addToCart(cartItem);
      toast.success(`${menuItem.name} added to cart`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
    }
  };

  const filteredMenuItems = menuItems.filter(item => {
    if (selectedCategory === 'all') return true;
    return item.category?.toLowerCase() === selectedCategory.toLowerCase();
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-50">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-3xl shadow-xl border-2 border-orange-100 p-8 text-center"
        >
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="w-20 h-20 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Info className="w-10 h-10 text-red-600" />
          </motion.div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent mb-2">
            Restaurant Not Found
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <motion.button 
            onClick={() => navigate('/restaurants')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            Browse Restaurants
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // No restaurant data
  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-50">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-3xl shadow-xl border-2 border-orange-100 p-8 text-center"
        >
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="w-20 h-20 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <ChefHat className="w-10 h-10 text-orange-600" />
          </motion.div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent mb-2">
            Restaurant Not Available
          </h2>
          <p className="text-gray-600 mb-6">This restaurant is currently not available.</p>
          <motion.button 
            onClick={() => navigate('/restaurants')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            Browse Other Restaurants
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-50">
      {/* Banner + Info */}
      <div className="bg-white shadow-md">
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            {/* Hero Image */}
            <div className="w-full h-44 md:h-60 bg-gradient-to-br from-orange-100 to-yellow-100">
              {restaurant.image ? (
                <img src={restaurant.image} alt={restaurant.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full grid place-items-center">
                  <Utensils className="w-16 h-16 text-orange-300" />
                </div>
              )}
            </div>

            {/* Overlay Gradient */}
            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-bold text-white drop-shadow-lg"
              >
                {restaurant.name}
              </motion.h1>
            </div>

            {/* Back Button */}
            <motion.button
              onClick={() => navigate(-1)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute top-4 left-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </motion.button>

            {/* Favorite Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all"
            >
              <Heart className="w-5 h-5 text-orange-500" />
            </motion.button>
          </div>

          {/* Restaurant Info */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="px-4 py-4"
          >
            <p className="text-gray-600 text-sm mb-3">{restaurant.description}</p>
            
            <div className="flex flex-wrap items-center gap-3 text-sm">
              {/* Open Status Badge */}
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-semibold shadow-md"
              >
                <Clock className="w-3.5 h-3.5" />
                Open
              </motion.span>

              {/* Phone */}
              {restaurant.phone && (
                <motion.span 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="inline-flex items-center gap-1.5 text-gray-700"
                >
                  <Phone className="w-4 h-4 text-orange-500" />
                  {restaurant.phone}
                </motion.span>
              )}

              {/* Address */}
              {restaurant.address && (
                <motion.span 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="inline-flex items-center gap-1.5 text-gray-700 truncate"
                >
                  <MapPin className="w-4 h-4 text-orange-500 shrink-0" />
                  <span className="truncate">{restaurant.address}</span>
                </motion.span>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Menu Items (mobile-first card list) */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        {filteredMenuItems.length > 0 ? (
          <div className="space-y-4">
            {filteredMenuItems.map((item, index) => {
              const qty = getCartItemQuantity(item._id);
              return (
                <motion.div 
                  key={item._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.01 }}
                  className="bg-white rounded-3xl shadow-md border-2 border-orange-100 hover:border-orange-300 hover:shadow-lg p-4 flex gap-3 transition-all"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-[15px] font-semibold text-gray-900 truncate flex items-center gap-1.5">
                          {item.isVeg && <Leaf className="w-4 h-4 text-green-600 shrink-0" />}
                          {item.name}
                        </h3>
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                          className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full bg-gradient-to-r from-orange-100 to-yellow-100 border border-orange-200"
                        >
                          <Sparkles className="w-3 h-3 text-orange-600" />
                          <span className="text-xs font-medium text-orange-700">Highly reordered</span>
                        </motion.div>
                      </div>
                    </div>
                    <div className="mt-2 text-[15px] font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">
                      ₹{Number(item.price).toFixed(0)}
                    </div>
                    {item.description && (
                      <p className="mt-1 text-gray-600 text-sm line-clamp-2">{item.description}</p>
                    )}
                    {item.isAvailable === false && (
                      <div className="text-xs text-red-600 mt-2 font-medium">Currently unavailable</div>
                    )}
                  </div>

                  <div className="w-28 shrink-0">
                    <div className="relative w-28 h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-orange-100">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full grid place-items-center">
                          <Utensils className="w-8 h-8 text-orange-300" />
                        </div>
                      )}
                    </div>
                    <div className="mt-2 flex justify-end">
                      {item.isAvailable !== false ? (
                        qty > 0 ? (
                          <motion.div 
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            className="flex items-center bg-gradient-to-r from-orange-500 to-yellow-500 rounded-lg overflow-hidden shadow-md"
                          >
                            <motion.button 
                              onClick={() => getCartItemQuantity(item._id) > 1 ? updateQuantity(item._id, qty - 1) : updateQuantity(item._id, 0)} 
                              whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.2)' }}
                              whileTap={{ scale: 0.9 }}
                              className="w-8 h-8 grid place-items-center text-white font-bold"
                            >
                              <Minus className="w-4 h-4" />
                            </motion.button>
                            <span className="w-8 text-center font-bold text-white">{qty}</span>
                            <motion.button 
                              onClick={() => updateQuantity(item._id, qty + 1)} 
                              whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.2)' }}
                              whileTap={{ scale: 0.9 }}
                              className="w-8 h-8 grid place-items-center text-white font-bold"
                            >
                              <Plus className="w-4 h-4" />
                            </motion.button>
                          </motion.div>
                        ) : (
                          <motion.button 
                            onClick={() => handleAddToCart(item)} 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold shadow-md hover:shadow-lg transition-all"
                          >
                            ADD
                          </motion.button>
                        )
                      ) : (
                        <span className="text-xs text-red-600 font-medium">Not Available</span>
                      )}
                    </div>
                    <div className="text-[11px] text-orange-600 mt-1 text-right font-medium flex items-center justify-end gap-1">
                      <Sparkles className="w-3 h-3" />
                      customisable
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="w-20 h-20 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <ChefHat className="w-10 h-10 text-orange-600" />
            </motion.div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent mb-2">
              No Menu Items
            </h3>
            <p className="text-gray-600">Try selecting a different category</p>
          </motion.div>
        )}
      </div>

      {/* Floating Checkout Button - Shows when cart has items (Mobile Only) */}
      <AnimatePresence>
        {cartItems.length > 0 && (
          <motion.button
            onClick={() => navigate('/cart')}
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            whileTap={{ scale: 0.98 }}
            className="fixed bottom-[60px] left-0 right-0 z-45 bg-gradient-to-r from-[#FF6B35] to-[#FFC857] shadow-lg px-4 py-3 flex items-center justify-between md:hidden"
          >
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="bg-white/20 backdrop-blur-sm rounded-full p-2"
              >
                <ShoppingCart className="w-5 h-5 text-white" />
              </motion.div>
              <div className="text-left">
                <div className="text-xs text-white/90 font-medium">
                  {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
                </div>
                <div className="text-lg font-bold text-white">
                  ₹{getCartTotal().toFixed(0)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-white font-semibold text-sm">
              <span>View Cart</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Floating Filter Button */}
      <motion.button
        onClick={() => setShowFilterModal(true)}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", delay: 0.5 }}
        whileHover={{ 
          scale: 1.1,
          boxShadow: "0 0 25px rgba(255, 107, 53, 0.5)"
        }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-[140px] right-6 sm:bottom-20 sm:right-8 z-40 bg-white/80 backdrop-blur-lg border-2 border-[#FF6B35] shadow-lg rounded-full p-4 group"
      >
        <div className="relative">
          <Filter className="w-6 h-6 text-[#FF6B35]" />
          {selectedCategory !== 'all' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-[#FF6B35] to-[#FFC857] rounded-full border-2 border-white"
            />
          )}
        </div>
      </motion.button>

      {/* Filter Modal/Popover */}
      <AnimatePresence>
        {showFilterModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilterModal(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-lg z-50 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-[#FF6B35] p-6 max-h-[80vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#FF6B35] to-[#FFC857] rounded-full flex items-center justify-center">
                    <Filter className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-[#FF6B35] to-[#FFC857] bg-clip-text text-transparent">
                    Filter Menu
                  </h2>
                </div>
                <motion.button
                  onClick={() => setShowFilterModal(false)}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </motion.button>
              </div>

              {/* Categories Section */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Categories
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {categories.map((category, index) => (
                    <motion.button
                      key={category.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setSelectedCategory(category.id);
                        setShowFilterModal(false);
                      }}
                      className={`relative px-4 py-3 rounded-2xl text-sm font-semibold border-2 transition-all ${
                        selectedCategory === category.id
                          ? 'bg-gradient-to-r from-[#FF6B35] to-[#FFC857] text-white border-[#FF6B35] shadow-lg'
                          : 'bg-white text-gray-700 border-orange-200 hover:border-[#FF6B35] hover:bg-orange-50'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-xl">{category.icon}</span>
                        <span>{category.name}</span>
                      </div>
                      {selectedCategory === category.id && (
                        <motion.div
                          layoutId="activeFilter"
                          className="absolute inset-0 bg-gradient-to-r from-[#FF6B35] to-[#FFC857] rounded-2xl -z-10"
                          transition={{ type: "spring", damping: 20 }}
                        />
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Dietary Preferences Section */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Dietary Preferences
                </h3>
                <div className="space-y-2">
                  <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full px-4 py-3 rounded-2xl text-sm font-semibold bg-white text-gray-700 border-2 border-green-200 hover:border-green-400 hover:bg-green-50 transition-all flex items-center justify-center gap-2"
                  >
                    <Leaf className="w-5 h-5 text-green-600" />
                    <span>Vegetarian Only</span>
                  </motion.button>

                  <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full px-4 py-3 rounded-2xl text-sm font-semibold bg-white text-gray-700 border-2 border-red-200 hover:border-red-400 hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                  >
                    <span className="text-xl">🔴</span>
                    <span>Non-Vegetarian</span>
                  </motion.button>

                  <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full px-4 py-3 rounded-2xl text-sm font-semibold bg-white text-gray-700 border-2 border-yellow-200 hover:border-yellow-400 hover:bg-yellow-50 transition-all flex items-center justify-center gap-2"
                  >
                    <span className="text-xl">🥚</span>
                    <span>Contains Egg</span>
                  </motion.button>
                </div>
              </div>

              {/* Clear Filter Button */}
              {selectedCategory !== 'all' && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedCategory('all');
                    setShowFilterModal(false);
                  }}
                  className="w-full mt-6 px-6 py-3 rounded-full text-sm font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all"
                >
                  Clear All Filters
                </motion.button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Cart Sidebar */}
      {showCart && (
        <Cart isOpen={showCart} onClose={() => setShowCart(false)} />
      )}

      {/* Sticky bottom bar when items in cart - Hidden on mobile, shown on desktop */}
      <AnimatePresence>
        {cartItems.length > 0 && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="hidden sm:fixed sm:inset-x-0 sm:bottom-0 bg-gradient-to-r from-orange-500 to-yellow-500 border-t-4 border-orange-600 p-3 z-50 shadow-2xl"
          >
            <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2, delay: 1 }}
                >
                  <ShoppingCart className="w-6 h-6 text-white" />
                </motion.div>
                <div>
                  <div className="text-xs text-white/90 font-medium">{cartItems.length} items</div>
                  <div className="text-lg font-bold text-white">₹{getCartTotal().toFixed(0)}</div>
                </div>
              </div>
              <motion.button
                onClick={() => navigate('/checkout')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 max-w-xs bg-white text-orange-600 py-3 px-6 rounded-full font-bold shadow-lg hover:shadow-xl transition-all"
              >
                View Cart & Checkout →
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Main component with route guard
const RestaurantDetail = () => {
  return (
    <RestaurantRouteGuard>
      <RestaurantDetailContent />
    </RestaurantRouteGuard>
  );
};

export default RestaurantDetail;