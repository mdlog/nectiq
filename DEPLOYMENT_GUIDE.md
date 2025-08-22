# Nectiq Platform Deployment Guide

**Last Updated: August 5, 2025**

## Overview

This guide provides comprehensive instructions for deploying the Nectiq cryptocurrency prediction platform in production environments. The platform is optimized for Replit deployment with support for custom domains and scaling.

### Recent Platform Updates (August 2025)
- ✅ **Enhanced CSV Export System**: Complete data export functionality for all admin sections
- ✅ **Advanced Admin Panel**: Full administrative control with detailed monitoring capabilities
- ✅ **TypeScript Stability**: All LSP diagnostics resolved for stable deployment
- ✅ **Production Ready**: System verified for stable production deployment with comprehensive testing

## Prerequisites

### System Requirements
- Node.js 20.0.0 or higher
- PostgreSQL database (Neon Database recommended)
- Replit deployment environment
- External API access for Pyth Network and Etherscan

### Required Services
- **Dynamic Labs Account**: For Web3 wallet authentication
- **Neon Database**: For PostgreSQL hosting
- **Firebase Project** (Optional): For email verification
- **Etherscan API Key**: For blockchain transaction verification

## Production Environment Setup

### 1. Environment Variables Configuration

Create production `.env` file with the following variables:

```env
# Database Configuration (Required)
DATABASE_URL=postgresql://username:password@host:port/database
PGHOST=your-neon-db-host
PGPORT=5432
PGUSER=your-neon-db-user
PGPASSWORD=your-neon-db-password
PGDATABASE=your-neon-db-name

# Session Security (Required)
SESSION_SECRET=your-super-secure-session-secret-at-least-32-chars

# Web3 Authentication (Required)
VITE_DYNAMIC_ENVIRONMENT_ID=your_dynamic_environment_id
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id

# Admin Configuration (Required)
ADMIN_WALLET_ADDRESSES=0x1234...,0x5678...
ADMIN_PRIVATE_KEY=your-encrypted-admin-private-key

# External APIs (Required)
ETHERSCAN_API_KEY=your_etherscan_api_key_here

# Firebase Email Verification (Optional)
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_PROJECT_ID=nectiq
VITE_FIREBASE_APP_ID=your-firebase-app-id

# Runtime Environment
NODE_ENV=production
```

### 2. Database Setup

Initialize the production database:

```bash
# Push database schema to production
npm run db:push

# Generate TypeScript types
npm run db:generate
```

### 3. Build Process

Create production build:

```bash
# Install dependencies
npm install

# Build frontend and backend
npm run build

# Verify build files
ls -la dist/
```

## Replit Deployment

### 1. Replit Configuration

The platform is optimized for Replit deployment with the following configuration:

**replit.nix** (if applicable):
```nix
{ pkgs }: {
  deps = [
    pkgs.nodejs-20_x
    pkgs.postgresql
  ];
}
```

**package.json scripts**:
```json
{
  "scripts": {
    "dev": "tsx server/index.ts",
    "build": "npm run build:frontend && npm run build:backend",
    "build:frontend": "vite build",
    "build:backend": "esbuild server/index.ts --bundle --platform=node --target=node20 --format=esm --outfile=dist/index.js",
    "start": "node dist/index.js",
    "db:push": "drizzle-kit push",
    "db:generate": "drizzle-kit generate"
  }
}
```

### 2. Replit Secrets Configuration

Configure the following secrets in Replit:

- `DATABASE_URL`
- `SESSION_SECRET`
- `ADMIN_WALLET_ADDRESSES`
- `ADMIN_PRIVATE_KEY`
- `ETHERSCAN_API_KEY`
- `VITE_DYNAMIC_ENVIRONMENT_ID`
- `VITE_WALLETCONNECT_PROJECT_ID`
- `VITE_FIREBASE_API_KEY` (optional)
- `VITE_FIREBASE_PROJECT_ID` (optional)
- `VITE_FIREBASE_APP_ID` (optional)

### 3. Replit Deployment Process

1. **Push Code**: Push all code to Replit repository
2. **Configure Secrets**: Set all required environment variables in Replit Secrets
3. **Database Setup**: Run `npm run db:push` to initialize database
4. **Start Application**: Run `npm run dev` for development or `npm start` for production
5. **Domain Configuration**: Set up custom domain if required

## Production Optimizations

### Performance Configurations

**Frontend Optimizations**:
- Vite production build with minification
- Code splitting for optimal loading
- Asset optimization and compression
- CDN integration for static assets

**Backend Optimizations**:
- ESBuild bundling for Node.js
- Connection pooling for PostgreSQL
- Redis caching (if implemented)
- API response optimization

### Security Configurations

**Production Security Headers**:
```javascript
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});
```

**CORS Configuration**:
```javascript
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com', 'https://your-replit-domain.replit.app']
    : true,
  credentials: true
}));
```

## External Service Configuration

### Dynamic Labs Setup

1. **Environment Configuration**: 
   - Environment ID: `your_dynamic_environment_id`
   - Configure supported wallets and networks

2. **Domain Authorization**:
   - Add production domain to Dynamic Labs settings
   - Configure redirect URLs for wallet authentication

### Firebase Configuration (Optional)

1. **Project Setup**:
   - Project ID: `nectiq`
   - Enable Google Authentication

2. **Domain Authorization**:
   - Add production domain to Firebase Console
   - Path: Authentication > Settings > Authorized domains

### Neon Database Configuration

1. **Connection Setup**:
   - Configure connection pooling
   - Set up read replicas if needed
   - Configure backup schedules

2. **Performance Optimization**:
   - Enable connection pooling
   - Configure database indexes
   - Set up monitoring and alerts

## Monitoring and Maintenance

### Application Monitoring

**Health Checks**:
```javascript
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: 'connected',
      pyth: 'operational',
      admin: 'available'
    }
  });
});
```

**Error Monitoring**:
- Comprehensive error logging
- Admin panel monitoring dashboard
- Automated alert system for critical errors

### Database Maintenance

**Regular Tasks**:
- Database backups (automated)
- Index optimization
- Query performance monitoring
- Connection pool monitoring

**Monitoring Queries**:
```sql
-- Check active connections
SELECT count(*) FROM pg_stat_activity;

-- Monitor slow queries
SELECT query, mean_exec_time FROM pg_stat_statements 
ORDER BY mean_exec_time DESC LIMIT 10;
```

## Scaling Considerations

### Horizontal Scaling

**Load Balancing**:
- Multiple Replit instances
- Session persistence configuration
- Database connection distribution

**Caching Strategy**:
- Redis for session storage
- API response caching
- Static asset CDN

### Performance Metrics

**Key Metrics to Monitor**:
- API response times
- Database query performance
- WebSocket connection stability
- Price feed update frequency
- User session management

## Backup and Recovery

### Database Backups

**Automated Backups**:
- Daily database backups via Neon
- Transaction log backups
- Point-in-time recovery capability

**Backup Verification**:
```bash
# Test backup restoration
pg_restore --verbose --clean --no-acl --no-owner -h localhost -U username -d test_db backup_file.sql
```

### Disaster Recovery

**Recovery Procedures**:
1. **Database Recovery**: Restore from latest backup
2. **Application Recovery**: Redeploy from Git repository
3. **Configuration Recovery**: Restore environment variables
4. **Service Recovery**: Restart external service connections

## Security Deployment Checklist

### Pre-Deployment Security
- [ ] All environment variables in Replit Secrets
- [ ] Admin wallet addresses secured
- [ ] API keys validated and active
- [ ] Firebase domains authorized
- [ ] SSL/TLS certificates configured

### Post-Deployment Security
- [ ] Admin panel accessibility verified
- [ ] Wallet authentication tested
- [ ] Financial transactions tested
- [ ] Security monitoring active
- [ ] Backup systems verified

## Troubleshooting

### Common Deployment Issues

**Database Connection Issues**:
```bash
# Test database connection
npx drizzle-kit introspect --config=drizzle.config.ts
```

**Environment Variable Issues**:
```bash
# Verify environment variables
node -e "console.log(process.env.DATABASE_URL ? 'DB Connected' : 'DB Missing')"
```

**Build Issues**:
```bash
# Clear build cache
rm -rf dist/ node_modules/.vite/
npm install
npm run build
```

### Performance Troubleshooting

**Database Performance**:
- Check connection pool status
- Analyze slow query logs
- Verify index usage

**API Performance**:
- Monitor response times
- Check rate limiting status
- Verify external API connectivity

## Support and Maintenance

### Regular Maintenance Tasks

**Daily**:
- Monitor application health
- Check error logs
- Verify financial transactions

**Weekly**:
- Database performance review
- Security log analysis
- Backup verification

**Monthly**:
- Dependency updates
- Security audit
- Performance optimization review

### Support Channels

**Technical Support**:
- GitHub Issues for bugs
- Documentation updates
- Community support forums

**Emergency Support**:
- Critical security issues
- Financial system problems
- Database recovery needs

---

**Version**: 2.0  
**Last Updated**: July 23, 2025  
**Deployment Status**: Production Ready  
**Next Review**: August 23, 2025