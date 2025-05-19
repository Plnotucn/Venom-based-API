# WhatsApp API Usage Guide

## Overview
The WhatsApp API is now running successfully. You have two ways to interact with it:
1. **CLI** - Command-line interface
2. **Interactive CLI** - Menu-driven interface

## Prerequisites
- Server must be running: `npm start` or `node src/index.js`
- Make sure the server is accessible at http://localhost:3000

## Using the CLI

### Create a Session
```bash
node src/cli/index.js session --create mysession
```

### Get QR Code
```bash
node src/cli/index.js session --qr mysession
```

### List Sessions
```bash
node src/cli/index.js session --list
```

### Delete Session
```bash
node src/cli/index.js session --delete mysession
```

## Using Interactive Mode

Start interactive mode:
```bash
node src/cli/index.js interactive
```

Then follow the menu options:
1. Select "Manage Sessions"
2. Choose "Create session" to create a new session
3. Choose "View QR code" to get the QR code for scanning

## Using the API Directly

### Create Session
```bash
curl -X POST http://localhost:3000/api/sessions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"sessionName": "mysession"}'
```

### Get QR Code
```bash
curl -X GET http://localhost:3000/api/sessions/mysession/qr \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Important Notes

1. **QR Code Timeouts**: WhatsApp QR codes timeout after 60 seconds. The system will generate new QR codes automatically.

2. **Session States**: 
   - `notLogged` - Waiting for QR scan
   - `qrReadSuccess` - QR scanned successfully
   - `connected` - Fully authenticated
   - `desconnectedMobile` - Disconnected by phone

3. **Base64 QR Codes**: The QR codes are returned as base64 PNG images. You can:
   - Display them in HTML: `<img src="data:image/png;base64,{QR_STRING}">`
   - Convert to image file
   - Generate ASCII representation

## Testing Script

Run the quick session test:
```bash
node quick-session.js test
```

This will:
1. Create a session
2. Wait for QR generation
3. Display the QR code
4. Monitor authentication status

## Troubleshooting

1. **"Failed to create session" error**: 
   - Check server logs: `tail -f logs/application-*.log`
   - Ensure browser dependencies are installed
   - Try with a different session name

2. **QR code not displaying**:
   - Wait 3-5 seconds after session creation
   - Check if session already exists

3. **Connection issues**:
   - Verify server is running: `curl http://localhost:3000/health`
   - Check JWT token is valid
   - Ensure correct API endpoints