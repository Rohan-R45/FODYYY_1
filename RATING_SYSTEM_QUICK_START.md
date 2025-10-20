# Dynamic Rating System - Quick Start Guide

## 🚀 Quick Overview

When a student delivers an order, a rating modal appears. After they submit a rating (1-5 stars), **the restaurant rating updates in real-time** across all pages with a smooth animation.

```
Order Delivered → Modal Pops Up → Student Rates → 
Backend Calculates Average → Context Broadcasts Update → 
All Pages Update Instantly with Animation ✨
```

---

## 📍 File Locations

```
fodyyy-frontend/src/
├── context/
│   └── RatingContext.jsx          ← Pub/Sub system
├── components/
│   ├── RatingModal.jsx            ← Rating collection modal
│   └── RatingDisplay.jsx          ← Animated rating display
├── pages/
│   ├── OrderTracking.jsx          ← Shows modal + broadcasts update
│   ├── RestaurantList.jsx         ← Subscribes to updates
│   └── RestaurantDetail.jsx       ← Subscribes to updates
└── App.jsx                        ← RatingProvider wrapper
```

---

## 💻 How to Use in Your Components

### 1. Display Animated Ratings (RatingDisplay)

```jsx
import RatingDisplay from '../components/RatingDisplay';

function MyComponent() {
  return (
    <RatingDisplay 
      rating={4.5}
      totalReviews={50}
      size="md"           // sm, md, lg, xl
      showCount={true}    // Show (50+)
      animated={true}     // Enable smooth animation
    />
  );
}
```

**What it shows:** ⭐ 4.5 (50+)

When rating changes from 4.3 to 4.5:
- Old rating fades out
- New rating fades in with scale animation
- Number animates smoothly: 4.3 → 4.5
- Green checkmark appears briefly

### 2. Subscribe to Rating Updates

```jsx
import { useRatingUpdates } from '../context/RatingContext';

function RestaurantCard({ restaurant }) {
  const [rating, setRating] = useState(restaurant.rating);
  const { subscribeToRestaurant } = useRatingUpdates();

  // Subscribe when component mounts
  useEffect(() => {
    const unsubscribe = subscribeToRestaurant(
      restaurant._id, 
      (updatedRating) => {
        setRating(updatedRating.rating);
      }
    );

    // Cleanup on unmount
    return () => unsubscribe();
  }, [restaurant._id, subscribeToRestaurant]);

  return (
    <div>
      <h2>{restaurant.name}</h2>
      <RatingDisplay 
        rating={rating}
        totalReviews={restaurant.totalReviews}
        animated={true}
      />
    </div>
  );
}
```

### 3. Broadcast Rating Updates (from OrderTracking)

```jsx
import { useRatingUpdates } from '../context/RatingContext';

function OrderTracking() {
  const { updateRestaurantRating } = useRatingUpdates();

  const handleRatingSubmit = async (ratingData) => {
    // Submit to backend
    const response = await api.submitRating(orderId, ratingData);

    if (response.success) {
      // Notify all subscribers!
      updateRestaurantRating(
        response.restaurantId,
        response.newAverageRating,  // e.g., 4.22
        response.totalReviews       // e.g., 51
      );
    }
  };

  return (
    <RatingModal
      onSubmit={handleRatingSubmit}
      // ... other props
    />
  );
}
```

---

## 🎨 Customization Guide

### Change Animation Speed

In `RatingDisplay.jsx`, line 29:

```javascript
const duration = 600;  // milliseconds (600ms = 0.6s)
                       // Change to 300 for faster, 1000 for slower
```

### Change Checkmark Display Time

In `RatingDisplay.jsx`, line 21:

```javascript
setTimeout(() => setShowCheckmark(false), 2000);  // 2000ms = 2 seconds
                                                   // Change as needed
```

### Customize Modal Appearance

Edit `RatingModal.jsx`:
- Line 87: Change `max-w-md` to adjust modal width
- Line 142: Change title text
- Line 142: Change title styling
- Line 161: Change star colors (fill-[#FFC857] = gold)

### Customize Star Size

In `RatingDisplay.jsx`, update `sizeClasses` object:

```javascript
const sizeClasses = {
  sm: { star: 'w-4 h-4', text: 'text-sm' },      // Small
  md: { star: 'w-5 h-5', text: 'text-base' },    // Medium
  lg: { star: 'w-6 h-6', text: 'text-lg' },      // Large
  xl: { star: 'w-8 h-8', text: 'text-xl' },      // Extra Large
  // Add custom sizes
  // '2xl': { star: 'w-10 h-10', text: 'text-2xl' },
};
```

---

## 🔧 Backend Integration

### Required API Endpoint

```
POST /api/orders/:id/rating
```

**Request Body:**
```json
{
  "rating": 5,
  "comment": "Amazing food!",
  "studentId": "...",
  "restaurantId": "..."
}
```

**Expected Response:**
```json
{
  "success": true,
  "newAverageRating": 4.22,
  "totalReviews": 51,
  "message": "Rating submitted successfully"
}
```

### Rating Calculation Formula

Backend should calculate:

```
newAverageRating = (currentRating × currentReviews + newRating) / (currentReviews + 1)
```

**Example:**
- Current: 4.2 stars from 50 reviews
- New rating: 5 stars
- Calculation: (4.2 × 50 + 5) / 51 = 4.22 stars

---

## 🧪 Testing

### Manual Test

1. **Start app:**
   ```bash
   npm run dev
   ```

2. **Place an order and track it**

3. **Wait for "delivered" status** (or manually update in DB)

4. **Rating modal should appear automatically**

5. **Submit a rating**

6. **Verify:**
   - ✅ Success toast appears
   - ✅ Modal closes after 2 seconds
   - ✅ RestaurantList shows updated rating (if open)
   - ✅ RestaurantDetail shows updated rating (if open)
   - ✅ Smooth animation plays

### Debug in Console

```javascript
// Check if context is working
const { ratingUpdates } = useRatingUpdates();
console.log(ratingUpdates);  // Should show restaurant IDs and their ratings

// Check subscriptions
// (Open DevTools when on RestaurantList or RestaurantDetail)
// You won't see this directly, but updates should work smoothly
```

---

## ⚠️ Common Issues & Fixes

### Issue: Modal doesn't appear when order delivered
**Fix:** 
- Check backend returns order status as "delivered"
- Verify `trackingData?.order?.status` is exactly "delivered"
- Check browser console for errors

### Issue: Rating updates but no animation
**Fix:**
- Make sure `animated={true}` is passed to RatingDisplay
- Check that `animated` prop is actually being used

### Issue: Ratings don't update on other pages
**Fix:**
- Verify RestaurantList/RestaurantDetail call `subscribeToRestaurant`
- Check that unsubscribe cleanup function is called
- Ensure RatingProvider wraps all pages in App.jsx

### Issue: Memory leaks warning
**Fix:**
- Ensure cleanup functions are called:
  ```javascript
  useEffect(() => {
    const unsubscribe = subscribeToRestaurant(...);
    return () => unsubscribe();  // ← This is important!
  }, []);
  ```

---

## 📱 Mobile Responsiveness

### RatingDisplay Sizes

```
Size  | When to Use
------|------------------
sm    | Restaurant cards, list items
md    | Default, general use
lg    | Detail page headers
xl    | Hero sections, featured items
```

### Modal on Mobile

- ✅ Full-screen on mobile devices
- ✅ Larger touch targets for stars
- ✅ Full-width buttons
- ✅ Textarea full width

---

## 🔒 Security Considerations

### Already Handled
- ✅ JWT token validation (backend)
- ✅ Student ID verification (backend)
- ✅ Restaurant ID validation
- ✅ Rating range validation (1-5)
- ✅ Comment length limit (500 chars)

### Best Practices (Backend)
- Verify student actually ordered from this restaurant
- Verify student hasn't already rated this order
- Validate rating is between 1 and 5
- Sanitize comment text
- Log rating submissions for auditing

---

## 📊 Monitoring & Analytics

### Events to Track

```javascript
// Add analytics tracking in handleRatingSubmit:
analytics.track('rating_submitted', {
  orderId: order.id,
  restaurantId: restaurant.id,
  rating: ratingData.rating,
  hasComment: !!ratingData.comment,
  timestamp: new Date()
});
```

### Metrics to Monitor

- Ratings submitted per day
- Average rating value
- Percentage with comments
- Response time (submission → update)

---

## 🚀 Performance Tips

### What's Already Optimized
- ✅ Pub/Sub pattern (not Redux global state)
- ✅ Targeted subscriptions (not all subscribers)
- ✅ requestAnimationFrame for smooth animation
- ✅ useRef for subscribers (no re-renders)
- ✅ Proper cleanup functions (no memory leaks)

### Further Optimization (if needed)

```javascript
// Use useMemo to prevent unnecessary subscriptions
const restaurantIds = useMemo(
  () => restaurants.map(r => r._id).join(','),
  [restaurants]
);

useEffect(() => {
  // Subscribe only when restaurant IDs actually change
}, [restaurantIds]);
```

---

## 📚 Related Documentation

- Full Implementation: `RATING_SYSTEM_IMPLEMENTATION_COMPLETE.md`
- Component Details: Check JSDoc comments in source files
- Backend Integration: See API documentation

---

## ✅ Checklist for Developers

When implementing or modifying the rating system:

- [ ] Backend returns `newAverageRating` in rating submission response
- [ ] Backend calculates average using correct formula
- [ ] Frontend imports RatingContext where needed
- [ ] RatingProvider wraps Router in App.jsx
- [ ] Components use `subscribeToRestaurant` and cleanup properly
- [ ] RatingDisplay uses `animated={true}` for smooth updates
- [ ] Modal auto-shows when order status is "delivered"
- [ ] Modal auto-closes after successful submission
- [ ] Toast notification confirms submission
- [ ] Build passes without errors or warnings
- [ ] Manual testing confirms real-time updates work
- [ ] No memory leaks in browser console

---

**Questions?** Check the full implementation document: `RATING_SYSTEM_IMPLEMENTATION_COMPLETE.md`