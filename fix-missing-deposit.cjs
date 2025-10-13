#!/usr/bin/env node

/**
 * Manual Fix Script for Missing Deposit Processing
 * 
 * This script manually processes a deposit that was confirmed on blockchain
 * but didn't update the user's NTIQ balance due to the MultiTokenVaultEventListener bug.
 * 
 * Usage: node fix-missing-deposit.cjs <username> <transactionHash> <amountPOL>
 * Example: node fix-missing-deposit.cjs MegaQueen6703 0x123... 0.1
 */

const { ethers } = require('ethers');
const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const { users, deposits, transactionLogs } = require('./shared/schema');
const { eq, and } = require('drizzle-orm');

// Configuration
const AMOY_RPC = process.env.AMOY_RPC_URL || 'https://rpc-amoy.polygon.technology';
const NTIQ_PRICE_USD = 0.01; // 1 NTIQ = $0.01
const POL_PRICE_USD = 0.5; // Approximate POL price (should fetch from API)

// Database connection
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    console.error('❌ DATABASE_URL environment variable not set');
    process.exit(1);
}

const sql = postgres(connectionString);
const db = drizzle(sql);

/**
 * Fetch current POL price from CoinGecko
 */
async function getPOLPrice() {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=matic-network&vs_currencies=usd');
        const data = await response.json();
        return data['matic-network'].usd;
    } catch (error) {
        console.warn('⚠️ Failed to fetch POL price, using fallback:', POL_PRICE_USD);
        return POL_PRICE_USD;
    }
}

/**
 * Verify transaction on blockchain
 */
async function verifyTransaction(txHash) {
    try {
        const provider = new ethers.JsonRpcProvider(AMOY_RPC);
        const tx = await provider.getTransaction(txHash);
        const receipt = await provider.getTransactionReceipt(txHash);

        if (!tx || !receipt) {
            throw new Error('Transaction not found');
        }

        if (receipt.status !== 1) {
            throw new Error('Transaction failed');
        }

        return {
            from: tx.from,
            to: tx.to,
            value: ethers.formatEther(tx.value),
            blockNumber: receipt.blockNumber,
            gasUsed: receipt.gasUsed.toString()
        };
    } catch (error) {
        throw new Error(`Failed to verify transaction: ${error.message}`);
    }
}

/**
 * Find user by username
 */
async function findUser(username) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
}

/**
 * Check if deposit already exists
 */
async function checkExistingDeposit(txHash) {
    const [deposit] = await db.select().from(deposits).where(eq(deposits.transactionHash, txHash));
    return deposit;
}

/**
 * Process the missing deposit
 */
async function processMissingDeposit(username, txHash, amountPOL) {
    try {
        console.log(`🔍 Processing missing deposit for ${username}...`);
        console.log(`   Transaction: ${txHash}`);
        console.log(`   Amount: ${amountPOL} POL`);

        // Step 1: Verify transaction on blockchain
        console.log('\n📡 Verifying transaction on blockchain...');
        const txDetails = await verifyTransaction(txHash);
        console.log(`✅ Transaction verified:`);
        console.log(`   From: ${txDetails.from}`);
        console.log(`   To: ${txDetails.to}`);
        console.log(`   Value: ${txDetails.value} ETH/POL`);
        console.log(`   Block: ${txDetails.blockNumber}`);

        // Step 2: Find user
        console.log('\n👤 Finding user...');
        const user = await findUser(username);
        if (!user) {
            throw new Error(`User not found: ${username}`);
        }
        console.log(`✅ User found: ${user.username} (ID: ${user.id})`);
        console.log(`   Current balance: ${user.balance} NTIQ`);

        // Step 3: Check if deposit already exists
        console.log('\n🔍 Checking for existing deposit...');
        const existingDeposit = await checkExistingDeposit(txHash);
        if (existingDeposit) {
            console.log(`⚠️ Deposit already exists in database:`);
            console.log(`   ID: ${existingDeposit.id}`);
            console.log(`   Status: ${existingDeposit.status}`);
            console.log(`   NTIQ Amount: ${existingDeposit.ntiqAmount}`);

            if (existingDeposit.status === 'completed' && existingDeposit.processedAt) {
                console.log(`✅ Deposit already processed - no action needed`);
                return;
            }
        }

        // Step 4: Get current POL price
        console.log('\n💰 Fetching current POL price...');
        const polPriceUSD = await getPOLPrice();
        console.log(`✅ POL price: $${polPriceUSD}`);

        // Step 5: Calculate NTIQ amount
        const usdValue = parseFloat(amountPOL) * polPriceUSD;
        const ntiqAmount = Math.floor(usdValue / NTIQ_PRICE_USD);

        console.log(`\n🧮 Calculating NTIQ amount:`);
        console.log(`   ${amountPOL} POL × $${polPriceUSD} = $${usdValue.toFixed(2)}`);
        console.log(`   $${usdValue.toFixed(2)} ÷ $${NTIQ_PRICE_USD} = ${ntiqAmount} NTIQ`);

        // Step 6: Create deposit record
        console.log('\n📝 Creating deposit record...');
        const depositData = {
            userId: user.id,
            fromWalletAddress: txDetails.from.toLowerCase(),
            toWalletAddress: txDetails.to.toLowerCase(),
            chainName: 'polygon-amoy',
            chainId: 80002,
            tokenType: 'POL',
            tokenAddress: '0x0000000000000000000000000000000000000000',
            amountUSD: usdValue.toFixed(6),
            ntiqAmount: ntiqAmount,
            ethPriceSnapshot: polPriceUSD.toString(),
            transactionHash: txHash,
            blockNumber: txDetails.blockNumber.toString(),
            status: 'confirmed',
            processedAt: new Date(),
            expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
        };

        const [newDeposit] = await db.insert(deposits).values(depositData).returning();
        console.log(`✅ Deposit record created (ID: ${newDeposit.id})`);

        // Step 7: Credit user balance
        console.log('\n💳 Crediting user balance...');
        const newBalance = user.balance + ntiqAmount;

        await db.update(users)
            .set({ balance: newBalance })
            .where(eq(users.id, user.id));

        console.log(`✅ Balance updated: ${user.balance} → ${newBalance} NTIQ`);

        // Step 8: Create transaction log
        console.log('\n📊 Creating transaction log...');
        const transactionLogData = {
            userId: user.id,
            type: 'deposit_credit',
            amount: ntiqAmount,
            token: 'NTIQ',
            description: `Manual fix - Multi-token vault deposit - ${amountPOL} POL`,
            relatedId: newDeposit.id,
            metadata: JSON.stringify({
                source: 'manual_fix_script',
                originalTransactionHash: txHash,
                tokenSymbol: 'POL',
                amountInToken: amountPOL,
                tokenPriceUSD: polPriceUSD,
                usdValue: usdValue,
                conversionRate: NTIQ_PRICE_USD,
                network: 'Polygon Amoy',
                chainId: 80002,
                blockNumber: txDetails.blockNumber
            })
        };

        const [transactionLog] = await db.insert(transactionLogs).values(transactionLogData).returning();
        console.log(`✅ Transaction log created (ID: ${transactionLog.id})`);

        // Step 9: Summary
        console.log('\n🎉 DEPOSIT PROCESSING COMPLETED SUCCESSFULLY!');
        console.log(`   User: ${username} (${user.id})`);
        console.log(`   Transaction: ${txHash}`);
        console.log(`   Amount: ${amountPOL} POL → ${ntiqAmount} NTIQ`);
        console.log(`   Balance: ${user.balance} → ${newBalance} NTIQ`);
        console.log(`   Deposit ID: ${newDeposit.id}`);
        console.log(`   Transaction Log ID: ${transactionLog.id}`);
        console.log(`   View on Polygonscan: https://amoy.polygonscan.com/tx/${txHash}`);

    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        process.exit(1);
    }
}

// Main execution
async function main() {
    const args = process.argv.slice(2);

    if (args.length !== 3) {
        console.log('Usage: node fix-missing-deposit.cjs <username> <transactionHash> <amountPOL>');
        console.log('Example: node fix-missing-deposit.cjs MegaQueen6703 0x123... 0.1');
        process.exit(1);
    }

    const [username, txHash, amountPOL] = args;

    console.log('🔧 Manual Deposit Fix Script');
    console.log('============================');

    await processMissingDeposit(username, txHash, amountPOL);

    await sql.end();
    console.log('\n✅ Script completed successfully');
}

main().catch(console.error);
