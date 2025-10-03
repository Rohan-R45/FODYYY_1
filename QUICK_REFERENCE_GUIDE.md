# FODYYY Premium Theme - Quick Reference Guide

## 🎨 Quick Color Reference

```css
/* Gradients - Copy & Paste */
bg-gradient-to-r from-orange-500 to-yellow-500        /* Buttons, bars */
bg-gradient-to-r from-orange-600 to-yellow-600        /* Text gradient */
bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-50  /* Page bg */
bg-gradient-to-br from-orange-100 to-yellow-100       /* Badges, circles */

/* Borders */
border-2 border-orange-100        /* Default */
border-2 border-orange-200        /* Hover */
border-2 border-orange-300        /* Active */
border-2 border-orange-600        /* Accent */

/* Text Colors */
text-orange-600                   /* Primary orange */
text-orange-500                   /* Lighter orange */
text-gray-700                     /* Body text */
text-gray-600                     /* Secondary text */
```

---

## 🎬 Quick Animation Reference

```javascript
// Page Entrance
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}

// Stagger (in map)
transition={{ delay: index * 0.05 }}

// Button Hover
whileHover={{ scale: 1.05 }}
whileTap={{ scale: 0.95 }}

// Card Hover
whileHover={{ scale: 1.01 }}

// Icon Spring
transition={{ type: "spring", delay: 0.2 }}

// Pulse
animate={{ scale: [1, 1.2, 1] }}
transition={{ repeat: Infinity, duration: 2 }}
```

---

## 🎯 Quick Component Templates

### Premium Button
```jsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-6 py-3 rounded-full font-semibold shadow-lg"
>
  Button Text
</motion.button>
```

### Premium Card
```jsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  whileHover={{ scale: 1.01 }}
  className="bg-white rounded-3xl shadow-md border-2 border-orange-100 hover:border-orange-300 p-6"
>
  {/* Content */}
</motion.div>
```

### Gradient Text
```jsx
<h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">
  Heading
</h2>
```

### Icon Circle
```jsx
<div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-full flex items-center justify-center">
  <Icon className="w-10 h-10 text-orange-600" />
</div>
```

### Badge
```jsx
<span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-orange-100 to-yellow-100 border border-orange-200 text-xs font-semibold text-orange-700">
  <Icon className="w-3.5 h-3.5" />
  Badge Text
</span>
```

---

## 🎨 Quick Icon Reference

```javascript
// Import
import { 
  ArrowLeft,      // Back button
  Heart,          // Favorite
  Search,         // Search
  Filter,         // Filters
  Plus, Minus,    // Quantity
  ShoppingCart,   // Cart
  Utensils,       // Food
  Leaf,           // Vegetarian
  Sparkles,       // Special
  ChefHat,        // Empty state
  Clock,          // Time
  MapPin,         // Location
  Phone,          // Contact
  Star,           // Rating
  Edit, Trash2    // Actions
} from 'lucide-react';

// Use
<Icon className="w-5 h-5 text-orange-500" />
```

---

## 📐 Quick Sizing Reference

```css
/* Border Radius */
rounded-full    /* Pills, circular buttons */
rounded-3xl     /* Cards, modals */
rounded-2xl     /* Images */
rounded-xl      /* Medium elements */
rounded-lg      /* Small buttons */

/* Shadows */
shadow-sm       /* Subtle */
shadow-md       /* Medium */
shadow-lg       /* Prominent */
shadow-xl       /* Hover */
shadow-2xl      /* Fixed elements */

/* Spacing */
p-4             /* Small padding */
p-6             /* Medium padding */
p-8             /* Large padding */
gap-2           /* Small gap */
gap-3           /* Medium gap */
gap-4           /* Large gap */
```

---

## 🎯 Quick Pattern Reference

### Empty State
```jsx
<motion.div className="text-center py-16">
  <motion.div
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    transition={{ type: "spring" }}
    className="w-20 h-20 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4"
  >
    <Icon className="w-10 h-10 text-orange-600" />
  </motion.div>
  <h3 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent mb-2">
    Title
  </h3>
  <p className="text-gray-600 mb-6">Description</p>
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-6 py-3 rounded-full font-semibold shadow-lg"
  >
    Action
  </motion.button>
</motion.div>
```

### Filter Pills
```jsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  className={`px-4 py-2 rounded-full text-sm font-medium border-2 ${
    active 
      ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white border-orange-500' 
      : 'bg-white text-gray-700 border-orange-200 hover:border-orange-400'
  }`}
>
  Filter Text
</motion.button>
```

### Quantity Controls
```jsx
<motion.div 
  initial={{ scale: 0.8 }}
  animate={{ scale: 1 }}
  className="flex items-center bg-gradient-to-r from-orange-500 to-yellow-500 rounded-lg overflow-hidden"
>
  <motion.button 
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    className="w-8 h-8 grid place-items-center text-white"
  >
    <Minus className="w-4 h-4" />
  </motion.button>
  <span className="w-8 text-center font-bold text-white">{qty}</span>
  <motion.button 
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    className="w-8 h-8 grid place-items-center text-white"
  >
    <Plus className="w-4 h-4" />
  </motion.button>
</motion.div>
```

---

## 📱 Quick Responsive Reference

```css
/* Mobile First */
className="text-sm md:text-base lg:text-lg"
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
className="p-4 md:p-6 lg:p-8"

/* Breakpoints */
sm: 640px   /* Small tablets */
md: 768px   /* Tablets */
lg: 1024px  /* Desktops */
xl: 1280px  /* Large desktops */
```

---

## 🎨 Quick State Reference

```css
/* Hover States */
hover:bg-orange-50
hover:border-orange-400
hover:shadow-lg
hover:scale-105

/* Focus States */
focus:ring-2 focus:ring-orange-500
focus:border-orange-500
focus:outline-none

/* Active States */
active:scale-95
active:bg-orange-600

/* Disabled States */
disabled:opacity-50
disabled:cursor-not-allowed
```

---

## 🚀 Quick Setup Checklist

### For New Component
- [ ] Import Framer Motion
- [ ] Import Lucide React icons
- [ ] Add gradient background
- [ ] Add entrance animations
- [ ] Add hover/tap effects
- [ ] Add border-2 styling
- [ ] Add rounded-3xl
- [ ] Add shadow-md
- [ ] Test responsive
- [ ] Test accessibility

---

## 📚 Documentation Files

1. **MENU_PAGE_PREMIUM_UPGRADE.md** - MenuPage details
2. **RESTAURANT_DETAIL_PREMIUM_UPGRADE.md** - RestaurantDetail details
3. **COMPLETE_PREMIUM_THEME_SUMMARY.md** - All pages overview
4. **MENU_PAGE_BEFORE_AFTER.md** - MenuPage comparison
5. **RESTAURANT_DETAIL_BEFORE_AFTER.md** - RestaurantDetail comparison
6. **COMPLETE_APP_TRANSFORMATION_SUMMARY.md** - Executive summary
7. **QUICK_REFERENCE_GUIDE.md** - This file

---

## 🎯 Common Tasks

### Add New Page
1. Copy page background: `bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-50`
2. Add motion wrapper: `<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>`
3. Use premium card pattern
4. Add stagger animations
5. Use gradient buttons

### Add New Button
1. Use motion.button
2. Add whileHover/whileTap
3. Use gradient background
4. Add rounded-full
5. Add shadow-lg

### Add New Card
1. Use motion.div
2. Add entrance animation
3. Use rounded-3xl
4. Add border-2 border-orange-100
5. Add hover effects

### Add New Icon
1. Import from lucide-react
2. Use w-5 h-5 (or appropriate size)
3. Use text-orange-500 (or appropriate color)
4. Wrap in motion.div for animations

---

## 🎉 Quick Tips

### Performance
- Use transform and opacity for animations
- Avoid animating width/height
- Use GPU acceleration
- Optimize images

### Accessibility
- Add aria-labels
- Ensure keyboard navigation
- Check color contrast
- Test with screen readers

### Consistency
- Use design system colors
- Follow animation patterns
- Use standard spacing
- Maintain icon sizes

---

## 📞 Quick Support

### Issues?
1. Check documentation files
2. Review component patterns
3. Test in different browsers
4. Check console for errors

### Need Help?
- Review COMPLETE_APP_TRANSFORMATION_SUMMARY.md
- Check specific page documentation
- Review before/after comparisons
- Test with provided examples

---

**Quick Reference Version**: 1.0.0
**Last Updated**: 2025
**Status**: ✅ Ready to Use

---

## 🎊 You're All Set!

Use this guide as a quick reference while building new features or maintaining existing ones. All patterns are production-tested and ready to use! 🚀✨