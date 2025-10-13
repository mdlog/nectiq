#!/bin/bash

echo "🔄 Restarting Nectiq Server with Automated Withdrawal Service"
echo "============================================================="

# Kill existing server processes
echo "🛑 Stopping existing server processes..."
pkill -f "tsx server/index.ts" || echo "No existing server process found"
pkill -f "node.*server/index.ts" || echo "No existing server process found"

# Wait a moment for processes to stop
sleep 2

# Load environment variables
echo "📋 Loading environment variables..."
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
    echo "✅ Environment variables loaded"
else
    echo "❌ .env file not found!"
    exit 1
fi

# Verify ADMIN_PRIVATE_KEY is set
if [ -z "$ADMIN_PRIVATE_KEY" ]; then
    echo "❌ ADMIN_PRIVATE_KEY not found in environment"
    echo "Please run: ./add-test-admin-key.sh"
    exit 1
fi

echo "✅ ADMIN_PRIVATE_KEY is set"
echo "✅ ENABLE_AUTO_WITHDRAWALS: ${ENABLE_AUTO_WITHDRAWALS:-true}"
echo "✅ WITHDRAWAL_CHECK_INTERVAL: ${WITHDRAWAL_CHECK_INTERVAL:-5}"

# Start the server
echo "🚀 Starting server with automated withdrawal service..."
echo "   This will start the server in the background"
echo "   Check the logs for automated withdrawal service initialization"
echo ""

# Start server in background
nohup npm run dev > server.log 2>&1 &
SERVER_PID=$!

echo "📊 Server started with PID: $SERVER_PID"
echo "📝 Logs are being written to: server.log"
echo ""

# Wait a moment for server to start
echo "⏳ Waiting for server to initialize..."
sleep 5

# Check if server is running
if ps -p $SERVER_PID > /dev/null; then
    echo "✅ Server is running (PID: $SERVER_PID)"
else
    echo "❌ Server failed to start"
    echo "📝 Check server.log for errors:"
    tail -20 server.log
    exit 1
fi

# Check for automated withdrawal service initialization
echo "🔍 Checking for automated withdrawal service initialization..."
sleep 3

if grep -q "Automated withdrawal system initialized" server.log; then
    echo "✅ Automated withdrawal service initialized successfully"
elif grep -q "ADMIN_PRIVATE_KEY not found" server.log; then
    echo "❌ Automated withdrawal service failed - ADMIN_PRIVATE_KEY not found"
    echo "📝 Check server.log for details"
else
    echo "⚠️  Automated withdrawal service status unclear"
    echo "📝 Check server.log for details"
fi

echo ""
echo "📋 Server Status:"
echo "   PID: $SERVER_PID"
echo "   Logs: server.log"
echo "   URL: http://localhost:3000"
echo ""
echo "🔍 To monitor logs: tail -f server.log"
echo "🛑 To stop server: kill $SERVER_PID"
echo ""
echo "🎉 Server restart completed!"
