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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Restaurant Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => navigate('/restaurants')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Restaurants
          </button>
        </div>
      </div>
    );
  }

  // No restaurant data
  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0h2M7 7h10M7 11h10M7 15h10" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Restaurant Not Available</h2>
          <p className="text-gray-600 mb-6">This restaurant is currently not available.</p>
          <button 
            onClick={() => navigate('/restaurants')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Other Restaurants
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/restaurants')}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-700"
              aria-label="Back"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-sm font-medium text-gray-800 truncate max-w-[60%]">{restaurant?.name}</span>
            <button
              onClick={() => setShowCart(true)}
              className="relative p-2 rounded-full hover:bg-gray-100"
              aria-label="Cart"
            >
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8m-8 0a2 2 0 100 4 2 2 0 000-4zm8 0a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-[10px] rounded-full h-4 w-4 grid place-items-center">
                  {cartItems.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Banner + Info */}
      <div className="bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            <div className="w-full h-44 md:h-60 bg-gray-200">
              {restaurant.image ? (
                <img src={restaurant.image} alt={restaurant.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full grid place-items-center text-gray-400">No image</div>
              )}
            </div>
            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/50 to-transparent text-white">
              <h1 className="text-xl font-bold drop-shadow">{restaurant.name}</h1>
            </div>
          </div>

          <div className="px-4 py-4">
            <p className="text-gray-600 text-sm mb-3">{restaurant.description}</p>
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-green-600 text-white text-xs font-medium">Open</span>
              {restaurant.phone && <span>{restaurant.phone}</span>}
              {restaurant.address && <span className="truncate">{restaurant.address}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="bg-white border-y">
        <div className="max-w-3xl mx-auto px-4 py-3 overflow-x-auto no-scrollbar">
          <div className="flex gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-3 h-9 rounded-full text-sm whitespace-nowrap ${selectedCategory === category.id ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}
              >
                {category.name}
              </button>
            ))}
            <button className="px-3 h-9 rounded-full text-sm bg-gray-100 text-gray-800">Veg</button>
            <button className="px-3 h-9 rounded-full text-sm bg-gray-100 text-gray-800">Non-Veg</button>
            <button className="px-3 h-9 rounded-full text-sm bg-gray-100 text-gray-800">Egg</button>
          </div>
        </div>
      </div>

      {/* Menu Items (mobile-first card list) */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        {filteredMenuItems.length > 0 ? (
          <div className="space-y-4">
            {filteredMenuItems.map((item) => {
              const qty = getCartItemQuantity(item._id);
              return (
                <div key={item._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-[15px] font-semibold text-gray-900 truncate">{item.name}</h3>
                        <div className="text-xs text-emerald-700 mt-1">Highly reordered</div>
                      </div>
                    </div>
                    <div className="mt-2 text-[15px] font-bold text-gray-900">₹{Number(item.price).toFixed(0)}</div>
                    {item.description && (
                      <p className="mt-1 text-gray-600 text-sm line-clamp-2">{item.description}</p>
                    )}
                    {item.isAvailable === false && (
                      <div className="text-xs text-red-600 mt-2">Currently unavailable</div>
                    )}
                  </div>

                  <div className="w-28 shrink-0">
                    <div className="relative w-28 h-24 rounded-xl overflow-hidden bg-gray-100">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full grid place-items-center text-gray-400 text-xs">No Image</div>
                      )}
                    </div>
                    <div className="mt-2 flex justify-end">
                      {item.isAvailable ? (
                        qty > 0 ? (
                          <div className="flex items-center bg-white rounded-lg border border-gray-200 overflow-hidden">
                            <button onClick={() => getCartItemQuantity(item._id) > 1 ? updateQuantity(item._id, qty - 1) : updateQuantity(item._id, 0)} className="w-8 h-8 grid place-items-center text-rose-600 font-bold">−</button>
                            <span className="w-8 text-center font-semibold">{qty}</span>
                            <button onClick={() => updateQuantity(item._id, qty + 1)} className="w-8 h-8 grid place-items-center text-rose-600 font-bold">+</button>
                          </div>
                        ) : (
                          <button onClick={() => handleAddToCart(item)} className="px-4 py-2 rounded-lg bg-orange-600 text-white font-semibold shadow-sm active:scale-95">ADD</button>
                        )
                      ) : (
                        <span className="text-xs text-red-600">Not Available</span>
                      )}
                    </div>
                    <div className="text-[11px] text-gray-500 mt-1 text-right">customisable</div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-600">No Menu Items</div>
        )}
      </div>

      {/* Cart Sidebar */}
      {showCart && (
        <Cart isOpen={showCart} onClose={() => setShowCart(false)} />
      )}

      {/* Sticky bottom bar when items in cart */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 z-40">
          <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
            <div>
              <div className="text-xs text-gray-500">Total</div>
              <div className="text-lg font-semibold">₹{getCartTotal().toFixed(0)}</div>
            </div>
            <button
              onClick={() => navigate('/checkout')}
              className="flex-1 bg-orange-600 text-white py-3 rounded-xl font-semibold shadow-sm active:scale-95"
            >
              View Cart & Checkout
            </button>
          </div>
        </div>
      )}
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