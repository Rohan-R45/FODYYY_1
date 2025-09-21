const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const config = require('./config');
const logger = require('./utils/logger');
require('dotenv').config();

const app = express();

// Trust proxy for production deployments (needed for secure cookies and rate limiters behind proxies)
if (config.TRUST_PROXY) app.set('trust proxy', 1);

// --- Request logging (structured) ---
app.use(logger.requestLogger());

// --- Security & Performance ---
app.use(helmet());
app.use(compression());

// --- Body parsing ---
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// --- Basic MongoDB injection prevention & input sanitization ---
function sanitizeKeys(obj) {
  if (!obj || typeof obj !== 'object') return;
  for (const key of Object.keys(obj)) {
    if (key.startsWith('$') || key.includes('.')) {
      delete obj[key];
      continue;
    }
    sanitizeKeys(obj[key]);
  }
}
app.use((req, _res, next) => {
  try {
    if (req.body) sanitizeKeys(req.body);
    if (req.query) sanitizeKeys(req.query);
    if (req.params) sanitizeKeys(req.params);
  } catch (_) {}
  next();
});

// Additional sanitization (XSS-safe escaping of strings)
try {
  const { sanitizeInput } = require('./middleware/validation');
  app.use(sanitizeInput);
} catch (_) {
  // If validation helpers are not available, continue silently
}

// --- CORS (env-driven) ---
const allowedOrigins = (config.ALLOWED_ORIGINS || [])
  .concat(config.FRONTEND_URL ? [config.FRONTEND_URL] : [])
  .filter(Boolean);

logger.info('CORS allowed origins configured', { allowedOrigins });

app.use(
  cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true); // allow non-browser clients
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error('Not allowed by CORS'));
    },
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-auth-token'],
  })
);

// --- Rate limiting & speed limits ---
const generalLimiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS, // default 15 min
  max: config.RATE_LIMIT_MAX_REQUESTS,   // default 100 reqs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(generalLimiter);

// Stricter auth limiter
const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 min
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});
const authSpeed = slowDown({
  windowMs: 5 * 60 * 1000, // 5 min
  delayAfter: 5,
  delayMs: (hits) => Math.min(2000, hits * 200),
});
app.use('/api/auth/login', authLimiter, authSpeed);
app.use('/api/auth/register', authLimiter, authSpeed);

// Order creation limiter (POST only)
const orderLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 min
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/orders', (req, res, next) => {
  if (req.method === 'POST') return orderLimiter(req, res, next);
  next();
});

// --- Optional Redis caching for frequently accessed data ---
let redisClient = null;
(async () => {
  if (config.REDIS_URL) {
    try {
      // Try to load redis client dynamically to avoid hard dependency
      const { createClient } = require('redis');
      redisClient = createClient({ url: config.REDIS_URL });
      redisClient.on('error', (err) => logger.warn('Redis client error', { err: err.message }));
      await redisClient.connect();
      logger.info('Redis connected');
    } catch (err) {
      logger.warn('Redis not enabled (missing package or connection error)', { error: err.message });
      redisClient = null;
    }
  }
})();

function cacheMiddleware(ttlSeconds = 60, keyFn) {
  return async (req, res, next) => {
    try {
      if (!redisClient || req.method !== 'GET') return next();
      const key = (keyFn ? keyFn(req) : `cache:${req.originalUrl}`);
      const cached = await redisClient.get(key);
      if (cached) {
        res.set('X-Cache', 'HIT');
        return res.status(200).json(JSON.parse(cached));
      }
      const originalJson = res.json.bind(res);
      res.json = (body) => {
        if (res.statusCode === 200) {
          redisClient
            .setEx(key, ttlSeconds, JSON.stringify(body))
            .catch((e) => logger.warn('Redis setEx failed', { error: e.message }));
        }
        res.set('X-Cache', 'MISS');
        return originalJson(body);
      };
      next();
    } catch (e) {
      logger.warn('Cache middleware error', { error: e.message });
      next();
    }
  };
}

// Apply caching for commonly-hit GET endpoints
app.use('/api/restaurants', cacheMiddleware(60));
app.use('/api/menu', cacheMiddleware(60));

// --- MongoDB connection with pooling ---
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.MONGODB_URI, {
      maxPoolSize: config.MONGODB_POOL_SIZE || 10,
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
    });
    logger.info('MongoDB connected', { host: conn.connection.host });

    // Ensure indexes for performance (models must be required after connection)
    try {
      const { User, Restaurant, MenuItem, Order } = require('./models');
      await Promise.all([
        User.init(),
        Restaurant.init(),
        MenuItem.init(),
        Order.init(),
      ]);
      logger.info('Model indexes ensured');
    } catch (idxErr) {
      logger.warn('Index initialization skipped/failed', { error: idxErr.message });
    }
  } catch (error) {
    logger.error('MongoDB connection failed', { error: error.message });
    if (config.isProduction()) process.exit(1);
  }
};
connectDB();

// --- Load routes with error protection ---
logger.info('Loading routes...');
let authRoutes, usersRoutes, restaurantRoutes, menuRoutes, orderRoutes;

try { authRoutes = require('./routes/auth'); logger.info('Auth routes loaded'); } 
catch (e) { logger.error('Failed to load auth routes', { error: e.message, stack: e.stack }); process.exit(1); }

try { usersRoutes = require('./routes/users'); logger.info('Users routes loaded'); } 
catch (e) { logger.error('Failed to load users routes', { error: e.message, stack: e.stack }); process.exit(1); }

try { restaurantRoutes = require('./routes/restaurants'); logger.info('Restaurant routes loaded'); } 
catch (e) { logger.error('Failed to load restaurant routes', { error: e.message, stack: e.stack }); process.exit(1); }

try { menuRoutes = require('./routes/menu'); logger.info('Menu routes loaded'); } 
catch (e) { logger.error('Failed to load menu routes', { error: e.message, stack: e.stack }); process.exit(1); }

try { orderRoutes = require('./routes/orders'); logger.info('Order routes loaded'); } 
catch (e) { logger.error('Failed to load order routes', { error: e.message, stack: e.stack }); process.exit(1); }

// --- Mount routes ---
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);

// --- Health & basic routes ---
app.get('/', (_req, res) => {
  res.json({ message: 'Welcome to FOODY API', status: 'Server is running!', timestamp: new Date().toISOString() });
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString(), environment: config.NODE_ENV, database: { connected: mongoose.connection.readyState === 1, host: mongoose.connection.host || 'Not connected' } });
});

// --- 404 handler ---
app.use((req, res) => {
  logger.warn('Route not found', { method: req.method, url: req.originalUrl });
  res.status(404).json({ success: false, error: `Route ${req.method} ${req.originalUrl} not found` });
});

// --- Error logging & centralized error handler ---
app.use(logger.errorLogger());
try {
  const errorHandler = require('./middleware/errorHandler');
  app.use(errorHandler);
} catch (_) {
  // Fallback basic handler
  app.use((err, _req, res, _next) => {
    logger.error('Unhandled error', { error: err.message, stack: err.stack });
    res.status(err.statusCode || 500).json({ success: false, error: err.message || 'Server Error' });
  });
}

// --- Graceful shutdown ---
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  try { await mongoose.connection.close(); logger.info('MongoDB connection closed.'); } catch (e) { logger.warn('Error closing MongoDB connection', { error: e.message }); }
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully...');
  try { await mongoose.connection.close(); logger.info('MongoDB connection closed.'); } catch (e) { logger.warn('Error closing MongoDB connection', { error: e.message }); }
  process.exit(0);
});

const PORT = config.PORT;
const HOST = config.isProduction() ? '0.0.0.0' : 'localhost';

app.listen(PORT, HOST, () => {
  logger.info('Server started', {
    mode: config.NODE_ENV,
    host: HOST,
    port: PORT,
    environment: config.NODE_ENV,
    jwtConfigured: !!config.JWT_SECRET,
    mongoConfigured: !!config.MONGODB_URI,
  });
});

module.exports = app;