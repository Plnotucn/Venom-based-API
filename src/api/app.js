const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const logger = require('../utils/logger');
const config = require('../config');
const { authMiddleware } = require('./middleware/auth');
const rateLimiterMiddleware = require('./middleware/rateLimiter');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { swaggerUi, specs } = require('./swagger');

// Routes
const authRoutes = require('./routes/auth');
const sessionRoutes = require('./routes/sessions');
const messageRoutes = require('./routes/messages');
const webhookRoutes = require('./routes/webhooks');

// Services
const whatsappService = require('../services/whatsappService');
const webhookService = require('../services/webhookService');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Body parsing middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  const timer = logger.startTimer();
  
  res.on('finish', () => {
    timer.done(`${req.method} ${req.path}`, {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      ip: req.ip
    });
  });
  
  next();
});

// Health check endpoint (no auth required)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Swagger documentation (no auth required)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Auth routes (no auth required)
app.use('/api/auth', rateLimiterMiddleware, authRoutes);

// API routes (protected)
app.use('/api/sessions', authMiddleware, rateLimiterMiddleware, sessionRoutes);
app.use('/api/messages', authMiddleware, rateLimiterMiddleware, messageRoutes);
app.use('/api/webhooks', authMiddleware, rateLimiterMiddleware, webhookRoutes);

// Setup webhook handlers for WhatsApp events
whatsappService.on('message', (event) => {
  webhookService.triggerWebhook('message:received', event);
});

whatsappService.on('ack', (event) => {
  webhookService.triggerWebhook('message:status', event);
});

whatsappService.on('qr', (event) => {
  webhookService.triggerWebhook('session:qr', event);
});

whatsappService.on('connected', (event) => {
  webhookService.triggerWebhook('session:connected', event);
});

whatsappService.on('disconnected', (event) => {
  webhookService.triggerWebhook('session:disconnected', event);
});

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;