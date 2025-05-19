#!/bin/bash

cd /root/venommm

# Test creating a session in regular CLI mode
echo "Test 1: Creating session via regular CLI mode"
node src/cli/index.js session --create test-regular

# Test getting QR code in regular CLI mode
echo -e "\nTest 2: Getting QR code via regular CLI mode"
node src/cli/index.js session --qr test-regular

# Test listing sessions 
echo -e "\nTest 3: Listing sessions"
node src/cli/index.js session --list

echo -e "\nAll tests completed!"