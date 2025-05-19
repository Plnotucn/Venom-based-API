# Simple WhatsApp API Usage

## Create Session and Get QR Code

### Method 1: Using CLI Commands

```bash
# 1. Create a session
node src/cli/index.js session --create test

# 2. Wait 5-10 seconds for QR generation

# 3. Get the QR code
node src/cli/index.js session --qr test
```

### Method 2: Using Interactive Mode

```bash
# 1. Start interactive mode
node src/cli/index.js interactive

# 2. Select "Manage Sessions"
# 3. Select "Create session" 
# 4. Enter a session name (e.g., "test")
# 5. Select "Manage Sessions" again
# 6. Select "View QR code"
# 7. Select your session from the list
```

### Method 3: Using curl (Direct API)

```bash
# 1. Create session
curl -X POST http://localhost:3000/api/sessions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzQ3NTE1NTgwLCJleHAiOjE3NDgxMjAzODB9.-B-zPbD1ga-OLZ3s7Up90cvQIz-eqkJiKPUiOxJlgjU" \
  -d '{"sessionName": "test"}'

# 2. Wait 5-10 seconds

# 3. Get QR code
curl -X GET http://localhost:3000/api/sessions/test/qr \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzQ3NTE1NTgwLCJleHAiOjE3NDgxMjAzODB9.-B-zPbD1ga-OLZ3s7Up90cvQIz-eqkJiKPUiOxJlgjU"
```

## Understanding the QR Code

When you get the QR code, it will be in base64 format. To use it:

1. The QR code string starts with `data:image/png;base64,`
2. Copy this entire string
3. You can:
   - Paste it in an HTML file as `<img src="[QR_STRING]">`
   - Use an online converter like https://base64.guru/converter/decode/image
   - Use any base64 to image converter

## Important Notes

- Sessions timeout after 5 minutes if not scanned
- QR codes regenerate every ~20 seconds
- You'll see multiple QR generations in the logs - this is normal
- The system will keep trying until you scan or it times out

## Quick Test

Here's the quickest way to test:

```bash
# Create session and get QR in two commands
node src/cli/index.js session --create quicktest
sleep 5
node src/cli/index.js session --qr quicktest
```

The QR code will be displayed in your terminal!