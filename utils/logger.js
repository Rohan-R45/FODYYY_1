const config = require('../config');

class Logger {
  constructor() {
    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3
    };
    
    this.currentLevel = this.levels[config.LOG_LEVEL] || this.levels.info;
  }

  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level: level.toUpperCase(),
      message,
      ...meta
    };

    if (config.isDevelopment()) {
      // Pretty print for development
      return `[${timestamp}] ${level.toUpperCase()}: ${message}${
        Object.keys(meta).length > 0 ? '\n' + JSON.stringify(meta, null, 2) : ''
      }`;
    } else {
      // JSON format for production (easier for log aggregation)
      return JSON.stringify(logEntry);
    }
  }

  log(level, message, meta = {}) {
    if (!config.ENABLE_LOGGING) return;
    
    const levelValue = this.levels[level];
    if (levelValue <= this.currentLevel) {
      const formattedMessage = this.formatMessage(level, message, meta);
      
      if (level === 'error') {
        console.error(formattedMessage);
      } else if (level === 'warn') {
        console.warn(formattedMessage);
      } else {
        console.log(formattedMessage);
      }
    }
  }

  error(message, meta = {}) {
    this.log('error', message, meta);
  }

  warn(message, meta = {}) {
    this.log('warn', message, meta);
  }

  info(message, meta = {}) {
    this.log('info', message, meta);
  }

  debug(message, meta = {}) {
    this.log('debug', message, meta);
  }

  // Express middleware for request logging
  requestLogger() {
    return (req, res, next) => {
      const start = Date.now();
      
      res.on('finish', () => {
        const duration = Date.now() - start;
        const logData = {
          method: req.method,
          url: req.url,
          statusCode: res.statusCode,
          duration: `${duration}ms`,
          userAgent: req.get('User-Agent'),
          ip: req.ip
        };

        if (res.statusCode >= 400) {
          this.warn(`HTTP ${res.statusCode} - ${req.method} ${req.url}`, logData);
        } else {
          this.info(`HTTP ${res.statusCode} - ${req.method} ${req.url}`, logData);
        }
      });

      next();
    };
  }

  // Error logging middleware
  errorLogger() {
    return (err, req, res, next) => {
      const errorData = {
        message: err.message,
        stack: config.isDevelopment() ? err.stack : undefined,
        method: req.method,
        url: req.url,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        body: config.isDevelopment() ? req.body : undefined
      };

      this.error('Unhandled error', errorData);
      next(err);
    };
  }
}

module.exports = new Logger();