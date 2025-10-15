#!/bin/bash

echo "🧪 Testing Nectiq Server..."
echo ""

# Check if server is running
echo "1️⃣ Checking if server is running..."
if lsof -i :5003 > /dev/null 2>&1; then
    echo "   ✅ Server is running on port 5003"
else
    echo "   ❌ Server is NOT running on port 5003"
    echo "   💡 Run: npm run dev"
    exit 1
fi

echo ""
echo "2️⃣ Testing API endpoints..."

# Test basic route
echo "   Testing /api/test-route-priority..."
RESPONSE=$(timeout 3 curl -s http://localhost:5003/api/test-route-priority 2>&1)
if echo "$RESPONSE" | grep -q "success"; then
    echo "   ✅ Basic route working"
else
    echo "   ❌ Basic route failed"
    echo "   Response: $RESPONSE"
fi

# Test auth endpoint
echo "   Testing /api/auth/me..."
AUTH_RESPONSE=$(timeout 3 curl -s http://localhost:5003/api/auth/me 2>&1)
if echo "$AUTH_RESPONSE" | grep -q "Authentication required"; then
    echo "   ✅ Auth endpoint working (not authenticated)"
elif echo "$AUTH_RESPONSE" | grep -q "id"; then
    echo "   ✅ Auth endpoint working (authenticated)"
else
    echo "   ❌ Auth endpoint failed"
    echo "   Response: $AUTH_RESPONSE"
fi

# Test home page
echo "   Testing home page..."
HOME_RESPONSE=$(timeout 3 curl -s http://localhost:5003/ 2>&1)
if echo "$HOME_RESPONSE" | grep -q "<!DOCTYPE html>"; then
    echo "   ✅ Home page loading"
else
    echo "   ❌ Home page failed"
fi

echo ""
echo "3️⃣ Checking processes..."
ps aux | grep -E "(tsx|node)" | grep nectiq | grep -v grep | head -3

echo ""
echo "✅ Server test complete!"
echo ""
echo "🌐 Access the app at: http://localhost:5003"
echo "📊 User dashboard: http://localhost:5003/user-dashboard (requires wallet connection)"
