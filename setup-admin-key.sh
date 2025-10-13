#!/bin/bash

# Script to setup ADMIN_PRIVATE_KEY for withdrawal processing
# This script will help you add the admin private key to your .env file

echo "🔑 Setting up ADMIN_PRIVATE_KEY for automated withdrawals"
echo "=================================================="

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "Please create a .env file first"
    exit 1
fi

# Check if ADMIN_PRIVATE_KEY already exists
if grep -q "ADMIN_PRIVATE_KEY" .env; then
    echo "⚠️  ADMIN_PRIVATE_KEY already exists in .env file"
    echo "Current value:"
    grep "ADMIN_PRIVATE_KEY" .env
    echo ""
    read -p "Do you want to update it? (y/n): " update
    if [ "$update" != "y" ]; then
        echo "Exiting..."
        exit 0
    fi
fi

echo "📝 Please provide your admin wallet private key:"
echo "   - This should be the private key of the wallet that will send USDC/ETH"
echo "   - Make sure this wallet has enough USDC and ETH for gas fees"
echo "   - For Polygon Amoy testnet, you can get testnet tokens from faucets"
echo ""

read -p "Enter admin private key (without 0x prefix): " private_key

# Validate private key format
if [ ${#private_key} -ne 64 ]; then
    echo "❌ Invalid private key format. Should be 64 characters long."
    exit 1
fi

# Add or update ADMIN_PRIVATE_KEY in .env
if grep -q "ADMIN_PRIVATE_KEY" .env; then
    # Update existing key
    sed -i "s/ADMIN_PRIVATE_KEY=.*/ADMIN_PRIVATE_KEY=$private_key/" .env
    echo "✅ Updated ADMIN_PRIVATE_KEY in .env file"
else
    # Add new key
    echo "ADMIN_PRIVATE_KEY=$private_key" >> .env
    echo "✅ Added ADMIN_PRIVATE_KEY to .env file"
fi

echo ""
echo "🔧 Additional environment variables you might need:"
echo "   ENABLE_AUTO_WITHDRAWALS=true"
echo "   WITHDRAWAL_CHECK_INTERVAL=5"
echo "   MAX_DAILY_WITHDRAWAL=10000"
echo "   MAX_SINGLE_WITHDRAWAL=1000"
echo "   AUTO_APPROVAL_THRESHOLD=500"
echo ""

echo "📋 Next steps:"
echo "   1. Restart your server to apply changes"
echo "   2. Check admin panel for automated withdrawal status"
echo "   3. Test with a small withdrawal amount"
echo ""

echo "🎉 Setup completed!"
