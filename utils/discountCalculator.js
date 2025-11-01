/**
 * Discount Calculator Utility
 * Handles percentage and BOGO discount calculations
 */

/**
 * Calculate discount amount for a single item
 * @param {Number} price - Original item price
 * @param {Number} quantity - Item quantity
 * @param {Object} discount - Discount object
 * @returns {Object} { discountedPrice, discountAmount, savings, discountType, details }
 */
function calculateItemDiscount(price, quantity, discount) {
  if (!discount || !discount.type) {
    return {
      discountedPrice: price * quantity,
      discountAmount: 0,
      savings: 0,
      discountType: null,
      details: {}
    };
  }

  let result = {
    originalPrice: price * quantity,
    discountAmount: 0,
    savings: 0,
    discountType: discount.type,
    details: {}
  };

  if (discount.type === 'percentage') {
    // Percentage discount
    const discountPercent = discount.value;
    result.discountAmount = (price * quantity * discountPercent) / 100;
    result.discountedPrice = price * quantity - result.discountAmount;
    result.savings = discountPercent;
    result.details = {
      percentage: discountPercent,
      label: `${discountPercent}% Off`
    };
  } else if (discount.type === 'bogo') {
    // Buy X Get Y Free
    const { buy, free } = discount.bogo;
    const totalSets = Math.floor(quantity / buy);
    const freeItems = totalSets * free;
    const totalPaid = quantity - freeItems;
    
    result.discountAmount = price * freeItems;
    result.discountedPrice = price * totalPaid;
    result.savings = Math.round((freeItems / quantity) * 100);
    result.details = {
      buy,
      free,
      freeItems,
      label: `Buy ${buy} Get ${free} Free`
    };
  }

  return result;
}

/**
 * Calculate total discount for an order
 * @param {Array} items - Array of { menuItemId, quantity, price, discount }
 * @returns {Object} { totalOriginal, totalDiscount, totalFinal, itemBreakdown, message }
 */
function calculateOrderDiscount(items) {
  let totalOriginal = 0;
  let totalDiscount = 0;
  const itemBreakdown = [];

  items.forEach(item => {
    const itemTotal = item.price * item.quantity;
    totalOriginal += itemTotal;

    if (item.discount) {
      const calc = calculateItemDiscount(item.price, item.quantity, item.discount);
      totalDiscount += calc.discountAmount;
      
      itemBreakdown.push({
        itemId: item.menuItemId,
        name: item.name,
        quantity: item.quantity,
        originalPrice: itemTotal,
        discountAmount: calc.discountAmount,
        finalPrice: calc.discountedPrice,
        discountType: calc.discountType,
        discountDetails: calc.details
      });
    } else {
      itemBreakdown.push({
        itemId: item.menuItemId,
        name: item.name,
        quantity: item.quantity,
        originalPrice: itemTotal,
        discountAmount: 0,
        finalPrice: itemTotal,
        discountType: null,
        discountDetails: {}
      });
    }
  });

  return {
    totalOriginal: Math.round(totalOriginal * 100) / 100,
    totalDiscountAmount: Math.round(totalDiscount * 100) / 100,
    totalFinal: Math.round((totalOriginal - totalDiscount) * 100) / 100,
    itemBreakdown,
    discountPercentage: totalOriginal > 0 ? Math.round((totalDiscount / totalOriginal) * 100) : 0,
    message: totalDiscount > 0 ? `You save ₹${(Math.round(totalDiscount * 100) / 100).toFixed(2)} with student discounts!` : 'No discounts applied'
  };
}

/**
 * Check if discount is currently active
 * @param {Object} discount - Discount object
 * @returns {Boolean}
 */
function isDiscountActive(discount) {
  if (!discount || !discount.isActive) return false;

  const now = new Date();
  const startDate = new Date(discount.startDate);
  const endDate = new Date(discount.endDate);

  return startDate <= now && now <= endDate;
}

/**
 * Get discount status message
 * @param {Object} discount - Discount object
 * @returns {Object} { isActive, message, status }
 */
function getDiscountStatus(discount) {
  if (!discount.isActive) {
    return {
      isActive: false,
      status: 'inactive',
      message: 'This discount is currently disabled'
    };
  }

  const now = new Date();
  const startDate = new Date(discount.startDate);
  const endDate = new Date(discount.endDate);

  if (now < startDate) {
    const daysUntil = Math.ceil((startDate - now) / (1000 * 60 * 60 * 24));
    return {
      isActive: false,
      status: 'upcoming',
      message: `This discount starts in ${daysUntil} day(s)`,
      startDate
    };
  }

  if (now > endDate) {
    return {
      isActive: false,
      status: 'expired',
      message: 'This discount has expired'
    };
  }

  const daysRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
  return {
    isActive: true,
    status: 'active',
    message: `Active for ${daysRemaining} more day(s)`,
    endDate,
    daysRemaining
  };
}

/**
 * Format discount for display
 * @param {Object} discount - Discount object
 * @returns {Object} formatted discount
 */
function formatDiscountForDisplay(discount) {
  const status = getDiscountStatus(discount);

  let label = '';
  let description = '';
  let badge = '';

  if (discount.type === 'percentage') {
    label = `Save ${discount.value}%`;
    description = discount.description || `Get ${discount.value}% off on eligible items`;
    badge = `${discount.value}% OFF`;
  } else if (discount.type === 'bogo') {
    label = `Buy ${discount.bogo.buy} Get ${discount.bogo.free} Free`;
    description = discount.description || `Buy ${discount.bogo.buy} and get ${discount.bogo.free} free`;
    badge = `BUY ${discount.bogo.buy} GET ${discount.bogo.free}`;
  }

  return {
    id: discount._id,
    type: discount.type,
    label,
    description,
    badge,
    value: discount.value,
    bogo: discount.bogo,
    isActive: status.isActive,
    status: status.status,
    statusMessage: status.message,
    applicableItems: discount.applicableItems || [],
    applicableCategories: discount.applicableCategories || [],
    startDate: discount.startDate,
    endDate: discount.endDate,
    daysRemaining: status.daysRemaining
  };
}

/**
 * Get list of formatted active discounts
 * @param {Array} discounts - Array of discount objects
 * @returns {Array} formatted active discounts
 */
function getFormattedActiveDiscounts(discounts) {
  return discounts
    .filter(discount => isDiscountActive(discount) && discount.isVisible)
    .map(formatDiscountForDisplay);
}

/**
 * Calculate BOGO details for display
 * @param {Object} bogoDiscount - BOGO discount object
 * @param {Number} itemPrice - Price of the item
 * @returns {Object} details
 */
function calculateBogoDetails(bogoDiscount, itemPrice) {
  const { buy, free } = bogoDiscount;
  const totalItems = buy + free;
  const setPrice = itemPrice * buy;
  const freeItemsValue = itemPrice * free;
  const pricePerItem = setPrice / totalItems;
  const discountPercentage = Math.round((freeItemsValue / (setPrice + freeItemsValue)) * 100);

  return {
    buyQuantity: buy,
    freeQuantity: free,
    totalInSet: totalItems,
    setPrice,
    freeItemsValue,
    pricePerItem: Math.round(pricePerItem * 100) / 100,
    discountPercentage,
    effectiveSavings: `₹${Math.round(freeItemsValue * 100) / 100} per set`
  };
}

module.exports = {
  calculateItemDiscount,
  calculateOrderDiscount,
  isDiscountActive,
  getDiscountStatus,
  formatDiscountForDisplay,
  getFormattedActiveDiscounts,
  calculateBogoDetails
};