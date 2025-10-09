import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/helpers';
import { Plus, Minus, Trash2, ShoppingCart, Tag, ArrowRight, X } from 'lucide-react';
import toast from 'react-hot-toast';

const Cart = ({ restaurantId }) => {
  const { 
    cartItems, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    getCartTotal, 
    getCartItemsCount 
  } = useCart();

  const [couponCode, setCouponCode] = React.useState('');
  const [appliedCoupon, setAppliedCoupon] = React.useState(null);

  // Filter cart items for current restaurant if restaurantId is provided
  const relevantItems = restaurantId 
    ? cartItems.filter(item => item.restaurantId === restaurantId)
    : cartItems;

  const subtotal = relevantItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const discount = appliedCoupon ? appliedCoupon.discount : 0;
  
  // Delivery fee is determined by the restaurant's delivery settings; fallback values are used if unavailable
  const [deliverySettings, setDeliverySettings] = React.useState({ charge: 15, freeAbove: 300 });

  React.useEffect(() => {
    const fetchDeliverySettings = async () => {
      try {
        const restId = restaurantId || (relevantItems[0]?.restaurantId);
        if (!restId) return;
        const resp = await (await import('../services/restaurantService')).default.getRestaurantById(restId);
        if (resp?.success && resp?.data?.restaurant) {
          const ds = resp.data.restaurant.deliverySettings || {};
          setDeliverySettings({
            charge: typeof ds.deliveryCharge === 'number' ? ds.deliveryCharge : 15,
            freeAbove: typeof ds.freeDeliveryAbove === 'number' ? ds.freeDeliveryAbove : 300
          });
        } else {
          setDeliverySettings({ charge: 15, freeAbove: 300 });
        }
      } catch {
        setDeliverySettings({ charge: 15, freeAbove: 300 });
      }
    };
    fetchDeliverySettings();
  }, [restaurantId, relevantItems.length]);

  const deliveryFee = subtotal > 0 && subtotal >= (deliverySettings.freeAbove || 300) ? 0 : (subtotal > 0 ? (deliverySettings.charge || 15) : 0);
  const total = subtotal + deliveryFee - discount;

  const handleApplyCoupon = () => {
    if (couponCode.toLowerCase() === 'save10') {
      setAppliedCoupon({ code: 'SAVE10', discount: subtotal * 0.1 });
      toast.success('Coupon applied! 10% off');
    } else if (couponCode.toLowerCase() === 'first50') {
      setAppliedCoupon({ code: 'FIRST50', discount: 50 });
      toast.success('Coupon applied! ₹50 off');
    } else {
      toast.error('Invalid coupon code');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    toast.success('Coupon removed');
  };

  if (relevantItems.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border-2 border-orange-200 p-8"
      >
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🛒</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h3>
          <p className="text-gray-600 mb-6">Add some delicious items to get started!</p>
          {!restaurantId && (
            <Link
              to="/restaurants"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-yellow-400 text-white rounded-full font-semibold hover:shadow-lg transition-all hover:scale-105"
            >
              <ShoppingCart className="w-5 h-5" />
              Browse Restaurants
            </Link>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border-2 border-orange-200"
    >
      {/* Cart Header */}
      <div className="bg-gradient-to-r from-orange-500 to-yellow-400 p-6 rounded-t-3xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-white">
            <ShoppingCart className="w-6 h-6" />
            <div>
              <h3 className="text-xl font-bold">
                Your Cart
              </h3>
              <p className="text-sm text-white/90">
                {relevantItems.length} item{relevantItems.length !== 1 ? 's' : ''}
                {relevantItems.length > 0 && relevantItems[0].restaurantName && (
                  <span> from {relevantItems[0].restaurantName}</span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (restaurantId) {
                relevantItems.forEach(item => removeFromCart(item._id));
              } else {
                clearCart();
              }
              toast.success('Cart cleared');
            }}
            className="text-sm text-white hover:bg-white/20 px-3 py-1.5 rounded-full font-medium transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Cart Items */}
      <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
        {relevantItems.map((item, index) => (
          <motion.div
            key={item._id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-orange-50 rounded-2xl p-4 border-2 border-orange-200 hover:border-orange-300 transition-colors"
          >
            <div className="flex gap-4">
              {/* Item Image */}
              <div className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-orange-200 to-yellow-200 flex items-center justify-center">
                    <span className="text-2xl">🍽️</span>
                  </div>
                )}
              </div>

              {/* Item Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="font-bold text-gray-900 truncate">{item.name}</h4>
                  <button
                    onClick={() => {
                      removeFromCart(item._id);
                      toast.success('Item removed');
                    }}
                    className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <p className="text-sm text-gray-600 mb-2">{formatCurrency(item.price)} each</p>
                
                {/* Veg/Non-Veg Indicator */}
                <div className="flex items-center mb-3">
                  {item.isVegetarian !== undefined && (
                    <div className={`w-4 h-4 border-2 flex items-center justify-center mr-2 ${
                      item.isVegetarian ? 'border-green-500' : 'border-red-500'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${
                        item.isVegetarian ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                    </div>
                  )}
                  {item.isSpicy && (
                    <span className="text-xs">🌶️</span>
                  )}
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                    className="w-8 h-8 bg-white border-2 border-orange-300 rounded-full flex items-center justify-center hover:bg-orange-50 transition-colors"
                  >
                    <Minus className="w-4 h-4 text-orange-600" />
                  </button>
                  <span className="font-bold text-gray-900 min-w-[2rem] text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    className="w-8 h-8 bg-gradient-to-r from-orange-500 to-yellow-400 text-white rounded-full flex items-center justify-center hover:shadow-lg transition-all"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <span className="ml-auto font-bold text-orange-600">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Coupon Section */}
      <div className="px-6 pb-4">
        <div className="border-2 border-dashed border-orange-300 rounded-2xl p-4 bg-orange-50/50">
          <div className="flex items-center gap-2 mb-3">
            <Tag className="w-5 h-5 text-orange-600" />
            <h4 className="font-bold text-gray-900">Apply Coupon</h4>
          </div>
          
          {appliedCoupon ? (
            <div className="flex items-center justify-between bg-green-50 border-2 border-green-300 rounded-xl p-3">
              <div>
                <p className="font-bold text-green-700">{appliedCoupon.code}</p>
                <p className="text-sm text-green-600">-{formatCurrency(appliedCoupon.discount)} saved</p>
              </div>
              <button
                onClick={handleRemoveCoupon}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Enter code"
                className="flex-1 px-4 py-2 rounded-xl border-2 border-orange-200 focus:border-orange-400 focus:outline-none"
              />
              <button
                onClick={handleApplyCoupon}
                className="bg-gradient-to-r from-orange-500 to-yellow-400 text-white px-6 py-2 rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Apply
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Cart Summary */}
      <div className="px-6 pb-6">
        <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
          <h4 className="font-bold text-gray-900 mb-3">Bill Details</h4>
          
          {/* Item Total */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Item Total</span>
            <span className="text-gray-900 font-medium">{formatCurrency(subtotal)}</span>
          </div>

          {/* Delivery Fee */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Delivery Fee</span>
            <span className={`font-medium ${deliveryFee === 0 ? 'text-green-600' : 'text-gray-900'}`}>
              {deliveryFee === 0 ? 'FREE' : formatCurrency(deliveryFee)}
            </span>
          </div>

          {/* Discount */}
          {discount > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Discount</span>
              <span className="text-green-600 font-medium">-{formatCurrency(discount)}</span>
            </div>
          )}

          {/* Total */}
          <div className="flex items-center justify-between text-xl font-bold pt-3 border-t-2 border-gray-200">
            <span className="text-gray-900">Total</span>
            <span className="text-orange-600">{formatCurrency(total)}</span>
          </div>

          {/* Free Delivery Progress */}
          {subtotal > 0 && subtotal < deliverySettings.freeAbove && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">
                  Add {formatCurrency(deliverySettings.freeAbove - subtotal)} for free delivery
                </span>
                <span className="text-orange-600 font-bold">
                  {Math.round((subtotal / deliverySettings.freeAbove) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((subtotal / deliverySettings.freeAbove) * 100, 100)}%` }}
                  className="bg-gradient-to-r from-orange-500 to-yellow-400 h-2 rounded-full"
                />
              </div>
            </div>
          )}
        </div>

        {/* Checkout Button */}
        <Link
          to="/checkout"
          className="w-full mt-4 bg-gradient-to-r from-orange-500 to-yellow-400 text-white py-4 px-6 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 group"
        >
          <span>Proceed to Checkout</span>
          <span className="font-bold">{formatCurrency(total)}</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>

        {/* Continue Shopping */}
        {!restaurantId && (
          <Link
            to="/restaurants"
            className="w-full mt-3 text-center py-3 px-4 text-orange-600 hover:text-orange-700 font-medium transition-colors block"
          >
            Continue Shopping
          </Link>
        )}
      </div>
    </motion.div>
  );
};

export default Cart;