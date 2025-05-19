# WhatsApp API Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### 1. Prerequisites

- Node.js 18+
- Chrome/Chromium installed
- Git

### 2. Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/whatsapp-api.git
cd whatsapp-api

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
```

### 3. Configuration

Edit `.env` file:
```env
# Change the JWT secret
JWT_SECRET=your-super-secret-key-here

# Change admin password
ADMIN_PASSWORD=your-strong-password
```

### 4. Start the Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

### 5. Get API Token

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "your-admin-password"
  }'
```

Save the returned token for API calls.

### 6. Create WhatsApp Session

```bash
curl -X POST http://localhost:3000/api/sessions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionName": "my-whatsapp"
  }'
```

### 7. Get QR Code

```bash
curl -X GET http://localhost:3000/api/sessions/my-whatsapp/qr \
  -H "Authorization: Bearer YOUR_TOKEN"
```

The response contains a base64 QR code. You can:
- Decode and display it in terminal
- Use the CLI tool: `npm run cli -- session -q my-whatsapp`
- Open Swagger UI: http://localhost:3000/api-docs

### 8. Send Your First Message

```bash
curl -X POST http://localhost:3000/api/messages/send \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionName": "my-whatsapp",
    "to": "1234567890",
    "message": "Hello from WhatsApp API!"
  }'
```

## 🎯 Using the CLI

### Interactive Mode

```bash
npm run cli -- interactive
```

### Quick Commands

```bash
# List sessions
npm run cli -- session -l

# Create session
npm run cli -- session -c my-session

# Send message
npm run cli -- send -s my-session -r 1234567890 -t "Hello!"

# Send image
npm run cli -- send -s my-session -r 1234567890 -i /path/to/image.jpg -c "Check this!"
```

## 📡 Webhook Setup

Register a webhook to receive real-time events:

```bash
curl -X POST http://localhost:3000/api/webhooks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-app.com/webhook",
    "events": ["message:received"],
    "secret": "webhook-secret"
  }'
```

## 🐳 Docker Deployment

```bash
# Build and run
docker-compose up -d

# View logs
docker-compose logs -f
```

## 📚 API Documentation

Open http://localhost:3000/api-docs for interactive API documentation.

## 🆘 Troubleshooting

### QR Code Not Showing

1. Check if Chrome/Chromium is installed
2. Verify session name is correct
3. Check logs: `tail -f logs/application-*.log`

### Messages Not Sending

1. Ensure phone is connected (session authenticated)
2. Check number format (include country code)
3. Verify rate limits aren't exceeded

### Connection Issues

1. Restart the service
2. Delete and recreate session
3. Check WhatsApp web is working on your phone

## 📞 Support

- GitHub Issues: https://github.com/yourusername/whatsapp-api/issues
- Documentation: http://localhost:3000/api-docs
- Logs: Check `logs/` directory

## ⚡ Next Steps

1. Set up webhooks for real-time notifications
2. Configure PM2 for production deployment
3. Set up Nginx reverse proxy with SSL
4. Implement custom message templates
5. Explore bulk messaging features