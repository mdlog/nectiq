# 🌐 Setup Domain Pribadi untuk Nectiq di Replit

## 📋 Persyaratan Awal

### ✅ Yang Anda Butuhkan:
- Domain yang sudah Anda miliki (contoh: nectiq.com)
- Akses ke DNS management domain tersebut
- Replit subscription (Hacker Plan atau Teams Plan)
- Aplikasi Nectiq sudah di-deploy di Replit

---

## 🚀 Step-by-Step Setup Domain Pribadi

### **Step 1: Deploy Aplikasi ke Replit Production**

**A. Klik tombol "Deploy" di Replit:**
```
Replit Dashboard → Your Project → Deploy Button
```

**B. Pilih deployment type:**
```
- Autoscale Deployment (Recommended untuk full-stack)
- Reserved VM (Untuk high performance)
```

**C. Tunggu deployment selesai:**
```
✅ Deployment akan mendapat URL default: your-app-name.replit.app
```

---

### **Step 2: Setup Custom Domain di Replit**

**A. Buka Deployment Settings:**
```
Replit Dashboard → Deployments → Your App → Settings
```

**B. Scroll ke "Custom Domain" section:**
```
🔧 Custom Domain Configuration
├── Domain Name: [masukkan domain Anda]
├── SSL Certificate: Auto-managed by Replit
└── DNS Configuration: Manual setup required
```

**C. Masukkan domain Anda:**
```
Domain: nectiq.com (atau subdomain: app.nectiq.com)
```

---

### **Step 3: Konfigurasi DNS di Provider Domain**

**A. Login ke DNS Management:**
- Godaddy → DNS Management
- Cloudflare → DNS Records
- Namecheap → Advanced DNS
- dll sesuai provider Anda

**B. Tambah CNAME Record:**
```
Type: CNAME
Name: @ (untuk root domain) atau subdomain (untuk app.nectiq.com)
Value: your-app-name.replit.app
TTL: 300 (5 minutes)
```

**Contoh DNS Records:**
```
# Untuk root domain (nectiq.com)
Type: CNAME
Name: @
Target: nectiq-app.replit.app

# Untuk subdomain (app.nectiq.com)  
Type: CNAME
Name: app
Target: nectiq-app.replit.app
```

---

### **Step 4: Verify Domain Connection**

**A. Tunggu DNS Propagation (5-30 menit):**
```bash
# Test DNS resolution
nslookup nectiq.com
dig nectiq.com CNAME
```

**B. Cek status di Replit Dashboard:**
```
Replit Deployment → Custom Domain → Status
✅ Connected: Domain berhasil terhubung
❌ Pending: Masih menunggu DNS propagation
```

**C. Test akses domain:**
```
https://nectiq.com → Should load your Nectiq app
```

---

## 🔧 Konfigurasi DNS untuk Different Providers

### **Cloudflare:**
```
Type: CNAME
Name: @
Target: your-app.replit.app
Proxy Status: DNS Only (Gray Cloud)
```

### **GoDaddy:**
```
Type: CNAME
Host: @
Points to: your-app.replit.app
TTL: 1 Hour
```

### **Namecheap:**
```
Type: CNAME Record
Host: @
Value: your-app.replit.app
TTL: Automatic
```

### **Google Domains:**
```
Name: @
Type: CNAME
TTL: 300
Data: your-app.replit.app
```

---

## 🛡️ SSL Certificate Setup

### **Automatic SSL (Recommended):**
```
✅ Replit automatically provides SSL certificate
✅ HTTPS akan aktif dalam 15-30 menit setelah domain connected
✅ Auto-renewal setiap 90 hari
```

### **Custom SSL (Advanced):**
```
🔧 Upload your own SSL certificate jika diperlukan
📋 Certificate + Private Key + Certificate Chain
⚙️ Konfigurasi di Deployment Settings → SSL
```

---

## 📊 Verification & Testing

### **Test Domain Functionality:**

**A. Basic Connection Test:**
```bash
curl -I https://nectiq.com
# Should return 200 OK
```

**B. SSL Certificate Test:**
```bash
openssl s_client -connect nectiq.com:443
# Should show valid SSL certificate
```

**C. Application Functionality Test:**
```
✅ Homepage loads
✅ User registration works
✅ Prediction system functional
✅ Admin panel accessible
✅ Database connections working
```

---

## 🔄 Environment Configuration

### **Update Environment Variables:**

**A. Production Environment (.env):**
```bash
# Update allowed origins for CORS
ALLOWED_ORIGINS=https://nectiq.com,https://www.nectiq.com

# Update session cookie domain
COOKIE_DOMAIN=.nectiq.com

# Update any hardcoded URLs
FRONTEND_URL=https://nectiq.com
API_BASE_URL=https://nectiq.com/api
```

**B. Frontend Configuration:**
```typescript
// Update any hardcoded URLs in frontend
const API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://nectiq.com/api'
  : 'http://localhost:5000/api';
```

---

## 📈 Post-Setup Optimization

### **Performance Optimization:**
```
🚀 CDN: Replit provides automatic CDN
⚡ Caching: Configure browser caching headers
🗜️ Compression: Enable gzip compression
📊 Monitoring: Setup uptime monitoring
```

### **SEO Setup:**
```html
<!-- Update meta tags untuk domain baru -->
<meta property="og:url" content="https://nectiq.com">
<meta property="og:site_name" content="Nectiq">
<link rel="canonical" href="https://nectiq.com">
```

---

## 🛠️ Troubleshooting Common Issues

### **Issue 1: Domain tidak terhubung**
```bash
# Check DNS propagation
dig nectiq.com CNAME

# Solution:
- Pastikan CNAME record benar
- Tunggu DNS propagation (up to 48 hours)
- Check with your DNS provider
```

### **Issue 2: SSL Certificate error**
```bash
# Check SSL status
curl -I https://nectiq.com

# Solution:
- Tunggu 30 menit setelah domain connected
- Pastikan HTTPS redirect enabled
- Contact Replit support jika masih error
```

### **Issue 3: CORS Error**
```bash
# Update CORS configuration
ALLOWED_ORIGINS=https://nectiq.com

# Solution:
- Update environment variables
- Restart deployment
- Test dari browser
```

### **Issue 4: Redirect Loop**
```bash
# Check redirect configuration
curl -L https://nectiq.com

# Solution:
- Disable proxy di Cloudflare (if using)
- Check .htaccess rules
- Verify server configuration
```

---

## 💡 Best Practices

### **Security:**
```
🔒 Always use HTTPS
🛡️ Setup security headers
🚫 Block direct .replit.app access
📋 Regular security audits
```

### **Performance:**
```
⚡ Enable compression
📊 Monitor response times
🗜️ Optimize images and assets
📈 Use CDN for static files
```

### **Maintenance:**
```
🔄 Regular DNS health checks
📊 Monitor uptime and performance
🔧 Keep SSL certificates updated
📋 Backup domain configuration
```

---

## 📞 Support & Resources

### **Replit Documentation:**
- Custom Domains: https://docs.replit.com/deployments/custom-domains
- SSL Certificates: https://docs.replit.com/deployments/ssl

### **DNS Providers Help:**
- Cloudflare: https://support.cloudflare.com/
- GoDaddy: https://support.godaddy.com/
- Namecheap: https://www.namecheap.com/support/

### **Testing Tools:**
- DNS Checker: https://dnschecker.org/
- SSL Test: https://www.ssllabs.com/ssltest/
- Uptime Monitor: https://uptimerobot.com/

---

## 🎯 Final Checklist

**✅ Before Going Live:**
```
□ Domain properly configured
□ SSL certificate active
□ All app functions working
□ Database connected
□ Environment variables updated
□ CORS configured correctly
□ Performance optimized
□ Monitoring setup
□ Backup strategy ready
```

**🚀 Ready to Launch:**
```
✅ https://nectiq.com fully functional
✅ All users can access the platform
✅ Smart contracts deployable
✅ Admin functions working
✅ Production environment stable
```

**Selamat! Domain pribadi Anda siap untuk platform Nectiq! 🎉**