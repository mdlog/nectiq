#!/bin/bash

echo "🔄 Restarting Nectiq Application..."
echo ""

# Kill existing processes
echo "🛑 Stopping existing processes..."
pkill -f "tsx server/index.ts" 2>/dev/null
pkill -f "node.*nectiq" 2>/dev/null
sleep 2

# Check if port is free
echo "🔍 Checking port 5003..."
if lsof -i :5003 > /dev/null 2>&1; then
    echo "⚠️  Port 5003 is still in use. Forcing kill..."
    lsof -ti :5003 | xargs kill -9 2>/dev/null
    sleep 1
fi

# Clear cache (optional)
if [ "$1" == "--clear-cache" ]; then
    echo "🧹 Clearing node_modules cache..."
    rm -rf node_modules/.cache
fi

echo ""
echo "✅ Ready to start!"
echo ""
echo "📝 To start the application, run:"
echo "   npm run dev"
echo ""
echo "🌐 Then open: http://localhost:5003"
echo ""
echo "🔐 Steps to access user dashboard:"
echo "   1. Open http://localhost:5003"
echo "   2. Click 'Connect Wallet'"
echo "   3. Connect your wallet (MetaMask, etc.)"
echo "   4. Navigate to /user-dashboard"
echo ""
