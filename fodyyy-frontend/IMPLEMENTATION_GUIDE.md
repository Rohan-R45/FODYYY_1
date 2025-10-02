# FOODY Home Page - Implementation Guide

## 🚀 Quick Start

### 1. Development Server
```bash
cd fodyyy-frontend
npm run dev
```
Visit: `http://localhost:5174/`

### 2. Build for Production
```bash
npm run build
```

### 3. Preview Production Build
```bash
npm run preview
```

---

## 📦 Dependencies Installed

All required dependencies are already installed:

```json
{
  "framer-motion": "^12.23.22",    // Animations
  "countup.js": "^2.9.0",          // Number counters
  "react": "^19.1.0",              // React framework
  "react-router-dom": "^7.6.2",    // Routing
  "tailwindcss": "^3.4.17"         // Styling
}
```

---

## 🎨 Customization Guide

### Change Brand Colors

**File**: `tailwind.config.js`

```javascript
colors: {
  'foody': {
    'primary': '#FF6B35',    // Change this
    'secondary': '#F7931E',  // Change this
    'accent': '#FFC857',     // Change this
    'success': '#C1D82F',    // Change this
    'dark': '#1B1B1E',       // Change this
    'cream': '#FFF8F0',      // Change this
  },
}
```

### Update Content

**File**: `src/pages/Home.jsx`

#### Change Headline
```javascript
// Line ~130
<span className="block text-gray-900">Crave It.</span>
<span className="block bg-gradient-to-r from-foody-primary via-foody-secondary to-foody-accent bg-clip-text text-transparent">
  Tap It.
</span>
<span className="block text-gray-900">Devour It.</span>
```

#### Change Subheadline
```javascript
// Line ~144
<p className="text-xl sm:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
  Your custom text here
</p>
```

#### Update Statistics
```javascript
// Line ~520
<AnimatedCounter end={1000} suffix="+" />  // Change 1000
<AnimatedCounter end={5000} suffix="+" />  // Change 5000
<AnimatedCounter end={4.8} suffix="/5" />  // Change 4.8
```

### Add New Restaurant

**File**: `src/pages/Home.jsx`

```javascript
// Line ~220 - Add to featuredRestaurants array
{
  name: 'Your Restaurant',
  cuisine: '🍕 Italian',
  rating: 4.9,
  deliveryTime: '25-30 min',
  image: 'https://your-image-url.com/image.jpg',
}
```

### Add New Testimonial

**File**: `src/pages/Home.jsx`

```javascript
// Line ~200 - Add to testimonials array
{
  id: 4,
  name: 'Student Name',
  role: 'B.Tech CSE, 2nd Year',
  avatar: '👨‍🎓',
  text: 'Your testimonial text here...',
  rating: 5,
}
```

---

## 🔌 Backend Integration

### Connect to Real API

#### 1. Featured Restaurants

**Current** (Demo data):
```javascript
const featuredRestaurants = [
  { name: 'Spice Garden', ... }
];
```

**Replace with** (API call):
```javascript
import { useState, useEffect } from 'react';
import axios from 'axios';

const [featuredRestaurants, setFeaturedRestaurants] = useState([]);

useEffect(() => {
  const fetchRestaurants = async () => {
    try {
      const response = await axios.get('/api/restaurants?featured=true&limit=3');
      setFeaturedRestaurants(response.data);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    }
  };
  fetchRestaurants();
}, []);
```

#### 2. Testimonials

**Replace with**:
```javascript
const [testimonials, setTestimonials] = useState([]);

useEffect(() => {
  const fetchTestimonials = async () => {
    try {
      const response = await axios.get('/api/testimonials?limit=3');
      setTestimonials(response.data);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    }
  };
  fetchTestimonials();
}, []);
```

#### 3. Statistics

**Replace with**:
```javascript
const [stats, setStats] = useState({
  students: 0,
  orders: 0,
  rating: 0
});

useEffect(() => {
  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };
  fetchStats();
}, []);
```

---

## 🎭 Animation Customization

### Change Animation Duration

**File**: `src/pages/Home.jsx`

```javascript
// Floating icons
<FloatingIcon emoji="🍔" delay={0} duration={3} />
// Change duration to 5 for slower animation
<FloatingIcon emoji="🍔" delay={0} duration={5} />
```

### Modify Fade-in Timing

```javascript
// Feature cards
<FeatureCard
  icon="⚡"
  title="Lightning Fast"
  description="..."
  delay={0}  // Change this (in seconds)
/>
```

### Adjust Hover Effects

**File**: `src/pages/Home.jsx`

```javascript
// In FeatureCard component
whileHover={{ y: -8, transition: { duration: 0.3 } }}
// Change y to -12 for more lift
// Change duration to 0.5 for slower animation
```

---

## 📱 Responsive Customization

### Adjust Breakpoints

**File**: `tailwind.config.js`

```javascript
screens: {
  'xs': '320px',   // Extra small devices
  'sm': '640px',   // Small devices
  'md': '768px',   // Medium devices
  'lg': '1024px',  // Large devices
  'xl': '1280px',  // Extra large devices
  '2xl': '1536px', // 2X large devices
}
```

### Mobile-Specific Styles

```javascript
// Example: Different text size on mobile
className="text-3xl md:text-5xl lg:text-7xl"
// Mobile: 3xl, Tablet: 5xl, Desktop: 7xl
```

---

## 🎨 Adding Custom Fonts

### 1. Add Font Files

Place font files in `public/fonts/`:
```
public/
  fonts/
    Satoshi-Bold.woff2
    Satoshi-Regular.woff2
```

### 2. Update CSS

**File**: `src/index.css`

```css
@font-face {
  font-family: 'Satoshi';
  src: url('/fonts/Satoshi-Regular.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
}

@font-face {
  font-family: 'Satoshi';
  src: url('/fonts/Satoshi-Bold.woff2') format('woff2');
  font-weight: 700;
  font-style: normal;
}
```

### 3. Update Tailwind Config

**File**: `tailwind.config.js`

```javascript
fontFamily: {
  'satoshi': ['Satoshi', 'Poppins', 'sans-serif'],
}
```

### 4. Use in Components

```javascript
className="font-satoshi"
```

---

## 🖼️ Image Optimization

### Use Optimized Images

#### Option 1: External CDN (Unsplash, Cloudinary)
```javascript
image: 'https://images.unsplash.com/photo-xxx?w=500&h=300&fit=crop&q=80'
```

#### Option 2: Local Images
```javascript
// Place in public/images/
image: '/images/restaurant-1.jpg'
```

#### Option 3: Next-gen Formats
```javascript
// Use WebP for better compression
image: '/images/restaurant-1.webp'
```

### Lazy Loading

Already implemented with Framer Motion:
```javascript
<motion.img
  loading="lazy"
  src={image}
  alt={name}
/>
```

---

## 🔍 SEO Optimization

### Add Meta Tags

**File**: `index.html`

```html
<head>
  <title>FOODY - Campus Food Delivery | IIT & IISER Tirupati</title>
  <meta name="description" content="Order delicious food from top campus restaurants. Fast delivery to your hostel room in 30 minutes!" />
  <meta name="keywords" content="food delivery, campus food, IIT Tirupati, IISER Tirupati, student food" />
  
  <!-- Open Graph -->
  <meta property="og:title" content="FOODY - Campus Food Delivery" />
  <meta property="og:description" content="Order delicious food from top campus restaurants" />
  <meta property="og:image" content="/og-image.jpg" />
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="FOODY - Campus Food Delivery" />
  <meta name="twitter:description" content="Order delicious food from top campus restaurants" />
</head>
```

---

## 📊 Analytics Integration

### Google Analytics

**File**: `index.html`

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Track Events

**File**: `src/pages/Home.jsx`

```javascript
// Track CTA clicks
const handleCTAClick = () => {
  // Google Analytics
  if (window.gtag) {
    window.gtag('event', 'cta_click', {
      'event_category': 'engagement',
      'event_label': 'hero_order_now'
    });
  }
  
  // Navigate
  navigate('/register');
};
```

---

## 🐛 Troubleshooting

### Issue: Animations not working

**Solution**: Check Framer Motion import
```javascript
import { motion } from 'framer-motion';
```

### Issue: Counters not animating

**Solution**: Ensure CountUp.js is imported
```javascript
import { CountUp } from 'countup.js';
```

### Issue: Tailwind classes not applying

**Solution**: Rebuild Tailwind
```bash
npm run build
```

### Issue: Images not loading

**Solution**: Check image paths
```javascript
// Correct for public folder
image: '/images/restaurant.jpg'

// Correct for external URL
image: 'https://example.com/image.jpg'
```

---

## 🔒 Security Best Practices

### 1. Sanitize User Input
```javascript
import DOMPurify from 'dompurify';

const cleanText = DOMPurify.sanitize(userInput);
```

### 2. Validate API Responses
```javascript
const response = await axios.get('/api/restaurants');
if (response.data && Array.isArray(response.data)) {
  setRestaurants(response.data);
}
```

### 3. Use Environment Variables
```javascript
// .env
VITE_API_URL=https://api.foody.com

// Usage
const API_URL = import.meta.env.VITE_API_URL;
```

---

## 🚀 Deployment

### Netlify

1. Connect GitHub repository
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Deploy!

### Vercel

1. Import project
2. Framework preset: Vite
3. Build command: `npm run build`
4. Output directory: `dist`
5. Deploy!

### Custom Server

```bash
# Build
npm run build

# Copy dist folder to server
scp -r dist/* user@server:/var/www/html/

# Configure nginx
server {
  listen 80;
  server_name foody.com;
  root /var/www/html;
  
  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

---

## 📝 Maintenance Checklist

### Weekly
- [ ] Check for broken links
- [ ] Update featured restaurants
- [ ] Review testimonials
- [ ] Monitor performance metrics

### Monthly
- [ ] Update dependencies
- [ ] Review analytics
- [ ] Optimize images
- [ ] Test on new devices

### Quarterly
- [ ] Refresh content
- [ ] Update statistics
- [ ] A/B test CTAs
- [ ] Conduct user testing

---

## 🎓 Learning Resources

### Framer Motion
- [Official Docs](https://www.framer.com/motion/)
- [Animation Examples](https://www.framer.com/motion/examples/)

### Tailwind CSS
- [Official Docs](https://tailwindcss.com/docs)
- [Component Examples](https://tailwindui.com/)

### React
- [Official Docs](https://react.dev/)
- [React Patterns](https://reactpatterns.com/)

---

## 💡 Pro Tips

### 1. Use React DevTools
Install React DevTools browser extension to debug components and performance.

### 2. Enable Tailwind JIT
Already enabled in config for faster builds and smaller CSS.

### 3. Optimize Bundle Size
```bash
npm run build:analyze
```

### 4. Test Accessibility
Use Lighthouse in Chrome DevTools to audit accessibility.

### 5. Monitor Performance
Use Web Vitals to track Core Web Vitals metrics.

---

## 🤝 Contributing

### Code Style
- Use functional components
- Follow React hooks best practices
- Keep components small and focused
- Use meaningful variable names
- Add comments for complex logic

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/new-section

# Make changes and commit
git add .
git commit -m "Add new testimonial section"

# Push and create PR
git push origin feature/new-section
```

---

## 📞 Support

### Need Help?
- Check documentation first
- Search existing issues
- Create new issue with details
- Contact development team

### Report Bugs
Include:
- Browser and version
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable

---

**Happy Coding! 🎉**

The home page is fully documented and ready for customization. Follow this guide to make it your own while maintaining best practices and performance.