#!/bin/bash

echo "🔥 Force Restarting Nectiq Application..."
echo ""

# Kill ALL node/tsx processes related to nectiq
echo "🛑 Killing all nectiq processes..."
pkill -9 -f "tsx server/index.ts"
pkill -9 -f "node.*nectiq"
pkill -9 -f "vite"
sleep 2

# Force kill anything on port 5003
echo "🔍 Checking port 5003..."
PORT_PID=$(lsof -ti :5003 2>/dev/null)
if [ ! -z "$PORT_PID" ]; then
    echo "⚠️  Killing process on port 5003 (PID: $PORT_PID)..."
    kill -9 $PORT_PID 2>/dev/null
    sleep 1
fi

# Verify port is free
if lsof -i :5003 > /dev/null 2>&1; then
    echo "❌ Port 5003 is still in use!"
    lsof -i :5003
    exit 1
else
    echo "✅ Port 5003 is free"
fi

echo ""
echo "✅ All processes killed!"
echo ""
echo "📝 Now start the application with:"
echo "   npm run dev"
echo ""
echo "⚠️  IMPORTANT: The accuracy_percentage fix has been applied."
echo "   After restart, /api/user/insights should work without errors."
echo ""
