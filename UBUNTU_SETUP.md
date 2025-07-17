# Panduan Setup Nectiq di Ubuntu VPS Server

## 0. VPS Initial Setup

### SSH ke VPS dan Update System
```bash
# SSH ke VPS dengan IP dan user root/ubuntu
ssh root@YOUR_VPS_IP
# atau
ssh ubuntu@YOUR_VPS_IP

# Update system pertama kali
sudo apt update && sudo apt upgrade -y

# Install tools essential
sudo apt install -y curl wget git unzip nano htop ufw fail2ban
```

### Konfigurasi Firewall (UFW)
```bash
# Enable firewall
sudo ufw enable

# Allow SSH (pastikan jangan sampai terkunci)
sudo ufw allow ssh
sudo ufw allow 22

# Allow HTTP dan HTTPS untuk web access
sudo ufw allow 80
sudo ufw allow 443

# Allow port aplikasi (5000)
sudo ufw allow 5000

# Check status
sudo ufw status verbose
```

### Setup Swap (untuk VPS kecil)
```bash
# Buat swap 2GB (adjust sesuai kebutuhan)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make permanent
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Verify
free -h
```

## 1. Prerequisites dan Installation

### Install Node.js 20
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify
node --version  # Should be v20.x.x
npm --version
```

### Install PostgreSQL
```bash
# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Start dan enable service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verify status
sudo systemctl status postgresql
```

## 2. Database Setup

### Create Database dan User
```bash
# Switch ke postgres user
sudo -u postgres psql

# Jalankan command berikut di PostgreSQL prompt:
CREATE USER nectiq_user WITH PASSWORD 'nectiq_password_2024';
CREATE DATABASE nectiq_db OWNER nectiq_user;
GRANT ALL PRIVILEGES ON DATABASE nectiq_db TO nectiq_user;
GRANT ALL PRIVILEGES ON SCHEMA public TO nectiq_user;
ALTER USER nectiq_user CREATEDB;
\q
```

### Test Database Connection
```bash
psql -h localhost -U nectiq_user -d nectiq_db -c "SELECT version();"
# Password: nectiq_password_2024
```

## 3. Project Setup

### Extract dan Install Dependencies
```bash
# Extract project
cd ~
unzip nectiq.zip
cd CryptoPredictorBattle

# Install dependencies
npm install

# Install additional packages for local PostgreSQL
npm install pg @types/pg
```

### Environment Configuration
```bash
# Create .env file untuk production
cat > .env << 'EOF'
# Database Configuration
DATABASE_URL=postgresql://nectiq_user:nectiq_password_2024@localhost:5432/nectiq_db

# Session Secret (GANTI dengan secret yang aman!)
SESSION_SECRET=nectiq_super_secret_session_key_2024_very_long_and_secure

# Environment (ubah ke production setelah testing)
NODE_ENV=production

# Admin Wallet Addresses (atur wallet admin)
ADMIN_WALLET_ADDRESSES=0x4C6165286739696849Fb3e77A16b0639D762c5B6,0x3e4d881819768fab30c5a79F3A9A7e69f0a935a4

# Server Configuration
PORT=5000
HOST=0.0.0.0

# API Keys (opsional tapi direkomendasikan)
COINGECKO_API_KEY=your_coingecko_api_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key_here

# Blockchain RPC URLs (untuk withdrawal system)
SEPOLIA_RPC_URL=https://eth-sepolia.public.blastapi.io
ETHEREUM_MAINNET_RPC_URL=https://eth-mainnet.public.blastapi.io

# WalletConnect Project ID (untuk Web3 integration)
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id

# Admin Private Key (untuk automated withdrawals - KEEP SECRET!)
ADMIN_PRIVATE_KEY=your_admin_private_key_here
EOF

# Set proper permissions untuk file .env
chmod 600 .env
```

### Network Configuration (Fix CoinGecko API)
```bash
# Check internet connection
ping -c 3 8.8.8.8

# Test CoinGecko API directly
curl -H "User-Agent: Nectiq-App/1.0" "https://api.coingecko.com/api/v3/ping"

# If blocked by firewall, configure DNS
echo "nameserver 8.8.8.8" | sudo tee /etc/resolv.conf
echo "nameserver 8.8.4.4" | sudo tee -a /etc/resolv.conf
```

## 4. Database Schema Setup

```bash
# Push schema to database
npm run db:push

# Verify tables created
psql -h localhost -U nectiq_user -d nectiq_db -c "\dt"
```

## 5. Production Setup dengan PM2 Process Manager

### Install PM2
```bash
# Install PM2 globally
npm install -g pm2

# Build aplikasi untuk production
npm run build

# Verify build folder
ls -la dist/
```

### Create PM2 Configuration
```bash
# Create ecosystem file untuk PM2 (CommonJS format untuk compatibility)
cat > ecosystem.config.cjs << 'EOF'
module.exports = {
  apps: [{
    name: 'nectiq-app',
    script: './dist/index.js',
    instances: 1,
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
EOF

# Create logs directory
mkdir -p logs
```

### Start dengan PM2
```bash
# Start application dengan .cjs file
pm2 start ecosystem.config.cjs

# Check status
pm2 status

# View logs
pm2 logs nectiq-app

# Setup auto-start on boot
pm2 startup
pm2 save
```

## 6. Nginx Reverse Proxy dan SSL

### Install Nginx
```bash
# Install Nginx
sudo apt install nginx -y

# Start dan enable
sudo systemctl start nginx
sudo systemctl enable nginx

# Check status
sudo systemctl status nginx
```

### Konfigurasi Nginx untuk Nectiq
```bash
# Create Nginx config untuk Nectiq
sudo tee /etc/nginx/sites-available/nectiq << 'EOF'
server {
    listen 80;
    server_name YOUR_DOMAIN.com www.YOUR_DOMAIN.com;

    # Redirect HTTP ke HTTPS (setelah SSL setup)
    # return 301 https://$server_name$request_uri;

    # Sementara direct proxy ke aplikasi
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
    }

    # Serve static files (jika ada)
    location /static/ {
        alias /var/www/nectiq/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/nectiq /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### Setup SSL dengan Let's Encrypt (untuk domain)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Ganti YOUR_DOMAIN.com dengan domain sebenarnya
sudo certbot --nginx -d YOUR_DOMAIN.com -d www.YOUR_DOMAIN.com

# Test auto-renewal
sudo certbot renew --dry-run

# Setup auto-renewal cron job
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
```

## 7. Monitoring dan Maintenance

### Setup Log Rotation
```bash
# Create logrotate config untuk PM2 logs
sudo tee /etc/logrotate.d/nectiq << 'EOF'
/home/ubuntu/CryptoPredictorBattle/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 ubuntu ubuntu
    postrotate
        pm2 reloadLogs
    endscript
}
EOF
```

### Monitoring Commands
```bash
# Check application status
pm2 status
pm2 monit

# Check system resources
htop
df -h
free -h

# Check logs
pm2 logs nectiq-app --lines 50
tail -f logs/combined.log

# Check database connections
sudo netstat -tulpn | grep :5432
psql -h localhost -U nectiq_user -d nectiq_db -c "SELECT count(*) FROM users;"

# Check Nginx access logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Backup Automation
```bash
# Create backup script
cat > backup-script.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/home/ubuntu/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
pg_dump -h localhost -U nectiq_user -d nectiq_db > $BACKUP_DIR/nectiq_db_$DATE.sql

# Application backup
tar -czf $BACKUP_DIR/nectiq_app_$DATE.tar.gz /home/ubuntu/CryptoPredictorBattle --exclude=node_modules --exclude=logs

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
EOF

# Make executable
chmod +x backup-script.sh

# Setup daily backup cron job
echo "0 2 * * * /home/ubuntu/CryptoPredictorBattle/backup-script.sh" | crontab -
```

## 8. Access Points

### Jika menggunakan IP langsung:
- **Main Application**: http://YOUR_VPS_IP:5000
- **Admin Panel**: http://YOUR_VPS_IP:5000/admin

### Jika menggunakan Nginx + Domain:
- **Main Application**: https://YOUR_DOMAIN.com
- **Admin Panel**: https://YOUR_DOMAIN.com/admin

### Jika menggunakan Nginx tanpa SSL:
- **Main Application**: http://YOUR_DOMAIN.com
- **Admin Panel**: http://YOUR_DOMAIN.com/admin

## 9. Admin Access Setup

### Default Admin Wallets (sesuai .env)
Aplikasi menggunakan wallet admin yang dikonfigurasi di environment variables:
```
ADMIN_WALLET_ADDRESSES=0x4C6165286739696849Fb3e77A16b0639D762c5B6,0x3e4d881819768fab30c5a79F3A9A7e69f0a935a4
```

### Create Manual Admin User (jika diperlukan)
```bash
# Connect to database
psql -h localhost -U nectiq_user -d nectiq_db

# Insert admin user dengan wallet address yang sesuai .env
INSERT INTO users (username, wallet_address, is_admin, balance, auth_method) 
VALUES ('admin_production', '0x4C6165286739696849Fb3e77A16b0639D762c5B6', true, 10000, 'wallet');
\q
```

## 10. Troubleshooting VPS

### VPS Connection Issues
```bash
# Test SSH connection
ssh -v ubuntu@YOUR_VPS_IP

# Check SSH service
sudo systemctl status ssh

# Check firewall rules
sudo ufw status verbose

# Reset firewall if locked out (dari console VPS)
sudo ufw --force reset
sudo ufw enable
sudo ufw allow 22
```

### Domain dan DNS Issues
```bash
# Check domain resolution
nslookup YOUR_DOMAIN.com
dig YOUR_DOMAIN.com

# Check if domain points to VPS IP
host YOUR_DOMAIN.com

# Test HTTP/HTTPS access
curl -I http://YOUR_DOMAIN.com
curl -I https://YOUR_DOMAIN.com
```

### PM2 Process Issues
```bash
# Restart application
pm2 restart nectiq-app

# Rebuild and restart
npm run build
pm2 restart nectiq-app

# Check logs untuk debugging
pm2 logs nectiq-app --lines 100

# Stop dan start ulang
pm2 stop nectiq-app
pm2 start ecosystem.config.cjs

# Delete dan recreate
pm2 delete nectiq-app
pm2 start ecosystem.config.cjs
```

### Memory dan Performance Issues
```bash
# Check memory usage
free -h
htop

# Check disk space
df -h

# Clean up logs jika perlu
pm2 flush
sudo find /var/log -name "*.log" -mtime +7 -delete

# Restart services to free memory
sudo systemctl restart nginx
pm2 restart nectiq-app
```

## 11. Traditional Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check if port 5432 is open
sudo netstat -tlnp | grep 5432

# Edit PostgreSQL config if needed
sudo nano /etc/postgresql/*/main/pg_hba.conf
# Ensure these lines exist:
# local   all             all                                     md5
# host    all             all             127.0.0.1/32            md5

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### CoinGecko API Connection Error (ECONNREFUSED 127.0.0.1:443)
```bash
# Check DNS resolution
nslookup api.coingecko.com

# Test direct API call
curl -v "https://api.coingecko.com/api/v3/ping"

# If behind proxy, configure:
export https_proxy="your-proxy:port"
export http_proxy="your-proxy:port"

# Or disable proxy temporarily:
unset https_proxy
unset http_proxy
```

### Port 5000 Already in Use
```bash
# Find process using port 5000
sudo lsof -i :5000

# Kill process
sudo kill -9 <PID>

# Or change port in package.json scripts
```

### Permission Issues
```bash
# Fix file permissions
sudo chown -R $USER:$USER ./CryptoPredictorBattle
chmod +x node_modules/.bin/*
```

## 9. Verification Tests

### Test Database
```bash
psql -h localhost -U nectiq_user -d nectiq_db -c "SELECT count(*) FROM users;"
```

### Test API Endpoints
```bash
# Test crypto prices endpoint
curl http://localhost:5000/api/crypto/prices

# Test leaderboard
curl http://localhost:5000/api/leaderboard
```

### Test CoinGecko Integration
```bash
# Direct test
curl -H "User-Agent: Nectiq-App/1.0" "https://api.coingecko.com/api/v3/coins/markets?ids=bitcoin,ethereum&vs_currency=usd"
```

## 12. Quick Start Command Summary

```bash
# Clone project
cd /home/ubuntu
git clone YOUR_REPOSITORY_URL CryptoPredictorBattle
cd CryptoPredictorBattle

# Install dependencies
npm install

# Setup database
sudo -u postgres psql -c "CREATE USER nectiq_user WITH PASSWORD 'nectiq_password_2024';"
sudo -u postgres psql -c "CREATE DATABASE nectiq_db OWNER nectiq_user;"

# Setup environment
cp .env.example .env
nano .env  # Edit with your configurations

# Build dan deploy
npm run build
npm install -g pm2
pm2 start ecosystem.config.cjs
pm2 startup
pm2 save

# Setup Nginx (opsional)
sudo apt install nginx -y
# Configure nginx (lihat section 6)

# Enable firewall
sudo ufw enable
sudo ufw allow 22,80,443,5000
```

## 13. Production Notes

### Performance Optimization
- CoinGecko API memiliki rate limit 50 calls/minute untuk free tier
- Aplikasi menggunakan caching 3 detik untuk real-time prices dengan synchronized variation system
- PM2 cluster mode untuk better performance
- Nginx sebagai reverse proxy untuk load balancing
- Database connection pooling untuk scalability

### Security Features
- UFW firewall configuration
- Fail2ban untuk SSH protection
- SSL certificates dengan Let's Encrypt
- Environment variables untuk sensitive data
- Admin wallet authentication system
- Rate limiting untuk API endpoints

### Monitoring
- PM2 process monitoring
- Log rotation dengan logrotate
- Daily automated backups
- System resource monitoring dengan htop
- Nginx access dan error logs

### Financial System
- Automated withdrawal system dengan blockchain integration
- Multi-chain support (Ethereum, BSC, Base, Optimism, Arbitrum)
- Real-time balance tracking dan security auditing
- Complete transaction logging untuk audit trails

## 14. Support dan Maintenance

### Daily Maintenance Checklist
```bash
# Check application status
pm2 status

# Check system resources
free -h && df -h

# Check recent logs
pm2 logs nectiq-app --lines 20

# Check database connection
psql -h localhost -U nectiq_user -d nectiq_db -c "SELECT count(*) FROM users;"
```

### Jika ada masalah, pastikan:
1. VPS memiliki minimum 1GB RAM dan 10GB storage
2. PostgreSQL service running dan accessible
3. Database credentials di .env benar
4. Internet connection aktif untuk CoinGecko API
5. Firewall rules allow required ports
6. PM2 process running dan healthy
7. Nginx configuration benar (jika digunakan)
8. Domain DNS pointing ke VPS IP (jika pakai domain)
9. SSL certificate valid (jika HTTPS enabled)
10. File .env configured dengan semua required variables