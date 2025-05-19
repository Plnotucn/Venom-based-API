const jwt = require('jsonwebtoken');
const config = require('../../config');
const logger = require('../../utils/logger');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.warn('Unauthorized request', { 
      ip: req.ip, 
      path: req.path,
      method: req.method 
    });
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = decoded;
    next();
  } catch (error) {
    logger.warn('Invalid token', { 
      ip: req.ip, 
      error: error.message 
    });
    return res.status(401).json({ error: 'Invalid token' });
  }
};

const generateToken = (payload) => {
  return jwt.sign(payload, config.jwt.secret, { 
    expiresIn: config.jwt.expiry 
  });
};

module.exports = { authMiddleware, generateToken };