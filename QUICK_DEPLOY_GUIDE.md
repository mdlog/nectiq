# 🚀 Quick Deploy Guide - Nectiq Platform VPS

**Terakhir Diperbarui: 5 Agustus 2025**

## Cara Cepat Deploy ke VPS

### Status Update Terbaru (Agustus 2025)
- ✅ **Sistem Export CSV Lengkap**: 8 fungsi export dengan coverage data komprehensif
- ✅ **Enhanced Admin Panel**: Kontrol administratif penuh dengan monitoring detail  
- ✅ **TypeScript Stability**: Semua error LSP diagnostics telah diperbaiki untuk deployment stabil
- ✅ **Production Ready**: Platform siap untuk deployment produksi dengan testing komprehensif

### Option 1: Automated Script (Recommended)
```bash
# 1. Login ke VPS
ssh your-user@your-vps-ip

# 2. Download aplikasi dan script
git clone https://github.com/mdlog/nectiq.git
cd nectiq

# 3. Jalankan script deploy otomatis
./deploy.sh

# 4. Ikuti prompts dan masukkan:
#    - Domain name (contoh: nectiq.com)
#    - Email untuk SSL certificate
```

**Script akan otomatis:**
- ✅ Update system dan install dependencies
- ✅ Setup firewall dan security
- ✅ Install Node.js 20, PostgreSQL, Nginx
- ✅ Setup database dengan password random
- ✅ Build dan deploy aplikasi dengan PM2
- ✅ Configure Nginx reverse proxy
- ✅ Setup SSL certificate dengan Let's Encrypt
- ✅ Setup monitoring dan auto-backup

### Option 2: Manual Step-by-Step
Ikuti panduan lengkap di [VPS_DEPLOYMENT_GUIDE.md](./VPS_DEPLOYMENT_GUIDE.md)

---

## 📋 Persyaratan VPS

### Spesifikasi Minimum:
- **OS**: Ubuntu 20.04/22.04 LTS
- **RAM**: 2 GB (4 GB untuk produksi)
- **Storage**: 20 GB SSD
- **CPU**: 1 vCore
- **Domain**: Sudah pointing ke IP VPS

### Provider Recommended:
- **DigitalOcean**: $12/bulan (2GB RAM, 50GB SSD)
- **Vultr**: $6/bulan (1GB RAM, 25GB SSD)
- **Linode**: $10/bulan (2GB RAM, 50GB SSD)

---

## 🔧 Setelah Deploy

### 1. Update Environment Variables
```bash
# Edit file .env
nano ~/nectiq-platform/.env

# Update bagian berikut dengan API keys asli:
VITE_FIREBASE_API_KEY=your_real_firebase_api_key
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_DYNAMIC_ENVIRONMENT_ID=your_dynamic_environment_id
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
ADMIN_WALLET_ADDRESSES=0xYourAdminWallet1,0xYourAdminWallet2

# Restart aplikasi
pm2 restart nectiq-platform
```

### 2. Setup External Services

**Firebase Setup:**
1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Buat project baru atau gunakan existing
3. Enable Authentication
4. Tambahkan domain VPS ke Authorized domains
5. Copy API keys ke .env file

**Dynamic Labs Setup:**
1. Daftar di [Dynamic Labs](https://app.dynamic.xyz/)
2. Buat environment production
3. Configure wallet providers
4. Copy Environment ID ke .env file

**WalletConnect Setup:**
1. Daftar di [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Buat project baru
3. Copy Project ID ke .env file

### 3. Test Aplikasi
```bash
# Check status
pm2 status

# View logs
pm2 logs nectiq-platform

# Test HTTP response
curl -I https://your-domain.com

# Check database
psql -h localhost -U nectiq_user -d nectiq_db -c "SELECT COUNT(*) FROM users;"
```

---

## 🛠️ Management Commands

### PM2 Commands:
```bash
pm2 status                    # Check app status
pm2 logs nectiq-platform     # View logs
pm2 restart nectiq-platform  # Restart app
pm2 stop nectiq-platform     # Stop app
pm2 delete nectiq-platform   # Delete app from PM2
```

### System Commands:
```bash
sudo systemctl status nginx     # Check Nginx
sudo systemctl status postgresql # Check database
sudo ufw status                 # Check firewall
htop                           # Monitor resources
df -h                          # Check disk usage
```

### SSL Certificate:
```bash
sudo certbot certificates      # Check SSL status
sudo certbot renew           # Manual renewal
sudo certbot renew --dry-run  # Test renewal
```

---

## 🚨 Troubleshooting

### App tidak bisa diakses:
```bash
# Check PM2
pm2 logs nectiq-platform

# Check Nginx
sudo tail -f /var/log/nginx/error.log

# Restart services
pm2 restart nectiq-platform
sudo systemctl restart nginx
```

### Database issues:
```bash
# Check PostgreSQL
sudo systemctl status postgresql

# Test connection
psql -h localhost -U nectiq_user -d nectiq_db

# Restart database
sudo systemctl restart postgresql
```

### SSL Certificate issues:
```bash
# Check certificate
sudo certbot certificates

# Renew manually
sudo certbot --nginx -d your-domain.com
```

---

## 📞 Support

Jika mengalami masalah:
1. Check application logs: `pm2 logs nectiq-platform`
2. Check system resources: `htop`
3. Check service status: `sudo systemctl status nginx postgresql`
4. Restart services: `pm2 restart nectiq-platform`

**Deployment berhasil jika:**
- ✅ `pm2 status` menunjukkan app online
- ✅ `https://your-domain.com` dapat diakses
- ✅ Wallet connection berfungsi
- ✅ Database connection aktif