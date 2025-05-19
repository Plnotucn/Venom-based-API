# VenomMM - Enterprise WhatsApp API

A production-ready WhatsApp API built on venom-bot that provides enterprise-grade automation capabilities including multi-session management, bulk messaging, webhook notifications, and a comprehensive CLI interface.

![License](https://img.shields.io/badge/license-ISC-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)

## 🚀 Features

- **Multi-Session Management**: Create and manage multiple WhatsApp sessions simultaneously
- **Bulk Messaging**: Send messages to multiple recipients with rate limiting and queuing
- **Webhook Notifications**: Real-time event notifications for messages and session state changes
- **Comprehensive CLI**: Both interactive and command-line interfaces for all operations
- **REST API**: Complete HTTP API with JWT authentication
- **Docker Support**: Easy deployment with Docker and docker-compose
- **PM2 Integration**: Production process management with monitoring

## 📋 Prerequisites

- Node.js 18 or later
- NPM or Yarn
- For Docker deployment: Docker and docker-compose

## 🔧 Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/venommm.git
cd venommm

# Install dependencies
npm install

# Copy example environment file and configure
cp .env.example .env
# Edit .env file with your preferred settings
```

## 🏃‍♂️ Quick Start

```bash
# Start development server with hot reload
npm run dev

# Run the quick demo script
./demo.sh

# Create a session and get QR code
./simple-create-and-get-qr.sh
```

## 💻 CLI Usage

The CLI provides both interactive and command modes:

```bash
# Interactive mode
npm run cli -- interactive

# Session management
npm run cli -- session --create mySession
npm run cli -- session --qr mySession
npm run cli -- session --list
npm run cli -- session --info mySession
npm run cli -- session --delete mySession

# Send messages
npm run cli -- send -s mySession -r 1234567890 -t "Hello World"
npm run cli -- send -s mySession -r 1234567890 -i /path/to/image.jpg

# Bulk messaging
npm run cli -- bulk -s mySession -f messages.csv
```

## 🔌 API Endpoints

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

## 🐳 Docker Deployment

```bash
# Build Docker image
npm run docker:build

# Run with Docker
npm run docker:run

# Deploy with docker-compose
npm run docker:compose

# View logs
npm run docker:logs
```

## 🔄 Development Workflow

### Session Creation Flow

1. Create session via API/CLI
2. Session enters "pending" state
3. QR code generated and displayed
4. User scans with WhatsApp app
5. Session transitions to "connected"
6. Webhook notifications sent

### Environment Configuration

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

## 📚 Documentation

For more detailed documentation, please refer to:

- [USAGE_GUIDE.md](./USAGE_GUIDE.md) - Comprehensive usage guide
- [QUICKSTART.md](./QUICKSTART.md) - Quick start documentation
- [HOW_TO_USE.md](./HOW_TO_USE.md) - In-depth tutorials
- [SIMPLE_USAGE.md](./SIMPLE_USAGE.md) - Simple usage examples

## 🔒 Security Best Practices

1. Always use environment variables for sensitive data
2. JWT tokens expire after configured duration
3. Rate limiting prevents API abuse
4. Webhook payloads can be signed for verification
5. Session data isolated per instance
6. Non-root user in Docker containers

## 📝 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 👥 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

## 📧 Contact

For support or inquiries, please open an issue in the repository.