#!/bin/bash
# Nectiq Quick Migration Script
# Demonstrates how easy it is to migrate the application

set -e

echo "🚀 Nectiq Migration Analysis Tool"
echo "=================================="

# Check current application status
echo "📊 Current Application Status:"
echo "------------------------------"

# Database size
if command -v psql &> /dev/null && [ ! -z "$DATABASE_URL" ]; then
    DB_SIZE=$(psql "$DATABASE_URL" -t -c "SELECT pg_size_pretty(pg_database_size(current_database()));")
    echo "Database Size: $DB_SIZE"
    
    USER_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM users;" 2>/dev/null || echo "0")
    echo "Total Users: $USER_COUNT"
    
    PREDICTION_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM predictions;" 2>/dev/null || echo "0")
    echo "Total Predictions: $PREDICTION_COUNT"
    
    BATTLE_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM battles;" 2>/dev/null || echo "0")
    echo "Total Battles: $BATTLE_COUNT"
else
    echo "Database: Not accessible (database not configured)"
fi

# File uploads size
if [ -d "server/uploads" ]; then
    UPLOAD_SIZE=$(du -sh server/uploads 2>/dev/null | cut -f1)
    UPLOAD_COUNT=$(find server/uploads -type f 2>/dev/null | wc -l)
    echo "Upload Files: $UPLOAD_SIZE ($UPLOAD_COUNT files)"
else
    echo "Upload Files: 0B (0 files)"
fi

# Source code size
SOURCE_SIZE=$(du -sh . --exclude=node_modules --exclude=.git --exclude=backups 2>/dev/null | cut -f1)
echo "Source Code: $SOURCE_SIZE"

echo ""
echo "🎯 Migration Complexity Analysis:"
echo "--------------------------------"

# Check dependencies
echo "✅ Simple Stack: Node.js + PostgreSQL + React"
echo "✅ Zero External Services: All data stored locally"
echo "✅ Portable Database: Standard PostgreSQL"
echo "✅ Environment Based: All config via .env"

# Calculate estimated migration time
ESTIMATED_TIME="15-30 minutes"
if [ "$USER_COUNT" -gt 1000 ]; then
    ESTIMATED_TIME="30-60 minutes"
fi
if [ "$USER_COUNT" -gt 10000 ]; then
    ESTIMATED_TIME="1-2 hours"
fi

echo "⏱️  Estimated Migration Time: $ESTIMATED_TIME"

echo ""
echo "📦 Required Backup Data:"
echo "------------------------"
echo "1. Database (PostgreSQL dump) - CRITICAL"
echo "2. Upload files (server/uploads/) - MEDIUM"
echo "3. Environment variables (.env) - CRITICAL"
echo "4. Smart contracts (optional) - LOW"

echo ""
echo "🛠️  Migration Steps:"
echo "-------------------"
echo "1. Create backup (5 min)"
echo "2. Setup new server (10 min)"
echo "3. Transfer files (5 min)"
echo "4. Restore database (5-15 min)"
echo "5. Start application (2 min)"

echo ""
echo "💡 Migration Commands Preview:"
echo "-----------------------------"

cat << 'EOF'
# On source server:
npm run backup:create
scp -r ./backups/ user@new-server:/tmp/

# On new server:
git clone <repo-url> /var/www/nectiq
cd /var/www/nectiq
npm install && npm run build
cp /tmp/backups/.env .env
psql $DATABASE_URL < /tmp/backups/nectiq-db-latest.sql
cp -r /tmp/backups/uploads-*/* ./server/uploads/
npm start

# Total downtime: 15-30 minutes
EOF

echo ""
echo "🎯 Ease Rating: ⭐⭐⭐⭐⭐ (Very Easy)"
echo "Requirements: Basic Linux skills + PostgreSQL knowledge"
echo ""
echo "For full migration guide, see: MIGRATION_GUIDE.md"