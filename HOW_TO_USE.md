# How to Use the WhatsApp API

## ✅ System is Working!

Based on the logs, your WhatsApp API is running correctly:
- Server is active at http://localhost:3000
- Sessions are being created successfully
- QR codes are being generated

## 🚀 Quick Start

### 1. Create a Session & Get QR Code

```bash
# Create a new session
node src/cli/index.js session --create mysession

# Get the QR code (wait 3-5 seconds after creation)
node src/cli/index.js session --qr mysession
```

### 2. Interactive Mode

```bash
# Start interactive CLI
node src/cli/index.js interactive

# Then select:
# 1. Manage Sessions
# 2. Create session
# 3. View QR code
```

## 📖 Understanding the QR Output

When you run the QR command, you'll see:
- An ASCII QR code in the terminal
- A base64 string (data:image/png;base64,...)

The base64 string is the actual QR image that you need to scan.

## 🔄 Session Workflow

1. **Create Session**: Initiates WhatsApp connection
2. **Get QR Code**: Retrieves the authentication QR
3. **Scan with WhatsApp**: Open WhatsApp on your phone → Settings → Linked Devices → Link a Device
4. **Session Authenticated**: Once scanned, the session becomes active

## ⚠️ Important Notes

- QR codes regenerate every ~20 seconds if not scanned
- Sessions timeout after 5 minutes if not authenticated
- The system will retry multiple times (you see "Attempt 1", "Attempt 2", etc.)

## 🔧 Troubleshooting

If QR shows as "undefined":
1. Wait 5 seconds after creating session
2. Check if session already exists: `node src/cli/index.js session --list`
3. Create a new session with different name

## 📝 Example Commands

```bash
# Create session
node src/cli/index.js session --create demo

# Wait a few seconds, then get QR
node src/cli/index.js session --qr demo

# List all sessions
node src/cli/index.js session --list

# Delete a session
node src/cli/index.js session --delete demo
```

## 🎯 Next Steps

Once authenticated, you can:
- Send messages
- Receive messages  
- Set up webhooks
- Use the full API

For detailed API documentation, check the Swagger docs at:
http://localhost:3000/api-docs