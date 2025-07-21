# FODYYY Deployment Guide

This guide covers deploying the FODYYY application to various platforms including Netlify, Vercel, Heroku, and Railway.

## 📋 Pre-deployment Checklist

### Backend Preparation
- [ ] Environment variables configured for production
- [ ] MongoDB Atlas database set up
- [ ] JWT secrets generated and secured
- [ ] CORS origins updated for production URLs
- [ ] Rate limiting configured
- [ ] Logging configured for production
- [ ] Security headers enabled

### Frontend Preparation
- [ ] API URLs updated for production
- [ ] Build process tested locally
- [ ] Environment variables configured
- [ ] Error boundaries implemented
- [ ] Loading states added
- [ ] Performance optimized

## 🚀 Frontend Deployment

### Option 1: Netlify Deployment

#### Step 1: Prepare for Netlify
```bash
cd fodyyy-frontend
npm run build
```

#### Step 2: Deploy via Netlify CLI
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod --dir=dist
```

#### Step 3: Configure Environment Variables
In Netlify dashboard:
1. Go to Site settings → Environment variables
2. Add the following variables:
```
VITE_API_URL=https://your-backend-url.herokuapp.com/api
VITE_APP_NAME=FODYYY
VITE_APP_VERSION=1.0.0
VITE_NODE_ENV=production
```

#### Step 4: Configure Build Settings
- Build command: `npm run build`
- Publish directory: `dist`
- Node version: `18`

#### Step 5: Configure Redirects
The `netlify.toml` file is already configured for SPA routing.

### Option 2: Vercel Deployment

#### Step 1: Deploy via Vercel CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from frontend directory
cd fodyyy-frontend
vercel --prod
```

#### Step 2: Configure Environment Variables
In Vercel dashboard:
1. Go to Project Settings → Environment Variables
2. Add the same variables as Netlify

#### Step 3: Configure Build Settings
The `vercel.json` file is already configured.

## 🖥️ Backend Deployment

### Option 1: Heroku Deployment

#### Step 1: Prepare Heroku App
```bash
# Install Heroku CLI
# Create new app
heroku create your-app-name

# Add MongoDB Atlas add-on (optional)
heroku addons:create mongolab:sandbox
```

#### Step 2: Configure Environment Variables
```bash
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI="your_mongodb_atlas_connection_string"
heroku config:set JWT_SECRET="your_super_secure_jwt_secret"
heroku config:set FRONTEND_URL="https://your-frontend-url.netlify.app"
heroku config:set ALLOWED_ORIGINS="https://your-frontend-url.netlify.app,https://your-domain.com"
heroku config:set BCRYPT_SALT_ROUNDS=12
heroku config:set RATE_LIMIT_WINDOW_MS=900000
heroku config:set RATE_LIMIT_MAX_REQUESTS=100
```

#### Step 3: Deploy
```bash
# Add Heroku remote
heroku git:remote -a your-app-name

# Deploy
git push heroku main
```

#### Step 4: Scale and Monitor
```bash
# Scale web dyno
heroku ps:scale web=1

# View logs
heroku logs --tail

# Open app
heroku open
```

### Option 2: Railway Deployment

#### Step 1: Connect Repository
1. Go to [Railway](https://railway.app)
2. Connect your GitHub repository
3. Select the root directory (not the frontend folder)

#### Step 2: Configure Environment Variables
In Railway dashboard, add:
```
NODE_ENV=production
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secure_jwt_secret
FRONTEND_URL=https://your-frontend-url.netlify.app
ALLOWED_ORIGINS=https://your-frontend-url.netlify.app
BCRYPT_SALT_ROUNDS=12
PORT=5000
```

#### Step 3: Configure Build
Railway will automatically detect the Node.js app and use the `railway.json` configuration.

### Option 3: Render Deployment

#### Step 1: Create Web Service
1. Go to [Render](https://render.com)
2. Connect your GitHub repository
3. Create a new Web Service

#### Step 2: Configure Build Settings
- Build Command: `npm install`
- Start Command: `npm start`
- Environment: `Node`

#### Step 3: Add Environment Variables
Same as Railway configuration above.

## 🗄️ Database Setup (MongoDB Atlas)

### Step 1: Create Cluster
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster (free tier available)
3. Choose a cloud provider and region

### Step 2: Configure Security
1. Create a database user:
   - Username: `fodyyy-user`
   - Password: Generate secure password
   - Roles: `readWrite` to any database

2. Configure Network Access:
   - Add IP: `0.0.0.0/0` (allow from anywhere)
   - Or add specific IPs of your deployment platforms

### Step 3: Get Connection String
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your database user password
5. Replace `<dbname>` with `fodyyy`

Example:
```
mongodb+srv://fodyyy-user:your_password@cluster0.abc123.mongodb.net/fodyyy?retryWrites=true&w=majority
```

## 🔧 Environment Configuration

### Production Environment Variables

#### Backend (.env.production)
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/fodyyy
JWT_SECRET=your_super_secure_jwt_secret_at_least_32_characters_long
JWT_EXPIRE=30d
FRONTEND_URL=https://your-frontend-domain.com
ALLOWED_ORIGINS=https://your-frontend-domain.com,https://www.your-domain.com
BCRYPT_SALT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
TRUST_PROXY=true
SECURE_COOKIES=true
LOG_LEVEL=error
ENABLE_LOGGING=true
```

#### Frontend (.env.production)
```env
VITE_NODE_ENV=production
VITE_API_URL=https://your-backend-domain.herokuapp.com/api
VITE_APP_NAME=FODYYY
VITE_APP_VERSION=1.0.0
VITE_ENABLE_DEVTOOLS=false
VITE_DEBUG_MODE=false
VITE_ENABLE_ANALYTICS=true
```

## 🔒 Security Considerations

### SSL/HTTPS
- Ensure both frontend and backend use HTTPS in production
- Update CORS origins to use HTTPS URLs
- Set secure cookie flags in production

### Environment Variables
- Never commit production secrets to version control
- Use platform-specific environment variable management
- Rotate secrets regularly

### Database Security
- Use MongoDB Atlas with authentication
- Restrict network access to known IPs when possible
- Enable MongoDB Atlas security features

## 📊 Monitoring and Logging

### Backend Monitoring
```javascript
// Add to your production environment
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});
```

### Error Tracking
Consider integrating:
- Sentry for error tracking
- LogRocket for session replay
- New Relic for performance monitoring

### Health Checks
Add health check endpoint:
```javascript
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

## 🚀 Deployment Automation

### GitHub Actions (Optional)
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install and Build
        run: |
          cd fodyyy-frontend
          npm install
          npm run build
      - name: Deploy to Netlify
        uses: nwtgck/actions-netlify@v1.2
        with:
          publish-dir: './fodyyy-frontend/dist'
          production-branch: main
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Heroku
        uses: akhileshns/heroku-deploy@v3.12.12
        with:
          heroku_api_key: ${{ secrets.HEROKU_API_KEY }}
          heroku_app_name: "your-app-name"
          heroku_email: "your-email@example.com"
```

## 🧪 Testing Deployment

### Pre-deployment Testing
```bash
# Test backend locally with production config
NODE_ENV=production npm start

# Test frontend build
npm run build
npm run preview
```

### Post-deployment Testing
1. Test all authentication flows
2. Verify API endpoints work
3. Check CORS configuration
4. Test error handling
5. Verify environment variables are loaded
6. Check database connectivity

### Load Testing
Use tools like:
- Artillery.io for API load testing
- Lighthouse for frontend performance
- WebPageTest for real-world performance

## 🔄 Rollback Strategy

### Frontend Rollback
- Netlify: Use deployment history to rollback
- Vercel: Use deployment dashboard to promote previous version

### Backend Rollback
- Heroku: `heroku rollback`
- Railway: Use deployment history in dashboard

### Database Rollback
- Keep database migrations reversible
- Backup database before major deployments
- Test rollback procedures in staging

## 📋 Post-deployment Checklist

- [ ] Frontend loads correctly
- [ ] Backend API responds
- [ ] Database connection works
- [ ] Authentication flow works
- [ ] CORS is properly configured
- [ ] SSL certificates are valid
- [ ] Environment variables are loaded
- [ ] Error logging is working
- [ ] Performance is acceptable
- [ ] All features work as expected

## 🆘 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check ALLOWED_ORIGINS environment variable
   - Ensure frontend URL is included in backend CORS config

2. **Database Connection Failed**
   - Verify MongoDB Atlas connection string
   - Check network access settings in MongoDB Atlas
   - Ensure database user has correct permissions

3. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check for JSX syntax in .js files

4. **Environment Variables Not Loading**
   - Verify variable names match exactly
   - Check platform-specific variable configuration
   - Restart application after adding variables

### Getting Help
- Check platform-specific documentation
- Review application logs
- Test locally with production configuration
- Contact platform support if needed

---

**Happy Deploying! 🚀**