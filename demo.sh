#!/bin/bash

# Demo script for WhatsApp API usage

echo "==================================="
echo "WhatsApp API Demo"
echo "==================================="
echo ""

# Check if server is running
echo "Checking server status..."
if curl -s http://localhost:3000/health > /dev/null; then
    echo "✓ Server is running"
else
    echo "✗ Server is not running. Please start it with: npm start"
    exit 1
fi

echo ""
echo "1. Creating a new session..."
echo "Command: node src/cli/index.js session --create demo-session"
echo ""
node src/cli/index.js session --create demo-session

echo ""
echo "2. Getting the QR code..."
echo "Command: node src/cli/index.js session --qr demo-session"
echo ""
node src/cli/index.js session --qr demo-session

echo ""
echo "3. Listing all sessions..."
echo "Command: node src/cli/index.js session --list"
echo ""
node src/cli/index.js session --list

echo ""
echo "==================================="
echo "Demo Complete!"
echo "==================================="
echo ""
echo "To use interactive mode, run:"
echo "  node src/cli/index.js interactive"
echo ""
echo "For more details, check USAGE_GUIDE.md"