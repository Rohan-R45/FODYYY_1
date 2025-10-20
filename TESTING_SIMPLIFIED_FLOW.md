# 🧪 End-to-End Testing Guide - Simplified Status Flow

## ✅ Pre-Testing Checklist

- [ ] Backend running on `http://localhost:5000`
- [ ] Frontend running on `http://localhost:5173`
- [ ] MongoDB connected
- [ ] Browser DevTools open (F12)
- [ ] Two browser windows/tabs open:
  - Tab 1: Student account
  - Tab 2: Restaurant account

---

## 🧑‍🎓 Test 1: Student Places Order

### Steps:

1. **Open Browser Tab 1 (Student)**
   - Go to `http://localhost:5173`
   - Login as student

2. **Browse Restaurants**
   - Click on any restaurant
   - View menu items

3. **Add Items to Cart**
   - Add 2-3 items
   - Click "View Cart"

4. **Checkout**
   - Fill in delivery address
   - Select payment method (COD or UPI)
   - Click "Place Order"

### Expected Result:
```
✅ Order created successfully
✅ Toast: "Order placed successfully"
✅ Redirected to OrderTracking page
✅ Status shows: 📝 PENDING
```

### What You Should See:
```
Order Timeline:
├─ 📝 Order Placed ✅ (Completed)
├─ ✅ Order Confirmed ○ (Pending)
└─ 🎉 Delivered ○ (Pending)

Current Status: 🕐 PENDING
```

---

## 👨‍💼 Test 2: Restaurant Confirms Order

### Setup:
- **Tab 1**: Keep student on OrderTracking
- **Tab 2**: Open as restaurant owner
  - Go to `http://localhost:5173`
  - Login as restaurant owner

### Steps in Tab 2:

1. **Go to Restaurant Dashboard**
   - Click "Restaurant" in nav
   - Select "My Orders" or dashboard

2. **Find the Order**
   - Look for order you just created
   - Status should be 🕐 **PENDING**

3. **Update Status**
   - Click [Update Status] button
   - Modal should open with TWO options:
     ```
     ◉ Confirm Order (Blue)
     ○ Cancel Order (Red)
     ```

4. **Confirm the Order**
   - Select "Confirm Order"
   - Add optional note: "Preparing your food..."
   - Click [Update Status]

### Expected Result (Tab 2):
```
✅ Toast: "Order status updated to confirmed"
✅ Order card updates
✅ Status badge changes to: ✅ CONFIRMED
✅ [Update Status] button now shows:
   - ◉ Mark as Delivered (Green)
   - ○ Cancel Order (Red)
```

### Expected Result (Tab 1):
```
✅ Timeline updates automatically (NO refresh needed!)
✅ Status changes to: ✅ CONFIRMED
✅ Icon updates: ✅ Order Confirmed
✅ No Rating Card yet (not delivered)
```

---

## 🎉 Test 3: Restaurant Marks as Delivered

### Steps in Tab 2 (Restaurant):

1. **Click [Update Status] Again**
   - Modal opens with TWO options:
     ```
     ◉ Mark as Delivered (Green)
     ○ Cancel Order (Red)
     ```

2. **Mark as Delivered**
   - Select "Mark as Delivered"
   - Add note: "Order delivered to hostel"
   - Click [Update Status]

### Expected Result (Tab 2):
```
✅ Toast: "Order status updated to delivered"
✅ Status badge changes to: 🎉 DELIVERED
✅ [Update Status] button becomes DISABLED
   (Cannot make further changes)
```

### Expected Result (Tab 1):
```
✅ Timeline updates automatically
✅ Status changes to: 🎉 DELIVERED
✅ Icon updates: 🎉 Delivered
✅ Rating Card appears below order details:
   
   ┌──────────────────────────────┐
   │ ⭐ Rate This Order           │
   │                              │
   │ Share your thoughts to help  │
   │ others discover great food!  │
   │                              │
   │ [⭐ Rate This Order Now]     │
   └──────────────────────────────┘
```

---

## ⭐ Test 4: Student Rates the Order

### Steps in Tab 1 (Student):

#### Option A: Via Modal (Auto-appears)

1. **Modal Pops Up Automatically**
   - Title: "How was your order?"
   - Stars: ☆ ☆ ☆ ☆ ☆ (Click to rate)
   - Comments: [Optional text field]

2. **Rate the Order**
   - Click on 4th star (4-star rating)
   - Add comment: "Great food, quick delivery!"
   - Click [Submit Rating]

#### Option B: Via Card Button

If modal didn't auto-show:
1. Scroll down to Rating Card
2. Click [⭐ Rate This Order Now]
3. Same modal appears

### Expected Result:
```
✅ Modal closes after 2 seconds
✅ Toast: "Rating submitted successfully"
✅ Rating Card now shows:

   ┌────────────────────────────────┐
   │ Your Rating: ⭐⭐⭐⭐ (4.0)   │
   │                                │
   │ "Great food, quick delivery!"  │
   │                                │
   │ Thank you for rating!          │
   │ Your feedback helps restaurants│
   │ serve better food.             │
   │                                │
   │ [Edit]  [Close]                │
   └────────────────────────────────┘
```

---

## 📊 Test 5: Verify Real-time Rating Updates

### Steps:

1. **Open RestaurantList in New Tab**
   - Tab 3: `http://localhost:5173/restaurants`
   - Find the restaurant from this order
   - Note the current rating

2. **Back to Tab 1 - Student Rates**
   - If not already rated, complete Test 4
   - Submit a 5-star rating

### Expected Result:
```
✅ Tab 3 updates IMMEDIATELY (without refresh!)
✅ Rating display shows smooth animation:
   - Old rating fades out
   - New rating fades in
   - Numbers animate: 4.2 → 4.3
   - Green checkmark appears briefly
✅ Rating badge updates in restaurant card
```

---

## ✋ Test 6: Verify Invalid Transitions are Blocked

### Test 6a: Cannot Skip Steps (Pending → Delivered)

**Setup**: Create a new order in Tab 1

**In Tab 2** (Restaurant):
1. **Try to Trick the System**
   - Open browser DevTools (F12)
   - Go to Network tab
   - Try to call API directly:
     ```javascript
     fetch('http://localhost:5000/api/orders/{orderId}/status', {
       method: 'PUT',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ status: 'delivered' })
     })
     ```

### Expected Result:
```
❌ Backend returns error:
{
  "success": false,
  "message": "Cannot change status from pending to delivered"
}

✅ Order status remains PENDING
✅ Error toast shows on UI
```

### Test 6b: Cannot Go Backward

**After confirming an order**:
1. In DevTools, try:
   ```javascript
   status: 'pending'  // Try to go back
   ```

### Expected Result:
```
❌ Backend rejects:
"Cannot change status from confirmed to pending"

✅ Order stays CONFIRMED
```

---

## 🚫 Test 7: Cancel Order at Different Stages

### Test 7a: Cancel from Pending

1. **Create new order** (Tab 1)
2. **In Tab 2** (Restaurant):
   - Click [Update Status]
   - Select "Cancel Order"
   - Add note: "Out of ingredients"
   - Click [Update Status]

### Expected Result:
```
✅ Status → 🚫 CANCELLED
✅ No more status changes allowed
✅ In Tab 1: Timeline updates
✅ Toast: "Order cancelled"
✅ Rating card does NOT appear
```

### Test 7b: Cancel from Confirmed

1. **Confirm an order** first
2. **Click [Update Status]**
   - Modal shows:
     ```
     ◉ Mark as Delivered
     ○ Cancel Order  ← Click this
     ```
3. **Select Cancel, Add note, Click Update**

### Expected Result:
```
✅ Status → 🚫 CANCELLED
✅ Student sees order cancelled
✅ No rating modal
```

---

## 🔄 Test 8: Multiple Orders Simultaneously

### Setup:
1. **Tab 1**: Student logged in
2. **Tab 2**: Restaurant owner logged in
3. **Tab 3**: RestaurantList page

### Steps:

1. **Tab 1**: Place 3 different orders
2. **Tab 2**: 
   - Confirm order #1
   - Deliver order #2
   - Cancel order #3

### Expected Result:
```
✅ All changes update correctly
✅ Tab 3 (RestaurantList) updates in real-time
✅ Each order has correct status
✅ No conflicts or data corruption
```

---

## 🧪 Test 9: Browser Console - No Errors

### Steps:

1. **Open DevTools** (F12)
2. **Go to Console tab**
3. **Perform entire flow**:
   - Place order
   - Confirm order
   - Deliver order
   - Rate order

### Expected Result:
```
✅ No red errors in console
✅ No warnings about missing props
✅ No "Cannot find X" messages
✅ Status updates log:
   console: "Status updated: confirmed"
   console: "Status updated: delivered"
```

---

## 📱 Test 10: Mobile Responsiveness

### On Mobile Device or DevTools Device Mode:

#### Restaurant Dashboard:
```
✅ Status modal fits screen
✅ Buttons are large enough to tap
✅ Text is readable
✅ All options visible
✅ No horizontal scrolling
```

#### Student Order Tracking:
```
✅ Timeline displays vertically
✅ Rating card is full-width
✅ Rating stars are large enough
✅ Comments textarea is usable
✅ Buttons are tappable (48px minimum)
```

---

## 🐛 Troubleshooting During Testing

### Issue: "Order not found" Error

**Fix**:
1. Ensure you're using the exact order ID
2. Check order exists in MongoDB:
   ```javascript
   db.orders.findOne({ orderNumber: 'ORD123456' })
   ```
3. Refresh page and try again

### Issue: Status Modal Doesn't Show

**Fix**:
1. Check browser console for errors (F12)
2. Ensure order ID is valid
3. Verify user is logged in as restaurant owner
4. Try refreshing the page

### Issue: Real-time Updates Don't Work

**Fix**:
1. Check both tabs are connected to same backend
2. Verify backend is running: `http://localhost:5000`
3. Open Network tab to see requests
4. Check for CORS errors

### Issue: Rating Card Doesn't Appear

**Fix**:
1. Verify order status is exactly "delivered"
2. Check browser console (F12) for errors
3. Verify OrderTracking.jsx has rating card component
4. Try hard refresh: `Ctrl + Shift + R`

---

## ✅ Final Verification Checklist

### Backend ✅
- [ ] `statusTransitions` only allows: pending→confirmed, confirmed→delivered
- [ ] `validStatuses` is: ['pending', 'confirmed', 'delivered', 'cancelled']
- [ ] `statusTimeline` shows 3 steps (not 5)
- [ ] PUT endpoint rejects invalid transitions
- [ ] actualDeliveryTime sets when status = delivered

### Frontend ✅
- [ ] `getNextStatuses` only shows valid options
- [ ] Modal buttons match backend allowed transitions
- [ ] No "Preparing" or "Ready" options in UI
- [ ] Timeline shows 3 steps
- [ ] Rating card appears when status = delivered
- [ ] Rating modal auto-shows on delivery

### Integration ✅
- [ ] Student can place order (status = pending)
- [ ] Restaurant can confirm (pending → confirmed)
- [ ] Restaurant can deliver (confirmed → delivered)
- [ ] Student sees rating modal on delivery
- [ ] Student can submit rating
- [ ] Rating updates appear on RestaurantList in real-time
- [ ] No invalid transitions accepted
- [ ] Error messages are clear

---

## 📊 Success Criteria

| Test | Expected | Result |
|---|---|---|
| Place Order | Status: Pending | ✅ Pass |
| Confirm Order | Status: Confirmed | ✅ Pass |
| Mark Delivered | Status: Delivered | ✅ Pass |
| Rating Modal | Auto-appears | ✅ Pass |
| Submit Rating | Card shows rating | ✅ Pass |
| Real-time Update | Other pages update | ✅ Pass |
| Invalid Transition | Backend rejects | ✅ Pass |
| Cancel Order | Stops further action | ✅ Pass |
| Mobile View | Responsive design | ✅ Pass |
| No Errors | Clean console | ✅ Pass |

---

## 🎉 All Tests Passed!

If all tests pass with expected results, the simplified status flow is **production-ready**! 🚀

---

## 📝 Test Results Summary

**Date**: ________________
**Tester**: ________________
**Build**: ________________

### Results:
- Backend Tests: ✅ / ✅
- Frontend Tests: ✅ / ✅
- Integration Tests: ✅ / ✅
- Mobile Tests: ✅ / ✅
- Error Handling: ✅ / ✅

**Overall Status**: ________________

**Issues Found**: ________________

**Sign Off**: ________________