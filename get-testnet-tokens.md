# Get Testnet Tokens for Admin Wallet

## Admin Wallet Address
```
0x1Be31A94361a391bBaFB2a4CCd704F57dc04d4bb
```

## Current Balances
- **ETH Balance**: 0.00011456798369 ETH ⚠️ (Low)
- **USDC Balance**: 0.0 USDC ❌ (None)

## How to Get Testnet Tokens

### 1. Get POL (ETH) for Gas Fees
Visit: https://faucet.polygon.technology
- Select "Polygon Amoy Testnet"
- Enter wallet address: `0x1Be31A94361a391bBaFB2a4CCd704F57dc04d4bb`
- Request POL tokens (minimum 0.1 POL recommended)

### 2. Get USDC Testnet Tokens
Visit: https://faucet.polygon.technology
- Select "Polygon Amoy Testnet"
- Enter wallet address: `0x1Be31A94361a391bBaFB2a4CCd704F57dc04d4bb`
- Request USDC tokens (minimum 10 USDC recommended)

### 3. Alternative Faucets
- **Polygon Faucet**: https://faucet.polygon.technology
- **Alchemy Faucet**: https://sepoliafaucet.com (if available for Amoy)
- **QuickNode Faucet**: https://faucet.quicknode.com/polygon/amoy

## After Getting Tokens

1. **Verify balances**:
   ```bash
   node check-withdrawal-status-fixed.cjs
   ```

2. **Test withdrawal**:
   - Go to admin panel
   - Create a small USDC withdrawal request
   - Check if it gets processed automatically

3. **Monitor logs**:
   ```bash
   tail -f server.log
   ```

## Expected Results

After getting tokens, you should see:
- ✅ **ETH Balance**: > 0.01 ETH
- ✅ **USDC Balance**: > 10 USDC
- ✅ **Automated withdrawal processing working**

## Troubleshooting

If withdrawal still fails after getting tokens:
1. Check server logs for errors
2. Verify admin wallet has sufficient balance
3. Check network connectivity
4. Verify USDC contract is working
