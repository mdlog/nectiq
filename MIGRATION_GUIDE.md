# Nectiq Platform Migration Guide

**Last Updated: August 5, 2025**

## Overview

This guide provides instructions for migrating the Nectiq cryptocurrency prediction platform between different environments, databases, and deployment configurations. It covers data migration, configuration updates, and platform transitions.

### Recent Platform Updates (August 2025)
- ✅ **Enhanced CSV Export System**: Complete data export functionality supports seamless data migration
- ✅ **Advanced Admin Panel**: Enhanced migration capabilities with detailed data monitoring
- ✅ **TypeScript Stability**: All migration-related type safety issues resolved
- ✅ **Production Ready Migration**: Platform tested and verified for stable environment migrations

## Migration Types

### 1. Environment Migration (Development → Production)

**Purpose**: Move application from development to production environment

**Key Steps**:
1. **Environment Variables Migration**:
   ```bash
   # Copy environment variables from development
   cp .env .env.production
   
   # Update production-specific values
   NODE_ENV=production
   DATABASE_URL=your-production-database-url
   ADMIN_WALLET_ADDRESSES=your-production-admin-addresses
   ```

2. **Database Schema Migration**:
   ```bash
   # Generate migration from development schema
   npm run db:generate
   
   # Apply schema to production database
   npm run db:push
   ```

3. **Configuration Updates**:
   - Update Dynamic Labs environment settings
   - Configure Firebase authorized domains for production
   - Update CORS origins for production domains
   - Set secure cookie settings

### 2. Database Migration

**Purpose**: Move database between providers or upgrade database versions

#### From Local PostgreSQL to Neon Database

**Pre-Migration Checklist**:
- [ ] Backup existing database
- [ ] Create Neon Database project
- [ ] Test connection with new DATABASE_URL
- [ ] Verify schema compatibility

**Migration Steps**:
```bash
# 1. Export existing database
pg_dump postgresql://localhost/nectiq_db > nectiq_backup.sql

# 2. Create new database schema on Neon
npm run db:push

# 3. Import data to Neon (if needed)
psql $DATABASE_URL < nectiq_backup.sql

# 4. Verify data integrity
npm run db:introspect
```

#### Schema Migration Process

**Using Drizzle Kit**:
```bash
# Generate migration files
npx drizzle-kit generate

# Review generated migration
cat drizzle/0001_migration.sql

# Apply migration
npm run db:push
```

### 3. Platform Migration (Replit → Self-Hosted)

**Purpose**: Move from Replit to custom server infrastructure

#### Pre-Migration Requirements

**Server Requirements**:
- Node.js 20.0.0 or higher
- PostgreSQL 13+ or Neon Database access
- SSL certificate for HTTPS
- Domain name and DNS configuration

**Required Services**:
- Process manager (PM2 recommended)
- Reverse proxy (Nginx recommended)
- Database backup solution
- Monitoring tools

#### Migration Process

1. **Server Setup**:
   ```bash
   # Install Node.js and dependencies
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PM2 process manager
   npm install -g pm2
   
   # Install Nginx
   sudo apt-get install nginx
   ```

2. **Application Deployment**:
   ```bash
   # Clone repository
   git clone your-repository-url
   cd nectiq-platform
   
   # Install dependencies
   npm install
   
   # Build application
   npm run build
   
   # Configure PM2
   pm2 start ecosystem.config.js
   ```

3. **Environment Configuration**:
   ```bash
   # Create production environment file
   cp .env.example .env
   
   # Configure environment variables
   nano .env
   ```

4. **Database Migration**:
   ```bash
   # Apply database schema
   npm run db:push
   
   # Migrate data (if coming from Replit)
   # Export from Replit database and import to new database
   ```

5. **Nginx Configuration**:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
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
   }
   ```

## Data Migration Procedures

### User Data Migration

**Export User Data**:
```sql
-- Export users table
COPY users TO '/tmp/users.csv' DELIMITER ',' CSV HEADER;

-- Export predictions
COPY predictions TO '/tmp/predictions.csv' DELIMITER ',' CSV HEADER;

-- Export battles
COPY battles TO '/tmp/battles.csv' DELIMITER ',' CSV HEADER;

-- Export transaction logs
COPY transaction_logs TO '/tmp/transaction_logs.csv' DELIMITER ',' CSV HEADER;
```

**Import User Data**:
```sql
-- Import users
COPY users FROM '/tmp/users.csv' DELIMITER ',' CSV HEADER;

-- Import predictions
COPY predictions FROM '/tmp/predictions.csv' DELIMITER ',' CSV HEADER;

-- Import battles
COPY battles FROM '/tmp/battles.csv' DELIMITER ',' CSV HEADER;

-- Import transaction logs
COPY transaction_logs FROM '/tmp/transaction_logs.csv' DELIMITER ',' CSV HEADER;
```

### Cryptocurrency Data Migration

**Export Cryptocurrency Configuration**:
```sql
-- Export cryptocurrencies with all metadata
SELECT id, name, symbol, image, pyth_feed_id 
FROM cryptocurrencies 
ORDER BY id;
```

**Import Process**:
```typescript
// Use admin panel "Add New Cryptocurrency" feature
// Or bulk import via API
const cryptocurrencies = [
  {
    cryptoId: 'bitcoin',
    name: 'Bitcoin',
    symbol: 'BTC',
    pythFeedId: '0xe62df6c8b4c85fe2e2440f1cb1da4b1b3ce6c7ad3ebef516e6fee2b8c7f7b70b',
    image: 'https://coin-images.coingecko.com/coins/images/1/large/bitcoin.png'
  },
  // ... other cryptocurrencies
];

for (const crypto of cryptocurrencies) {
  await fetch('/api/admin/cryptocurrencies', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(crypto)
  });
}
```

## Configuration Migration

### Dynamic Labs Configuration

**Migration Steps**:
1. **Create New Environment** (if needed):
   - Go to Dynamic Labs Dashboard
   - Create new environment for production
   - Configure wallet connectors and networks

2. **Update Environment Variables**:
   ```env
   # Update Dynamic Labs environment ID
   VITE_DYNAMIC_ENVIRONMENT_ID=your-new-environment-id
   
   # Update WalletConnect project ID (if changed)
   VITE_WALLETCONNECT_PROJECT_ID=your-walletconnect-id
   ```

3. **Domain Configuration**:
   - Add new domain to Dynamic Labs allowed origins
   - Configure redirect URLs for new domain
   - Test wallet connection on new domain

### Firebase Configuration Migration

**Migration Process**:
1. **Create New Firebase Project** (if needed):
   - Create new project in Firebase Console
   - Enable Google Authentication
   - Configure authorized domains

2. **Update Environment Variables**:
   ```env
   VITE_FIREBASE_API_KEY=your-new-api-key
   VITE_FIREBASE_PROJECT_ID=your-new-project-id
   VITE_FIREBASE_APP_ID=your-new-app-id
   ```

3. **Domain Authorization**:
   - Add new domain to Firebase authorized domains
   - Remove old domain (if no longer needed)
   - Test email verification flow

### Admin Configuration Migration

**Admin Wallet Migration**:
```env
# Update admin wallet addresses for new environment
ADMIN_WALLET_ADDRESSES=0xnew1...,0xnew2...,0xnew3...

# Update admin private key for automated withdrawals
ADMIN_PRIVATE_KEY=your-new-encrypted-private-key
```

**Security Considerations**:
- Generate new admin wallet addresses for production
- Use hardware wallets for admin addresses
- Securely transfer admin private keys
- Update admin access in application

## Migration Testing

### Pre-Migration Testing

**Test Checklist**:
- [ ] Database connection test
- [ ] Environment variables validation
- [ ] External API connectivity (Pyth, Etherscan)
- [ ] Admin authentication test
- [ ] Firebase authentication test (if used)

**Test Commands**:
```bash
# Test database connection
npm run db:introspect

# Test environment variables
node -e "console.log('DB:', process.env.DATABASE_URL ? 'OK' : 'MISSING')"

# Test application startup
npm run dev
```

### Post-Migration Validation

**Functionality Tests**:
1. **User Authentication**:
   - Test wallet connection
   - Verify session management
   - Test admin access

2. **Core Features**:
   - Create prediction
   - Check live prices
   - Test battle creation
   - Verify survival tournaments

3. **Financial Operations**:
   - Test deposit creation
   - Verify withdrawal process
   - Check balance updates
   - Validate transaction logs

4. **Admin Panel**:
   - Access admin dashboard
   - Test user management
   - Verify financial oversight
   - Check security monitoring

## Rollback Procedures

### Database Rollback

**Backup-Based Rollback**:
```bash
# Restore from backup
psql $DATABASE_URL < nectiq_backup_pre_migration.sql

# Verify data integrity
npm run db:introspect
```

### Configuration Rollback

**Environment Rollback**:
```bash
# Restore previous environment configuration
cp .env.backup .env

# Restart application
pm2 restart nectiq-platform
```

### Service Rollback

**External Service Rollback**:
1. Revert Dynamic Labs configuration
2. Restore Firebase settings
3. Update DNS records (if changed)
4. Restore admin wallet configuration

## Migration Monitoring

### Health Checks

**Post-Migration Monitoring**:
```bash
# Check application health
curl http://your-domain.com/health

# Monitor application logs
pm2 logs nectiq-platform

# Check database connections
psql $DATABASE_URL -c "SELECT COUNT(*) FROM users;"
```

### Performance Monitoring

**Key Metrics**:
- Application response times
- Database query performance
- External API response times
- User session management
- Financial transaction processing

**Monitoring Commands**:
```bash
# Monitor CPU and memory usage
pm2 monit

# Check database performance
psql $DATABASE_URL -c "SELECT * FROM pg_stat_activity;"

# Monitor API endpoints
curl -w "@curl-format.txt" http://your-domain.com/api/crypto/prices
```

## Common Migration Issues

### Database Connection Issues

**Problem**: Unable to connect to new database
**Solution**:
```bash
# Verify connection string
echo $DATABASE_URL

# Test direct connection
psql $DATABASE_URL -c "SELECT version();"

# Check firewall settings
telnet your-db-host 5432
```

### Environment Variable Issues

**Problem**: Missing or incorrect environment variables
**Solution**:
```bash
# Validate all required variables
npm run validate-env

# Check for typos
env | grep VITE_

# Restart application after changes
pm2 restart all
```

### External Service Issues

**Problem**: External APIs not working
**Solution**:
1. Verify API keys are correct
2. Check domain authorization
3. Test API endpoints manually
4. Review service documentation for changes

## Support and Documentation

### Migration Support

**Pre-Migration Planning**:
- Review migration checklist
- Plan migration timeline
- Prepare rollback procedures
- Test migration in staging environment

**During Migration**:
- Monitor application logs
- Test functionality incrementally
- Document any issues encountered
- Keep stakeholders informed

**Post-Migration**:
- Validate all functionality
- Monitor performance metrics
- Update documentation
- Train team on new environment

### Documentation Updates

**Update Required Documents**:
- Deployment procedures
- Environment configuration
- Admin access instructions
- User authentication flows
- API endpoint documentation

---

**Document Version**: 2.0  
**Last Updated**: July 23, 2025  
**Migration Status**: All procedures tested and validated  
**Next Review**: August 23, 2025