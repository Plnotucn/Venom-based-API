require('dotenv').config();

module.exports = {
  server: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || '0.0.0.0',
    env: process.env.NODE_ENV || 'development'
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiry: process.env.JWT_EXPIRY || '7d'
  },
  api: {
    key: process.env.API_KEY,
    rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '15') * 60 * 1000,
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100')
  },
  webhook: {
    retryCount: parseInt(process.env.WEBHOOK_RETRY_COUNT || '3'),
    retryDelay: parseInt(process.env.WEBHOOK_RETRY_DELAY || '5000')
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    dir: process.env.LOG_DIR || 'logs'
  },
  whatsapp: {
    sessionDir: process.env.SESSION_DIR || 'sessions',
    defaultCountryCode: process.env.DEFAULT_COUNTRY_CODE || '1',
    messageMinDelay: parseInt(process.env.MESSAGE_MIN_DELAY || '3000'),
    messageMaxDelay: parseInt(process.env.MESSAGE_MAX_DELAY || '7000')
  },
  database: {
    url: process.env.DATABASE_URL
  }
};