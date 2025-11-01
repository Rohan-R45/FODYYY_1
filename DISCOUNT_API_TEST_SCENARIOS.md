# Student Discount System - API Test Scenarios

## Pre-Test Setup

Before running tests:
1. Start the backend: `npm start`
2. Have a restaurant ID ready (use existing or create new)
3. Have an auth token for the restaurant owner
4. Use Postman, cURL, or similar tool to test endpoints

---

## Test Scenario 1: Create Percentage Discount

### Test Case 1.1: Valid Percentage Discount

**Endpoint:** `POST /api/discounts/:restaurantId`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "type": "percentage",
  "value": 20,
  "description": "20% discount for all students",
  "startDate": "2024-01-15",
  "endDate": "2024-02-15",
  "isActive": true,
  "isVisible": true
}
```

**Expected Response:** ✅
```json
{
  "success": true,
  "message": "Discount created successfully",
  "data": {
    "discountId": "<id>",
    "discount": {
      "id": "<id>",
      "type": "percentage",
      "label": "Save 20%",
      "badge": "20% OFF",
      "value": 20,
      "isActive": true,
      "status": "active"
    }
  }
}
```

### Test Case 1.2: Invalid Percentage (Too High)

**Request Body:**
```json
{
  "type": "percentage",
  "value": 150,
  "startDate": "2024-01-15",
  "endDate": "2024-02-15"
}
```

**Expected Response:** ❌
```json
{
  "success": false,
  "message": "Percentage must be between 1 and 100"
}
```

### Test Case 1.3: Invalid Percentage (Zero)

**Request Body:**
```json
{
  "type": "percentage",
  "value": 0,
  "startDate": "2024-01-15",
  "endDate": "2024-02-15"
}
```

**Expected Response:** ❌
```json
{
  "success": false,
  "message": "Percentage must be between 1 and 100"
}
```

### Test Case 1.4: Invalid Date Range

**Request Body:**
```json
{
  "type": "percentage",
  "value": 20,
  "startDate": "2024-02-15",
  "endDate": "2024-01-15"
}
```

**Expected Response:** ❌
```json
{
  "success": false,
  "message": "End date must be after start date"
}
```

---

## Test Scenario 2: Create BOGO Discount

### Test Case 2.1: Valid BOGO Discount

**Request Body:**
```json
{
  "type": "bogo",
  "bogo": {
    "buy": 2,
    "free": 1
  },
  "applicableItems": ["pizza_id_1", "pizza_id_2"],
  "description": "Buy 2 pizzas get 1 free",
  "startDate": "2024-01-15",
  "endDate": "2024-02-15",
  "isActive": true,
  "isVisible": true
}
```

**Expected Response:** ✅
```json
{
  "success": true,
  "message": "Discount created successfully",
  "data": {
    "discountId": "<id>",
    "discount": {
      "id": "<id>",
      "type": "bogo",
      "label": "Buy 2 Get 1 Free",
      "badge": "BUY 2 GET 1",
      "bogo": { "buy": 2, "free": 1 },
      "isActive": true,
      "status": "active"
    }
  }
}
```

### Test Case 2.2: Invalid BOGO (Missing Free)

**Request Body:**
```json
{
  "type": "bogo",
  "bogo": {
    "buy": 2
  },
  "startDate": "2024-01-15",
  "endDate": "2024-02-15"
}
```

**Expected Response:** ❌
```json
{
  "success": false,
  "message": "BOGO discount requires buy and free quantities (both > 0)"
}
```

### Test Case 2.3: BOGO with Applicable Categories

**Request Body:**
```json
{
  "type": "bogo",
  "bogo": {
    "buy": 3,
    "free": 1
  },
  "applicableCategories": ["pizza", "pasta"],
  "description": "Buy 3 Get 1 Free on pizza & pasta",
  "startDate": "2024-01-15",
  "endDate": "2024-02-15"
}
```

**Expected Response:** ✅

---

## Test Scenario 3: Get Discounts

### Test Case 3.1: Get Public Discounts (No Auth)

**Endpoint:** `GET /api/discounts/:restaurantId`

**Expected Response:** ✅ (Only active, visible discounts)
```json
{
  "success": true,
  "data": {
    "restaurantId": "<id>",
    "restaurantName": "Restaurant Name",
    "discountCount": 2,
    "discounts": [
      {
        "id": "<id>",
        "type": "percentage",
        "label": "Save 20%",
        "status": "active",
        "statusMessage": "Active for 5 more day(s)",
        "daysRemaining": 5
      }
    ]
  }
}
```

### Test Case 3.2: Get Owner's Discounts (With Auth)

**Endpoint:** `GET /api/discounts/:restaurantId/owner`

**Headers:**
```
Authorization: Bearer <token>
```

**Expected Response:** ✅ (All discounts, including inactive/hidden)
```json
{
  "success": true,
  "data": {
    "restaurantId": "<id>",
    "restaurantName": "Restaurant Name",
    "totalDiscounts": 5,
    "activeCount": 3,
    "discounts": [ /* all discounts */ ]
  }
}
```

### Test Case 3.3: Get Discounts - Invalid Restaurant ID

**Endpoint:** `GET /api/discounts/invalid_id`

**Expected Response:** ❌
```json
{
  "success": false,
  "message": "Invalid restaurant ID format"
}
```

### Test Case 3.4: Get Discounts - Restaurant Not Found

**Endpoint:** `GET /api/discounts/507f1f77bcf86cd799439011`

**Expected Response:** ❌
```json
{
  "success": false,
  "message": "Restaurant not found"
}
```

---

## Test Scenario 4: Update Discount

### Test Case 4.1: Update Percentage Value

**Endpoint:** `PUT /api/discounts/:restaurantId/:discountId`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "value": 25
}
```

**Expected Response:** ✅

### Test Case 4.2: Toggle Discount Visibility

**Request Body:**
```json
{
  "isVisible": false
}
```

**Expected Response:** ✅
- Discount will no longer appear in public list
- Should still appear in owner's view

### Test Case 4.3: Update Discount Dates

**Request Body:**
```json
{
  "startDate": "2024-01-20",
  "endDate": "2024-02-20"
}
```

**Expected Response:** ✅

### Test Case 4.4: Invalid Update (Invalid Percentage)

**Request Body:**
```json
{
  "value": 150
}
```

**Expected Response:** ❌
```json
{
  "success": false,
  "message": "Percentage must be between 1 and 100"
}
```

### Test Case 4.5: Deactivate Discount

**Request Body:**
```json
{
  "isActive": false
}
```

**Expected Response:** ✅
- Discount removed from public/owner views
- No longer calculated for students

---

## Test Scenario 5: Delete Discount

### Test Case 5.1: Delete Valid Discount

**Endpoint:** `DELETE /api/discounts/:restaurantId/:discountId`

**Headers:**
```
Authorization: Bearer <token>
```

**Expected Response:** ✅
```json
{
  "success": true,
  "message": "Discount deleted successfully"
}
```

### Test Case 5.2: Verify Discount Deleted

**Follow up:** Get owner's discounts

**Expected Result:** Discount should not appear in list

### Test Case 5.3: Delete Nonexistent Discount

**Expected Response:** ❌
```json
{
  "success": false,
  "message": "Discount not found"
}
```

---

## Test Scenario 6: Authorization Tests

### Test Case 6.1: Create Discount - Not Authenticated

**Headers:** (No Authorization)

**Expected Response:** ❌
```json
{
  "success": false,
  "message": "Not authenticated"
}
```

### Test Case 6.2: Create Discount - Wrong User

**Setup:** Create discount as User A, try with User B's token

**Expected Response:** ❌
```json
{
  "success": false,
  "message": "Access denied. You can only manage discounts for your own restaurant"
}
```

### Test Case 6.3: Create Discount - Student User

**Setup:** Use student token instead of owner token

**Expected Response:** ❌
```json
{
  "success": false,
  "message": "You are not authorized to perform this action"
}
```

---

## Test Scenario 7: Discount Status & Visibility

### Test Case 7.1: Upcoming Discount Status

**Setup:** Create discount with `startDate` in the future

**Get Public Discounts:**
```json
{
  "status": "upcoming",
  "statusMessage": "This discount starts in 3 day(s)",
  "isActive": false
}
```

**Expected Result:** ✅ Discount not shown in public list

### Test Case 7.2: Expired Discount Status

**Setup:** Create discount with `endDate` in the past

**Get Owner Discounts:**
```json
{
  "status": "expired",
  "statusMessage": "This discount has expired",
  "isActive": false
}
```

**Expected Result:** ✅ Discount not shown in public list

### Test Case 7.3: Active Discount Status

**Setup:** Create discount with dates around today

**Get Public Discounts:**
```json
{
  "status": "active",
  "statusMessage": "Active for 5 more day(s)",
  "isActive": true,
  "daysRemaining": 5
}
```

**Expected Result:** ✅ Discount shown in public list

---

## Test Scenario 8: Discount Calculation Logic

### Test Case 8.1: Percentage Discount Calculation

**Setup:**
- Item Price: ₹100
- Quantity: 3
- Discount: 20%

**Expected Calculation:**
```
Original Total: ₹300
Discount Amount: ₹60 (300 × 20%)
Final Total: ₹240
Savings: 20%
```

### Test Case 8.2: BOGO Calculation

**Setup:**
- Item Price: ₹100
- Quantity: 5
- Discount: Buy 2 Get 1 Free

**Expected Calculation:**
```
Sets: 2 (5 ÷ 2)
Free Items: 2 (2 × 1)
Paid Items: 3 (5 - 2)
Final Total: ₹300 (3 × ₹100)
Savings: 40% (2 free out of 5)
```

### Test Case 8.3: BOGO with Partial Set

**Setup:**
- Item Price: ₹50
- Quantity: 3
- Discount: Buy 2 Get 1 Free

**Expected Calculation:**
```
Sets: 1 (3 ÷ 2)
Free Items: 1
Paid Items: 2 (3 - 1)
Final Total: ₹100 (2 × ₹50)
Savings: 33% (1 free out of 3)
```

---

## Test Scenario 9: Best Discount Selection

### Test Case 9.1: Multiple Discounts - Percentage Wins

**Setup:**
- Discount A: 10% off
- Discount B: Buy 3 Get 1 (≈25% off)

**Expected Result:** Discount B applied (higher savings)

### Test Case 9.2: Multiple Discounts - Higher Percentage Wins

**Setup:**
- Discount A: 20% off
- Discount B: 30% off

**Expected Result:** Discount B applied (30% > 20%)

---

## Test Scenario 10: Edge Cases

### Test Case 10.1: Discount with No Applicable Items/Categories

**Request Body:**
```json
{
  "type": "percentage",
  "value": 20,
  "applicableItems": [],
  "applicableCategories": [],
  "startDate": "2024-01-15",
  "endDate": "2024-02-15"
}
```

**Expected Result:** ✅ Applies to all items

### Test Case 10.2: Very Small Discount (1%)

**Request Body:**
```json
{
  "type": "percentage",
  "value": 1,
  "startDate": "2024-01-15",
  "endDate": "2024-02-15"
}
```

**Expected Result:** ✅ Valid (min 1%)

### Test Case 10.3: Very Large BOGO (Buy 10 Get 5)

**Request Body:**
```json
{
  "type": "bogo",
  "bogo": {
    "buy": 10,
    "free": 5
  },
  "startDate": "2024-01-15",
  "endDate": "2024-02-15"
}
```

**Expected Result:** ✅ Valid

### Test Case 10.4: Same Start and End Date

**Request Body:**
```json
{
  "type": "percentage",
  "value": 20,
  "startDate": "2024-01-15",
  "endDate": "2024-01-15"
}
```

**Expected Result:** ❌ (End must be after start)

---

## Manual Testing Checklist

- [ ] Percentage discount creation
- [ ] BOGO discount creation
- [ ] Invalid percentage rejection
- [ ] Invalid date range rejection
- [ ] Public discount listing (only active/visible)
- [ ] Owner discount listing (all discounts)
- [ ] Update discount
- [ ] Delete discount
- [ ] Auth checks (owner only)
- [ ] Status calculation (active/expired/upcoming)
- [ ] Visibility toggle
- [ ] Best discount selection
- [ ] BOGO calculation accuracy
- [ ] Percentage calculation accuracy
- [ ] Applicable items filtering
- [ ] Applicable categories filtering

---

## Performance Testing

### Test Case P.1: Large Discount List

**Setup:** Create 50 discounts for a restaurant

**Test:** `GET /api/discounts/:restaurantId/owner`

**Expected:** Response in < 500ms

### Test Case P.2: Discount Filter Performance

**Setup:** 50 discounts with various statuses

**Test:** Public list should only return 5-10 active/visible

**Expected:** Filtered response < 300ms

---

## Integration Testing Checklist

- [ ] Discount schema migration complete
- [ ] Helper methods on Restaurant model working
- [ ] Utility functions calculating correctly
- [ ] API endpoints all accessible
- [ ] Authorization middleware working
- [ ] Error handling consistent
- [ ] Caching enabled for GET endpoints
- [ ] Database indexes present

---

## Reporting Issues

If a test fails:

1. **Check Response Status Code**
   - 400 = Request validation error
   - 403 = Authorization error
   - 404 = Resource not found
   - 500 = Server error

2. **Review Error Message**
   - Should indicate exactly what's wrong

3. **Verify Setup**
   - Correct restaurant ID
   - Valid auth token
   - Proper date format

4. **Check Logs**
   - Backend console for errors

---

**Ready to test? Start with Test Scenario 1 and work through sequentially!** ✅
