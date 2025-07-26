#!/bin/bash

# 🚀 Nectiq Platform - VPS Deployment Script
# This script automates the deployment process on Ubuntu VPS

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuration
APP_NAME="nectiq-platform"
APP_USER="nectiq"
APP_DIR="/home/$APP_USER/$APP_NAME"
DOMAIN=""
EMAIL=""

# Function to check if running as root
check_root() {
    if [ "$EUID" -eq 0 ]; then
        print_error "Please do not run this script as root. Run as regular user with sudo privileges."
        exit 1
    fi
}

# Function to check Ubuntu version
check_ubuntu() {
    if ! lsb_release -d | grep -q "Ubuntu"; then
        print_error "This script is designed for Ubuntu. Please use Ubuntu 20.04 LTS or 22.04 LTS."
        exit 1
    fi
    
    VERSION=$(lsb_release -rs)
    if [[ "$VERSION" != "20.04" && "$VERSION" != "22.04" ]]; then
        print_warning "This script is tested on Ubuntu 20.04 and 22.04. You're running $VERSION."
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
}

# Function to get user input
get_user_input() {
    echo -e "${BLUE}=== Nectiq Platform VPS Deployment Setup ===${NC}"
    echo
    
    # Get domain name
    while [ -z "$DOMAIN" ]; do
        read -p "Enter your domain name (e.g., example.com): " DOMAIN
        if [ -z "$DOMAIN" ]; then
            print_error "Domain name is required!"
        fi
    done
    
    # Get email for SSL certificate
    while [ -z "$EMAIL" ]; do
        read -p "Enter your email for SSL certificate: " EMAIL
        if [ -z "$EMAIL" ]; then
            print_error "Email is required for SSL certificate!"
        fi
    done
    
    echo
    print_status "Configuration:"
    print_status "  Domain: $DOMAIN"
    print_status "  Email: $EMAIL"
    print_status "  App Directory: $APP_DIR"
    echo
    
    read -p "Continue with deployment? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Deployment cancelled."
        exit 0
    fi
}

# Function to update system
update_system() {
    print_status "Updating system packages..."
    sudo apt update
    sudo apt upgrade -y
    sudo apt install -y curl wget git vim ufw software-properties-common htop
    print_success "System updated successfully"
}

# Function to setup firewall
setup_firewall() {
    print_status "Setting up firewall..."
    
    # Enable UFW
    sudo ufw --force enable
    
    # Allow SSH
    sudo ufw allow ssh
    
    # Allow HTTP and HTTPS
    sudo ufw allow 80
    sudo ufw allow 443
    
    # Allow application port
    sudo ufw allow 5000
    
    print_success "Firewall configured successfully"
    sudo ufw status
}

# Function to setup swap
setup_swap() {
    # Check if swap already exists
    if swapon --show | grep -q "/swapfile"; then
        print_status "Swap file already exists, skipping..."
        return
    fi
    
    print_status "Setting up 2GB swap file..."
    
    sudo fallocate -l 2G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    
    # Make swap permanent
    if ! grep -q "/swapfile" /etc/fstab; then
        echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    fi
    
    print_success "Swap configured successfully"
    free -h
}

# Function to install Node.js
install_nodejs() {
    print_status "Installing Node.js 20.x..."
    
    # Add NodeSource repository
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    
    # Install Node.js
    sudo apt install -y nodejs
    
    # Install global packages
    sudo npm install -g pm2 typescript tsx
    
    print_success "Node.js installed successfully"
    node --version
    npm --version
}

# Function to install PostgreSQL
install_postgresql() {
    print_status "Installing PostgreSQL..."
    
    sudo apt install -y postgresql postgresql-contrib
    
    # Start and enable PostgreSQL
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
    
    print_success "PostgreSQL installed successfully"
    sudo systemctl status postgresql --no-pager -l
}

# Function to setup database
setup_database() {
    print_status "Setting up database..."
    
    # Generate random password
    DB_PASSWORD=$(openssl rand -base64 32)
    
    # Create database and user
    sudo -u postgres psql << EOF
CREATE DATABASE nectiq_db;
CREATE USER nectiq_user WITH PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE nectiq_db TO nectiq_user;
ALTER USER nectiq_user CREATEDB;
EOF
    
    # Save database credentials
    echo "DATABASE_PASSWORD=$DB_PASSWORD" > ~/.db_credentials
    chmod 600 ~/.db_credentials
    
    print_success "Database setup completed"
    print_status "Database credentials saved to ~/.db_credentials"
}

# Function to clone and setup application
setup_application() {
    print_status "Setting up application..."
    
    # Remove existing directory if it exists
    if [ -d "$APP_DIR" ]; then
        print_warning "Application directory exists. Backing up..."
        mv "$APP_DIR" "${APP_DIR}_backup_$(date +%Y%m%d_%H%M%S)"
    fi
    
    # Clone repository (you need to replace this with your actual repo)
    print_status "Cloning repository..."
    echo "Please manually clone your repository to $APP_DIR"
    echo "Example: git clone https://github.com/your-username/nectiq-platform.git $APP_DIR"
    
    read -p "Press Enter after you've cloned the repository..."
    
    # Check if directory exists
    if [ ! -d "$APP_DIR" ]; then
        print_error "Application directory not found. Please clone the repository first."
        exit 1
    fi
    
    cd "$APP_DIR"
    
    # Install dependencies
    print_status "Installing dependencies..."
    npm install
    
    # Setup environment file
    print_status "Setting up environment file..."
    if [ ! -f .env ]; then
        if [ -f .env.example ]; then
            cp .env.example .env
        else
            touch .env
        fi
    fi
    
    # Load database password
    source ~/.db_credentials
    
    # Update .env file with basic configuration
    cat > .env << EOF
# Database Configuration
DATABASE_URL="postgresql://nectiq_user:$DATABASE_PASSWORD@localhost:5432/nectiq_db"
PGHOST=localhost
PGPORT=5432
PGUSER=nectiq_user
PGPASSWORD=$DATABASE_PASSWORD
PGDATABASE=nectiq_db

# Application Settings
NODE_ENV=production
SESSION_SECRET=$(openssl rand -base64 32)
PORT=5000

# Domain Configuration
DOMAIN=$DOMAIN
FRONTEND_URL=https://$DOMAIN

# Firebase Configuration (PLEASE UPDATE THESE)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_APP_ID=your_firebase_app_id

# Dynamic Labs Configuration (PLEASE UPDATE THESE)
VITE_DYNAMIC_ENVIRONMENT_ID=your_dynamic_environment_id

# WalletConnect Configuration (PLEASE UPDATE THESE)
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id

# Admin Configuration (PLEASE UPDATE THESE)
ADMIN_WALLET_ADDRESSES=0xYourAdminWallet1,0xYourAdminWallet2
ADMIN_PRIVATE_KEY=your_admin_private_key

# Security Settings
CORS_ORIGIN=https://$DOMAIN
ALLOWED_ORIGINS=https://$DOMAIN,https://www.$DOMAIN
EOF
    
    print_warning "IMPORTANT: Please update the .env file with your actual API keys and configuration!"
    print_status "Environment file created at: $APP_DIR/.env"
    
    # Build application
    print_status "Building application..."
    npm run build
    
    print_success "Application setup completed"
}

# Function to setup PM2
setup_pm2() {
    print_status "Setting up PM2 process manager..."
    
    cd "$APP_DIR"
    
    # Create logs directory
    mkdir -p logs
    
    # Create PM2 ecosystem file
    cat > ecosystem.config.cjs << 'EOF'
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
EOF
    
    # Setup database schema
    print_status "Setting up database schema..."
    npm run db:push
    
    # Start application with PM2
    pm2 start ecosystem.config.cjs
    
    # Save PM2 configuration
    pm2 save
    
    # Setup PM2 startup
    print_status "Setting up PM2 startup script..."
    PM2_STARTUP_CMD=$(pm2 startup | tail -n 1)
    eval "$PM2_STARTUP_CMD"
    
    print_success "PM2 setup completed"
    pm2 status
}

# Function to install Nginx
install_nginx() {
    print_status "Installing Nginx..."
    
    sudo apt install -y nginx
    
    # Start and enable Nginx
    sudo systemctl start nginx
    sudo systemctl enable nginx
    
    print_success "Nginx installed successfully"
}

# Function to configure Nginx
configure_nginx() {
    print_status "Configuring Nginx..."
    
    # Create Nginx configuration
    sudo tee /etc/nginx/sites-available/$APP_NAME << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
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
EOF
    
    # Enable site
    sudo ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/
    
    # Remove default site
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # Test configuration
    sudo nginx -t
    
    # Reload Nginx
    sudo systemctl reload nginx
    
    print_success "Nginx configured successfully"
}

# Function to setup SSL
setup_ssl() {
    print_status "Setting up SSL certificate..."
    
    # Install Certbot
    sudo apt install -y certbot python3-certbot-nginx
    
    # Obtain SSL certificate
    sudo certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --email "$EMAIL" --agree-tos --non-interactive
    
    # Setup auto-renewal
    (sudo crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet && systemctl reload nginx") | sudo crontab -
    
    print_success "SSL certificate configured successfully"
}

# Function to setup monitoring
setup_monitoring() {
    print_status "Setting up monitoring and backups..."
    
    # Create backup script
    cat > ~/backup-database.sh << 'EOF'
#!/bin/bash

# Configuration
BACKUP_DIR="$HOME/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="nectiq_db_backup_$DATE.sql"
DB_NAME="nectiq_db"
DB_USER="nectiq_user"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Create backup
pg_dump -h localhost -U $DB_USER -d $DB_NAME > "$BACKUP_DIR/$BACKUP_FILE"

# Compress backup
gzip "$BACKUP_DIR/$BACKUP_FILE"

# Remove backups older than 7 days
find "$BACKUP_DIR" -name "nectiq_db_backup_*.sql.gz" -mtime +7 -delete

echo "$(date): Database backup completed: $BACKUP_FILE.gz"
EOF
    
    chmod +x ~/backup-database.sh
    
    # Setup cron job for daily backup
    (crontab -l 2>/dev/null; echo "0 2 * * * $HOME/backup-database.sh >> $HOME/backup.log 2>&1") | crontab -
    
    # Setup log rotation
    sudo tee /etc/logrotate.d/$APP_NAME << EOF
$APP_DIR/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 $APP_USER $APP_USER
    postrotate
        pm2 reload $APP_NAME
    endscript
}
EOF
    
    print_success "Monitoring and backups configured"
}

# Function to run final tests
run_tests() {
    print_status "Running final tests..."
    
    # Test PM2 status
    pm2 status
    
    # Test HTTP response
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:5000 | grep -q "200"; then
        print_success "Local HTTP test passed"
    else
        print_warning "Local HTTP test failed"
    fi
    
    # Test HTTPS response (if SSL is setup)
    if curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN | grep -q "200"; then
        print_success "HTTPS test passed"
    else
        print_warning "HTTPS test failed (normal if DNS not propagated)"
    fi
    
    # Test database connection
    if PGPASSWORD=$(grep PGPASSWORD ~/.db_credentials | cut -d'=' -f2) psql -h localhost -U nectiq_user -d nectiq_db -c "SELECT 1;" > /dev/null 2>&1; then
        print_success "Database connection test passed"
    else
        print_warning "Database connection test failed"
    fi
    
    print_success "Tests completed"
}

# Function to display final information
show_final_info() {
    echo
    echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
    echo
    echo -e "${BLUE}=== Important Information ===${NC}"
    echo -e "Application URL: ${GREEN}https://$DOMAIN${NC}"
    echo -e "Application Directory: ${GREEN}$APP_DIR${NC}"
    echo -e "Database Credentials: ${GREEN}~/.db_credentials${NC}"
    echo -e "Environment File: ${GREEN}$APP_DIR/.env${NC}"
    echo
    echo -e "${YELLOW}=== Next Steps ===${NC}"
    echo "1. Update your domain's DNS to point to this server's IP"
    echo "2. Update the .env file with your actual API keys:"
    echo "   - Firebase configuration"
    echo "   - Dynamic Labs environment ID"
    echo "   - WalletConnect project ID"
    echo "   - Admin wallet addresses"
    echo "3. Test the application at https://$DOMAIN"
    echo
    echo -e "${BLUE}=== Useful Commands ===${NC}"
    echo "• Check application status: pm2 status"
    echo "• View application logs: pm2 logs nectiq-platform"
    echo "• Restart application: pm2 restart nectiq-platform"
    echo "• Check system resources: htop"
    echo "• Check Nginx status: sudo systemctl status nginx"
    echo "• Check SSL certificate: sudo certbot certificates"
    echo
    echo -e "${GREEN}Deployment log saved to: deployment_$(date +%Y%m%d_%H%M%S).log${NC}"
}

# Main deployment function
main() {
    # Create log file
    LOG_FILE="deployment_$(date +%Y%m%d_%H%M%S).log"
    exec > >(tee -a "$LOG_FILE")
    exec 2>&1
    
    print_status "Starting Nectiq Platform VPS deployment..."
    
    # Run all deployment steps
    check_root
    check_ubuntu
    get_user_input
    update_system
    setup_firewall
    setup_swap
    install_nodejs
    install_postgresql
    setup_database
    setup_application
    setup_pm2
    install_nginx
    configure_nginx
    setup_ssl
    setup_monitoring
    run_tests
    show_final_info
    
    print_success "Deployment completed! Check the information above."
}

# Run main function
main "$@"