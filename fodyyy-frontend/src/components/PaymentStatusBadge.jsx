import React from 'react';

const PaymentStatusBadge = ({ 
  paymentStatus, 
  isVerified = false, 
  size = 'md',
  showIcon = true 
}) => {
  const getStatusConfig = () => {
    const configs = {
      pending: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        border: 'border-yellow-200',
        icon: '⏳',
        label: 'Payment Pending'
      },
      paid: {
        bg: isVerified ? 'bg-green-100' : 'bg-blue-100',
        text: isVerified ? 'text-green-800' : 'text-blue-800',
        border: isVerified ? 'border-green-200' : 'border-blue-200',
        icon: isVerified ? '✅' : '💳',
        label: isVerified ? 'Payment Verified' : 'Payment Confirmed'
      },
      failed: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        border: 'border-red-200',
        icon: '❌',
        label: 'Payment Failed'
      },
      refunded: {
        bg: 'bg-purple-100',
        text: 'text-purple-800',
        border: 'border-purple-200',
        icon: '↩️',
        label: 'Refunded'
      }
    };

    return configs[paymentStatus] || configs.pending;
  };

  const getSizeClasses = () => {
    const sizes = {
      sm: 'px-2 py-1 text-xs',
      md: 'px-3 py-1 text-sm',
      lg: 'px-4 py-2 text-base'
    };
    return sizes[size] || sizes.md;
  };

  const config = getStatusConfig();
  const sizeClasses = getSizeClasses();

  return (
    <span className={`
      inline-flex items-center rounded-full font-medium border
      ${config.bg} ${config.text} ${config.border} ${sizeClasses}
    `}>
      {showIcon && (
        <span className="mr-1">{config.icon}</span>
      )}
      {config.label}
    </span>
  );
};

export default PaymentStatusBadge;