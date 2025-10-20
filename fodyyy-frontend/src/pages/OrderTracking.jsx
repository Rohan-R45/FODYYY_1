import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import orderService from '../services/orderService';
import { formatCurrency, formatDateTime, getRelativeTime } from '../utils/helpers';
import UPIPaymentModal from '../components/UPIPaymentModal';
import PaymentConfirmationForm from '../components/PaymentConfirmationForm';
import PaymentStatusBadge from '../components/PaymentStatusBadge';
import toast from 'react-hot-toast';

const stepVariants = {
  inactive: { scale: 0.95, opacity: 0.6 },
  active: { scale: 1.05, opacity: 1, boxShadow: '0 12px 30px -12px rgba(255, 165, 0, 0.8)' },
  completed: { scale: 1, opacity: 1, boxShadow: '0 12px 28px -12px rgba(59, 130, 246, 0.6)' },
};

const connectorVariants = {
  inactive: { width: '0%', opacity: 0.3 },
  active: { width: '100%', opacity: 0.7 },
  completed: { width: '100%', opacity: 1 },
};

// Order Status Stepper Component
const OrderStatusStepper = ({ statusTimeline, currentStep }) => (
  <div className="relative">
    <div className="flex flex-wrap lg:flex-nowrap items-start justify-between gap-6">
      {statusTimeline.map((step, index) => {
        const isCompleted = step.completed;
        const isActive = index === currentStep;
        const statusVariant = isCompleted ? 'completed' : isActive ? 'active' : 'inactive';

        return (
          <div key={step.status} className="flex-1 min-w-[160px] max-w-xs mx-auto">
            <div className="flex flex-col items-center text-center">
              <motion.div
                variants={stepVariants}
                initial="inactive"
                animate={statusVariant}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                className={`relative w-16 h-16 rounded-3xl flex items-center justify-center text-2xl font-semibold border-2 shadow-lg backdrop-blur-xl
                  ${isCompleted ? 'bg-gradient-to-br from-[#34D399] to-[#059669] border-[#34D399] text-white'
                    : isActive ? 'bg-gradient-to-br from-[#FF6B35] via-[#FF9F1C] to-[#FFD23F] border-orange-200 text-white'
                    : 'bg-white/70 border-white/60 text-[#9CA3AF]'}`}
              >
                <span>{isCompleted ? '✓' : step.icon || '•'}</span>
                {isActive && (
                  <motion.span
                    className="absolute -bottom-2 w-6 h-6 rounded-full bg-white/90 border border-orange-200 text-[#FF6B35] flex items-center justify-center text-xs"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    LIVE
                  </motion.span>
                )}
              </motion.div>

              <motion.div
                className="mt-4 space-y-2"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <p className={`text-base font-semibold tracking-wide
                  ${isCompleted ? 'text-[#047857]' : isActive ? 'text-[#FF6B35]' : 'text-[#9CA3AF]'}`}
                >
                  {step.label}
                </p>
                {step.description && (
                  <p className="text-xs text-[#6B7280]/80 max-w-[180px] mx-auto">
                    {step.description}
                  </p>
                )}
                {step.timestamp && (
                  <p className="text-xs font-medium text-[#9CA3AF]">
                    {formatDateTime(step.timestamp, { timeOnly: true })}
                  </p>
                )}
              </motion.div>
            </div>

            {index < statusTimeline.length - 1 && (
              <motion.div
                className="hidden lg:block h-2 mt-6 rounded-full bg-gradient-to-r from-[#FFE8D6] via-[#FFD7A8] to-[#FFC857]" 
                variants={connectorVariants}
                initial="inactive"
                animate={isCompleted ? 'completed' : isActive ? 'active' : 'inactive'}
                transition={{ delay: 0.1, duration: 0.6 }}
              />
            )}

            {index < statusTimeline.length - 1 && (
              <motion.div
                className="block lg:hidden mt-6 h-12 w-[2px] mx-auto bg-gradient-to-b from-[#FFE8D6] via-[#FFD7A8] to-[#FFC857]"
                variants={connectorVariants}
                initial="inactive"
                animate={isCompleted ? 'completed' : isActive ? 'active' : 'inactive'}
                transition={{ delay: 0.1, duration: 0.6 }}
              />
            )}
          </div>
        );
      })}
    </div>
  </div>
);

const OrderDetailsCard = ({ order, restaurant, items }) => (
  <motion.div
    className="relative bg-white/80 backdrop-blur-xl border border-white/60 rounded-3xl shadow-xl p-6 sm:p-8 flex flex-col"
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, ease: 'easeOut' }}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-[#FFF5E6]/90 via-[#FFE8D6]/70 to-white/60 pointer-events-none" />
    <div className="relative">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold tracking-widest uppercase text-[#F7941D]">#{order.orderNumber}</p>
          <h3 className="text-2xl font-bold text-[#1B1B1E] mt-2">Order Summary</h3>
        </div>
        <motion.div
          className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#FF9F1C] to-[#FF6B35] flex items-center justify-center text-white text-3xl shadow-lg"
          animate={{ rotate: [0, 6, -6, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
        >
          🍽️
        </motion.div>
      </div>

      <div className="mt-6 grid gap-4">
        <div className="grid xs:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-[#FFE8D6] bg-white/90 px-4 py-3 shadow-sm">
            <p className="text-xs text-[#9CA3AF] uppercase tracking-wide">Order Date</p>
            <p className="mt-1 text-[#1B1B1E] font-semibold">{formatDateTime(order.createdAt)}</p>
          </div>
          <div className="rounded-2xl border border-[#FFE8D6] bg-white/90 px-4 py-3 shadow-sm">
            <p className="text-xs text-[#9CA3AF] uppercase tracking-wide">Payment Method</p>
            <p className="mt-1 text-[#1B1B1E] font-semibold capitalize">{order.paymentMethod}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-[#FFE8D6] bg-white/90 px-4 py-3 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-[#9CA3AF] uppercase tracking-wide">Payment Status</p>
            <p className="mt-1 text-sm font-semibold">
              <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold
                ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-amber-100 text-amber-700 border border-amber-200'}`}
              >
                <span className="text-base">{order.paymentStatus === 'paid' ? '✅' : '⌛'}</span>
                {order.paymentStatus}
              </span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[#9CA3AF] uppercase tracking-wide">Tracking</p>
            <p className="mt-1 text-sm font-semibold text-[#FF6B35]">
              {getRelativeTime(order.updatedAt)}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-[#FFE8D6] bg-white/90 px-4 py-4 shadow-sm flex gap-3">
          <div className="shrink-0 h-12 w-12 rounded-2xl bg-gradient-to-br from-[#FF6B35] to-[#F7931E] text-white text-2xl flex items-center justify-center shadow-md">
            🏪
          </div>
          <div>
            <p className="text-sm font-semibold text-[#1B1B1E]">{restaurant.name}</p>
            <p className="text-sm text-[#6B7280]">{restaurant.address}</p>
            {restaurant.phone && (
              <a href={`tel:${restaurant.phone}`} className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-[#FF6B35] hover:text-[#D9480F]">
                <span>📞</span>
                {restaurant.phone}
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-[#FFE8D6] bg-white/95 px-4 py-4 shadow-sm">
        <h4 className="text-sm font-semibold text-[#1B1B1E] uppercase tracking-wide mb-3">Items Ordered</h4>
        <div className="space-y-3">
          {items.map((item, index) => (
            <motion.div
              key={item.menuItem?._id || index}
              className="flex items-center justify-between rounded-xl border border-[#FFE8D6]/60 bg-[#FFF6EB]/70 px-4 py-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.05, duration: 0.4 }}
            >
              <div className="flex items-center gap-3">
                {item.menuItem?.image && (
                  <img
                    src={item.menuItem.image}
                    alt={item.menuItem.name}
                    className="h-12 w-12 rounded-2xl object-cover"
                  />
                )}
                <div>
                  <p className="text-sm font-semibold text-[#1B1B1E]">{item.menuItem?.name || 'Menu Item'}</p>
                  <p className="text-xs text-[#9CA3AF]">{formatCurrency(item.price)} × {item.quantity}</p>
                  {item.specialInstructions && (
                    <p className="text-xs text-[#B45309] italic mt-1">{item.specialInstructions}</p>
                  )}
                </div>
              </div>
              <p className="text-sm font-semibold text-[#FF6B35]">
                {formatCurrency(item.price * item.quantity)}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 space-y-2">
          <div className="flex items-center justify-between text-sm text-[#6B7280]">
            <span>Subtotal</span>
            <span>{formatCurrency(order.subtotal ?? order.total)}</span>
          </div>
          {typeof order.deliveryFee === 'number' && (
            <div className="flex items-center justify-between text-sm text-[#6B7280]">
              <span>Delivery Fee</span>
              <span>{formatCurrency(order.deliveryFee)}</span>
            </div>
          )}
          {typeof order.tax === 'number' && order.tax > 0 && (
            <div className="flex items-center justify-between text-sm text-[#6B7280]">
              <span>Tax</span>
              <span>{formatCurrency(order.tax)}</span>
            </div>
          )}
          {typeof order.discount === 'number' && order.discount > 0 && (
            <div className="flex items-center justify-between text-sm text-[#6B7280]">
              <span>Discount</span>
              <span>-{formatCurrency(order.discount)}</span>
            </div>
          )}
          <div className="pt-3 flex items-center justify-between text-lg font-bold text-[#FF6B35] border-t border-[#FFE8D6]">
            <span>Total</span>
            <span>{formatCurrency((typeof order.total === 'number') ? order.total : (Number(order.subtotal || order.totalAmount || 0) + Number(order.deliveryFee || 0) + Number(order.tax || 0) - (typeof order.discount === 'number' ? order.discount : Number(order?.discount?.amount || 0))))}</span>
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);

// UPI Payment Instructions Component
const UPIPaymentInstructions = ({ paymentInstructions }) => {
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <h4 className="font-semibold text-yellow-800 mb-3 flex items-center">
        💳 Payment Required
      </h4>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-yellow-700">UPI ID:</span>
          <div className="flex items-center">
            <code className="bg-yellow-100 px-2 py-1 rounded text-sm">
              {paymentInstructions.upiId}
            </code>
            <button 
              onClick={() => copyToClipboard(paymentInstructions.upiId)}
              className="ml-2 text-yellow-600 hover:text-yellow-800"
            >
              📋
            </button>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-yellow-700">Amount:</span>
          <span className="font-semibold text-yellow-800">
            ₹{paymentInstructions.amount}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-yellow-700">Note:</span>
          <div className="flex items-center">
            <code className="bg-yellow-100 px-2 py-1 rounded text-sm">
              {paymentInstructions.note}
            </code>
            <button 
              onClick={() => copyToClipboard(paymentInstructions.note)}
              className="ml-2 text-yellow-600 hover:text-yellow-800"
            >
              📋
            </button>
          </div>
        </div>
      </div>
      <p className="text-xs text-yellow-600 mt-3">
        Please complete the payment to confirm your order. Your order will be processed once payment is received.
      </p>
    </div>
  );
};

const OrderTracking = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [trackingData, setTrackingData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showConfirmationForm, setShowConfirmationForm] = useState(false);
  const [isConfirmingPayment, setIsConfirmingPayment] = useState(false);

  useEffect(() => {
    loadTrackingData();
    loadPaymentData();
    
    // Set up polling for real-time updates every 30 seconds
    const interval = setInterval(() => {
      loadTrackingData();
      loadPaymentData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [id]);

  const loadTrackingData = async () => {
    try {
      setError(null);
      const response = await orderService.getOrderTracking(id);
      
      if (response.success) {
        setTrackingData(response.data);
      } else {
        setError(response.message || 'Failed to load order tracking data');
      }
    } catch (error) {
      console.error('Error loading tracking data:', error);
      setError('Failed to load order tracking data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPaymentData = async () => {
    try {
      const response = await orderService.getPaymentDetails(id);
      
      if (response.success) {
        setPaymentData(response.data);
      }
    } catch (error) {
      console.error('Error loading payment data:', error);
    }
  };

  const handlePaymentClick = () => {
    setShowPaymentModal(true);
  };

  const handlePaymentModalConfirm = () => {
    setShowPaymentModal(false);
    setShowConfirmationForm(true);
  };

  const handlePaymentConfirmation = async (formData) => {
    try {
      setIsConfirmingPayment(true);
      
      const response = await orderService.confirmPayment(id, {
        transactionId: formData.transactionId,
        paymentProof: formData.paymentProof
      });

      if (response.success) {
        toast.success('Payment confirmed successfully!');
        setShowConfirmationForm(false);
        
        // Reload data to reflect payment status
        await loadTrackingData();
        await loadPaymentData();
      } else {
        toast.error(response.message || 'Failed to confirm payment');
      }
    } catch (error) {
      console.error('Error confirming payment:', error);
      toast.error('Failed to confirm payment');
    } finally {
      setIsConfirmingPayment(false);
    }
  };

  const statusStyles = {
    pending: {
      badge: 'bg-gradient-to-r from-[#FFF7ED] via-[#FFE8D6] to-[#FFD7A8] text-[#B45309] border border-[#FDE68A]/60',
      text: 'text-[#F97316]',
      glow: 'from-[#FFEDD5]/70 via-[#FFD7A8]/40 to-transparent'
    },
    confirmed: {
      badge: 'bg-gradient-to-r from-[#EFF6FF] via-[#DBEAFE] to-[#C7D2FE] text-[#1D4ED8] border border-[#93C5FD]/70',
      text: 'text-[#2563EB]',
      glow: 'from-[#DBEAFE]/70 via-[#BFDBFE]/40 to-transparent'
    },
    preparing: {
      badge: 'bg-gradient-to-r from-[#FFF7ED] via-[#FED7AA] to-[#FDBA74] text-[#B45309] border border-[#FB923C]/60',
      text: 'text-[#EA580C]',
      glow: 'from-[#F97316]/20 via-[#FED7AA]/40 to-transparent'
    },
    ready: {
      badge: 'bg-gradient-to-r from-[#FAF5FF] via-[#EDE9FE] to-[#DDD6FE] text-[#6B21A8] border border-[#C4B5FD]/60',
      text: 'text-[#7C3AED]',
      glow: 'from-[#EDE9FE]/70 via-[#DDD6FE]/40 to-transparent'
    },
    delivered: {
      badge: 'bg-gradient-to-r from-[#ECFDF5] via-[#D1FAE5] to-[#A7F3D0] text-[#047857] border border-[#34D399]/60',
      text: 'text-[#047857]',
      glow: 'from-[#6EE7B7]/30 via-[#D1FAE5]/50 to-transparent'
    },
    cancelled: {
      badge: 'bg-gradient-to-r from-[#FEF2F2] via-[#FEE2E2] to-[#FECACA] text-[#B91C1C] border border-[#FCA5A5]/60',
      text: 'text-[#B91C1C]',
      glow: 'from-[#FECACA]/60 via-[#FCD5CE]/40 to-transparent'
    },
  };

  const cancelOrder = async () => {
    if (!trackingData?.order.canCancel) {
      toast.error('Order cannot be cancelled at this stage');
      return;
    }

    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      const response = await orderService.cancelOrder(id);
      
      if (response.success) {
        toast.success('Order cancelled successfully');
        loadTrackingData();
      } else {
        toast.error(response.message || 'Failed to cancel order');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error('Failed to cancel order');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFF5E1] via-[#FFE7BA] to-[#FFC36B] flex items-center justify-center">
        <motion.div
          className="relative bg-white/80 backdrop-blur-xl border border-white/60 rounded-3xl p-10 shadow-2xl"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <motion.div
            className="absolute -top-8 -left-10 h-32 w-32 rounded-full bg-gradient-to-br from-[#FF9F1C]/50 to-[#FF6B35]/50 blur-2xl"
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ repeat: Infinity, duration: 3 }}
          />
          <motion.div
            className="absolute -bottom-12 -right-12 h-40 w-40 rounded-full bg-gradient-to-br from-[#FFD23F]/50 to-[#FF9F1C]/40 blur-3xl"
            animate={{ scale: [0.9, 1.1, 0.9] }}
            transition={{ repeat: Infinity, duration: 4 }}
          />
          <div className="relative flex flex-col items-center gap-4">
            <motion.div
              className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF6B35] to-[#F7931E] text-white text-3xl"
              animate={{ rotate: [0, 8, -8, 0] }}
              transition={{ repeat: Infinity, duration: 2.5 }}
            >
              🛵
            </motion.div>
            <motion.h2
              className="text-2xl font-bold text-[#1B1B1E]"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Gathering your live tracking data...
            </motion.h2>
            <motion.p
              className="text-sm text-[#6B7280]"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Fresh updates will appear in a blink. Stay tuned! 🧡
            </motion.p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (error || !trackingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFF5E1] via-[#FFE7BA] to-[#FFC36B] flex items-center justify-center px-4">
        <motion.div
          className="relative max-w-lg w-full bg-white/85 backdrop-blur-2xl border border-white/60 rounded-3xl p-8 shadow-2xl text-center"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <motion.div
            className="absolute -top-14 -right-12 h-40 w-40 bg-gradient-to-br from-[#FFD23F]/40 via-[#FF9F1C]/30 to-transparent blur-3xl"
            animate={{ rotate: [0, 20, -10, 0] }}
            transition={{ repeat: Infinity, duration: 8 }}
          />
          <motion.div
            className="absolute -bottom-10 -left-12 h-44 w-44 bg-gradient-to-tr from-[#FF6B35]/30 via-[#FF9F1C]/20 to-transparent blur-3xl"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 6 }}
          />
          <div className="relative">
            <motion.div
              className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[#FF9F1C] to-[#FF6B35] text-white text-4xl shadow-lg"
              animate={{ scale: [0.95, 1.05, 0.95] }}
              transition={{ repeat: Infinity, duration: 2.8 }}
            >
              📋
            </motion.div>
            <motion.h3
              className="text-2xl font-bold text-[#1B1B1E]"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error || 'Order not found'}
            </motion.h3>
            <motion.p
              className="mt-4 text-sm text-[#6B7280]"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
            >
              The order you’re looking for may have sizzled away or you might not have access to it.
            </motion.p>
            <motion.div
              className="mt-6 flex justify-center"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Link
                to="/orders"
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF6B35] via-[#FF9F1C] to-[#FFD23F] px-6 py-3 text-white font-semibold shadow-lg hover:shadow-orange-300 transition-all"
              >
                Browse Your Orders
                <span>→</span>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  const { order, restaurant, items, statusTimeline, currentStep, paymentInstructions } = trackingData;
  const statusConfig = statusStyles[order.status] || statusStyles.pending;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF5E1] via-[#FFE7BA] to-[#FFC36B] overflow-hidden">
      <div className="fixed -top-24 -left-24 h-64 w-64 rounded-full bg-gradient-to-br from-[#FF9F1C]/30 to-[#FF6B35]/20 blur-3xl pointer-events-none" />
      <div className="fixed -bottom-32 -right-32 h-80 w-80 rounded-full bg-gradient-to-tl from-[#FFD23F]/30 to-[#FF9F1C]/20 blur-3xl pointer-events-none" />

      <div className="relative">
        <div className="bg-white/75 backdrop-blur-xl shadow-sm border-b border-white/60">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <motion.h1
                  className="text-3xl font-extrabold text-[#1B1B1E]"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  Track Your Feast
                </motion.h1>
                <motion.p
                  className="mt-1 text-sm sm:text-base text-[#6B7280]"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  Order #{order.orderNumber} • Updated {getRelativeTime(order.updatedAt)}
                </motion.p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <motion.div
                  className="inline-flex items-center gap-2 rounded-full bg-white/80 border border-[#FFE8D6] px-4 py-2 text-[#047857] font-semibold shadow-sm"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  Live Tracking
                </motion.div>
                <Link
                  to="/orders"
                  className="inline-flex items-center gap-2 rounded-full bg-white/80 border border-[#FFE8D6] px-4 py-2 text-[#9CA3AF] font-semibold hover:text-[#FF6B35] transition"
                >
                  ← Back to Orders
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <motion.div
            className="relative bg-white/85 backdrop-blur-2xl border border-white/60 rounded-3xl shadow-2xl overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-[#FFE8D6]/40 to-transparent pointer-events-none" />
            <div className="relative px-6 sm:px-8 lg:px-12 py-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-10">
                <div>
                  <motion.div
                    className={`inline-flex items-center gap-3 px-5 py-3 rounded-2xl text-sm font-semibold shadow-sm border ${statusConfig.badge}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <span className="text-lg">
                      {statusTimeline[currentStep]?.icon || '📋'}
                    </span>
                    {statusTimeline[currentStep]?.label || order.status}
                  </motion.div>
                  <motion.h2
                    className="mt-5 text-3xl font-extrabold text-[#1B1B1E]"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                  >
                    Your taste adventure is in progress!
                  </motion.h2>
                  <motion.p
                    className="mt-3 text-base text-[#6B7280] max-w-xl"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                  >
                    We are monitoring your order to make sure every bite reaches you warm and zestful. Keep this page open for real-time updates.
                  </motion.p>
                </div>

                <motion.div
                  className="relative rounded-3xl bg-gradient-to-br from-[#FF9F1C] via-[#FF6B35] to-[#FFD23F] text-white px-6 py-5 shadow-2xl"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                >
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/20 via-white/10 to-transparent opacity-60" />
                  <div className="relative flex flex-col gap-3">
                    <p className="text-xs uppercase tracking-[0.3em] font-semibold text-white/90">Estimated Delivery</p>
                    <h3 className="text-3xl font-extrabold">{order.timeRemaining > 0 && order.status !== 'delivered' && order.status !== 'cancelled' ? `${order.timeRemaining} mins` : 'Serving shortly'}</h3>
                    <p className="text-xs text-white/80">
                      Our delivery partner is navigating the quickest path. You can call the restaurant for specific timing adjustments.
                    </p>
                  </div>
                </motion.div>
              </div>

              <div className="mt-10">
                <OrderStatusStepper statusTimeline={statusTimeline} currentStep={currentStep} />
              </div>

              {paymentData && (
                <motion.div
                  className="mt-10 rounded-3xl bg-white/85 border border-white/60 px-6 py-6 shadow-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF9F1C] to-[#FF6B35] text-white text-2xl">
                        💳
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#1B1B1E]">Payment Status</p>
                        <PaymentStatusBadge paymentStatus={paymentData.paymentStatus} isVerified={!!paymentData.verifiedAt} />
                      </div>
                    </div>

                    {paymentData.canConfirmPayment && (
                      <div className="flex-1">
                        <p className="text-sm text-[#6B7280]">Complete your payment to confirm the order</p>
                        <button
                          onClick={handlePaymentClick}
                          className="mt-3 w-full lg:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF6B35] via-[#FF9F1C] to-[#FFD23F] px-5 py-3 text-white font-semibold shadow-md"
                        >
                          Make Payment
                          <span>→</span>
                        </button>
                      </div>
                    )}

                    {paymentData.paymentStatus === 'paid' && !paymentData.verifiedAt && (
                      <div className="rounded-2xl bg-blue-50/70 border border-blue-200/80 px-4 py-3 text-sm text-blue-800">
                        ✅ Payment confirmed! Waiting for restaurant verification.
                      </div>
                    )}

                    {paymentData.verifiedAt && (
                      <div className="rounded-2xl bg-green-50/80 border border-green-200/80 px-4 py-3 text-sm text-green-800">
                        ✅ Payment verified by restaurant. Your order is being prepared.
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {paymentInstructions && order.paymentStatus !== 'paid' && (
                <motion.div
                  className="mt-8"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
                >
                  <UPIPaymentInstructions paymentInstructions={paymentInstructions} />
                </motion.div>
              )}

              {order.status === 'cancelled' && (
                <motion.div
                  className="mt-8 rounded-3xl bg-[#FEF2F2]/90 border border-red-100 px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600 text-2xl">
                    ❌
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-red-700">Order Cancelled</p>
                    <p className="text-sm text-red-500">
                      This order has been cancelled. If you have any questions, please contact the restaurant.
                    </p>
                  </div>
                </motion.div>
              )}

              <div className="mt-8 flex flex-col sm:flex-row sm:justify-between gap-4">
                {order.canCancel && order.status !== 'cancelled' && (
                  <button
                    onClick={cancelOrder}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/90 border border-red-200 px-5 py-3 text-red-600 font-semibold hover:bg-red-50 transition"
                  >
                    Cancel Order
                  </button>
                )}
                <div className="flex flex-col sm:flex-row gap-3 sm:ml-auto">
                  {order.canRate && (
                    <Link
                      to={`/orders/${order._id}/rate`}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF9F1C] to-[#FF6B35] px-5 py-3 text-white font-semibold shadow-md hover:shadow-lg"
                    >
                      Rate Order
                    </Link>
                  )}
                  <Link
                    to={`/orders/${order._id}`}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/90 border border-[#FFE8D6] px-5 py-3 text-[#B45309] font-semibold hover:bg-white"
                  >
                    View Receipt
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <OrderDetailsCard order={order} restaurant={restaurant} items={items} />

            <motion.div
              className="relative bg-white/80 backdrop-blur-xl border border-white/60 rounded-3xl shadow-xl p-6 sm:p-8 flex flex-col"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#FFF0DA]/70 via-[#FFE8D6]/60 to-white/50 pointer-events-none" />
              <div className="relative">
                <h3 className="text-2xl font-bold text-[#1B1B1E]">Delivery Details</h3>
                <p className="mt-1 text-sm text-[#9CA3AF]">Updated live as your meal travels</p>

                <div className="mt-6 space-y-4">
                  <div className="rounded-2xl border border-[#FFE8D6]/80 bg-white/90 px-4 py-3 shadow-sm">
                    <p className="text-xs uppercase tracking-widest text-[#F7941D]">
                      Delivery Address
                    </p>
                    <p className="mt-2 text-sm font-semibold text-[#1B1B1E]">{order.deliveryAddress}</p>
                  </div>

                  <div className="rounded-2xl border border-[#FFE8D6]/80 bg-white/90 px-4 py-3 shadow-sm flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-[#F7941D]">Contact</p>
                      <p className="mt-2 text-sm font-semibold text-[#1B1B1E]">{order.phone}</p>
                    </div>
                    <a
                      href={`tel:${order.phone}`}
                      className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#FF9F1C] to-[#FF6B35] px-4 py-2 text-white text-sm font-semibold shadow"
                    >
                      Call
                      <span>📞</span>
                    </a>
                  </div>

                  {order.specialInstructions && (
                    <div className="rounded-2xl border border-[#FFE8D6]/80 bg-white/90 px-4 py-3 shadow-sm">
                      <p className="text-xs uppercase tracking-widest text-[#F7941D]">
                        Special Instructions
                      </p>
                      <p className="mt-2 text-sm text-[#6B7280]">{order.specialInstructions}</p>
                    </div>
                  )}

                  <div className="rounded-2xl border border-[#FFE8D6]/80 bg-white/90 px-4 py-3 shadow-sm">
                    <p className="text-xs uppercase tracking-widest text-[#F7941D]">Estimated Delivery Time</p>
                    <p className="mt-2 text-sm font-semibold text-[#1B1B1E]">
                      {formatDateTime(order.estimatedDeliveryTime)}
                    </p>
                  </div>

                  {order.actualDeliveryTime && (
                    <div className="rounded-2xl border border-[#FFE8D6]/80 bg-white/90 px-4 py-3 shadow-sm">
                      <p className="text-xs uppercase tracking-widest text-[#F7941D]">Delivered On</p>
                      <p className="mt-2 text-sm font-semibold text-[#047857]">
                        {formatDateTime(order.actualDeliveryTime)}
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-6 rounded-2xl border border-[#FFE8D6]/80 bg-white/90 px-4 py-3 shadow-inner">
                  <p className="text-sm text-[#B45309]">
                    Need any help? Call the restaurant to adjust delivery instructions or timings.
                  </p>
                  {restaurant.phone && (
                    <a
                      href={`tel:${restaurant.phone}`}
                      className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/90 border border-[#FFE8D6] px-4 py-2 text-[#FF6B35] font-semibold hover:bg-white"
                    >
                      📞 Call Restaurant
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {paymentData && (
        <UPIPaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          orderData={paymentData}
          onPaymentConfirm={handlePaymentModalConfirm}
        />
      )}

      {paymentData && (
        <PaymentConfirmationForm
          isOpen={showConfirmationForm}
          onClose={() => setShowConfirmationForm(false)}
          orderData={paymentData}
          onSubmit={handlePaymentConfirmation}
          isSubmitting={isConfirmingPayment}
        />
      )}
    </div>
  );
};

export default OrderTracking;