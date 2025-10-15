# 🚀 Instruksi Restart Aplikasi Nectiq

## ✅ Status Perbaikan

Semua fixes sudah diterapkan di kode:
- ✅ RPC errors fixed (polling interval 30s)
- ✅ Database error fixed (accuracy_percentage → accuracy)
- ✅ Error handling improved

## 🔴 Server Sudah Di-Kill

Server telah di-stop. Port 5003 sudah free.

## 📝 Langkah-Langkah Restart

### 1. Start Server
```bash
npm run dev
```

### 2. Tunggu Sampai Server Ready
Anda akan melihat output seperti ini:
```
🔧 Initializing services...
✅ Vault event listener started
✅ Multi Token Vault event listener started
serving on port 5003
```

### 3. Buka Browser
```
http://localhost:5003
```

### 4. Connect Wallet
- Klik tombol "Connect Wallet"
- Pilih MetaMask atau wallet lain
- Approve connection

### 5. Akses User Dashboard
Setelah wallet connected, navigate ke:
```
http://localhost:5003/user-dashboard
```

## 🧪 Test Setelah Restart

### Test 1: Basic Connectivity
```bash
curl http://localhost:5003/api/test-route-priority
```
Expected: `{"success":true,"message":"First route working!",...}`

### Test 2: User Insights (Yang Tadinya Error)
```bash
curl http://localhost:5003/api/user/insights
```
Expected: Tidak ada error "accuracy_percentage"

### Test 3: Home Page
```bash
curl http://localhost:5003/
```
Expected: HTML page dengan `<!DOCTYPE html>`

## 🔍 Verifikasi Dashboard Terender

### Di Browser Console (F12):

1. **Check Network Tab**
   - Semua API calls harus status 200 atau 304
   - Tidak ada request yang failed/pending

2. **Check Console Tab**
   - Harus ada log: `🎯 [USER-DASHBOARD] Rendering dashboard`
   - Tidak ada JavaScript errors

3. **Check Elements Tab**
   - Harus ada content di `<div id="root">`
   - Tidak boleh kosong

### Expected Console Logs:
```
🎯 [USER-DASHBOARD] Rendering dashboard
🎯 [USER-DASHBOARD] Dashboard rendering started
📊 [USER-DASHBOARD] Query states: {...}
🎯 [RENDER] Dashboard JSX about to return for user: YourUsername
```

## ❌ Troubleshooting

### Jika Dashboard Masih Blank:

#### 1. Check Wallet Connection
```javascript
// Di browser console, jalankan:
console.log('Wallet connected:', window.ethereum?.selectedAddress);
```

#### 2. Check User Authentication
```bash
curl -b cookies.txt http://localhost:5003/api/user
```

#### 3. Check React Rendering
- Buka DevTools → Elements
- Cari `<div id="root">`
- Lihat apakah ada content di dalamnya

#### 4. Hard Refresh Browser
```
Ctrl + Shift + R (Linux/Windows)
Cmd + Shift + R (Mac)
```

#### 5. Clear Browser Cache
- DevTools → Application → Clear Storage
- Clear all data
- Reload page

### Jika Error "accuracy_percentage" Masih Muncul:

Ini berarti server belum restart dengan kode baru. Lakukan:

```bash
# Force kill semua
./force-restart.sh

# Verify port free
lsof -i :5003

# Start fresh
npm run dev
```

## 📊 Expected Behavior

### ✅ Setelah Restart yang Benar:

1. **Server starts tanpa error**
   - No "accuracy_percentage" errors
   - No "could not coalesce error" spam

2. **Home page loads**
   - Shows landing page
   - Connect wallet button visible

3. **Wallet connection works**
   - MetaMask popup appears
   - Connection successful
   - User authenticated

4. **Dashboard renders**
   - Shows user balance
   - Shows predictions (if any)
   - Shows stats
   - No blank page

## 🎯 Checklist Sebelum Declare "Fixed"

- [ ] Server started successfully
- [ ] No errors in terminal
- [ ] Home page loads (http://localhost:5003)
- [ ] Wallet connected successfully
- [ ] User authenticated (check /api/user)
- [ ] Dashboard accessible (/user-dashboard)
- [ ] Dashboard shows content (not blank)
- [ ] No JavaScript errors in console
- [ ] All API calls successful (Network tab)

## 💡 Tips

### Jika Masih Ada Masalah:

1. **Check terminal output** - Lihat error messages
2. **Check browser console** - Lihat JavaScript errors
3. **Check Network tab** - Lihat failed requests
4. **Try different browser** - Test di Chrome/Firefox
5. **Clear all cache** - Browser + npm cache

### Untuk Development:

```bash
# Clear npm cache
rm -rf node_modules/.cache

# Clear browser cache
# DevTools → Application → Clear Storage

# Restart fresh
npm run dev
```

## 📞 Jika Masih Bermasalah

Jalankan diagnostic script:
```bash
./test-server.sh
```

Ini akan test:
- Server connectivity
- API endpoints
- Process status

## 🎉 Success Indicators

Anda tahu dashboard berhasil terender jika:

1. ✅ Tidak ada blank page
2. ✅ Melihat "Welcome back, [Username]!"
3. ✅ Melihat balance NTIQ
4. ✅ Melihat stats (predictions, accuracy, rank)
5. ✅ Melihat tabs (Overview, Predictions, Rewards, etc.)
6. ✅ Tidak ada error di console

---

## 🚀 Quick Start Command

```bash
# One-liner untuk restart dan test
./force-restart.sh && sleep 2 && npm run dev
```

Setelah server ready, buka browser dan connect wallet!
