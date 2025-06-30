# Localhost Setup Guide for Wallet Connection

## Quick Fix for Wallet Connection Issues

If wallet connection is not working on localhost, follow these steps:

### 1. Update Environment Variables

Create or update your `.env` file with:

```env
# Dynamic Labs Environment ID (required for wallet connection)
VITE_DYNAMIC_ENVIRONMENT_ID=bd026474-57a4-4b86-96c5-4897759d9b62

# Session Secret
SESSION_SECRET=localhost-crypto-predict-session-secret

# Admin Wallets (your admin wallet addresses)
ADMIN_WALLETS=0x4c6165286739696849fb3e77a16b0639d762c5b6

# Admin Secret Key
ADMIN_SECRET_KEY=localhost-admin-secret-key

# Development Mode
NODE_ENV=development
```

### 2. Browser Configuration

1. **Use HTTPS (Recommended)**: Most wallets require HTTPS connection
   - Run with SSL: `npm run dev:ssl` (if available)
   - Or use ngrok: `ngrok http 5000`

2. **Allow Insecure Localhost** (Chrome/Edge):
   - Go to `chrome://flags/#allow-insecure-localhost`
   - Enable "Allow invalid certificates for resources loaded from localhost"
   - Restart browser

3. **Firefox Settings**:
   - Go to `about:config`
   - Set `security.tls.insecure_fallback_hosts` to `localhost`

### 3. MetaMask Configuration

1. Make sure MetaMask is installed and unlocked
2. Switch to a supported network (Ethereum Mainnet or Testnet)
3. Allow connections to localhost in MetaMask settings

### 4. CORS Configuration

The server is already configured for localhost with permissive CORS:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Credentials: true`

### 5. Test Wallet Connection

1. Start the application: `npm run dev`
2. Open browser to `http://localhost:5000`
3. Click wallet connection button
4. Check browser console for errors

### 6. Common Issues and Solutions

**Issue**: "Dynamic environment not found"
- **Solution**: Add valid `VITE_DYNAMIC_ENVIRONMENT_ID` to `.env`

**Issue**: "Wallet connection refused"
- **Solution**: Use HTTPS or enable insecure localhost in browser

**Issue**: "MetaMask not detected"
- **Solution**: Refresh page, check MetaMask is unlocked

**Issue**: "Network connection failed"
- **Solution**: Check internet connection, MetaMask network settings

### 7. Dynamic Labs Setup

If you need a new Dynamic environment ID:

1. Go to [Dynamic Labs Dashboard](https://app.dynamic.xyz/)
2. Create new project or use existing
3. Copy Environment ID from project settings
4. Add to `.env` file as `VITE_DYNAMIC_ENVIRONMENT_ID`

### 8. Debugging

Check browser console for detailed error messages:
- Press F12 to open developer tools
- Look for wallet connection errors
- Check network tab for failed requests

### 9. Alternative: Use Replit Domain

If localhost continues to have issues:
1. Deploy to Replit
2. Use the generated `.replit.dev` domain
3. Wallet connections work better with proper domains

## Contact Support

If issues persist, the problem might be:
- Missing Dynamic Labs environment ID
- Browser security restrictions
- MetaMask configuration
- Network connectivity issues