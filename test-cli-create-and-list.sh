#!/bin/bash

# Script to test CLI session creation and immediate visibility

# Get auth token
TOKEN=$(node get-token.js | grep "JWT Token:" | awk '{print $3}')
export API_TOKEN=$TOKEN

echo "=== Testing CLI Session Creation and Visibility ==="
echo

# Create session via CLI
echo "1. Creating session via CLI..."
node src/cli/index.js session --create test-cli-flow &
CREATE_PID=$!

# Wait a moment for creation to start
sleep 2

# List sessions while creation is happening
echo
echo "2. Listing sessions during creation..."
node src/cli/index.js session --list

# Check QR code availability
echo
echo "3. Checking QR code availability..."
node src/cli/index.js session --qr test-cli-flow || echo "QR code might not be ready yet"

# Kill the creation process after test
kill $CREATE_PID 2>/dev/null

echo
echo "=== Test Complete ==="