#!/bin/bash

# Simple API Test

echo "🚀 WhatsApp API Simple Test"
echo "=========================="

# 1. Health check
echo -e "\n1. Health Check"
curl -s http://localhost:3000/health | grep -q "ok" && echo "✅ Server is healthy" || echo "❌ Health check failed"

# 2. Login
echo -e "\n2. Login"
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}' | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -n "$TOKEN" ]; then
    echo "✅ Login successful"
    echo "Token: ${TOKEN:0:50}..."
else
    echo "❌ Login failed"
    exit 1
fi

# 3. Create session
echo -e "\n3. Create Session"
RESPONSE=$(curl -s -X POST http://localhost:3000/api/sessions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"sessionName": "test-session"}')

echo "Response: $RESPONSE"
echo $RESPONSE | grep -q "success" && echo "✅ Session created" || echo "❌ Session creation failed"

# 4. List sessions
echo -e "\n4. List Sessions"
curl -s -X GET http://localhost:3000/api/sessions \
  -H "Authorization: Bearer $TOKEN" | grep -q "sessions" && echo "✅ Sessions listed" || echo "❌ Failed to list sessions"

# 5. Get QR code
echo -e "\n5. Get QR Code"
QR_RESPONSE=$(curl -s -X GET http://localhost:3000/api/sessions/test-session/qr \
  -H "Authorization: Bearer $TOKEN")

echo "QR Response: ${QR_RESPONSE:0:100}..."

# 6. API Docs
echo -e "\n6. API Documentation"
curl -s http://localhost:3000/api-docs | grep -q "swagger" && echo "✅ API docs available at http://localhost:3000/api-docs" || echo "❌ API docs not available"

echo -e "\n✨ Test completed!"