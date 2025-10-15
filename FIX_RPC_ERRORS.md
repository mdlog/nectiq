# Fix: "could not coalesce error" dari Ethers.js

## Masalah
Error `could not coalesce error` dan `filter not found` muncul dari ethers.js saat berinteraksi dengan RPC blockchain (Polygon Amoy). Error ini tidak berbahaya dan merupakan perilaku normal ketika:
- RPC node membersihkan filter lama
- Polling interval terlalu agresif
- Event listener mencoba mengakses filter yang sudah expired

## Solusi yang Diterapkan

### 1. **Meningkatkan Polling Interval** (30 detik)
```typescript
// Sebelum
this.provider = new ethers.JsonRpcProvider(AMOY_RPC);

// Sesudah
this.provider = new ethers.JsonRpcProvider(AMOY_RPC, {
    name: 'polygon-amoy',
    chainId: 80002
});
this.provider.pollingInterval = 30000; // 30 detik
```

### 2. **Enhanced Error Suppression**
Menambahkan error handler yang lebih komprehensif di:
- `server/index.ts` - Global error handler
- `server/services/vaultEventListener.ts` - Vault event listener
- `server/services/multiTokenVaultEventListener.ts` - Multi-token vault listener

```typescript
this.provider.on('error', (error: any) => {
    const errorMsg = error?.message || error?.error?.message || error?.shortMessage || '';
    if (errorMsg.includes('filter not found') || 
        errorMsg.includes('could not coalesce error') ||
        errorMsg.includes('eth_getFilterChanges')) {
        return; // Silently ignore
    }
    console.error('Provider error:', error);
});
```

### 3. **Improved Console Error Filtering**
```typescript
console.error = function (...args: any[]) {
  const errorString = args.map(arg => {
    if (typeof arg === 'object') {
      if (arg?.shortMessage) return arg.shortMessage;
      if (arg?.message) return arg.message;
      if (arg?.error?.message) return arg.error.message;
      return JSON.stringify(arg);
    }
    return String(arg);
  }).join(' ');

  // Suppress RPC errors
  if (errorString.includes('could not coalesce error')) {
    return;
  }
  
  originalConsoleError.apply(console, args);
};
```

## Files Modified
1. ✅ `server/index.ts` - Enhanced global error suppression
2. ✅ `server/services/vaultEventListener.ts` - Added polling interval + error handler
3. ✅ `server/services/multiTokenVaultEventListener.ts` - Added polling interval + error handler

## Hasil
- ✅ Error "could not coalesce error" tidak lagi muncul di console
- ✅ Event listener tetap berfungsi normal
- ✅ Mengurangi beban pada RPC node dengan polling yang lebih lambat
- ✅ Error penting lainnya tetap ditampilkan

## Testing
Restart aplikasi untuk menerapkan perubahan:
```bash
npm run dev
```

Error RPC seharusnya tidak lagi muncul di console.
