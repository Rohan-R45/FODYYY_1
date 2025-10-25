import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/helpers';
import { 
  X, 
  Plus, 
  Minus, 
  Trash2, 
  ShoppingCart, 
  Tag, 
  MapPin,
  CreditCard,
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const CartSidebar = ({ isOpen, onClose, restaurantId }) => {
  const navigate = useNavigate();
  const { 
    cartItems, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    getCartTotal, 
    getCartItemsCount 
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [deliveryCharge, setDeliveryCharge] = useState(0);

  // Filter cart items for current restaurant if restaurantId is provided
  const relevantItems = restaurantId 
    ? cartItems.filter(item => item.restaurantId === restaurantId)
    : cartItems;

  const subtotal = relevantItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  useEffect(() => {
    const fetchDeliveryCharge = async () => {
      try {
        const restId = restaurantId || (relevantItems[0]?.restaurantId);
        if (!restId) return;
        const resp = await (await import('../services/restaurantService')).default.getRestaurantById(restId);
        if (resp?.success && resp?.data?.restaurant) {
          const charge = typeof resp.data.restaurant.deliveryCharge === 'number' 
            ? resp.data.restaurant.deliveryCharge 
            : 0;
          setDeliveryCharge(charge);
        }
      } catch {
        setDeliveryCharge(0);
      }
    };
    fetchDeliveryCharge();
  }, [restaurantId, relevantItems.length]);

  const deliveryFee = subtotal > 0 ? deliveryCharge : 0;
  const discount = appliedCoupon ? appliedCoupon.discount : 0;
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

  const handleClearCart = () => {
    if (restaurantId) {
      relevantItems.forEach(item => removeFromCart(item._id));
    } else {
      clearCart();
    }
    toast.success('Cart cleared');
  };

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full md:w-[400px] bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-yellow-400 p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <ShoppingCart className="w-6 h-6" />
                  <h2 className="text-2xl font-bold">Your Cart</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-white/20 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <p className="text-white/90">
                {relevantItems.length} item{relevantItems.length !== 1 ? 's' : ''}
                {relevantItems.length > 0 && relevantItems[0].restaurantName && (
                  <span> from {relevantItems[0].restaurantName}</span>
                )}
              </p>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {relevantItems.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🛒</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h3>
                  <p className="text-gray-600 mb-6">Add some delicious items to get started!</p>
                  <button
                    onClick={onClose}
                    className="bg-gradient-to-r from-orange-500 to-yellow-400 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all"
                  >
                    Browse Menu
                  </button>
                </div>
              ) : (
                <>
                  {/* Clear Cart Button */}
                  <button
                    onClick={handleClearCart}
                    className="w-full text-sm text-red-600 hover:text-red-700 font-medium text-right"
                  >
                    Clear cart
                  </button>

                  {/* Cart Items List */}
                  {relevantItems.map((item, index) => (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-orange-50 rounded-xl p-4 border-2 border-orange-200"
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
                              onClick={() => removeFromCart(item._id)}
                              className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors flex-shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-2">{formatCurrency(item.price)} each</p>
                          
                          {/* Customizations */}
                          {item.customization && (
                            <div className="text-xs text-gray-500 mb-2">
                              {item.customization.size && <span>Size: {item.customization.size} </span>}
                              {item.customization.addons?.length > 0 && (
                                <span>+ {item.customization.addons.length} addon(s)</span>
                              )}
                            </div>
                          )}

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

                  {/* Coupon Section */}
                  <div className="border-2 border-dashed border-orange-300 rounded-xl p-4 bg-orange-50/50">
                    <div className="flex items-center gap-2 mb-3">
                      <Tag className="w-5 h-5 text-orange-600" />
                      <h4 className="font-bold text-gray-900">Apply Coupon</h4>
                    </div>
                    
                    {appliedCoupon ? (
                      <div className="flex items-center justify-between bg-green-50 border-2 border-green-300 rounded-lg p-3">
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
                          placeholder="Enter coupon code"
                          className="flex-1 px-4 py-2 rounded-lg border-2 border-orange-200 focus:border-orange-400 focus:outline-none"
                        />
                        <button
                          onClick={handleApplyCoupon}
                          className="bg-gradient-to-r from-orange-500 to-yellow-400 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all"
                        >
                          Apply
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Bill Details */}
                  <div className="bg-gray-50 rounded-xl p-4 space-y-3">
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
                    <div className="flex items-center justify-between text-lg font-bold pt-3 border-t-2 border-gray-200">
                      <span className="text-gray-900">Total</span>
                      <span className="text-orange-600">{formatCurrency(total)}</span>
                    </div>


                  </div>

                  {/* Delivery Address */}
                  <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 mb-1">Delivery Address</h4>
                        <p className="text-sm text-gray-600">123 Main Street, City</p>
                        <button className="text-sm text-blue-600 font-medium hover:underline mt-1">
                          Change
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="bg-purple-50 rounded-xl p-4 border-2 border-purple-200">
                    <div className="flex items-start gap-3">
                      <CreditCard className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 mb-1">Payment Method</h4>
                        <p className="text-sm text-gray-600">Cash on Delivery</p>
                        <button className="text-sm text-purple-600 font-medium hover:underline mt-1">
                          Change
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Checkout Button */}
            {relevantItems.length > 0 && (
              <div className="p-6 border-t-2 border-gray-100">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCheckout}
                  className="w-full bg-gradient-to-r from-orange-500 to-yellow-400 text-white py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 relative overflow-hidden"
                >
                  <motion.div
                    animate={{ 
                      boxShadow: [
                        '0 0 0 0 rgba(255, 107, 53, 0.7)',
                        '0 0 0 20px rgba(255, 107, 53, 0)',
                      ]
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute inset-0"
                  />
                  <span>Place Order</span>
                  <span className="font-bold">₹{total.toFixed(0)}</span>
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartSidebar;