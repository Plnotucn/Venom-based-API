#!/bin/bash

# WhatsApp API Test Script

API_URL=${API_URL:-"http://localhost:3000/api"}
USERNAME=${USERNAME:-"admin"}
PASSWORD=${PASSWORD:-"admin123"}

echo "🚀 WhatsApp API Test Script"
echo "=========================="
echo "API URL: $API_URL"
echo ""

# Login to get JWT token
echo "1. Testing login..."
LOGIN_RESPONSE=$(curl -s -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "'$USERNAME'",
    "password": "'$PASSWORD'"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
    echo "❌ Login failed"
    echo "Response: $LOGIN_RESPONSE"
    exit 1
fi

echo "✅ Login successful"
echo "Token: $TOKEN"
echo ""

# Test creating a session
echo "2. Testing session creation..."
SESSION_NAME="test-session-$(date +%s)"
SESSION_RESPONSE=$(curl -s -X POST $API_URL/sessions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionName": "'$SESSION_NAME'"
  }')

echo "Response: $SESSION_RESPONSE"
echo ""

# List sessions
echo "3. Testing list sessions..."
LIST_RESPONSE=$(curl -s -X GET $API_URL/sessions \
  -H "Authorization: Bearer $TOKEN")

echo "Sessions: $LIST_RESPONSE"
echo ""

# Get QR code
echo "4. Testing QR code retrieval..."
QR_RESPONSE=$(curl -s -X GET $API_URL/sessions/$SESSION_NAME/qr \
  -H "Authorization: Bearer $TOKEN")

QR_CODE=$(echo $QR_RESPONSE | jq -r '.qrCode')
if [ "$QR_CODE" != "null" ] && [ -n "$QR_CODE" ]; then
    echo "✅ QR code retrieved successfully"
    echo "QR Code (truncated): ${QR_CODE:0:50}..."
else
    echo "❌ No QR code available (session may already be authenticated)"
fi
echo ""

# Test webhook creation
echo "5. Testing webhook creation..."
WEBHOOK_URL="https://webhook.site/test"
WEBHOOK_RESPONSE=$(curl -s -X POST $API_URL/webhooks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "'$WEBHOOK_URL'",
    "events": ["message:received", "message:status"]
  }')

WEBHOOK_ID=$(echo $WEBHOOK_RESPONSE | jq -r '.id')
echo "Webhook created with ID: $WEBHOOK_ID"
echo ""

# Health check
echo "6. Testing health endpoint..."
HEALTH_RESPONSE=$(curl -s -X GET ${API_URL%/api}/health)
echo "Health: $HEALTH_RESPONSE"
echo ""

echo "🎉 API tests completed!"