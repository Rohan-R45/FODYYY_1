const path = require('path');
require('dotenv').config();

// Load environment-specific configuration
const env = process.env.NODE_ENV || 'development';
const envPath = path.join(__dirname, '..', `.env.${env}`);

require('dotenv').config({ path: envPath });

const config = {
  // Environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT) || 5000,
  
  // Database
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/fodyyy',
  
  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'fallback_secret_for_development',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '30d',
  
  // CORS
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5174',
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS ? 
    process.env.ALLOWED_ORIGINS.split(',') : 
    ['http://localhost:3000', 'http://localhost:5174', 'http://localhost:5175'],
  
  // Security
  BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12,
  TRUST_PROXY: process.env.TRUST_PROXY === 'true',
  SECURE_COOKIES: process.env.SECURE_COOKIES === 'true',
  
  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  ENABLE_LOGGING: process.env.ENABLE_LOGGING !== 'false',
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  
  // Helper methods
  isDevelopment: () => config.NODE_ENV === 'development',
  isProduction: () => config.NODE_ENV === 'production',
  isTest: () => config.NODE_ENV === 'test'
};

// Validate required environment variables in production
if (config.isProduction()) {
  const requiredVars = ['MONGODB_URI', 'JWT_SECRET'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingVars.join(', '));
    process.exit(1);
  }
}

module.exports = config;