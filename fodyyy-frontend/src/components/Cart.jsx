import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/helpers';

const Cart = ({ restaurantId }) => {
  const { 
    cartItems, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    getCartTotal, 
    getCartItemsCount 
  } = useCart();

  // Filter cart items for current restaurant if restaurantId is provided
  const relevantItems = restaurantId 
    ? cartItems.filter(item => item.restaurantId === restaurantId)
    : cartItems;

  const subtotal = relevantItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  // Delivery fee is determined by the restaurant's delivery settings; fallback values are used if unavailable
  const [deliverySettings, setDeliverySettings] = React.useState({ charge: 30, freeAbove: 300 });

  React.useEffect(() => {
    const fetchDeliverySettings = async () => {
      try {
        const restId = restaurantId || (relevantItems[0]?.restaurantId);
        if (!restId) return;
        const resp = await (await import('../services/restaurantService')).default.getRestaurantById(restId);
        if (resp?.success && resp?.data?.restaurant) {
          const ds = resp.data.restaurant.deliverySettings || {};
          setDeliverySettings({
            charge: typeof ds.deliveryCharge === 'number' ? ds.deliveryCharge : 30,
            freeAbove: typeof ds.freeDeliveryAbove === 'number' ? ds.freeDeliveryAbove : 300
          });
        } else {
          setDeliverySettings({ charge: 30, freeAbove: 300 });
        }
      } catch {
        setDeliverySettings({ charge: 30, freeAbove: 300 });
      }
    };
    fetchDeliverySettings();
  }, [restaurantId, relevantItems.length]);

  const deliveryFee = subtotal > 0 && subtotal >= (deliverySettings.freeAbove || 300) ? 0 : (subtotal > 0 ? (deliverySettings.charge || 30) : 0);
  const total = subtotal + deliveryFee;

  if (relevantItems.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="text-center py-8">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0L17 18" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
          <p className="text-gray-600 mb-4">Add some delicious items to get started!</p>
          {!restaurantId && (
            <Link
              to="/restaurants"
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Browse Restaurants
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Cart Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Your Cart ({relevantItems.length} item{relevantItems.length !== 1 ? 's' : ''})
          </h3>
          <button
            onClick={() => {
              if (restaurantId) {
                // Clear only items from this restaurant
                relevantItems.forEach(item => removeFromCart(item._id));
              } else {
                clearCart();
              }
            }}
            className="text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Clear cart
          </button>
        </div>
        {relevantItems.length > 0 && relevantItems[0].restaurantName && (
          <p className="text-sm text-gray-600 mt-1">
            From {relevantItems[0].restaurantName}
          </p>
        )}
      </div>

      {/* Cart Items */}
      <div className="p-6 space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
        {relevantItems.map((item, index) => (
          <div 
            key={item._id} 
            className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors animate-slide-up"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* Item Image */}
            <div className="w-16 h-16 flex-shrink-0">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Item Details */}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 truncate">{item.name}</h4>
              <p className="text-sm text-gray-600">{formatCurrency(item.price)} each</p>
              <div className="flex items-center mt-2">
                {item.isVeg !== undefined && (
                  <div className={`w-3 h-3 border mr-2 ${
                    item.isVeg ? 'border-green-500' : 'border-red-500'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full m-0.5 ${
                      item.isVeg ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                  </div>
                )}
                {item.isSpicy && (
                  <span className="text-red-500 text-xs mr-2">🌶️</span>
                )}
              </div>
            </div>

            {/* Quantity Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQuantity(item._id, item.quantity - 1)}
                className="w-8 h-8 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <span className="font-medium text-gray-900 min-w-[2rem] text-center">
                {item.quantity}
              </span>
              <button
                onClick={() => updateQuantity(item._id, item.quantity + 1)}
                className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center hover:bg-primary-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>

            {/* Remove Button */}
            <button
              onClick={() => removeFromCart(item._id)}
              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Cart Summary */}
      <div className="p-6 border-t border-gray-100">
        <div className="space-y-3">
          {/* Subtotal */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="text-gray-900">{formatCurrency(subtotal)}</span>
          </div>

          {/* Delivery Fee */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              Delivery Fee
              {subtotal >= 300 && (
                <span className="text-green-600 ml-1">(Free on orders ₹300+)</span>
              )}
            </span>
            <span className={`${deliveryFee === 0 ? 'text-green-600' : 'text-gray-900'}`}>
              {deliveryFee === 0 ? 'Free' : formatCurrency(deliveryFee)}
            </span>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between text-lg font-semibold pt-3 border-t border-gray-200">
            <span className="text-gray-900">Total</span>
            <span className="text-gray-900">{formatCurrency(total)}</span>
          </div>

          {/* Free Delivery Progress */}
          {subtotal > 0 && subtotal < 300 && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">Add {formatCurrency(300 - subtotal)} for free delivery</span>
                <span className="text-primary-600 font-medium">
                  {Math.round((subtotal / 300) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((subtotal / 300) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Checkout Button */}
          <Link
            to="/checkout"
            className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-medium text-center hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 mt-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Proceed to Checkout
            <span className="ml-auto font-semibold">{formatCurrency(total)}</span>
          </Link>

          {/* Continue Shopping */}
          {!restaurantId && (
            <Link
              to="/restaurants"
              className="w-full text-center py-2 px-4 text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              Continue Shopping
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;