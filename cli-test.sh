#!/bin/bash

# Test the CLI commands
echo "Testing CLI session creation..."

cd /root/venommm

# Create a new session
echo "1. Creating session..."
node src/cli/index.js session --create test-cli-session

echo -e "\n2. Listing sessions..."
node src/cli/index.js session --list

echo -e "\n3. Getting QR code..."
node src/cli/index.js session --qr test-cli-session

echo -e "\nDone!"