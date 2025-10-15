# Fix: Dashboard Stuck di "Checking Authentication"

## 🔴 Masalah
Dashboard menampilkan "Checking authentication..." selama beberapa detik lalu redirect atau stuck.

## ✅ Root Cause
1. **Wallet tidak ter-connect** di browser
2. **Session tidak dibuat** karena wallet belum authenticate
3. **Query `/api/user` gagal** karena tidak ada session

## 🔧 Fixes yang Diterapkan

### 1. Protected Route Timeout
- Menambahkan delay 2 detik sebelum redirect
- Memberikan waktu untuk authentication selesai
- File: `client/src/components/protected-route.tsx`

### 2. User Query Retry
- Menambahkan retry 3x untuk query `/api/user`
- Menambahkan delay 1 detik antar retry
- File: `client/src/hooks/useRainbowAuth.ts`

### 3. Enhanced Debugging
- Menambahkan console.log untuk track user query state
- Memudahkan debugging di browser console

---

## 📝 Cara Mengakses Dashboard (PENTING!)

### Step-by-Step:

#### 1. **Buka Home Page**
```
http://localhost:5003
```

#### 2. **Connect Wallet**
- Cari tombol "Connect Wallet" di header
- Klik tombol tersebut
- Pilih wallet (MetaMask, WalletConnect, dll)
- **Approve connection** di wallet popup

#### 3. **Tunggu Authentication**
Setelah wallet connected, akan ada proses:
```
🌈 [RAINBOW] Authenticating wallet: 0x...
🌈 [RAINBOW] Request payload: {...}
✅ [RAINBOW] Wallet authenticated successfully
```

#### 4. **Akses Dashboard**
Setelah wallet authenticated, baru bisa akses:
```
http://localhost:5003/user-dashboard
```

---

## 🧪 Test di Browser Console

### 1. Buka DevTools (F12)

### 2. Check Wallet Connection
```javascript
// Di console, jalankan:
console.log('Wallet:', window.ethereum?.selectedAddress);
console.log('Connected:', !!window.ethereum?.selectedAddress);
```

### 3. Check Session Cookie
```javascript
// Di console, jalankan:
console.log('Cookies:', document.cookie);
// Harus ada: connect.sid=...
```

### 4. Test API User
```javascript
// Di console, jalankan:
fetch('/api/user', { credentials: 'include' })
  .then(r => r.json())
  .then(d => console.log('User:', d))
  .catch(e => console.error('Error:', e));
```

Expected result:
- ✅ Jika authenticated: `{id: 14, username: "...", ...}`
- ❌ Jika tidak: `{message: "Authentication required"}`

---

## 🔍 Debugging Steps

### Jika Stuck di "Checking authentication":

#### 1. Check Console Logs
Lihat di browser console (F12 → Console):

```
✅ Good signs:
🌈 [RAINBOW] Auto-authenticating connected wallet
✅ [RAINBOW] Wallet authenticated successfully
👤 [USER-QUERY] State: { hasUser: true, isLoading: false }

❌ Bad signs:
🚫 [PROTECTED-ROUTE] Access denied
❌ [RAINBOW] Authentication failed
👤 [USER-QUERY] State: { hasUser: false, error: "..." }
```

#### 2. Check Network Tab
Buka DevTools → Network:

- Cari request ke `/api/auth/wallet-connect`
  - Status harus: **200 OK**
  - Response harus: `{success: true, user: {...}}`

- Cari request ke `/api/user`
  - Status harus: **200 OK** (bukan 401)
  - Response harus: `{id: ..., username: ...}`

#### 3. Check Wallet Connection
Di browser console:
```javascript
// Check if wallet is connected
console.log('Wallet connected:', !!window.ethereum?.selectedAddress);

// Check wallet address
console.log('Address:', window.ethereum?.selectedAddress);
```

---

## 🛠️ Solutions

### Solution 1: Wallet Belum Connected

**Problem:** Dashboard stuck karena wallet belum connected

**Fix:**
1. Klik "Connect Wallet" di home page
2. Approve di wallet popup
3. Tunggu sampai muncul address di header
4. Baru akses `/user-dashboard`

### Solution 2: Session Tidak Tersimpan

**Problem:** Cookie tidak di-set atau tidak dikirim

**Fix:**
1. Check browser settings → Allow cookies
2. Hard refresh: `Ctrl + Shift + R`
3. Clear site data:
   - DevTools → Application → Clear Storage
   - Clear all
   - Reload page
4. Connect wallet lagi

### Solution 3: Authentication Gagal

**Problem:** `/api/auth/wallet-connect` gagal

**Fix:**
1. Check server logs untuk error
2. Verify database connection
3. Restart server:
   ```bash
   ./force-restart.sh
   npm run dev
   ```
4. Try connect wallet lagi

### Solution 4: Query Timeout

**Problem:** `/api/user` query timeout atau gagal

**Fix:**
1. Check Network tab untuk request yang pending
2. Verify server responding:
   ```bash
   curl http://localhost:5003/api/test-route-priority
   ```
3. If server not responding, restart:
   ```bash
   ./force-restart.sh
   npm run dev
   ```

---

## ✅ Expected Flow

### Normal Authentication Flow:

```
1. User opens http://localhost:5003
   ↓
2. User clicks "Connect Wallet"
   ↓
3. Wallet popup appears
   ↓
4. User approves connection
   ↓
5. Client calls /api/auth/wallet-connect
   ↓
6. Server creates session + sets cookie
   ↓
7. Client queries /api/user (with cookie)
   ↓
8. Server returns user data
   ↓
9. User can access /user-dashboard
   ↓
10. Dashboard renders with user data
```

### What You Should See:

**In Browser Console:**
```
🌈 [RAINBOW] Authenticating wallet: 0x...
✅ [RAINBOW] Wallet authenticated successfully
👤 [USER-QUERY] State: { hasUser: true, isLoading: false }
🎯 [USER-DASHBOARD] Rendering dashboard
```

**In Network Tab:**
```
POST /api/auth/wallet-connect → 200 OK
GET /api/user → 200 OK
GET /api/user/stats → 200 OK
GET /api/predictions/active → 200 OK
```

**On Screen:**
```
Welcome back, [Username]!
Real NTIQ Balance: 1000
```

---

## 🚨 Common Mistakes

### ❌ Mistake 1: Akses Dashboard Tanpa Connect Wallet
```
http://localhost:5003/user-dashboard (langsung)
```
**Result:** Stuck di "Checking authentication" → redirect

**Fix:** Connect wallet dulu di home page!

### ❌ Mistake 2: Wallet Connected di Extension Tapi Tidak di Site
Wallet bisa connected di extension tapi tidak di website.

**Fix:** Klik "Connect Wallet" di website untuk authorize site

### ❌ Mistake 3: Cookie Blocked
Browser settings block cookies.

**Fix:** Allow cookies untuk localhost

### ❌ Mistake 4: Server Belum Restart
Kode sudah diupdate tapi server masih running kode lama.

**Fix:** Restart server dengan `./force-restart.sh`

---

## 📊 Checklist

Sebelum akses dashboard, pastikan:

- [ ] Server running di port 5003
- [ ] Home page loads (http://localhost:5003)
- [ ] Wallet extension installed (MetaMask, etc.)
- [ ] Clicked "Connect Wallet" button
- [ ] Approved connection in wallet popup
- [ ] Wallet address visible di header
- [ ] Browser console shows authentication success
- [ ] Cookie `connect.sid` exists
- [ ] `/api/user` returns user data (not 401)

Jika semua checklist ✅, dashboard akan terender!

---

## 🎯 Quick Test

```bash
# 1. Check server
curl http://localhost:5003/api/test-route-priority

# 2. Try authenticate (replace with your wallet address)
curl -X POST http://localhost:5003/api/auth/wallet-connect \
  -H "Content-Type: application/json" \
  -d '{"walletAddress":"0xYourWalletAddress"}' \
  -c cookies.txt

# 3. Check user (with cookie)
curl -b cookies.txt http://localhost:5003/api/user

# If step 3 returns user data, authentication works!
```

---

## 💡 Pro Tips

1. **Always connect wallet first** before accessing protected routes
2. **Check browser console** for authentication logs
3. **Use Network tab** to debug API calls
4. **Clear cache** if weird behavior
5. **Restart server** after code changes

---

## 🎉 Success Indicators

Dashboard berhasil terender jika:

1. ✅ Tidak ada "Checking authentication" loop
2. ✅ Melihat "Welcome back, [Username]!"
3. ✅ Melihat balance NTIQ
4. ✅ Melihat tabs (Overview, Predictions, etc.)
5. ✅ Tidak ada error di console
6. ✅ Semua API calls status 200/304

Jika semua ✅, congratulations! Dashboard sudah berfungsi! 🎊
