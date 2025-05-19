const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Create CLI logger
const cliLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'whatsapp-cli' },
  transports: [
    // CLI specific log file
    new winston.transports.File({ 
      filename: path.join(logsDir, 'cli.log'),
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    }),
    // Also log CLI actions to the main application log
    new winston.transports.File({ 
      filename: path.join(logsDir, `application-${new Date().toISOString().split('T')[0]}.log`),
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    })
  ]
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  cliLogger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

module.exports = cliLogger;