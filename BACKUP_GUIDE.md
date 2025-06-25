# Nectiq Backup & Recovery Guide

## Overview
Sistem backup Nectiq dirancang untuk melindungi data aplikasi dan memungkinkan pemulihan cepat dalam situasi darurat.

## Jenis Backup yang Tersedia

### 1. **Database Backup**
- **Lokasi**: PostgreSQL database lengkap
- **Frekuensi**: Manual atau terjadwal
- **Format**: SQL dump file
- **Ukuran**: Bergantung pada jumlah data (biasanya 5-50MB)

### 2. **File Upload Backup**
- **Lokasi**: Folder `/uploads` (banner images, dll)
- **Frekuensi**: Manual atau terjadwal
- **Format**: File copy langsung
- **Ukuran**: Bergantung pada jumlah upload

### 3. **Configuration Backup**
- **Lokasi**: System settings, exchange rates, dll
- **Frekuensi**: Manual atau saat perubahan konfigurasi
- **Format**: JSON file
- **Ukuran**: < 1MB

## Cara Menggunakan Backup System

### Membuat Backup Manual

#### Via Admin Panel:
1. Login sebagai admin
2. Buka Admin Panel → Settings
3. Klik "Backup Database"
4. Backup akan tersimpan dan dapat didownload

#### Via Command Line:
```bash
# Backup lengkap (database + files + config)
npm run backup:create

# Atau manual dengan script
node scripts/backup-system.js create
```

### Melihat Daftar Backup
```bash
# List semua backup yang tersedia
npm run backup:list

# Atau manual
node scripts/backup-system.js list
```

### Restore dari Backup
```bash
# Restore database dari backup file
npm run backup:restore ./backups/nectiq-db-2025-06-25.sql

# Atau manual
node scripts/backup-system.js restore ./backups/nectiq-db-2025-06-25.sql
```

## Automated Backup (Cron Jobs)

### Setup Automated Daily Backup:
```bash
# Edit crontab
crontab -e

# Tambahkan line berikut untuk backup harian jam 2 pagi
0 2 * * * cd /path/to/nectiq && npm run backup:create >> backup.log 2>&1

# Backup mingguan pada Minggu jam 1 pagi
0 1 * * 0 cd /path/to/nectiq && npm run backup:create >> backup-weekly.log 2>&1
```

### Setup Backup Retention (menghapus backup lama):
```bash
# Hapus backup lebih dari 30 hari (tambahkan ke crontab)
0 3 * * * find /path/to/nectiq/backups -name "*.sql" -mtime +30 -delete
```

## Struktur File Backup

```
backups/
├── nectiq-db-2025-06-25T10-30-00-000Z.sql         # Database backup
├── uploads-2025-06-25T10-30-00-000Z/              # Uploaded files
├── config-2025-06-25T10-30-00-000Z.json           # Configuration
└── backup-manifest-2025-06-25T10-30-00-000Z.json  # Backup manifest
```

## Backup Manifest File
Setiap backup memiliki manifest file yang berisi:
```json
{
  "timestamp": "2025-06-25T10:30:00.000Z",
  "backupId": "nectiq-backup-2025-06-25T10-30-00-000Z",
  "files": {
    "database": "nectiq-db-2025-06-25T10-30-00-000Z.sql",
    "uploads": "uploads-2025-06-25T10-30-00-000Z",
    "config": "config-2025-06-25T10-30-00-000Z.json"
  },
  "checksums": {
    "nectiq-db-2025-06-25T10-30-00-000Z.sql": "sha256hash...",
    "uploads-2025-06-25T10-30-00-000Z": "sha256hash...",
    "config-2025-06-25T10-30-00-000Z.json": "sha256hash..."
  }
}
```

## Recovery Scenarios

### 1. **Database Corruption**
```bash
# Stop aplikasi
pm2 stop nectiq

# Restore database
npm run backup:restore ./backups/nectiq-db-[latest-date].sql

# Restart aplikasi
pm2 start nectiq
```

### 2. **Lost Upload Files**
```bash
# Copy backup uploads ke folder aplikasi
cp -r ./backups/uploads-[date]/* ./uploads/
```

### 3. **Configuration Reset**
```bash
# Restore system settings dari config backup
# (perlu implementasi manual dalam admin panel)
```

## Monitoring & Alerts

### Setup Backup Success/Failure Notifications:
```bash
# Dalam backup script, tambahkan notifikasi
if [ $? -eq 0 ]; then
    echo "Backup berhasil: $(date)" | mail -s "Nectiq Backup Success" admin@example.com
else
    echo "Backup gagal: $(date)" | mail -s "Nectiq Backup FAILED" admin@example.com
fi
```

## Security Best Practices

### 1. **Enkripsi Backup**
```bash
# Encrypt backup dengan GPG
gpg --cipher-algo AES256 --compress-algo 1 --s2k-cipher-algo AES256 \
    --s2k-digest-algo SHA512 --s2k-mode 3 --s2k-count 65536 \
    --symmetric --output backup.sql.gpg backup.sql
```

### 2. **Remote Storage**
```bash
# Upload ke cloud storage (contoh: AWS S3)
aws s3 cp ./backups/ s3://nectiq-backups/ --recursive

# Atau ke server backup terpisah
rsync -avz ./backups/ backup-server:/backups/nectiq/
```

### 3. **Access Control**
```bash
# Set permission backup folder
chmod 700 ./backups
chown nectiq-user:nectiq-group ./backups
```

## Testing Recovery

### Monthly Recovery Test:
1. Buat backup test environment
2. Restore backup terbaru
3. Verifikasi data integrity
4. Test fungsi aplikasi
5. Dokumentasikan hasil test

## Troubleshooting

### Common Issues:

#### 1. "pg_dump: command not found"
```bash
# Install PostgreSQL client tools
sudo apt-get install postgresql-client
```

#### 2. "Permission denied"
```bash
# Fix backup directory permissions
sudo chown -R $USER:$USER ./backups
chmod 755 ./backups
```

#### 3. "Database connection failed"
```bash
# Check DATABASE_URL environment variable
echo $DATABASE_URL

# Test database connection
psql $DATABASE_URL -c "SELECT version();"
```

## Backup Size Estimation

- **Small deployment** (< 1000 users): 10-50MB
- **Medium deployment** (1000-10000 users): 50-200MB  
- **Large deployment** (> 10000 users): 200MB-1GB+

## Contact & Support

Untuk pertanyaan tentang backup system:
- Check logs: `tail -f backup.log`
- Admin Panel: `/admin` → Settings → Backup Management
- Emergency contact: sistem administrator