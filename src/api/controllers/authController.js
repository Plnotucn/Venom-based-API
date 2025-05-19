const bcrypt = require('bcrypt');
const { generateToken } = require('../middleware/auth');
const logger = require('../../utils/logger');
const config = require('../../config');

// Simple in-memory user store (in production, use a database)
const users = new Map();

// Initialize with a default admin user
const initUsers = async () => {
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const hashedPassword = await bcrypt.hash(adminPassword, 10);
  users.set('admin', {
    username: 'admin',
    password: hashedPassword,
    role: 'admin'
  });
};

initUsers();

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    
    const user = users.get(username);
    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }
    
    const token = generateToken({
      username: user.username,
      role: user.role
    });
    
    logger.info('User logged in', { username });
    
    res.json({
      success: true,
      token,
      expiresIn: config.jwt.expiry
    });
  } catch (error) {
    next(error);
  }
};

const register = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    
    if (users.has(username)) {
      return res.status(400).json({
        error: 'Username already exists'
      });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    users.set(username, {
      username,
      password: hashedPassword,
      role: 'user'
    });
    
    logger.info('User registered', { username });
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  register
};