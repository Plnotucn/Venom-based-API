const { RateLimiterMemory } = require('rate-limiter-flexible');
const config = require('../../config');
const logger = require('../../utils/logger');

const rateLimiter = new RateLimiterMemory({
  points: config.api.rateLimitMaxRequests,
  duration: config.api.rateLimitWindow / 1000, // Convert to seconds
  blockDuration: 0, // No blocking, just return error
});

const rateLimiterMiddleware = async (req, res, next) => {
  try {
    const key = `${req.ip}:${req.user?.id || 'anonymous'}`;
    await rateLimiter.consume(key);
    next();
  } catch (rejRes) {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      user: req.user?.id,
      path: req.path
    });
    
    res.status(429).json({
      error: 'Too many requests',
      retryAfter: Math.round(rejRes.msBeforeNext / 1000) || 60
    });
  }
};

module.exports = rateLimiterMiddleware;