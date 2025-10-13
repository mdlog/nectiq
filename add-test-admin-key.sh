#!/bin/bash

# Add a test admin private key to .env file for development
# WARNING: This is for testing only - use a real private key in production

echo "🔑 Adding test ADMIN_PRIVATE_KEY to .env file"
echo "============================================="

# Test private key (DO NOT USE IN PRODUCTION)
# This is a test key for Polygon Amoy testnet
TEST_PRIVATE_KEY="1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    exit 1
fi

# Check if ADMIN_PRIVATE_KEY already exists
if grep -q "ADMIN_PRIVATE_KEY" .env; then
    echo "⚠️  ADMIN_PRIVATE_KEY already exists in .env file"
    echo "Current value:"
    grep "ADMIN_PRIVATE_KEY" .env
    echo ""
    read -p "Do you want to update it with test key? (y/n): " update
    if [ "$update" != "y" ]; then
        echo "Exiting..."
        exit 0
    fi
    # Update existing key
    sed -i "s/ADMIN_PRIVATE_KEY=.*/ADMIN_PRIVATE_KEY=$TEST_PRIVATE_KEY/" .env
    echo "✅ Updated ADMIN_PRIVATE_KEY in .env file"
else
    # Add new key
    echo "ADMIN_PRIVATE_KEY=$TEST_PRIVATE_KEY" >> .env
    echo "✅ Added ADMIN_PRIVATE_KEY to .env file"
fi

echo ""
echo "⚠️  WARNING: This is a TEST private key!"
echo "   - Only use this for development/testing"
echo "   - Make sure to replace with a real private key for production"
echo "   - The test wallet needs USDC and ETH from testnet faucets"
echo ""

echo "📋 Additional environment variables added:"
echo "   ENABLE_AUTO_WITHDRAWALS=true"
echo "   WITHDRAWAL_CHECK_INTERVAL=5"
echo ""

# Add other required environment variables if they don't exist
if ! grep -q "ENABLE_AUTO_WITHDRAWALS" .env; then
    echo "ENABLE_AUTO_WITHDRAWALS=true" >> .env
    echo "✅ Added ENABLE_AUTO_WITHDRAWALS=true"
fi

if ! grep -q "WITHDRAWAL_CHECK_INTERVAL" .env; then
    echo "WITHDRAWAL_CHECK_INTERVAL=5" >> .env
    echo "✅ Added WITHDRAWAL_CHECK_INTERVAL=5"
fi

echo ""
echo "🎉 Setup completed!"
echo ""
echo "📝 Next steps:"
echo "   1. Restart your server to apply changes"
echo "   2. Get testnet USDC and ETH for the admin wallet"
echo "   3. Test withdrawal functionality"
echo ""
echo "💡 To get testnet tokens:"
echo "   - Visit: https://faucet.polygon.technology"
echo "   - Select 'Polygon Amoy Testnet'"
echo "   - Request tokens for the admin wallet address"
