# Ubuntu Server Setup Guide for Nectiq Platform

## Overview

This guide provides comprehensive instructions for setting up the Nectiq cryptocurrency prediction platform on Ubuntu server (18.04 LTS or higher). It covers both development and production deployment scenarios.

## Prerequisites

### System Requirements

**Minimum Requirements**:
- Ubuntu 18.04 LTS or higher (20.04/22.04 recommended)
- 2 GB RAM (4 GB recommended for production)
- 20 GB disk space (50 GB recommended for production)
- Internet connection for package installation

**Recommended Server Specifications**:
- Ubuntu 22.04 LTS
- 4 GB RAM
- 50 GB SSD storage
- 2 CPU cores
- Static IP address
- Domain name (for production)

### User Account Setup

**Create Non-Root User**:
```bash
# Create new user
sudo adduser nectiq

# Add user to sudo group
sudo usermod -aG sudo nectiq

# Switch to new user
su - nectiq
```

## System Update and Basic Setup

### Update System Packages

```bash
# Update package lists
sudo apt update

# Upgrade existing packages
sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl wget git vim ufw software-properties-common
```

### Configure Firewall

```bash
# Enable UFW firewall
sudo ufw enable

# Allow SSH access
sudo ufw allow ssh

# Allow HTTP and HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Allow custom application port (if needed)
sudo ufw allow 5000

# Check firewall status
sudo ufw status
```

### Configure Swap (Optional but Recommended)

```bash
# Create 2GB swap file
sudo fallocate -l 2G /swapfile

# Set swap file permissions
sudo chmod 600 /swapfile

# Set up swap area
sudo mkswap /swapfile

# Enable swap file
sudo swapon /swapfile

# Make swap permanent
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Verify swap is active
free -h
```

## Install Node.js

### Install Node.js 20.x

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

## Install and Configure PostgreSQL

### Install PostgreSQL

```bash
# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Check PostgreSQL status
sudo systemctl status postgresql
```

### Configure PostgreSQL Database

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user (in PostgreSQL shell)
CREATE DATABASE nectiq_db;
CREATE USER nectiq_user WITH PASSWORD 'nectiq_password_2024';
GRANT ALL PRIVILEGES ON DATABASE nectiq_db TO nectiq_user;
\q

# Test database connection
psql -h localhost -U nectiq_user -d nectiq_db -c "SELECT version();"
```

## Application Setup

### Clone Repository

```bash
# Navigate to home directory
cd ~

# Clone repository (replace with your repository URL)
git clone https://github.com/your-username/nectiq-platform.git

# Navigate to project directory
cd nectiq-platform

# Install dependencies
npm install
```

### Environment Configuration

**Create Environment File**:
```bash
# Copy example environment file
cp .env.example .env

# Edit environment file
nano .env
```

**Environment Variables Configuration**:
```env
# Database Configuration
DATABASE_URL=postgresql://nectiq_user:nectiq_password_2024@localhost:5432/nectiq_db
PGHOST=localhost
PGPORT=5432
PGUSER=nectiq_user
PGPASSWORD=nectiq_password_2024
PGDATABASE=nectiq_db

# Session Security
SESSION_SECRET=your-super-secure-session-secret-minimum-32-characters

# Web3 Authentication
VITE_DYNAMIC_ENVIRONMENT_ID=your-dynamic-environment-id
VITE_WALLETCONNECT_PROJECT_ID=your-walletconnect-project-id

# Admin Configuration
ADMIN_WALLET_ADDRESSES=0x1234...,0x5678...
ADMIN_PRIVATE_KEY=your-encrypted-admin-private-key

# External APIs
ETHERSCAN_API_KEY=your-etherscan-api-key

# Firebase (Optional)
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_PROJECT_ID=nectiq
VITE_FIREBASE_APP_ID=your-firebase-app-id

# Runtime Environment
NODE_ENV=production
```

### Database Setup

```bash
# Initialize database schema
npm run db:push

# Generate TypeScript types
npm run db:generate

# Verify database setup
npm run db:introspect
```

## Application Deployment

### Build Application

```bash
# Build frontend and backend
npm run build

# Verify build files
ls -la dist/
```

### Configure PM2 Process Manager

**Create PM2 Ecosystem File**:
```bash
# Create ecosystem configuration
nano ecosystem.config.cjs
```

**PM2 Configuration**:
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
    time: true
  }]
};
```

### Start Application with PM2

```bash
# Create logs directory
mkdir -p logs

# Start application
pm2 start ecosystem.config.cjs

# Check application status
pm2 status

# View application logs
pm2 logs nectiq-platform

# Save PM2 configuration
pm2 save

# Generate startup script
pm2 startup
# Follow the instructions provided by PM2
```

## Web Server Configuration (Nginx)

### Install Nginx

```bash
# Install Nginx
sudo apt install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Check Nginx status
sudo systemctl status nginx
```

### Configure Nginx Virtual Host

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/nectiq-platform
```

**Nginx Configuration**:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Redirect HTTP to HTTPS (after SSL setup)
    # return 301 https://$server_name$request_uri;

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
    }

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
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

**Enable Site Configuration**:
```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/nectiq-platform /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

## SSL Certificate Setup (Let's Encrypt)

### Install Certbot

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Test automatic renewal
sudo certbot renew --dry-run
```

### Configure Automatic SSL Renewal

```bash
# Add renewal cron job
sudo crontab -e

# Add this line to run renewal twice daily
0 12 * * * /usr/bin/certbot renew --quiet
```

## System Monitoring and Maintenance

### Configure Log Rotation

```bash
# Create logrotate configuration
sudo nano /etc/logrotate.d/nectiq-platform
```

**Log Rotation Configuration**:
```
/home/nectiq/nectiq-platform/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 nectiq nectiq
    postrotate
        pm2 reload nectiq-platform
    endscript
}
```

### System Monitoring

**Install monitoring tools**:
```bash
# Install system monitoring tools
sudo apt install -y htop iotop nethogs

# Monitor system resources
htop

# Monitor disk usage
df -h

# Monitor network connections
netstat -tulpn
```

### Database Backup Setup

**Create Backup Script**:
```bash
# Create backup directory
mkdir -p ~/backups

# Create backup script
nano ~/backup-database.sh
```

**Backup Script Content**:
```bash
#!/bin/bash

# Database backup script
BACKUP_DIR="/home/nectiq/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="nectiq_db_backup_$DATE.sql"

# Create backup
pg_dump -h localhost -U nectiq_user -d nectiq_db > "$BACKUP_DIR/$BACKUP_FILE"

# Compress backup
gzip "$BACKUP_DIR/$BACKUP_FILE"

# Remove backups older than 7 days
find "$BACKUP_DIR" -name "nectiq_db_backup_*.sql.gz" -mtime +7 -delete

echo "Database backup completed: $BACKUP_FILE.gz"
```

**Make Script Executable and Schedule**:
```bash
# Make backup script executable
chmod +x ~/backup-database.sh

# Add to crontab for daily backups
crontab -e

# Add this line for daily backup at 2 AM
0 2 * * * /home/nectiq/backup-database.sh
```

## Development Environment Setup

### Development Mode Setup

```bash
# Install development dependencies
npm install --dev

# Create development environment file
cp .env.example .env.development

# Edit development environment
nano .env.development
```

**Development Environment Variables**:
```env
# Use local database for development
DATABASE_URL=postgresql://nectiq_user:nectiq_password_2024@localhost:5432/nectiq_dev

# Development mode
NODE_ENV=development

# Development server port
PORT=3000

# Other variables same as production
```

### Start Development Server

```bash
# Create development database
sudo -u postgres createdb nectiq_dev

# Grant permissions
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE nectiq_dev TO nectiq_user;"

# Initialize development database
NODE_ENV=development npm run db:push

# Start development server
npm run dev
```

## Troubleshooting

### Common Issues and Solutions

**Application Won't Start**:
```bash
# Check PM2 logs
pm2 logs nectiq-platform

# Check environment variables
pm2 show nectiq-platform

# Restart application
pm2 restart nectiq-platform
```

**Database Connection Issues**:
```bash
# Test database connection
psql -h localhost -U nectiq_user -d nectiq_db -c "SELECT version();"

# Check PostgreSQL status
sudo systemctl status postgresql

# Restart PostgreSQL
sudo systemctl restart postgresql
```

**Nginx Issues**:
```bash
# Test Nginx configuration
sudo nginx -t

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

**Memory Issues**:
```bash
# Check memory usage
free -h

# Check swap usage
swapon --show

# Monitor process memory
ps aux --sort=-%mem | head -10
```

### Performance Optimization

**Database Optimization**:
```bash
# Optimize PostgreSQL configuration
sudo nano /etc/postgresql/*/main/postgresql.conf

# Key settings for small servers:
# shared_buffers = 128MB
# effective_cache_size = 1GB
# work_mem = 4MB
# maintenance_work_mem = 64MB

# Restart PostgreSQL after changes
sudo systemctl restart postgresql
```

**Node.js Optimization**:
```bash
# Update PM2 ecosystem for better performance
nano ecosystem.config.cjs

# Add these optimizations:
# instances: 'max',  // Use all CPU cores
# exec_mode: 'cluster',  // Enable cluster mode
# max_memory_restart: '512M',  // Restart if memory exceeds limit
```

## Security Hardening

### Basic Security Configuration

```bash
# Install fail2ban for intrusion prevention
sudo apt install -y fail2ban

# Configure SSH security
sudo nano /etc/ssh/sshd_config

# Recommended SSH settings:
# PermitRootLogin no
# PasswordAuthentication no
# Port 2222  # Change default SSH port

# Restart SSH service
sudo systemctl restart ssh
```

### Application Security

**Environment Variable Security**:
```bash
# Secure environment file
chmod 600 .env

# Ensure proper file ownership
chown nectiq:nectiq .env
```

**Database Security**:
```bash
# Secure PostgreSQL configuration
sudo nano /etc/postgresql/*/main/pg_hba.conf

# Ensure local connections require password authentication
# local   all             all                                     md5
```

## Quick Commands Reference

### Application Management
```bash
# Start application
pm2 start ecosystem.config.cjs

# Stop application
pm2 stop nectiq-platform

# Restart application
pm2 restart nectiq-platform

# View logs
pm2 logs nectiq-platform

# Monitor resources
pm2 monit
```

### Database Management
```bash
# Connect to database
psql -h localhost -U nectiq_user -d nectiq_db

# Backup database
pg_dump -h localhost -U nectiq_user -d nectiq_db > backup.sql

# Restore database
psql -h localhost -U nectiq_user -d nectiq_db < backup.sql
```

### System Maintenance
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Clean package cache
sudo apt autoremove -y && sudo apt autoclean

# Check disk usage
df -h

# Check memory usage
free -h

# View system logs
sudo journalctl -f
```

---

**Document Version**: 2.0  
**Last Updated**: July 23, 2025  
**Ubuntu Compatibility**: 18.04 LTS, 20.04 LTS, 22.04 LTS  
**Tested Configurations**: Development and Production Ready