#!/bin/bash

# NTIQ Token Deployment Script
# This script helps deploy NTIQ Token to different networks

echo "🚀 NTIQ Token Deployment Script"
echo "================================"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "Please create .env file with required environment variables:"
    echo "DEPLOYER_PRIVATE_KEY=your_private_key"
    echo "POLYGONSCAN_API_KEY=your_polygonscan_api_key"
    exit 1
fi

# Load environment variables
source .env

# Check if required variables are set
if [ -z "$DEPLOYER_PRIVATE_KEY" ]; then
    echo "❌ DEPLOYER_PRIVATE_KEY not set in .env file"
    exit 1
fi

if [ -z "$POLYGONSCAN_API_KEY" ]; then
    echo "❌ POLYGONSCAN_API_KEY not set in .env file"
    exit 1
fi

echo "✅ Environment variables loaded"
echo ""

# Function to deploy to testnet
deploy_testnet() {
    echo "🧪 Deploying to Polygon Amoy Testnet..."
    echo "⚠️  This will deploy to TESTNET only"
    echo ""
    
    # Check if user has testnet MATIC
    echo "💡 Make sure you have testnet MATIC from:"
    echo "   https://faucet.polygon.technology/"
    echo "   https://mumbaifaucet.com/"
    echo ""
    
    read -p "Continue with testnet deployment? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🚀 Starting testnet deployment..."
        npx hardhat run scripts/deploy-ntiq-polygon-amoy.cjs --network amoy
        
        if [ $? -eq 0 ]; then
            echo ""
            echo "✅ Testnet deployment successful!"
            echo ""
            echo "📄 Next steps:"
            echo "1. Test the contract: npx hardhat run scripts/test-ntiq-interaction.cjs --network amoy"
            echo "2. Verify contract: npx hardhat run scripts/verify-ntiq-contract.cjs --network amoy"
            echo "3. Check deployment file: ntiq-deployment-polygon-amoy-*.json"
        else
            echo "❌ Testnet deployment failed!"
        fi
    else
        echo "❌ Testnet deployment cancelled"
    fi
}

# Function to deploy to mainnet
deploy_mainnet() {
    echo "🌐 Deploying to Polygon Mainnet..."
    echo "⚠️  WARNING: This will deploy to MAINNET!"
    echo "⚠️  Make sure you have:"
    echo "   - Sufficient MATIC for gas fees"
    echo "   - Tested on testnet first"
    echo "   - Verified all parameters"
    echo ""
    
    read -p "Are you sure you want to deploy to MAINNET? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🚀 Starting mainnet deployment..."
        npx hardhat run scripts/deploy-ntiq-polygon-mainnet.cjs --network polygon
        
        if [ $? -eq 0 ]; then
            echo ""
            echo "✅ Mainnet deployment successful!"
            echo ""
            echo "📄 Next steps:"
            echo "1. Test the contract: npx hardhat run scripts/test-ntiq-interaction.cjs --network polygon"
            echo "2. Verify contract: npx hardhat verify --network polygon <contract_address>"
            echo "3. Check deployment file: ntiq-deployment-polygon-mainnet-*.json"
        else
            echo "❌ Mainnet deployment failed!"
        fi
    else
        echo "❌ Mainnet deployment cancelled"
    fi
}

# Function to test existing deployment
test_deployment() {
    echo "🧪 Testing existing deployment..."
    echo ""
    
    # Check for deployment files
    testnet_files=$(ls ntiq-deployment-polygon-amoy-*.json 2>/dev/null | wc -l)
    mainnet_files=$(ls ntiq-deployment-polygon-mainnet-*.json 2>/dev/null | wc -l)
    
    if [ $testnet_files -gt 0 ]; then
        echo "📄 Found $testnet_files testnet deployment(s)"
        echo "🧪 Testing testnet deployment..."
        npx hardhat run scripts/test-ntiq-interaction.cjs --network amoy
    fi
    
    if [ $mainnet_files -gt 0 ]; then
        echo "📄 Found $mainnet_files mainnet deployment(s)"
        echo "🧪 Testing mainnet deployment..."
        npx hardhat run scripts/test-ntiq-interaction.cjs --network polygon
    fi
    
    if [ $testnet_files -eq 0 ] && [ $mainnet_files -eq 0 ]; then
        echo "❌ No deployment files found!"
        echo "Please deploy first using option 1 or 2"
    fi
}

# Function to verify contract
verify_contract() {
    echo "🔍 Verifying contract on Polygonscan..."
    echo ""
    
    # Check for deployment files
    testnet_files=$(ls ntiq-deployment-polygon-amoy-*.json 2>/dev/null | wc -l)
    mainnet_files=$(ls ntiq-deployment-polygon-mainnet-*.json 2>/dev/null | wc -l)
    
    if [ $testnet_files -gt 0 ]; then
        echo "📄 Found $testnet_files testnet deployment(s)"
        echo "🔍 Verifying testnet contract..."
        npx hardhat run scripts/verify-ntiq-contract.cjs --network amoy
    fi
    
    if [ $mainnet_files -gt 0 ]; then
        echo "📄 Found $mainnet_files mainnet deployment(s)"
        echo "🔍 Verifying mainnet contract..."
        npx hardhat run scripts/verify-ntiq-contract.cjs --network polygon
    fi
    
    if [ $testnet_files -eq 0 ] && [ $mainnet_files -eq 0 ]; then
        echo "❌ No deployment files found!"
        echo "Please deploy first using option 1 or 2"
    fi
}

# Main menu
while true; do
    echo ""
    echo "📋 Select an option:"
    echo "1) Deploy to Polygon Amoy Testnet"
    echo "2) Deploy to Polygon Mainnet"
    echo "3) Test existing deployment"
    echo "4) Verify contract on Polygonscan"
    echo "5) Exit"
    echo ""
    read -p "Enter your choice (1-5): " choice
    
    case $choice in
        1)
            deploy_testnet
            ;;
        2)
            deploy_mainnet
            ;;
        3)
            test_deployment
            ;;
        4)
            verify_contract
            ;;
        5)
            echo "👋 Goodbye!"
            exit 0
            ;;
        *)
            echo "❌ Invalid option. Please choose 1-5."
            ;;
    esac
done
