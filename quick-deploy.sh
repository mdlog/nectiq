#!/bin/bash

echo "🚀 Quick Deploy to Polygon Amoy Testnet"
echo "======================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << 'EOF'
# Private key untuk deployment (tanpa 0x prefix)
PRIVATE_KEY=

# Polygon API Keys untuk contract verification  
POLYGONSCAN_API_KEY=

# Network URLs
NETWORK_URL_AMOY=https://rpc-amoy.polygon.technology
NETWORK_URL_POLYGON=https://polygon-rpc.com

# Admin Addresses
BACKEND_SIGNER_ADDRESS=
TREASURY_ADDRESS=0x3e4d881819768fab30c5a79F3A9A7e69f0a935a4
ORACLE_ADDRESS=

# Token Addresses on Polygon Amoy Testnet
WETH_ADDRESS=0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619
USDC_ADDRESS=0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174
LINK_ADDRESS=0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39

# NFT Metadata Base URI
NFT_BASE_URI=https://api.nectiq.com/nft-metadata/
EOF
    echo "✅ .env file created!"
fi

# Check if PRIVATE_KEY is set
source .env 2>/dev/null || true

if [ -z "$PRIVATE_KEY" ]; then
    echo ""
    echo "⚠️  PRIVATE_KEY not configured!"
    echo ""
    echo "📋 SETUP STEPS:"
    echo "1. Edit .env file: nano .env"
    echo "2. Set your private key: PRIVATE_KEY=your_private_key_here"
    echo "3. Remove 0x prefix from private key"
    echo "4. Get testnet MATIC: https://faucet.polygon.technology/"
    echo "5. Run this script again"
    echo ""
    echo "Example .env entry:"
    echo "PRIVATE_KEY=1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
    echo ""
    echo "🔗 Useful Links:"
    echo "- Faucet: https://faucet.polygon.technology/"
    echo "- Explorer: https://amoy.polygonscan.com/"
    echo "- API Key: https://polygonscan.com/"
    echo ""
    exit 1
fi

echo "✅ PRIVATE_KEY is configured"
echo ""

# Load environment
source .env

# Try to get account address
echo "🔍 Getting deployer address..."
DEPLOYER_ADDRESS=$(npx hardhat run -e 'const { ethers } = require("hardhat"); console.log(ethers.computeAddress("0x" + process.env.PRIVATE_KEY))' 2>/dev/null || echo "Unknown")

if [ "$DEPLOYER_ADDRESS" != "Unknown" ]; then
    echo "Deployer account: $DEPLOYER_ADDRESS"
else
    echo "⚠️  Could not determine deployer address"
fi

echo ""
echo "🚀 Ready to deploy enhanced contracts to Polygon Amoy!"
echo ""
echo "📋 Contracts to be deployed:"
echo "1. Enhanced Prediction Staking (with duration multipliers)"
echo "2. Enhanced Parlay Staking (with compound formula)"
echo "3. Enhanced Multi-Token Vault (with NTIQ support)"
echo "4. Prediction Insurance System (10% cost, 50% refund)"
echo "5. Referral Reward System (10% referral bonus)"
echo "6. NFT Achievement System (6 achievement categories)"
echo ""
echo "🔗 Using existing contracts:"
echo "- NTIQ Token: 0xE276c3634b7747c46c1aBAB4Eff6b2f046C71A6f"
echo "- Treasury: 0x3e4d881819768fab30c5a79F3A9A7e69f0a935a4"
echo ""

read -p "Press Enter to start deployment..." -r
echo ""

echo "🏗️  Starting deployment..."
echo "This may take a few minutes..."
echo ""

# Deploy contracts
npx hardhat run deploy-to-amoy.cjs --network amoy

echo ""
echo "🎉 Deployment completed!"
echo "Check the output above for contract addresses and block explorer links."
