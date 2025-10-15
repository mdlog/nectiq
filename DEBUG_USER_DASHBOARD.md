# Debug: User Dashboard Tidak Terender (Blank Page)

## Masalah
Halaman user-dashboard menampilkan blank page dan tidak bisa diakses melalui localhost:5003

## Root Cause Analysis

### 1. **Aplikasi Hang/Timeout**
- Request ke `localhost:5003` timeout
- Server tidak merespons request HTTP
- Kemungkinan ada blocking code di startup

### 2. **Authentication Loop**
- `ProtectedRoute` memerlukan wallet connection
- User tidak ter-autentikasi → redirect loop
- Session tidak tersimpan dengan benar

### 3. **Database Connection Issue**
- PostgreSQL connection mungkin lambat/timeout
- Query blocking di startup

## Solusi yang Harus Diterapkan

### Step 1: Restart Aplikasi dengan Clean State

```bash
# Kill semua proses node yang berjalan
pkill -f "tsx server/index.ts"
pkill -f "node.*nectiq"

# Clear node modules cache (optional)
rm -rf node_modules/.cache

# Restart aplikasi
npm run dev
```

### Step 2: Test API Endpoints

Setelah aplikasi berjalan, test endpoints ini:

```bash
# Test basic connectivity
curl http://localhost:5003/api/test-route-priority

# Test auth endpoint (should return 401)
curl http://localhost:5003/api/auth/me

# Test home page
curl http://localhost:5003/
```

### Step 3: Check Browser Console

Buka browser console (F12) dan cek:
1. Network tab - apakah ada request yang pending/failed?
2. Console tab - apakah ada JavaScript errors?
3. Application tab → Cookies - apakah ada session cookie?

### Step 4: Connect Wallet untuk Akses Dashboard

User dashboard memerlukan wallet connection:

1. Buka `http://localhost:5003`
2. Klik "Connect Wallet"
3. Connect dengan MetaMask/wallet lain
4. Setelah connected, akses `http://localhost:5003/user-dashboard`

## Fixes yang Sudah Diterapkan

### ✅ 1. Fixed RPC Errors
- Menambahkan polling interval 30 detik
- Enhanced error suppression untuk "could not coalesce error"
- Files: `server/index.ts`, `server/services/vaultEventListener.ts`, `server/services/multiTokenVaultEventListener.ts`

### ✅ 2. Improved Error Handling
- Better console.error filtering
- Nested error property checking
- Suppress RPC filter errors

## Debugging Commands

### Check if server is running
```bash
ps aux | grep -E "(tsx|node)" | grep nectiq
```

### Check port 5003
```bash
lsof -i :5003
netstat -tlnp | grep 5003
```

### Check server logs
```bash
# If using PM2
pm2 logs

# If running in terminal, check the terminal output
```

### Test database connection
```bash
# Create test script
cat > test-db.js << 'EOF'
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5000
});

async function testConnection() {
  try {
    console.log('Testing database connection...');
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Database connected:', result.rows[0]);
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();
EOF

# Run test
node test-db.js
```

## Expected Behavior

### When Working Correctly:

1. **Server starts successfully**
   ```
   🔧 Initializing services...
   ✅ Database connected
   ✅ Vault event listener started
   serving on port 5003
   ```

2. **Home page loads** (`http://localhost:5003`)
   - Shows landing page or dashboard
   - Connect wallet button visible

3. **After wallet connection**
   - User authenticated
   - Session created
   - Can access `/user-dashboard`

4. **User dashboard renders**
   - Shows user balance
   - Shows predictions
   - Shows stats

## Common Issues & Solutions

### Issue 1: "Authentication required"
**Solution:** Connect wallet terlebih dahulu di home page

### Issue 2: Blank page tanpa error
**Solution:** 
- Check browser console untuk JavaScript errors
- Check network tab untuk failed API calls
- Verify Vite dev server is running

### Issue 3: Infinite loading
**Solution:**
- Check if API endpoints responding
- Verify database connection
- Check for blocking queries

### Issue 4: Session tidak tersimpan
**Solution:**
- Check cookie settings di browser
- Verify session middleware di `server/index.ts`
- Check `SESSION_SECRET` di `.env`

## Next Steps

1. **Restart aplikasi** dengan command di atas
2. **Test endpoints** untuk verify server responding
3. **Connect wallet** di home page
4. **Access dashboard** setelah authenticated
5. **Check browser console** jika masih blank

## Files to Monitor

- `server/index.ts` - Main server file
- `server/routes.ts` - API routes
- `client/src/pages/user-dashboard.tsx` - Dashboard component
- `client/src/components/protected-route.tsx` - Auth guard
- `client/src/hooks/useRainbowAuth.ts` - Wallet auth hook

## Contact Points

Jika masih ada masalah:
1. Check terminal output untuk error messages
2. Check browser console untuk client-side errors
3. Verify `.env` configuration
4. Test database connection
5. Verify wallet connection flow
