import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/helpers';
import orderService from '../services/orderService';
import toast from 'react-hot-toast';

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, getCartTotal, clearCart, getCartRestaurant } = useCart();
  const { user } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);
  
  // Form state
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: '',
    landmark: '',
    city: '',
    pincode: '',
    instructions: ''
  });
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Load user data on mount
  useEffect(() => {
    if (user) {
      setPhoneNumber(user.phone || '');
      if (user.address) {
        setDeliveryAddress({
          street: user.address.street || '',
          landmark: user.address.landmark || '',
          city: user.address.city || '',
          pincode: user.address.pincode || '',
          instructions: ''
        });
      }
    }
  }, [user]);

  // Redirect if cart is empty
  useEffect(() => {
    if (cartItems.length === 0 && !orderPlaced) {
      navigate('/restaurants');
    }
  }, [cartItems, navigate, orderPlaced]);

  const cartRestaurant = getCartRestaurant();
  const subtotal = getCartTotal();
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [restaurantName, setRestaurantName] = useState('');

  useEffect(() => {
    const fetchDeliveryCharge = async () => {
      try {
        if (!cartRestaurant?.id) return;
        const resp = await (await import('../services/restaurantService')).default.getRestaurantById(cartRestaurant.id);
        if (resp?.success && resp?.data?.restaurant) {
          const charge = typeof resp.data.restaurant.deliveryCharge === 'number' 
            ? resp.data.restaurant.deliveryCharge 
            : 0;
          setDeliveryCharge(charge);
          setRestaurantName(resp.data.restaurant.name || '');
        }
      } catch (e) {
        setDeliveryCharge(0);
      }
    };

    fetchDeliveryCharge();
  }, [cartRestaurant?.id]);

  const deliveryFee = subtotal > 0 ? deliveryCharge : 0;
  const total = subtotal + deliveryFee;

  const handleAddressChange = (field, value) => {
    setDeliveryAddress(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!phoneNumber.trim()) {
      toast.error('Phone number is required');
      return false;
    }
    
    if (!/^[6-9]\d{9}$/.test(phoneNumber)) {
      toast.error('Please enter a valid 10-digit phone number');
      return false;
    }

    if (!deliveryAddress.street.trim()) {
      toast.error('Street address is required');
      return false;
    }

    if (!deliveryAddress.city.trim()) {
      toast.error('City is required');
      return false;
    }

    if (!deliveryAddress.pincode.trim()) {
      toast.error('Pincode is required');
      return false;
    }

    if (!/^\d{6}$/.test(deliveryAddress.pincode)) {
      toast.error('Please enter a valid 6-digit pincode');
      return false;
    }

    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Format delivery address as a single string
      const formattedAddress = [
        deliveryAddress.street,
        deliveryAddress.landmark && `Near ${deliveryAddress.landmark}`,
        deliveryAddress.city,
        deliveryAddress.pincode
      ].filter(Boolean).join(', ');

      const orderData = {
        restaurantId: cartRestaurant.id,
        items: cartItems.map(item => ({
          menuItemId: item._id,
          quantity: item.quantity,
          specialInstructions: item.specialInstructions || ''
        })),
        deliveryAddress: formattedAddress,
        phoneNumber,
        paymentMethod,
        specialInstructions: deliveryAddress.instructions || ''
      };

      const response = await orderService.createOrder(orderData);
      
      if (response.success) {
        setOrderDetails(response.data);
        setOrderPlaced(true);
        clearCart();
        setTimeout(() => setShowCelebration(true), 400);
        
        if (paymentMethod === 'upi') {
          setShowPaymentModal(true);
        } else {
          toast.success('Order placed successfully!');
        }
      } else {
        toast.error(response.message || 'Failed to place order');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (orderPlaced && orderDetails) {
    return (
      <OrderConfirmation 
        orderDetails={orderDetails} 
        showPaymentModal={showPaymentModal}
        setShowPaymentModal={setShowPaymentModal}
        showCelebration={showCelebration}
        setShowCelebration={setShowCelebration}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
              <p className="text-gray-600 mt-1">Review your order and complete payment</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Delivery Address */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 text-primary-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Delivery Address
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      value={deliveryAddress.street}
                      onChange={(e) => handleAddressChange('street', e.target.value)}
                      placeholder="Enter your street address"
                      className="input w-full"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Landmark
                    </label>
                    <input
                      type="text"
                      value={deliveryAddress.landmark}
                      onChange={(e) => handleAddressChange('landmark', e.target.value)}
                      placeholder="Near landmark (optional)"
                      className="input w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      value={deliveryAddress.city}
                      onChange={(e) => handleAddressChange('city', e.target.value)}
                      placeholder="Enter city"
                      className="input w-full"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      value={deliveryAddress.pincode}
                      onChange={(e) => handleAddressChange('pincode', e.target.value)}
                      placeholder="6-digit pincode"
                      className="input w-full"
                      maxLength={6}
                      required
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Instructions
                    </label>
                    <textarea
                      value={deliveryAddress.instructions}
                      onChange={(e) => handleAddressChange('instructions', e.target.value)}
                      placeholder="Any special instructions for delivery (optional)"
                      className="input w-full h-20 resize-none"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 text-primary-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Contact Information
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Enter 10-digit phone number"
                    className="input w-full"
                    maxLength={10}
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    We'll use this number to contact you about your order
                  </p>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 text-primary-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Payment Method
                </h3>
                
                <div className="space-y-3">
                  {/* UPI temporarily hidden */}
                  {/*
                  <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="upi"
                      checked={paymentMethod === 'upi'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="text-primary-600 focus:ring-primary-600"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center">
                        <span className="font-medium text-gray-900">UPI Payment</span>
                        <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Recommended</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Pay using Google Pay, PhonePe, Paytm, or any UPI app
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <img src="/images/upi-logo.png" alt="UPI" className="h-6 w-auto" onError={(e) => e.target.style.display = 'none'} />
                    </div>
                  </label>
                  */}
                  
                  <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="text-primary-600 focus:ring-primary-600"
                    />
                    <div className="ml-3 flex-1">
                      <span className="font-medium text-gray-900">Cash on Delivery</span>
                      <p className="text-sm text-gray-600 mt-1">
                        Pay with cash when your order arrives
                      </p>
                    </div>
                    <span className="text-2xl">💵</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 sticky top-4">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900">Order Summary</h3>
                  {cartRestaurant && (
                    <p className="text-sm text-gray-600 mt-1">From {cartRestaurant.name}</p>
                  )}
                </div>
                
                <div className="p-6 space-y-4 max-h-64 overflow-y-auto custom-scrollbar">
                  {cartItems.map((item) => (
                    <div key={item._id} className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">{item.name}</h4>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
                
                <div className="p-6 border-t border-gray-100 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">{formatCurrency(subtotal)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Delivery {restaurantName && <span className="text-xs text-gray-500">from {restaurantName}</span>}
                    </span>
                    <span className={deliveryFee === 0 ? 'text-green-600' : 'text-gray-900'}>
                      {deliveryFee === 0 ? 'Free' : formatCurrency(deliveryFee)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-lg font-semibold pt-3 border-t border-gray-200">
                    <span className="text-gray-900">Total</span>
                    <span className="text-gray-900">{formatCurrency(total)}</span>
                  </div>
                  
                  <button
                    onClick={handlePlaceOrder}
                    disabled={isLoading}
                    className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Placing Order...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Place Order • {formatCurrency(total)}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Order Confirmation Component
const celebrationVariant = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: 'easeOut' } },
};

const floatingIcons = [
  { icon: '🍊', delay: 0 },
  { icon: '🥤', delay: 0.2 },
  { icon: '🍟', delay: 0.4 },
  { icon: '🍔', delay: 0.6 },
  { icon: '🍕', delay: 0.8 },
  { icon: '🍩', delay: 1.0 },
];

const backgroundGradient =
  'bg-[radial-gradient(circle_at_top,_rgba(255,235,204,0.9),_rgba(255,179,71,0.4),_rgba(255,107,53,0.2))]';

const OrderConfirmation = ({ orderDetails, showPaymentModal, setShowPaymentModal, showCelebration, setShowCelebration }) => {
  const navigate = useNavigate();
  const restaurantName = orderDetails.restaurant?.name || 'Tasty Tales';
  const estimatedDeliveryInfo = React.useMemo(() => {
    const fallbackMinutes = 45;
    const now = new Date();
    const calculatedDelivery = new Date(now.getTime() + fallbackMinutes * 60000);

    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);

    const isToday = calculatedDelivery.toDateString() === now.toDateString();
    const isTomorrow = calculatedDelivery.toDateString() === tomorrow.toDateString();

    const dayLabel = isToday
      ? 'Today'
      : isTomorrow
      ? 'Tomorrow'
      : calculatedDelivery.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });

    const formattedTime = calculatedDelivery.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    const calendarDisplay = `${dayLabel}, ${formattedTime}`;
    const relativeDisplay = `in ${fallbackMinutes} minutes`;

    return {
      calendarDisplay,
      relativeDisplay,
    };
  }, [orderDetails?._id]);

  return (
    <div className={`min-h-screen ${backgroundGradient} flex items-center justify-center px-4 py-8 relative overflow-hidden`}> 
      {/* Floating ambience icons */}
      <AnimatePresence>
        {floatingIcons.map((food, index) => (
          <motion.span
            key={`${food.icon}-${index}`}
            className="absolute text-4xl md:text-5xl text-white/80 drop-shadow-lg"
            initial={{ opacity: 0, y: 40, rotate: -10 }}
            animate={{
              opacity: [0, 1, 1, 0],
              y: [-20, 0, -40, -80],
              rotate: [0, -4, 6, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: 8,
              delay: food.delay,
              ease: 'easeInOut',
            }}
            style={{ left: `${15 + index * 12}%`, top: `${10 + (index % 3) * 25}%` }}
          >
            {food.icon}
          </motion.span>
        ))}
      </AnimatePresence>

      <motion.div
        className="relative max-w-4xl w-full"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
          {/* Celebration card */}
          <motion.div
            className="relative bg-white/80 backdrop-blur-xl border border-white/60 rounded-3xl shadow-2xl p-6 sm:p-8 overflow-hidden"
            variants={celebrationVariant}
            initial="hidden"
            animate="visible"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#FFEDD5]/70 via-[#FFD7A8]/60 to-[#FFB347]/40 pointer-events-none" />
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/40 rounded-full blur-3xl" />
            <div className="relative flex flex-col h-full">
              <motion.div
                className="inline-flex items-center gap-2 bg-white/80 border border-white/70 text-[#FF6B35] font-semibold px-4 py-2 rounded-full self-start shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <span className="text-lg">✨</span>
                Cheers! Order Confirmed
              </motion.div>

              <motion.h2
                className="mt-6 text-3xl sm:text-4xl font-extrabold text-[#1B1B1E] tracking-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                Your feast is on the way!
              </motion.h2>

              <motion.p
                className="mt-4 text-base sm:text-lg text-[#4B5563] leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
              >
                Tastes of sunshine and comfort will be at your doorstep soon. Stay tuned for deliciousness!
              </motion.p>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-4 bg-white rounded-2xl p-5 shadow-md border border-orange-100">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-orange-500 text-white">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6v6l3 3" />
                      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth={1.8} />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Estimated Delivery</p>
                    <p className="text-lg font-bold text-gray-900">{estimatedDeliveryInfo.calendarDisplay}</p>
                    <p className="text-sm font-semibold text-orange-600 mt-1">{estimatedDeliveryInfo.relativeDisplay}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-white rounded-2xl p-5 shadow-md border border-orange-100">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#FBBF24] text-[#92400E]">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 9l9-6 9 6v10.5A1.5 1.5 0 0119.5 21h-15A1.5 1.5 0 013 19.5V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 21V12h6v9" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Restaurant</p>
                    <p className="text-lg font-bold text-gray-900">{restaurantName}</p>
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {showCelebration && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4 }}
                    className="mt-8 p-4 rounded-2xl bg-gradient-to-br from-[#FFE8D6]/80 to-[#FFD7A8]/70 border border-[#FFEDD5]/80 shadow-inner"
                  >
                    <p className="text-[#B45309] font-semibold flex items-center gap-2">
                      <span className="text-xl">🎉</span>
                      Saved to your favorites! Discover more foodie surprises in the app.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div
                className="mt-auto flex flex-col sm:flex-row gap-3 pt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
              >
                <button
                  onClick={() => navigate(`/orders/${orderDetails._id}`)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF6B35] via-[#FF9F1C] to-[#FFD23F] px-6 py-3 text-white font-semibold shadow-lg shadow-orange-200 hover:shadow-orange-300 transition-all"
                >
                  <span>Track Live Journey</span>
                  <span className="text-lg">→</span>
                </button>

                <button
                  onClick={() => navigate('/restaurants')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-white/90 border border-[#FFE8D6] px-6 py-3 text-[#B45309] font-semibold shadow-sm hover:bg-white transition"
                >
                  Continue Exploring
                </button>
              </motion.div>
            </div>
          </motion.div>

          {/* Order summary card */}
          <motion.div
            className="relative bg-white/75 backdrop-blur-xl border border-white/60 rounded-3xl shadow-xl p-6 sm:p-8 flex flex-col"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
          >
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-[#FFEDD5]/80 rounded-full blur-3xl" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold tracking-widest uppercase text-[#F7941D]">Order #{orderDetails.orderNumber}</p>
                  <h3 className="text-2xl font-bold text-[#1B1B1E] mt-2">Order Summary</h3>
                </div>
                <motion.div
                  className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#FF9F1C] to-[#FF6B35] flex items-center justify-center text-white text-3xl shadow-lg"
                  animate={{ rotate: [0, 6, -6, 0] }}
                  transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
                >
                  🛵
                </motion.div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between border border-[#FFE8D6] rounded-2xl p-4 bg-white/80 shadow-sm">
                  <div>
                    <p className="text-sm text-[#6B7280]">Delivery Address</p>
                    <p className="text-[#1B1B1E] font-semibold">{orderDetails.deliveryAddress}</p>
                  </div>
                  <span className="text-2xl">📍</span>
                </div>

                <div className="flex items-center justify-between border border-[#FFE8D6] rounded-2xl p-4 bg-white/80 shadow-sm">
                  <div>
                    <p className="text-sm text-[#6B7280]">Contact Number</p>
                    <p className="text-[#1B1B1E] font-semibold">{orderDetails.phone}</p>
                  </div>
                  <span className="text-2xl">📞</span>
                </div>

                <div className="border border-[#FFE8D6] rounded-2xl p-4 bg-white/80 shadow-sm">
                  <p className="text-sm text-[#6B7280] mb-3">Items</p>
                  <div className="space-y-3">
                    {orderDetails.items?.map((item, index) => (
                      <motion.div
                        key={`${item.menuItemId}-${index}`}
                        className="flex items-center justify-between rounded-xl border border-[#FFE8D6]/60 bg-[#FFF6EB]/80 px-4 py-3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + index * 0.05, duration: 0.4 }}
                      >
                        <div>
                          <p className="text-[#1B1B1E] font-semibold">{item.name || item.menuItemName || 'Menu Item'}</p>
                          <p className="text-sm text-[#9CA3AF]">Qty {item.quantity}</p>
                        </div>
                        <p className="text-[#FF6B35] font-semibold">{formatCurrency(item.price || item.itemTotal)}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="border border-[#FFE8D6] rounded-2xl p-4 bg-white/80 shadow-sm">
                  <div className="flex items-center justify-between text-[#6B7280] text-sm">
                    <span>Subtotal</span>
                    <span>{formatCurrency(orderDetails.subtotal ?? orderDetails.total)}</span>
                  </div>
                  {typeof orderDetails.deliveryFee === 'number' && (
                    <div className="mt-2 flex items-center justify-between text-[#6B7280] text-sm">
                      <span>Delivery Fee</span>
                      <span>{formatCurrency(orderDetails.deliveryFee)}</span>
                    </div>
                  )}
                  {typeof orderDetails.discount === 'number' && orderDetails.discount > 0 && (
                    <div className="mt-2 flex items-center justify-between text-[#6B7280] text-sm">
                      <span>Discounts</span>
                      <span>-{formatCurrency(orderDetails.discount)}</span>
                    </div>
                  )}
                  <div className="mt-4 flex items-center justify-between text-lg font-extrabold text-[#FF6B35]">
                    <span>Total Paid</span>
                    <span>{formatCurrency(orderDetails.total)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between bg-[#FFF6EB]/80 border border-[#FFE8D6] rounded-2xl px-4 py-3 text-sm text-[#B45309]">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📦</span>
                  <span>Confirm delivery once you receive your order for loyalty points.</span>
                </div>
                <button
                  onClick={() => setShowCelebration(!showCelebration)}
                  className="text-[#FF6B35] font-semibold hover:text-[#D9480F]"
                >
                  {showCelebration ? 'Hide Tip' : 'Save Tip'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal 
          orderDetails={orderDetails}
          onClose={() => setShowPaymentModal(false)}
        />
      )}
    </div>
  );
};

// Payment Modal Component
const PaymentModal = ({ orderDetails, onClose }) => {
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [transactionId, setTransactionId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('File size should be less than 5MB');
        return;
      }
      setPaymentScreenshot(file);
    }
  };

  const handleSubmitPayment = async () => {
    if (!paymentScreenshot) {
      toast.error('Please upload payment screenshot');
      return;
    }
    
    if (!transactionId.trim()) {
      toast.error('Please enter transaction ID');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('paymentScreenshot', paymentScreenshot);
      formData.append('transactionId', transactionId);

      const response = await orderService.updatePayment(orderDetails._id, formData);
      
      if (response.success) {
        toast.success('Payment confirmation submitted successfully!');
        onClose();
      } else {
        toast.error(response.message || 'Failed to submit payment confirmation');
      }
    } catch (error) {
      console.error('Error submitting payment:', error);
      toast.error('Failed to submit payment confirmation');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6 animate-scale-in">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Complete Payment</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="text-center mb-6">
          <div className="bg-gray-100 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-600 mb-2">Pay using any UPI app</p>
            <p className="text-lg font-semibold text-gray-900">{formatCurrency(orderDetails.total)}</p>
            <p className="text-sm text-gray-600 mt-1">UPI ID: restaurant@upi</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <div className="w-32 h-32 bg-white border-2 border-dashed border-gray-300 rounded-lg mx-auto flex items-center justify-center">
              <span className="text-gray-400 text-sm">QR Code</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">Scan with any UPI app</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Payment Screenshot *
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
            />
            {paymentScreenshot && (
              <p className="text-sm text-green-600 mt-1">✓ {paymentScreenshot.name}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transaction ID *
            </label>
            <input
              type="text"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="Enter UPI transaction ID"
              className="input w-full"
            />
          </div>
          
          <button
            onClick={handleSubmitPayment}
            disabled={isSubmitting}
            className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Confirm Payment'}
          </button>
          
          <button
            onClick={onClose}
            className="w-full text-gray-600 py-2 text-sm hover:text-gray-800 transition-colors"
          >
            I'll pay later
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;