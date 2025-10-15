#!/bin/bash

# Setup script for Polygon Amoy deployment
echo "🚀 Setting up Polygon Amoy Testnet Deployment"
echo "=============================================="

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
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
else
    echo "✅ .env file already exists"
fi

# Check if PRIVATE_KEY is set
if [ -z "$PRIVATE_KEY" ]; then
    echo ""
    echo "⚠️  PRIVATE_KEY not set!"
    echo ""
    echo "Please set your private key in .env file:"
    echo "1. Open .env file"
    echo "2. Set PRIVATE_KEY=your_private_key_here"
    echo "3. Make sure to remove 0x prefix from private key"
    echo ""
    echo "Example:"
    echo "PRIVATE_KEY=1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
    echo ""
    echo "After setting PRIVATE_KEY, run:"
    echo "source .env"
    echo "npx hardhat run deploy-to-testnet.cjs --network amoy"
    echo ""
else
    echo "✅ PRIVATE_KEY is set"
    echo "Account: $(npx hardhat run -e 'const { ethers } = require("hardhat"); console.log(ethers.computeAddress("0x" + process.env.PRIVATE_KEY))')"
fi

echo ""
echo "🔗 Useful Links:"
echo "- Get testnet MATIC: https://faucet.polygon.technology/"
echo "- Get Polygonscan API key: https://polygonscan.com/"
echo "- Polygon Amoy Explorer: https://amoy.polygonscan.com/"
echo ""
echo "📋 Next Steps:"
echo "1. Set PRIVATE_KEY in .env file"
echo "2. Get testnet MATIC from faucet"
echo "3. Set POLYGONSCAN_API_KEY (optional, for verification)"
echo "4. Run: source .env"
echo "5. Run: npx hardhat run deploy-to-testnet.cjs --network amoy"
echo ""
echo "🎯 Ready for deployment!"
