// Utilities to compute order totals robustly across different backend shapes

export const getItemPrice = (item) => {
  if (!item) return 0;
  if (typeof item?.price === 'number') return item.price; // price at order time
  if (typeof item?.menuItem?.price === 'number') return item.menuItem.price; // populated
  if (typeof item?.menuItemId?.price === 'number') return item.menuItemId.price; // populated as menuItemId
  return 0;
};

export const getItemQty = (item) => {
  return Number(item?.quantity || 0);
};

export const getItemName = (item) => {
  return item?.name || item?.menuItem?.name || item?.menuItemId?.name || 'Item';
};

export const computeSubtotal = (items) => {
  if (!Array.isArray(items)) return 0;
  return items.reduce((sum, it) => sum + getItemPrice(it) * getItemQty(it), 0);
};

export const computeTotal = (order) => {
  if (!order) return 0;
  // Use provided subtotal if present, else fall back to totalAmount (items sum) or recompute from items
  const itemsSubtotal = typeof order?.subtotal === 'number'
    ? order.subtotal
    : (typeof order?.totalAmount === 'number' ? order.totalAmount : computeSubtotal(order.items));

  const deliveryFee = Number(order?.deliveryFee || 0);
  const tax = Number(order?.tax || 0);
  const discount = typeof order?.discount === 'number' ? order.discount : Number(order?.discount?.amount || 0);
  const total = itemsSubtotal + deliveryFee + tax - discount;
  return Number.isFinite(total) && total >= 0 ? total : 0;
};