# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A production-ready WhatsApp API built on venom-bot that provides enterprise-grade automation capabilities including multi-session management, bulk messaging, webhook notifications, and a comprehensive CLI interface.

## Essential Commands

### Development & Testing
```bash
# Development with hot reload
npm run dev

# Run tests
./scripts/test-api.sh        # Comprehensive API testing with JWT flow
./scripts/test-simple.sh     # Quick connectivity and basic function test

# Demo script for quick overview
./demo.sh                    # Interactive demo of basic functions

# JWT Token generation for API testing
node get-token.js            # Outputs JWT token for direct API calls
```

### Production Deployment
```bash
# Standard production
npm start

# PM2 managed deployment
npm run pm2:start           # Start with PM2 process manager
npm run pm2:stop            # Stop all PM2 processes
npm run pm2:restart         # Restart PM2 processes
npm run pm2:logs            # View real-time PM2 logs

# Docker deployment
npm run docker:build        # Build Docker image
npm run docker:run          # Run container with volume mounts
npm run docker:compose      # Full stack deployment with docker-compose
npm run docker:logs         # Tail Docker logs
```

### CLI Operations
```bash
# Interactive mode for testing
npm run cli -- interactive

# Direct CLI commands
npm run cli -- session --create <name>          # Create new session
npm run cli -- session --qr <name>              # Display QR code
npm run cli -- session --list                   # List all sessions
npm run cli -- session --info <name>            # Session details
npm run cli -- session --delete <name>          # Remove session

# Messaging commands
npm run cli -- send -s <session> -r <number> -t "<message>"    # Send text
npm run cli -- send -s <session> -r <number> -i <path>         # Send image
npm run cli -- bulk -s <session> -f messages.csv               # Bulk messaging

# Webhook management
npm run cli -- webhooks --list                  # List all webhooks
npm run cli -- webhooks --add <url>             # Register webhook
npm run cli -- webhooks --delete <id>           # Remove webhook
```

## Architecture & Design Patterns

### Core Service Architecture

The application follows a layered architecture with clear separation of concerns:

1. **API Layer** (`src/api/`)
   - Express.js routes with JWT authentication
   - Input validation using Joi schemas
   - Rate limiting per endpoint group
   - Comprehensive error handling middleware

2. **Service Layer** (`src/services/`)
   - `whatsappService.js`: Core venom-bot integration with session lifecycle management
   - `messageQueue.js`: Implements a rate-limited queue for bulk operations
   - `webhookService.js`: Event-driven notification system with retry logic

3. **CLI Layer** (`src/cli/`)
   - Commander.js based interface
   - Both interactive and command modes
   - Direct API integration with JWT auth

### Session State Management

The WhatsAppService maintains an in-memory Map for session tracking with states:
- `pending`: Session created, awaiting QR scan
- `connected`: Active WhatsApp connection
- `disconnected`: Connection lost or terminated

Critical fix: Sessions are added to the Map immediately upon creation with "pending" status to ensure visibility during QR generation phase.

### Message Queue System

The MessageQueue service implements:
- Priority-based message handling
- Configurable rate limiting with MIN/MAX delays
- Bulk processing with progress tracking
- Error recovery and retry mechanisms

### Webhook Event System

Webhook service provides:
- Asynchronous event propagation
- Exponential backoff for failed deliveries
- Event types: message:received, message:sent, session:connected, session:disconnected
- Payload signing for security

## Configuration & Environment

### Required Environment Variables
```env
# Server Configuration
PORT=3000
NODE_ENV=production

# Security
JWT_SECRET=<strong-random-string>
JWT_EXPIRY=7d
ADMIN_PASSWORD=<secure-password>

# Rate Limiting
MESSAGE_MIN_DELAY=3000      # Minimum delay between messages (ms)
MESSAGE_MAX_DELAY=7000      # Maximum delay between messages (ms)

# Logging
LOG_LEVEL=info              # error, warn, info, debug

# WhatsApp Configuration
DEFAULT_COUNTRY_CODE=1      # Default country code for numbers
```

### Directory Structure
```
/app
├── logs/                   # Rotating log files
├── sessions/               # WhatsApp session data
├── tokens/                 # Chrome session storage
└── src/
    ├── api/               # REST API implementation
    ├── cli/               # CLI interface
    ├── config/            # Configuration management
    └── services/          # Core business logic
```

## Development Workflow

### Initial Setup
1. Clone repository and install dependencies
2. Copy `.env.example` to `.env` and configure
3. Run `npm run dev` for development server
4. Use `node get-token.js` to obtain JWT token
5. Test with `./scripts/test-simple.sh`

### Session Creation Flow
1. Create session via API/CLI
2. Session enters "pending" state
3. QR code generated and displayed
4. User scans with WhatsApp app
5. Session transitions to "connected"
6. Webhook notifications sent

### Common Development Tasks

#### Adding New Message Types
1. Extend `messageController.js` with new endpoint
2. Add validation schema in `validation.js`
3. Implement venom-bot method in `whatsappService.js`
4. Update CLI commands in `cli/index.js`
5. Add API documentation annotations

#### Modifying Rate Limits
1. Update environment variables for global limits
2. Modify `rateLimiter.js` for endpoint-specific limits
3. Adjust `messageQueue.js` for bulk operation timing

#### Adding Webhook Events
1. Define new event type in `whatsappService.js`
2. Emit event at appropriate lifecycle point
3. Update webhook documentation
4. Test with webhook listener

## Docker Deployment Notes

### Build Considerations
- Uses Node 18-slim base image
- Chromium pre-installed for venom-bot
- Non-root user for security
- Volume mounts for sessions and logs

### Common Issues & Solutions
1. **Permission errors**: Ensure logs/ and sessions/ have correct permissions
2. **Port conflicts**: Check for existing services on port 3000
3. **Chrome crashes**: Increase container memory limits
4. **Session persistence**: Use volume mounts for sessions/ directory

## API Endpoints Reference

### Authentication
- `POST /api/auth/login` - Obtain JWT token

### Sessions
- `GET /api/sessions` - List all sessions
- `POST /api/sessions` - Create new session
- `GET /api/sessions/:name` - Session details
- `GET /api/sessions/:name/qr` - Get QR code
- `DELETE /api/sessions/:name` - Remove session

### Messaging
- `POST /api/messages/send` - Send single message
- `POST /api/messages/bulk` - Bulk message queue
- `GET /api/messages/:sessionName` - Message history

### Webhooks
- `GET /api/webhooks` - List webhooks
- `POST /api/webhooks` - Register webhook
- `DELETE /api/webhooks/:id` - Remove webhook

## Security Best Practices

1. Always use environment variables for sensitive data
2. JWT tokens expire after configured duration
3. Rate limiting prevents API abuse
4. Webhook payloads can be signed for verification
5. Session data isolated per instance
6. Non-root user in Docker containers