#!/bin/bash

echo "╔═══════════════════════════════════════════════════════════════════════════════╗"
echo "║           🚀 HARDHAT DEPLOYMENT WITH TEMPORARY FIX                            ║"
echo "╚═══════════════════════════════════════════════════════════════════════════════╝"
echo ""

# Step 1: Backup package.json
echo "📋 Step 1: Backing up package.json..."
cp package.json package.json.backup
echo "✅ Backup created: package.json.backup"
echo ""

# Step 2: Remove "type": "module" temporarily
echo "🔧 Step 2: Temporarily modifying package.json..."
sed -i 's/"type": "module",//' package.json
echo "✅ Removed 'type': 'module'"
echo ""

# Step 3: Compile contract
echo "🔨 Step 3: Compiling smart contract..."
npx hardhat compile --config hardhat.config.cjs
COMPILE_STATUS=$?

if [ $COMPILE_STATUS -ne 0 ]; then
    echo "❌ Compilation failed!"
    echo "🔄 Restoring package.json..."
    mv package.json.backup package.json
    exit 1
fi

echo "✅ Compilation successful!"
echo ""

# Step 4: Deploy to Polygon Amoy
echo "🚀 Step 4: Deploying to Polygon Amoy..."
npx hardhat run scripts/deploy-vault.cjs --network amoy --config hardhat.config.cjs
DEPLOY_STATUS=$?

# Step 5: Restore package.json
echo ""
echo "🔄 Step 5: Restoring original package.json..."
mv package.json.backup package.json
echo "✅ package.json restored!"
echo ""

if [ $DEPLOY_STATUS -eq 0 ]; then
    echo "╔═══════════════════════════════════════════════════════════════════════════════╗"
    echo "║                  ✅ DEPLOYMENT SUCCESSFUL!                                    ║"
    echo "╚═══════════════════════════════════════════════════════════════════════════════╝"
    echo ""
    echo "📝 Next steps:"
    echo "   1. Copy the contract address from above"
    echo "   2. Add to .env:"
    echo "      VAULT_CONTRACT_ADDRESS=\"0x...\""
    echo "      VITE_VAULT_CONTRACT_ADDRESS=\"0x...\""
    echo "   3. Restart your server: npm run dev"
    echo ""
    exit 0
else
    echo "❌ Deployment failed!"
    exit 1
fi

