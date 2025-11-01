# Student Discount System - Complete Implementation Guide

## Overview

The Student Discount System allows restaurant owners to create and manage special discount offers exclusively for student users. The system supports two discount types:

1. **Percentage Discounts** - e.g., "Save 20%"
2. **Buy One Get One (BOGO)** - e.g., "Buy 2 Get 1 Free"

Discounts can be applied to specific items, categories, or all items in a restaurant's menu, with optional date-based validity periods.

---

## Architecture

### Database Schema Updates

**File Modified:** `models/Restaurant.js`

Added `studentDiscounts` array to Restaurant schema:

```javascript
studentDiscounts: [
  {
    _id: ObjectId (auto-generated),
    type: String ('percentage' | 'bogo'),
    value: Number (1-100 for percentage),
    bogo: { buy: Number, free: Number },
    applicableItems: [ObjectId],    // Empty = applies to all items
    applicableCategories: [String], // Empty = applies to all categories
    description: String,
    startDate: Date (required),
    endDate: Date (required),
    isActive: Boolean (default: true),
    isVisible: Boolean (default: true),
    createdAt: Date,
    updatedAt: Date
  }
]
```

### Helper Methods on Restaurant Model

```javascript
// Get active discounts with optional filters
getActiveDiscounts(filters = {})

// Get best applicable discount for a specific item
getApplicableDiscount(menuItemId, category)

// Create new discount
addDiscount(discountData)

// Update existing discount
updateDiscount(discountId, updateData)

// Delete discount
deleteDiscount(discountId)
```

### Utility Functions

**File Created:** `utils/discountCalculator.js`

```javascript
// Calculate discount for single item
calculateItemDiscount(price, quantity, discount)

// Calculate total discount for order
calculateOrderDiscount(items)

// Check if discount is currently active
isDiscountActive(discount)

// Get discount status and message
getDiscountStatus(discount)

// Format discount for frontend display
formatDiscountForDisplay(discount)

// Get all active, visible discounts
getFormattedActiveDiscounts(discounts)

// Calculate BOGO details
calculateBogoDetails(bogoDiscount, itemPrice)
```

---

## API Endpoints

**Base URL:** `/api/discounts`

### 1. Get Public Discounts (Public - Students)

```
GET /api/discounts/:restaurantId
```

**Description:** Fetch all active, visible discounts for a restaurant (public view)

**Response:**
```json
{
  "success": true,
  "data": {
    "restaurantId": "123abc",
    "restaurantName": "Restaurant Name",
    "discountCount": 3,
    "discounts": [
      {
        "id": "discount1",
        "type": "percentage",
        "label": "Save 20%",
        "description": "20% off on all items",
        "badge": "20% OFF",
        "value": 20,
        "isActive": true,
        "status": "active",
        "statusMessage": "Active for 5 more day(s)",
        "applicableItems": [],
        "applicableCategories": [],
        "startDate": "2024-01-01T00:00:00.000Z",
        "endDate": "2024-01-31T23:59:59.000Z",
        "daysRemaining": 5
      }
    ]
  }
}
```

### 2. Get Owner's Discounts

```
GET /api/discounts/:restaurantId/owner
Authorization: Bearer <token>
```

**Access:** Restaurant owner only

**Description:** Fetch all discounts for restaurant (owner view - includes inactive/hidden)

**Response:**
```json
{
  "success": true,
  "data": {
    "restaurantId": "123abc",
    "restaurantName": "Restaurant Name",
    "totalDiscounts": 5,
    "activeCount": 3,
    "discounts": [
      {
        "_id": "discount1",
        "type": "percentage",
        "value": 20,
        "description": "20% off",
        "startDate": "2024-01-01T00:00:00.000Z",
        "endDate": "2024-01-31T23:59:59.000Z",
        "isActive": true,
        "isVisible": true,
        "status": {
          "isActive": true,
          "status": "active",
          "message": "Active for 5 more day(s)",
          "daysRemaining": 5
        }
      }
    ]
  }
}
```

### 3. Create Discount (Owner Only)

```
POST /api/discounts/:restaurantId
Authorization: Bearer <token>
Content-Type: application/json
```

**Access:** Restaurant owner only

**Request Body:**
```json
{
  "type": "percentage",              // Required: 'percentage' or 'bogo'
  "value": 20,                       // For percentage discount (1-100)
  "bogo": {                          // For BOGO discount
    "buy": 2,
    "free": 1
  },
  "applicableItems": ["item1", "item2"],  // Optional: empty = all items
  "applicableCategories": ["pizza"],      // Optional: empty = all categories
  "description": "20% off all items",
  "startDate": "2024-01-01T00:00:00Z",
  "endDate": "2024-01-31T23:59:59Z",
  "isActive": true,
  "isVisible": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Discount created successfully",
  "data": {
    "discountId": "123abc",
    "discount": { /* formatted discount object */ }
  }
}
```

**Validation:**
- `type`: Required, must be 'percentage' or 'bogo'
- `startDate` and `endDate`: Required, endDate must be after startDate
- `value` (percentage): Must be between 1-100
- `bogo`: Must include both `buy` and `free` values > 0

### 4. Update Discount (Owner Only)

```
PUT /api/discounts/:restaurantId/:discountId
Authorization: Bearer <token>
Content-Type: application/json
```

**Access:** Restaurant owner only

**Request Body:** (All fields optional - only provided fields are updated)
```json
{
  "value": 25,
  "description": "Updated description",
  "isActive": false,
  "isVisible": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Discount updated successfully",
  "data": {
    "discountId": "123abc",
    "discount": { /* updated discount object */ }
  }
}
```

### 5. Delete Discount (Owner Only)

```
DELETE /api/discounts/:restaurantId/:discountId
Authorization: Bearer <token>
```

**Access:** Restaurant owner only

**Response:**
```json
{
  "success": true,
  "message": "Discount deleted successfully"
}
```

### 6. Get Specific Discount Details

```
GET /api/discounts/:restaurantId/:discountId
```

**Description:** Fetch details of a specific discount (only if active and visible, or owner is requesting)

**Response:**
```json
{
  "success": true,
  "data": {
    "discount": { /* formatted discount object */ }
  }
}
```

---

## Usage Examples

### Example 1: Create a 20% Percentage Discount

```bash
curl -X POST http://localhost:5000/api/discounts/restaurant123 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "percentage",
    "value": 20,
    "description": "20% off all items for students",
    "startDate": "2024-01-01T00:00:00Z",
    "endDate": "2024-02-01T00:00:00Z",
    "isActive": true,
    "isVisible": true
  }'
```

### Example 2: Create a Buy 2 Get 1 Free Discount

```bash
curl -X POST http://localhost:5000/api/discounts/restaurant123 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "bogo",
    "bogo": {
      "buy": 2,
      "free": 1
    },
    "applicableItems": ["pizza1", "pizza2"],
    "description": "Buy 2 pizzas, get 1 free",
    "startDate": "2024-01-01T00:00:00Z",
    "endDate": "2024-02-01T00:00:00Z",
    "isActive": true,
    "isVisible": true
  }'
```

### Example 3: Fetch Student's Visible Discounts

```bash
curl http://localhost:5000/api/discounts/restaurant123
```

---

## Discount Calculation Logic

### Percentage Discount

```javascript
Discount Amount = (Item Price × Quantity × Percentage) / 100
Final Price = (Item Price × Quantity) - Discount Amount

Example:
  Item Price = ₹100, Quantity = 2, Discount = 20%
  Discount Amount = (100 × 2 × 20) / 100 = ₹40
  Final Price = 200 - 40 = ₹160
```

### BOGO Discount

```javascript
Total Sets = floor(Quantity / Buy)
Free Items = Total Sets × Free
Total Paid = Quantity - Free Items
Discount Amount = Item Price × Free Items

Example:
  Item Price = ₹100, Quantity = 5, Buy 2 Get 1 Free
  Total Sets = floor(5 / 2) = 2
  Free Items = 2 × 1 = 2
  Total Paid = 5 - 2 = 3
  Discount Amount = 100 × 2 = ₹200
  Final Price = 300 (3 items paid)
```

### Best Discount Win Strategy

When multiple discounts apply to an item, the system calculates the savings percentage for each:

- **Percentage Discount:** Savings = discount.value%
- **BOGO Discount:** Savings = (free / (buy + free)) × 100%

The discount with the highest savings percentage is applied.

---

## Frontend Integration (Phase 2)

### Components Needed

1. **DiscountManagement** (Owner Dashboard)
   - List all discounts (active/inactive)
   - Create new discount form
   - Edit discount modal
   - Delete confirmation

2. **DiscountBadges** (Student View)
   - Display discount badges on menu items
   - Show "Save X%" or "Buy X Get Y" labels
   - Color-coded badges (green for percentage, blue for BOGO)

3. **DiscountSummary** (Cart/Checkout)
   - Show discounts applied to each item
   - Total savings display
   - Discount breakdown

### Service Integration

Add to `fodyyy-frontend/src/services/discountService.js`:

```javascript
// Get public discounts
export const getRestaurantDiscounts = (restaurantId) => {
  return api.get(`/discounts/${restaurantId}`);
};

// Get owner's discounts (requires auth)
export const getOwnerDiscounts = (restaurantId) => {
  return api.get(`/discounts/${restaurantId}/owner`);
};

// Create discount (requires auth)
export const createDiscount = (restaurantId, data) => {
  return api.post(`/discounts/${restaurantId}`, data);
};

// Update discount (requires auth)
export const updateDiscount = (restaurantId, discountId, data) => {
  return api.put(`/discounts/${restaurantId}/${discountId}`, data);
};

// Delete discount (requires auth)
export const deleteDiscount = (restaurantId, discountId) => {
  return api.delete(`/discounts/${restaurantId}/${discountId}`);
};
```

---

## Testing Checklist

- [ ] Create percentage discount endpoint works
- [ ] Create BOGO discount endpoint works
- [ ] Get public discounts returns only active, visible discounts
- [ ] Get owner discounts returns all discounts
- [ ] Update discount field validation works
- [ ] Delete discount endpoint works
- [ ] Discount status calculation is accurate
- [ ] Best discount selection works (multiple discounts on same item)
- [ ] Date range validation works (start < end)
- [ ] Permission checks work (only owner can modify)
- [ ] Percentage validation (1-100) works
- [ ] BOGO validation (buy > 0, free > 0) works
- [ ] Expired discounts are not returned in public view
- [ ] Inactive discounts are not returned in public view

---

## Database Migration (If Needed)

If you have existing restaurants in the database, run this to initialize `studentDiscounts` array:

```javascript
// In MongoDB shell or script
db.restaurants.updateMany(
  { studentDiscounts: { $exists: false } },
  { $set: { studentDiscounts: [] } }
);
```

---

## Performance Considerations

1. **Caching:** Discount GET endpoints use 30-second cache (shorter than menu items due to frequent changes)
2. **Indexing:** Consider adding index on `studentDiscounts.isActive` and `studentDiscounts.endDate` if many restaurants
3. **Date Calculations:** Discount status is calculated on-the-fly (not pre-calculated)
4. **Best Discount:** Only calculated when needed (during order creation)

---

## Error Handling

| Error | Status | Message |
|-------|--------|---------|
| Invalid restaurant ID | 400 | Invalid restaurant ID format |
| Restaurant not found | 404 | Restaurant not found |
| Discount not found | 404 | Discount not found |
| Invalid discount type | 400 | Discount type must be 'percentage' or 'bogo' |
| Invalid percentage | 400 | Percentage must be between 1 and 100 |
| Invalid date range | 400 | End date must be after start date |
| Permission denied | 403 | Access denied. You can only manage discounts for your own restaurant |
| Missing required fields | 400 | [Field] is required |

---

## Future Enhancements

1. **Student Verification** - Only verified students can use discounts
2. **Discount Analytics** - Track discount usage and savings
3. **Bulk Discount Management** - Apply discounts to multiple restaurants
4. **Tiered Discounts** - Different discounts for different order amounts
5. **Loyalty Points** - Earn points with discounts
6. **Seasonal Discounts** - Template discounts for holidays
7. **A/B Testing** - Test different discount strategies

---

## Files Modified/Created

**Created:**
- `utils/discountCalculator.js` - Discount calculation utilities
- `routes/discounts.js` - Discount API endpoints

**Modified:**
- `models/Restaurant.js` - Added studentDiscounts schema and methods
- `server.js` - Added discount routes and caching

**Not Modified (Ready for Phase 2):**
- Frontend components
- Order processing logic
- Cart calculation

---

## Support & Troubleshooting

### Discount not showing in public list
- Check if `isActive` is `true`
- Check if `isVisible` is `true`
- Check if current date is between `startDate` and `endDate`

### Discount not deleting
- Ensure you're authenticated as the restaurant owner
- Ensure the discount ID is correct (24-char hex string)

### Best discount calculation not working
- Ensure discount calculation logic is called during order creation
- Check if both percentage and BOGO discounts are properly formatted

---

**Status:** Backend implementation complete. Ready for:
1. Order integration (apply discounts during order creation)
2. Frontend UI development
3. Testing and QA
