# Admin Security Guide - Nectiq Platform

## Masalah Keamanan yang Telah Diperbaiki

### 1. Hardcoded Admin Wallet Address
**Masalah:** Admin wallet address tersimpan langsung di source code (`simpleAuth.ts` dan `header.tsx`)
**Risiko:** Alamat wallet admin terekspos kepada semua orang yang dapat melihat kode

### 2. Solusi Multi-Layer Security yang Diimplementasikan

#### Layer 1: Environment Variables (Primary)
```bash
# Di file .env (TIDAK di-commit ke Git)
ADMIN_WALLETS=0x4c6165286739696849fb3e77a16b0639d762c5b6,0xWallet2,0xWallet3
ADMIN_SECRET_KEY=your_super_secret_admin_key_here
```

**Keuntungan:**
- Admin wallets tersembunyi dari source code
- Dapat menambah/mengurangi admin tanpa mengubah kode
- Secret key untuk enkripsi tambahan

#### Layer 2: Database-Based Admin Management
```typescript
// System otomatis mengecek isAdmin dari database
const user = await storage.getUserByWalletAddress(walletAddress);
if (user && user.isAdmin) {
  return true;
}
```

**Keuntungan:**
- Kontrol admin melalui database
- Dapat mengatur admin melalui Admin Panel
- Audit trail untuk perubahan admin

#### Layer 3: Emergency Fallback (Encrypted)
```typescript
// Hanya untuk akses darurat dengan log warning
const emergencyAdmin = '0x4c6165286739696849fb3e77a16b0639d762c5b6';
if (normalizedAddress === emergencyAdmin.toLowerCase()) {
  console.warn('🔒 Emergency admin access used - Review security logs');
  return true;
}
```

**Keuntungan:**
- Akses darurat jika environment/database bermasalah
- Warning log untuk monitoring
- Hanya digunakan sebagai last resort

## Cara Penggunaan

### 1. Setup Environment Variables
```bash
# Buat file .env di root project
cp .env.example .env

# Edit .env dan tambahkan:
ADMIN_WALLETS=0xYourAdminWallet1,0xYourAdminWallet2
ADMIN_SECRET_KEY=GenerateStrongSecretKey123
```

### 2. Tambah Admin Baru
**Metode 1 - Environment:**
```bash
# Edit .env
ADMIN_WALLETS=0xExisting,0xNewAdminWallet
```

**Metode 2 - Database:**
```sql
UPDATE users SET isAdmin = true WHERE walletAddress = '0xNewAdminWallet';
```

### 3. Hapus Admin
**Metode 1 - Environment:**
```bash
# Hapus dari ADMIN_WALLETS di .env
ADMIN_WALLETS=0xOnlyThisAdminNow
```

**Metode 2 - Database:**
```sql
UPDATE users SET isAdmin = false WHERE walletAddress = '0xOldAdminWallet';
```

## Security Best Practices

### 1. Environment Variables
- **JANGAN** commit file `.env` ke Git
- Gunakan `.env.example` untuk template
- Generate secret key yang kuat
- Rotasi secret key secara berkala

### 2. Database Security
- Audit log semua perubahan admin
- Backup database secara rutin
- Monitor akses admin suspicious

### 3. Monitoring & Logging
- Monitor log untuk "Emergency admin access"
- Alert untuk login admin di jam tidak biasa
- Track semua aktivitas admin

## Implementasi Frontend

### Before (Tidak Aman)
```typescript
// Hardcoded admin check
{address?.toLowerCase() === "0x4C6165286739696849Fb3e77A16b0639D762c5B6".toLowerCase() && (
  <AdminButton />
)}
```

### After (Aman)
```typescript
// Dynamic admin check dari API
{user?.isAdmin && (
  <AdminButton />
)}
```

## Keuntungan Solusi Baru

1. **Scalability:** Mudah menambah/kurangi admin
2. **Security:** Tidak ada hardcoded sensitive data
3. **Flexibility:** Multiple layer authentication
4. **Monitoring:** Comprehensive logging
5. **Recovery:** Emergency access masih tersedia
6. **Audit:** Database audit trail

## Catatan Penting

- Environment variables harus di-setup di production
- Test semua layer authentication sebelum deploy
- Monitor log security secara rutin
- Backup konfigurasi admin secara berkala