import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/helpers';
import {
  ShoppingCart,
  Store,
  Truck,
  Package,
  Receipt,
  ArrowRight,
  ShieldCheck,
  Plus,
  Minus,
  Trash2
} from 'lucide-react';
import restaurantService from '../services/restaurantService';

const CartPage = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartRestaurant
  } = useCart();

  const [restaurantCharges, setRestaurantCharges] = useState({
    deliveryCharge: 0,
    gstPercentage: 5,
    packingCharge: 0,
    platformFee: 5
  });
  const [restaurantName, setRestaurantName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRestaurantCharges();
  }, [cartItems]);

  const fetchRestaurantCharges = async () => {
    try {
      setLoading(true);
      if (cartItems.length > 0) {
        const cartRestaurant = getCartRestaurant();
        if (cartRestaurant?.id) {
          const resp = await restaurantService.getRestaurantById(cartRestaurant.id);
          if (resp?.success && resp?.data?.restaurant) {
            setRestaurantCharges({
              deliveryCharge: typeof resp.data.restaurant.deliveryCharge === 'number'
                ? resp.data.restaurant.deliveryCharge
                : 0,
              gstPercentage: typeof resp.data.restaurant.gstPercentage === 'number'
                ? resp.data.restaurant.gstPercentage
                : 5,
              packingCharge: typeof resp.data.restaurant.packingCharge === 'number'
                ? resp.data.restaurant.packingCharge
                : 0,
              platformFee: typeof resp.data.restaurant.platformFee === 'number'
                ? resp.data.restaurant.platformFee
                : 5
            });
            setRestaurantName(resp.data.restaurant.name || '');
          }
        }
      }
    } catch (error) {
      console.error('Error fetching restaurant charges:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate totals
  const itemTotal = getCartTotal();
  const deliveryFee = itemTotal > 0 ? restaurantCharges.deliveryCharge : 0;
  const packingFee = itemTotal > 0 ? restaurantCharges.packingCharge : 0;
  const platformFee = itemTotal > 0 ? restaurantCharges.platformFee : 0;
  const gstAmount = itemTotal > 0 ? (itemTotal * restaurantCharges.gstPercentage) / 100 : 0;
  const totalAmount = itemTotal + deliveryFee + packingFee + platformFee + gstAmount;

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      clearCart();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8F0] to-orange-50 py-8">
      <div className="max-w-7xl mx-auto px-4 md:px-8">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link
                to="/restaurants"
                className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Your Cart</h1>
                <p className="text-gray-600 mt-2">
                  {cartItems.length > 0 ? `Review your items and proceed to checkout` : 'Add some delicious items to get started'}
                </p>
              </div>
            </div>

            {cartItems.length > 0 && (
              <button
                onClick={handleClearCart}
                className="text-red-600 hover:text-red-700 font-medium text-sm"
              >
                Clear Cart
              </button>
            )}
          </div>
        </div>

        {/* Empty Cart State */}
        {cartItems.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-lg p-12 text-center">
            <div className="w-32 h-32 mx-auto mb-6 bg-orange-100 rounded-full flex items-center justify-center">
              <ShoppingCart className="w-16 h-16 text-orange-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Add some delicious items to get started!</p>
            <button
              onClick={() => navigate('/student-dashboard')}
              className="bg-gradient-to-r from-orange-600 to-red-500 text-white px-8 py-3 rounded-full font-semibold hover:scale-105 transition-all"
            >
              Browse Restaurants
            </button>
          </div>
        ) : loading ? (
          /* Loading State */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 animate-pulse">
                <div className="h-40 bg-gray-200 rounded mb-4"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        ) : (

          /* Grid Layout - Items Left, Bill Right */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left Side - Cart Items (2 columns) */}
            <div className="lg:col-span-2 space-y-6">

              {/* Restaurant Info Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                    <Store className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Order from</p>
                    <h3 className="text-lg font-bold text-gray-900">{restaurantName}</h3>
                  </div>
                </div>
              </div>

              {/* Cart Items List */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Items ({cartItems.length})
                </h3>

                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item._id} className="flex gap-4 pb-4 border-b border-gray-200 last:border-0">

                      {/* Item Image */}
                      <img
                        src={item.image || '/placeholder-food.jpg'}
                        alt={item.name}
                        className="w-20 h-20 rounded-xl object-cover"
                      />

                      {/* Item Details */}
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{item.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{formatCurrency(item.price)}</p>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3 mt-3">
                          <button
                            onClick={() => updateQuantity(item._id, item.quantity - 1)}
                            className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full font-bold hover:bg-orange-200 transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="font-semibold text-gray-900 min-w-[2rem] text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item._id, item.quantity + 1)}
                            className="w-8 h-8 bg-orange-600 text-white rounded-full font-bold hover:bg-orange-700 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Item Total & Remove */}
                      <div className="text-right">
                        <p className="font-bold text-orange-600">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                        <button
                          onClick={() => removeFromCart(item._id)}
                          className="text-red-500 text-sm mt-2 hover:text-red-700 flex items-center gap-1"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Side - Bill Details (1 column, Sticky) */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg border border-orange-100 lg:sticky lg:top-24">

                {/* Bill Details Header */}
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900">Bill Details</h3>
                </div>

                {/* Bill Breakdown */}
                <div className="p-6 space-y-3">

                  {/* Item Total */}
                  <div className="flex justify-between text-sm text-gray-700">
                    <span>Item Total</span>
                    <span className="font-semibold">{formatCurrency(itemTotal)}</span>
                  </div>

                  {/* Delivery Charge */}
                  <div className="flex justify-between text-sm text-gray-700">
                    <div className="flex items-center gap-1">
                      <Truck className="w-4 h-4" />
                      <span>Delivery Charge</span>
                    </div>
                    <span className="font-semibold">
                      {deliveryFee === 0 ? (
                        <span className="text-green-600">FREE</span>
                      ) : (
                        formatCurrency(deliveryFee)
                      )}
                    </span>
                  </div>

                  {/* Packing Charge */}
                  <div className="flex justify-between text-sm text-gray-700">
                    <div className="flex items-center gap-1">
                      <Package className="w-4 h-4" />
                      <span>Packing Charge</span>
                    </div>
                    <span className="font-semibold">
                      {packingFee === 0 ? (
                        <span className="text-green-600">FREE</span>
                      ) : (
                        formatCurrency(packingFee)
                      )}
                    </span>
                  </div>

                  {/* Platform Fee */}
                  <div className="flex justify-between text-sm text-gray-700">
                    <span>Platform Fee</span>
                    <span className="font-semibold">{formatCurrency(platformFee)}</span>
                  </div>

                  {/* GST */}
                  <div className="flex justify-between text-sm text-gray-700">
                    <div className="flex items-center gap-1">
                      <Receipt className="w-4 h-4" />
                      <span>GST ({restaurantCharges.gstPercentage}%)</span>
                    </div>
                    <span className="font-semibold">{formatCurrency(gstAmount)}</span>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-300 pt-3 mt-3"></div>

                  {/* Total Amount */}
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Total Amount</span>
                    <span className="text-2xl font-bold text-orange-600">
                      {formatCurrency(totalAmount)}
                    </span>
                  </div>
                </div>

                {/* Checkout Button */}
                <div className="p-6 border-t border-gray-200">
                  <button
                    onClick={() => navigate('/checkout')}
                    className="w-full bg-gradient-to-r from-orange-600 to-red-500 text-white font-semibold py-4 rounded-xl shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2"
                  >
                    Proceed to Checkout
                    <ArrowRight className="w-5 h-5" />
                  </button>

                  {/* Safe Checkout Badge */}
                  <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-600">
                    <ShieldCheck className="w-4 h-4 text-green-600" />
                    <span>Safe and secure checkout</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;