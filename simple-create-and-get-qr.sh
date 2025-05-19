#!/bin/bash

# Simple script to create session and get QR code immediately

SESSION_NAME="${1:-test-session}"
API_URL="http://localhost:3000/api"
AUTH_TOKEN="Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzQ3NTE1NTgwLCJleHAiOjE3NDgxMjAzODB9.-B-zPbD1ga-OLZ3s7Up90cvQIz-eqkJiKPUiOxJlgjU"

echo "Creating session: $SESSION_NAME"

# Create session
curl -X POST "$API_URL/sessions" \
  -H "Content-Type: application/json" \
  -H "Authorization: $AUTH_TOKEN" \
  -d "{\"sessionName\": \"$SESSION_NAME\"}" \
  -s | jq . || echo "Session creation response received"

echo -e "\nWaiting for QR generation..."
sleep 5

echo -e "\nGetting QR code..."

# Get QR code
response=$(curl -X GET "$API_URL/sessions/$SESSION_NAME/qr" \
  -H "Authorization: $AUTH_TOKEN" \
  -s)

# Extract the QR code value
qr_code=$(echo "$response" | jq -r '.qrCode // .qr // empty')

if [ -n "$qr_code" ]; then
    echo -e "\nQR Code received successfully!"
    echo -e "\nBase64 QR Code:"
    echo "$qr_code"
    echo -e "\n\nTo view this QR code:"
    echo "1. Copy the base64 string above"
    echo "2. Visit: https://base64.guru/converter/decode/image"
    echo "3. Paste the string to see the QR code image"
    echo -e "\nOr use CLI to view QR: node src/cli/index.js session --qr $SESSION_NAME"
else
    echo "No QR code found in response"
    echo "Full response:"
    echo "$response" | jq . || echo "$response"
fi