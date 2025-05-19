const winston = require('winston');
require('winston-daily-rotate-file');
const fs = require('fs');
const path = require('path');
const config = require('../config');

const logDir = config.logging.dir;

// Create log directory if it doesn't exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Create file transports
const fileTransport = new winston.transports.DailyRotateFile({
  filename: path.join(logDir, 'application-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  level: config.logging.level
});

const errorTransport = new winston.transports.DailyRotateFile({
  filename: path.join(logDir, 'errors-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  level: 'error',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '30d'
});

// Create console transport
const consoleTransport = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple()
  )
});

// Create logger
const logger = winston.createLogger({
  level: config.logging.level,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'whatsapp-api' },
  transports: [
    fileTransport,
    errorTransport,
    consoleTransport
  ]
});

// Add performance timer utility
logger.startTimer = () => {
  const start = Date.now();
  return {
    done: (message, meta = {}) => {
      const duration = Date.now() - start;
      logger.info(message, { ...meta, duration });
    }
  };
};

module.exports = logger;