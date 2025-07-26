# 🚀 Panduan Deployment VPS Server - Nectiq Platform

## 📋 Persyaratan VPS

### Spesifikasi Minimum VPS
- **OS**: Ubuntu 20.04 LTS atau 22.04 LTS (disarankan)
- **RAM**: 2 GB (4 GB untuk produksi)
- **Storage**: 20 GB SSD (50 GB disarankan)
- **CPU**: 1 vCore (2 vCore disarankan)
- **Bandwidth**: Unlimited atau minimal 1 TB/bulan
- **IP**: Static IP public

### Provider VPS Rekomendasi
- DigitalOcean (Droplet $12/bulan)
- Vultr (Regular Performance $6/bulan)
- Linode (Nanode $5/bulan)
- AWS EC2 (t3.micro untuk testing)
- Google Cloud Platform (e2-micro)

---

## 🔧 Step 1: Setup Awal VPS

### 1.1 Koneksi ke VPS
```bash
# Koneksi via SSH
ssh root@YOUR_VPS_IP

# Atau jika menggunakan key file
ssh -i your-key.pem root@YOUR_VPS_IP
```

### 1.2 Update System
```bash
# Update package list
apt update && apt upgrade -y

# Install tools penting
apt install -y curl wget git vim ufw software-properties-common htop
```

### 1.3 Setup User Non-Root
```bash
# Buat user baru
adduser nectiq

# Tambahkan ke sudo group
usermod -aG sudo nectiq

# Copy SSH keys ke user baru (jika menggunakan key)
mkdir -p /home/nectiq/.ssh
cp /root/.ssh/authorized_keys /home/nectiq/.ssh/
chown -R nectiq:nectiq /home/nectiq/.ssh
chmod 700 /home/nectiq/.ssh
chmod 600 /home/nectiq/.ssh/authorized_keys

# Switch ke user nectiq
su - nectiq
```

### 1.4 Setup Firewall
```bash
# Enable UFW
sudo ufw enable

# Allow SSH (port 22)
sudo ufw allow ssh

# Allow HTTP dan HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Allow application port
sudo ufw allow 5000

# Check status
sudo ufw status verbose
```

### 1.5 Setup Swap (Optional tapi Disarankan)
```bash
# Buat 2GB swap file
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make permanent
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Verify
free -h
```

---

## 📦 Step 2: Install Dependencies

### 2.1 Install Node.js 20.x
```bash
# Add NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Install Node.js
sudo apt install -y nodejs

# Verify installation
node --version
npm --version

# Install global packages
sudo npm install -g pm2 typescript tsx
```

### 2.2 Install PostgreSQL
```bash
# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Start dan enable service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Check status
sudo systemctl status postgresql
```

### 2.3 Setup PostgreSQL Database
```bash
# Switch ke postgres user
sudo -u postgres psql

# Di dalam PostgreSQL shell:
CREATE DATABASE nectiq_db;
CREATE USER nectiq_user WITH PASSWORD 'nectiq_secure_password_2024!';
GRANT ALL PRIVILEGES ON DATABASE nectiq_db TO nectiq_user;
ALTER USER nectiq_user CREATEDB;
\q

# Test koneksi
psql -h localhost -U nectiq_user -d nectiq_db -c "SELECT version();"
```

---

## 🔄 Step 3: Deploy Aplikasi

### 3.1 Clone Repository
```bash
# Masuk ke home directory
cd ~

# Clone aplikasi (ganti dengan repository URL Anda)
git clone https://github.com/your-username/nectiq-platform.git

# Masuk ke direktori aplikasi
cd nectiq-platform
```

### 3.2 Install Dependencies
```bash
# Install semua dependencies
npm install

# Install production dependencies only (optional)
# npm ci --production
```

### 3.3 Setup Environment Variables
```bash
# Copy environment template
cp .env.example .env

# Edit environment file
nano .env
```

**Konfigurasi .env untuk Production:**
```env
# Database Configuration
DATABASE_URL="postgresql://nectiq_user:nectiq_secure_password_2024!@localhost:5432/nectiq_db"
PGHOST=localhost
PGPORT=5432
PGUSER=nectiq_user
PGPASSWORD=nectiq_secure_password_2024!
PGDATABASE=nectiq_db

# Application Settings
NODE_ENV=production
SESSION_SECRET=your_super_secret_session_key_minimum_32_characters_long
PORT=5000

# Domain Configuration
DOMAIN=your-domain.com
FRONTEND_URL=https://your-domain.com

# Firebase Configuration (dapatkan dari Firebase Console)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_APP_ID=your_firebase_app_id

# Dynamic Labs Configuration (dapatkan dari Dynamic Labs Dashboard)
VITE_DYNAMIC_ENVIRONMENT_ID=your_dynamic_environment_id

# WalletConnect Configuration (dapatkan dari WalletConnect Cloud)
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id

# Admin Configuration
ADMIN_WALLET_ADDRESSES=0xYourAdminWallet1,0xYourAdminWallet2
ADMIN_PRIVATE_KEY=your_admin_private_key_for_automated_features

# Security Settings
CORS_ORIGIN=https://your-domain.com
ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com

# External API Keys (optional)
ETHERSCAN_API_KEY=your_etherscan_api_key
COINGECKO_API_KEY=your_coingecko_api_key
```

### 3.4 Setup Database
```bash
# Push database schema
npm run db:push

# Verify database tables
psql -h localhost -U nectiq_user -d nectiq_db -c "\dt"
```

### 3.5 Build Aplikasi
```bash
# Build production version
npm run build

# Check build output
ls -la dist/
```

---

## 🚀 Step 4: Setup Process Manager (PM2)

### 4.1 Create PM2 Ecosystem File
```bash
# Buat konfigurasi PM2
nano ecosystem.config.cjs
```

**ecosystem.config.cjs:**
```javascript
module.exports = {
  apps: [{
    name: 'nectiq-platform',
    script: 'dist/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env_file: '.env',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    node_args: '--max-old-space-size=1024'
  }]
};
```

### 4.2 Setup PM2
```bash
# Buat direktori logs
mkdir -p logs

# Start aplikasi dengan PM2
pm2 start ecosystem.config.cjs

# Check status
pm2 status

# View logs
pm2 logs nectiq-platform

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup
# Jalankan command yang diberikan oleh PM2

# Test restart
pm2 restart nectiq-platform
```

---

## 🌐 Step 5: Setup Nginx Reverse Proxy

### 5.1 Install Nginx
```bash
# Install Nginx
sudo apt install -y nginx

# Start dan enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Check status
sudo systemctl status nginx
```

### 5.2 Configure Nginx Virtual Host
```bash
# Buat konfigurasi site
sudo nano /etc/nginx/sites-available/nectiq-platform
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL Configuration (will be configured by Certbot)
    # ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Main application
    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://127.0.0.1:5000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security
    location ~ /\. {
        deny all;
    }
}
```

### 5.3 Enable Site
```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/nectiq-platform /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## 🔒 Step 6: Setup SSL Certificate

### 6.1 Install Certbot
```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Test automatic renewal
sudo certbot renew --dry-run
```

### 6.2 Setup Auto-Renewal
```bash
# Add renewal cron job
sudo crontab -e

# Add this line for twice daily renewal check
0 12 * * * /usr/bin/certbot renew --quiet && systemctl reload nginx
```

---

## 📊 Step 7: Monitoring & Maintenance

### 7.1 Setup Log Rotation
```bash
# Create logrotate configuration
sudo nano /etc/logrotate.d/nectiq-platform
```

**Log Rotation Config:**
```
/home/nectiq/nectiq-platform/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 nectiq nectiq
    postrotate
        pm2 reload nectiq-platform
    endscript
}
```

### 7.2 Database Backup Script
```bash
# Create backup directory
mkdir -p ~/backups

# Create backup script
nano ~/backup-database.sh
```

**Database Backup Script:**
```bash
#!/bin/bash

# Configuration
BACKUP_DIR="/home/nectiq/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="nectiq_db_backup_$DATE.sql"
DB_NAME="nectiq_db"
DB_USER="nectiq_user"

# Create backup
pg_dump -h localhost -U $DB_USER -d $DB_NAME > "$BACKUP_DIR/$BACKUP_FILE"

# Compress backup
gzip "$BACKUP_DIR/$BACKUP_FILE"

# Remove backups older than 7 days
find "$BACKUP_DIR" -name "nectiq_db_backup_*.sql.gz" -mtime +7 -delete

echo "$(date): Database backup completed: $BACKUP_FILE.gz"
```

```bash
# Make executable
chmod +x ~/backup-database.sh

# Test backup
./backup-database.sh

# Add to crontab for daily backup at 2 AM
crontab -e
# Add: 0 2 * * * /home/nectiq/backup-database.sh >> /home/nectiq/backup.log 2>&1
```

### 7.3 System Monitoring
```bash
# Install monitoring tools
sudo apt install -y htop iotop nethogs

# Create monitoring script
nano ~/check-system.sh
```

**System Check Script:**
```bash
#!/bin/bash

echo "=== System Status $(date) ==="
echo "CPU and Memory:"
free -h
echo ""
echo "Disk Usage:"
df -h
echo ""
echo "PM2 Status:"
pm2 status
echo ""
echo "Application Logs (last 10 lines):"
pm2 logs nectiq-platform --lines 10 --nostream
echo ""
echo "Nginx Status:"
sudo systemctl status nginx --no-pager -l
```

```bash
# Make executable
chmod +x ~/check-system.sh

# Run system check
./check-system.sh
```

---

## 🔧 Step 8: Testing & Verification

### 8.1 Test Application
```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs nectiq-platform --lines 50

# Test HTTP response
curl -I http://localhost:5000

# Test HTTPS (after SSL setup)
curl -I https://your-domain.com
```

### 8.2 Database Verification
```bash
# Test database connection
psql -h localhost -U nectiq_user -d nectiq_db -c "SELECT COUNT(*) FROM users;"

# Check all tables
psql -h localhost -U nectiq_user -d nectiq_db -c "\dt"
```

### 8.3 Performance Test
```bash
# Install Apache Bench (optional)
sudo apt install -y apache2-utils

# Simple load test
ab -n 100 -c 10 https://your-domain.com/
```

---

## 🚨 Troubleshooting

### Common Issues dan Solutions

**1. Application Won't Start:**
```bash
# Check PM2 logs
pm2 logs nectiq-platform

# Check environment variables
pm2 show nectiq-platform

# Restart application
pm2 restart nectiq-platform

# Rebuild if needed
npm run build
```

**2. Database Connection Issues:**
```bash
# Test database connection
psql -h localhost -U nectiq_user -d nectiq_db

# Check PostgreSQL status
sudo systemctl status postgresql

# Restart PostgreSQL
sudo systemctl restart postgresql

# Check PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-*.log
```

**3. Nginx Issues:**
```bash
# Test Nginx configuration
sudo nginx -t

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

**4. SSL Certificate Issues:**
```bash
# Check certificate status
sudo certbot certificates

# Renew certificates manually
sudo certbot renew

# Check certificate expiry
openssl x509 -in /etc/letsencrypt/live/your-domain.com/cert.pem -text -noout | grep "Not After"
```

**5. Memory Issues:**
```bash
# Check memory usage
free -h

# Check process memory
ps aux --sort=-%mem | head -10

# Clear cache if needed
sudo sync && sudo sysctl vm.drop_caches=3

# Restart PM2 if memory leak
pm2 restart nectiq-platform
```

---

## 🎯 Production Checklist

### Before Going Live:
- [ ] Domain DNS pointing to VPS IP
- [ ] SSL certificate installed and working
- [ ] Database backups scheduled
- [ ] Environment variables configured
- [ ] Firebase project configured for production
- [ ] Dynamic Labs environment configured
- [ ] WalletConnect project configured
- [ ] Admin wallet addresses set
- [ ] Monitoring and alerting setup
- [ ] Log rotation configured
- [ ] Firewall properly configured
- [ ] PM2 startup script configured

### Security Checklist:
- [ ] SSH key-based authentication only
- [ ] Root login disabled
- [ ] UFW firewall enabled
- [ ] Fail2ban installed (optional)
- [ ] Regular security updates scheduled
- [ ] Database password strong and unique
- [ ] SSL certificates auto-renewal working
- [ ] Application secrets properly secured

---

## 📞 Support & Maintenance

### Regular Maintenance Tasks:
1. **Weekly**: Check application logs and system resources
2. **Monthly**: Update system packages and security patches
3. **Quarterly**: Review and rotate API keys and secrets
4. **Annually**: Review server specifications and scaling needs

### Emergency Contacts:
- Server Status: `systemctl status nginx postgresql pm2`
- Application Logs: `pm2 logs nectiq-platform`
- System Resources: `htop` atau `top`
- Database Status: `sudo systemctl status postgresql`

---

**🎉 Selamat! Aplikasi Nectiq Platform sekarang sudah running di VPS production server Anda!**

**Akses aplikasi di:** `https://your-domain.com`