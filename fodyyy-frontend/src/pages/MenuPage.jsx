import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import menuService from '../services/menuService';
import restaurantService from '../services/restaurantService';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, 
  Search, 
  Star, 
  Clock, 
  Info, 
  Heart,
  Plus,
  Minus,
  X,
  ShoppingCart,
  Utensils,
  Leaf,
  Sparkles,
  ChefHat
} from 'lucide-react';

const MenuPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const restaurantId = searchParams.get('restaurantId');

  const { addToCart, getCartItemQuantity, updateQuantity, cartItems, getCartTotal } = useCart();

  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [restaurant, setRestaurant] = useState(null);

  // UI state
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [vegOnly, setVegOnly] = useState(false);
  const [eggOnly, setEggOnly] = useState(false);
  const [nonVegOnly, setNonVegOnly] = useState(false);

  // Customization modal
  const [customizationModal, setCustomizationModal] = useState(null);
  const [selectedSize, setSelectedSize] = useState('regular');
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [customQuantity, setCustomQuantity] = useState(1);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        
        // Load restaurant details
        if (restaurantId) {
          const restRes = await restaurantService.getRestaurantById(restaurantId);
          if (restRes.success) {
            setRestaurant(restRes.data.restaurant || restRes.data);
          }
        }

        // Load categories
        menuService.getCategories().then((res) => {
          const cats = Array.isArray(res?.data) ? res.data : (res?.data?.categories || []);
          setCategories([{ id: 'all', name: 'All' }, ...cats.map((c) => ({ id: c.toLowerCase(), name: c }))]);
        }).catch(() => setCategories([{ id: 'all', name: 'All' }]));

        // Load menu items
        let res;
        if (restaurantId) {
          res = await menuService.getMenuItemsByRestaurant(restaurantId);
        } else {
          res = await menuService.getMenuItems();
        }

        let list = [];
        const data = res?.data || res;
        if (Array.isArray(data)) list = data;
        else if (Array.isArray(data?.items)) list = data.items;
        else if (data?.menuItems && typeof data.menuItems === 'object') {
          Object.values(data.menuItems).forEach((arr) => { if (Array.isArray(arr)) list.push(...arr); });
        }

        setItems(list);
      } catch (e) {
        console.error('Failed to load menu:', e);
        toast.error('Failed to load menu');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [restaurantId]);

  const filteredItems = useMemo(() => {
    let list = items;
    if (activeCategory !== 'all') {
      list = list.filter((i) => i.category?.toLowerCase() === activeCategory);
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((i) => i.name?.toLowerCase().includes(q) || i.description?.toLowerCase().includes(q));
    }
    if (vegOnly) list = list.filter((i) => i.isVegetarian === true);
    if (eggOnly) list = list.filter((i) => i.isEgg === true);
    if (nonVegOnly) list = list.filter((i) => i.isVegetarian === false);
    return list;
  }, [items, activeCategory, query, vegOnly, eggOnly, nonVegOnly]);

  const canAddToCart = (item) => {
    return Boolean(restaurantId || item.restaurantId || item.restaurant?._id);
  };

  const handleAdd = (item) => {
    if (!canAddToCart(item)) {
      toast.error('Open a restaurant to add items');
      return;
    }

    const normalizedId = item._id || item.id;
    const rId = restaurantId || item.restaurantId || item.restaurant?._id;
    const rName = item.restaurantName || item.restaurant?.name || 'Restaurant';
    addToCart({ ...item, _id: normalizedId, restaurantId: rId, restaurantName: rName }, 1);
    
    // Flying animation effect
    toast.success(`${item.name} added to cart! 🎉`, {
      icon: '🛒',
      duration: 2000
    });
  };

  const openCustomization = (item) => {
    setCustomizationModal(item);
    setSelectedSize('regular');
    setSelectedAddons([]);
    setSpecialInstructions('');
    setCustomQuantity(1);
  };

  const closeCustomization = () => {
    setCustomizationModal(null);
  };

  const handleCustomAdd = () => {
    if (!customizationModal) return;
    
    const item = customizationModal;
    const normalizedId = item._id || item.id;
    const rId = restaurantId || item.restaurantId || item.restaurant?._id;
    const rName = item.restaurantName || item.restaurant?.name || 'Restaurant';
    
    // Calculate price with addons
    let totalPrice = item.price;
    selectedAddons.forEach(addon => {
      totalPrice += addon.price || 0;
    });
    
    addToCart({
      ...item,
      _id: normalizedId,
      restaurantId: rId,
      restaurantName: rName,
      customization: {
        size: selectedSize,
        addons: selectedAddons,
        instructions: specialInstructions
      },
      price: totalPrice
    }, customQuantity);
    
    toast.success(`${item.name} added to cart! 🎉`, {
      icon: '🛒',
      duration: 2000
    });
    
    closeCustomization();
  };

  const qtyOf = (id) => getCartItemQuantity(id);

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
          <p className="text-gray-700 font-medium">Loading menu...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8F0] via-orange-50 to-[#FFC857]">
      {/* Hero Section */}
      {restaurant && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative h-[400px] overflow-hidden"
        >
          {/* Background Image */}
          <div className="absolute inset-0">
            {restaurant.image ? (
              <img
                src={restaurant.image}
                alt={restaurant.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-orange-500 to-yellow-400" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
          </div>

          {/* Content */}
          <div className="relative h-full container mx-auto px-4 flex flex-col justify-between py-6">
            {/* Top Bar */}
            <div className="flex items-center justify-between">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => navigate(-1)}
                className="p-3 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition-all shadow-lg"
              >
                <ArrowLeft className="w-6 h-6" />
              </motion.button>
              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-3 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition-all shadow-lg"
                >
                  <Heart className="w-6 h-6" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-3 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition-all shadow-lg"
                >
                  <Info className="w-6 h-6" />
                </motion.button>
              </div>
            </div>

            {/* Restaurant Info */}
            <div className="text-white">
              {restaurant.logo && (
                <img
                  src={restaurant.logo}
                  alt={restaurant.name}
                  className="w-20 h-20 rounded-2xl border-4 border-white mb-4 shadow-xl"
                />
              )}
              <h1 className="text-5xl font-bold mb-3">{restaurant.name}</h1>
              <p className="text-xl text-white/90 mb-4">{restaurant.cuisine?.join(', ')}</p>
              <div className="flex items-center gap-6 text-white/90">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <span className="font-semibold">{restaurant.rating?.toFixed(1) || 'New'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>{restaurant.deliveryTime || '30-40'} min</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Sticky Search & Category Tabs */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-lg shadow-md">
        <div className="container mx-auto px-4 py-4">
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for dishes..."
              className="w-full pl-12 pr-4 py-3 rounded-full bg-white border-2 border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 shadow-sm transition-all"
            />
          </div>

          {/* Category Pills */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {categories.map((c) => (
              <motion.button
                key={c.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveCategory(c.id)}
                className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                  activeCategory === c.id
                    ? 'bg-gradient-to-r from-orange-500 to-yellow-400 text-white shadow-lg border-2 border-orange-600'
                    : 'bg-orange-50 text-orange-600 hover:bg-orange-100 border-2 border-orange-200'
                }`}
              >
                {c.name}
              </motion.button>
            ))}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setVegOnly((v) => !v)}
              className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-1 ${
                vegOnly ? 'bg-green-500 text-white shadow-lg border-2 border-green-600' : 'bg-green-50 text-green-600 hover:bg-green-100 border-2 border-green-200'
              }`}
            >
              <Leaf className="w-4 h-4" />
              Veg
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setNonVegOnly((v) => !v)}
              className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                nonVegOnly ? 'bg-red-500 text-white shadow-lg border-2 border-red-600' : 'bg-red-50 text-red-600 hover:bg-red-100 border-2 border-red-200'
              }`}
            >
              🔴 Non-Veg
            </motion.button>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-6"
        >
          <Sparkles className="w-8 h-8 text-orange-500" />
          <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-yellow-500 bg-clip-text text-transparent">
            Recommended for you
          </h2>
        </motion.div>

        {filteredItems.length ? (
          <div className="space-y-6">
            {filteredItems.map((item, index) => {
              const normalizedId = item._id || item.id;
              const qty = qtyOf(normalizedId);
              
              return (
                <motion.div
                  key={normalizedId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.01 }}
                  className="bg-white rounded-3xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 border-2 border-orange-100 hover:border-orange-300"
                >
                  <div className="flex gap-6 justify-between">
                    {/* Left: Item Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3 mb-2">
                        {/* Veg/Non-Veg Indicator */}
                        {item.isVegetarian !== undefined && (
                          <div className={`w-5 h-5 border-2 flex items-center justify-center rounded ${
                            item.isVegetarian ? 'border-green-500' : 'border-red-500'
                          }`}>
                            <div className={`w-2.5 h-2.5 rounded-full ${
                              item.isVegetarian ? 'bg-green-500' : 'bg-red-500'
                            }`}></div>
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-xl font-bold text-gray-900">{item.name}</h3>
                            {item.isVegetarian && (
                              <Leaf className="w-4 h-4 text-green-500" />
                            )}
                          </div>
                          {item.isBestseller && (
                            <span className="inline-block mt-1 px-3 py-1 bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-600 text-xs font-semibold rounded-full border border-orange-200">
                              ⭐ Bestseller
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {item.description && (
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
                      )}
                      
                      <div className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent mb-2">
                        ₹{Number(item.price || 0).toFixed(0)}
                      </div>

                      {item.isAvailable === false && (
                        <div className="text-sm text-red-600 font-medium">Currently unavailable</div>
                      )}
                    </div>

                    {/* Right: Image & Add Button */}
                    <div className="w-40 flex-shrink-0">
                      <div className="relative w-40 h-40 rounded-2xl overflow-hidden bg-gradient-to-br from-orange-50 to-yellow-50 mb-3 border-2 border-orange-100">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full grid place-items-center text-orange-300">
                            <Utensils className="w-12 h-12" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex justify-center">
                        {item.isAvailable === false ? (
                          <span className="text-sm text-red-600 font-medium">Not Available</span>
                        ) : qty > 0 ? (
                          <motion.div 
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            className="flex items-center bg-gradient-to-r from-orange-500 to-yellow-400 rounded-full overflow-hidden shadow-lg"
                          >
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => updateQuantity(normalizedId, Math.max(0, qty - 1))}
                              className="w-10 h-10 grid place-items-center text-white font-bold hover:bg-white/20 transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </motion.button>
                            <span className="w-10 text-center font-bold text-white">{qty}</span>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => updateQuantity(normalizedId, qty + 1)}
                              className="w-10 h-10 grid place-items-center text-white font-bold hover:bg-white/20 transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </motion.button>
                          </motion.div>
                        ) : (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleAdd(item)}
                            disabled={!canAddToCart(item)}
                            className="px-6 py-3 rounded-full bg-gradient-to-r from-orange-500 to-yellow-400 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            <Plus className="w-4 h-4" />
                            ADD
                          </motion.button>
                        )}
                      </div>
                      
                      {item.customizable && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => openCustomization(item)}
                          className="w-full mt-2 px-3 py-1.5 text-xs text-orange-600 font-semibold bg-orange-50 rounded-full border border-orange-200 hover:bg-orange-100 transition-colors"
                        >
                          ✨ Customizable
                        </motion.button>
                      )}
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
            className="text-center py-16 bg-white rounded-3xl shadow-xl border-2 border-orange-100"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-orange-100 to-yellow-100 flex items-center justify-center"
            >
              <ChefHat className="w-12 h-12 text-orange-500" />
            </motion.div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No menu items found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your filters or search terms</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setQuery('');
                setActiveCategory('all');
                setVegOnly(false);
                setNonVegOnly(false);
              }}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-yellow-400 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all"
            >
              Clear All Filters
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* Sticky Bottom Cart Bar */}
      <AnimatePresence>
        {cartItems.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed inset-x-0 bottom-0 bg-gradient-to-r from-orange-500 to-yellow-400 p-4 z-50 shadow-2xl border-t-4 border-orange-600"
          >
            <div className="container mx-auto flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-white">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                >
                  <ShoppingCart className="w-6 h-6" />
                </motion.div>
                <div>
                  <div className="text-sm font-medium">{cartItems.length} item{cartItems.length !== 1 ? 's' : ''}</div>
                  <div className="text-2xl font-bold">₹{getCartTotal().toFixed(0)}</div>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/checkout')}
                className="bg-white text-orange-600 px-8 py-4 rounded-full font-bold shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                View Cart & Checkout →
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Customization Modal */}
      <AnimatePresence>
        {customizationModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4"
            onClick={closeCustomization}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-hidden shadow-2xl border-2 border-orange-100"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-orange-500 to-yellow-400 p-6 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                    <Utensils className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">{customizationModal.name}</h3>
                    <p className="text-white/90 font-bold text-xl mt-1">₹{customizationModal.price}</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ rotate: 90 }}
                  onClick={closeCustomization}
                  className="p-2 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 transition-colors text-white"
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </div>

              {/* Scrollable Content */}
              <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)]">

              {/* Image */}
              {customizationModal.image && (
                <img
                  src={customizationModal.image}
                  alt={customizationModal.name}
                  className="w-full h-48 object-cover rounded-2xl mb-6 border-2 border-orange-100"
                />
              )}

              {/* Size Options */}
              <div className="mb-6">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-orange-500" />
                  Size
                </h4>
                <div className="space-y-2">
                  {['Regular', 'Large', 'Extra Large'].map((size) => (
                    <motion.button
                      key={size}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedSize(size.toLowerCase())}
                      className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
                        selectedSize === size.toLowerCase()
                          ? 'border-orange-500 bg-gradient-to-r from-orange-50 to-yellow-50 shadow-md'
                          : 'border-orange-200 hover:border-orange-300 hover:bg-orange-50/50'
                      }`}
                    >
                      <div className="font-semibold">{size}</div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Special Instructions */}
              <div className="mb-6">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-orange-500" />
                  Special Instructions
                </h4>
                <textarea
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="Any special requests? (e.g., less spicy, no onions)"
                  className="w-full p-4 rounded-2xl border-2 border-orange-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none resize-none transition-all"
                  rows={3}
                />
              </div>

              {/* Quantity Selector */}
              <div className="mb-6">
                <h4 className="font-bold text-gray-900 mb-3">Quantity</h4>
                <div className="flex items-center gap-4">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setCustomQuantity(Math.max(1, customQuantity - 1))}
                    className="w-12 h-12 rounded-full bg-orange-100 hover:bg-orange-200 flex items-center justify-center text-orange-600 transition-colors"
                  >
                    <Minus className="w-5 h-5" />
                  </motion.button>
                  <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent min-w-[3rem] text-center">{customQuantity}</span>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setCustomQuantity(customQuantity + 1)}
                    className="w-12 h-12 rounded-full bg-orange-100 hover:bg-orange-200 flex items-center justify-center text-orange-600 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
              </div>

              {/* Add to Cart Button */}
              <div className="p-6 border-t-2 border-orange-100">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCustomAdd}
                  className="w-full bg-gradient-to-r from-orange-500 to-yellow-400 text-white py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart - ₹{(customizationModal.price * customQuantity).toFixed(0)}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer for bottom bar */}
      {cartItems.length > 0 && <div className="h-24" />}
    </div>
  );
};

export default MenuPage;