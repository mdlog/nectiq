#!/usr/bin/env node
/**
 * Comprehensive Backup System for Nectiq Application
 * Supports automated database backups, file exports, and data recovery
 */

import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class NectiqBackupSystem {
  constructor() {
    this.backupDir = path.join(__dirname, '../backups');
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.databaseUrl = process.env.DATABASE_URL;
  }

  async createBackupDirectory() {
    try {
      await fs.mkdir(this.backupDir, { recursive: true });
      console.log(`✅ Backup directory created: ${this.backupDir}`);
    } catch (error) {
      console.error('❌ Failed to create backup directory:', error.message);
      throw error;
    }
  }

  async backupDatabase() {
    const backupFile = path.join(this.backupDir, `nectiq-db-${this.timestamp}.sql`);
    
    return new Promise((resolve, reject) => {
      console.log('🔄 Starting database backup...');
      
      const pgDump = spawn('pg_dump', [this.databaseUrl, '--no-password'], {
        stdio: ['ignore', 'pipe', 'pipe']
      });

      const writeStream = require('fs').createWriteStream(backupFile);
      pgDump.stdout.pipe(writeStream);

      let errorOutput = '';
      pgDump.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      pgDump.on('close', (code) => {
        if (code === 0) {
          console.log(`✅ Database backup completed: ${backupFile}`);
          resolve(backupFile);
        } else {
          console.error('❌ Database backup failed:', errorOutput);
          reject(new Error(`pg_dump failed with code ${code}: ${errorOutput}`));
        }
      });
    });
  }

  async backupUploads() {
    const uploadsDir = path.join(__dirname, '../uploads');
    const backupUploadsDir = path.join(this.backupDir, `uploads-${this.timestamp}`);

    try {
      await fs.mkdir(backupUploadsDir, { recursive: true });
      
      // Copy all uploaded files (banners, etc.)
      const files = await fs.readdir(uploadsDir).catch(() => []);
      
      for (const file of files) {
        const srcPath = path.join(uploadsDir, file);
        const destPath = path.join(backupUploadsDir, file);
        await fs.copyFile(srcPath, destPath);
      }
      
      console.log(`✅ Uploads backup completed: ${backupUploadsDir}`);
      return backupUploadsDir;
    } catch (error) {
      console.error('❌ Uploads backup failed:', error.message);
      throw error;
    }
  }

  async createConfigBackup() {
    const configBackupFile = path.join(this.backupDir, `config-${this.timestamp}.json`);
    
    const configData = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      version: require('../package.json').version,
      schemas: await this.exportSchemas(),
      settings: await this.exportSystemSettings()
    };

    await fs.writeFile(configBackupFile, JSON.stringify(configData, null, 2));
    console.log(`✅ Config backup completed: ${configBackupFile}`);
    return configBackupFile;
  }

  async exportSchemas() {
    // Export database schema information
    return {
      schemaFile: 'shared/schema.ts',
      drizzleConfig: 'drizzle.config.ts',
      migrations: './migrations'
    };
  }

  async exportSystemSettings() {
    // This would connect to DB and export system settings
    // For now, return basic structure
    return {
      exchangeRates: {
        ethToPts: 300000,
        usdtToPts: 100,
        usdcToPts: 100
      },
      predictionLimits: {
        minStake: 1,
        maxStake: 500,
        timeframes: ['1h', '6h', '24h', '7d']
      },
      securitySettings: {
        maxLoginAttempts: 5,
        sessionTimeout: 3600000
      }
    };
  }

  async createFullBackup() {
    console.log('🚀 Starting full system backup...');
    
    try {
      await this.createBackupDirectory();
      
      const [dbBackup, uploadsBackup, configBackup] = await Promise.all([
        this.backupDatabase(),
        this.backupUploads(),
        this.createConfigBackup()
      ]);

      const manifestFile = path.join(this.backupDir, `backup-manifest-${this.timestamp}.json`);
      const manifest = {
        timestamp: new Date().toISOString(),
        backupId: `nectiq-backup-${this.timestamp}`,
        files: {
          database: path.basename(dbBackup),
          uploads: path.basename(uploadsBackup),
          config: path.basename(configBackup)
        },
        checksums: await this.generateChecksums([dbBackup, uploadsBackup, configBackup])
      };

      await fs.writeFile(manifestFile, JSON.stringify(manifest, null, 2));
      
      console.log('🎉 Full backup completed successfully!');
      console.log(`📂 Backup location: ${this.backupDir}`);
      console.log(`📋 Manifest: ${manifestFile}`);
      
      return manifest;
    } catch (error) {
      console.error('💥 Backup failed:', error.message);
      throw error;
    }
  }

  async generateChecksums(files) {
    const crypto = await import('crypto');
    const checksums = {};
    
    for (const file of files) {
      const data = await fs.readFile(file);
      const hash = crypto.createHash('sha256').update(data).digest('hex');
      checksums[path.basename(file)] = hash;
    }
    
    return checksums;
  }

  async listBackups() {
    try {
      const files = await fs.readdir(this.backupDir);
      const manifests = files.filter(f => f.includes('backup-manifest'));
      
      console.log('📋 Available backups:');
      for (const manifest of manifests) {
        const data = JSON.parse(await fs.readFile(path.join(this.backupDir, manifest), 'utf8'));
        console.log(`- ${data.backupId} (${data.timestamp})`);
      }
      
      return manifests;
    } catch (error) {
      console.log('ℹ️ No backups found or backup directory does not exist');
      return [];
    }
  }

  async restoreDatabase(backupFile) {
    console.log(`🔄 Restoring database from ${backupFile}...`);
    
    return new Promise((resolve, reject) => {
      const psql = spawn('psql', [this.databaseUrl], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      const readStream = require('fs').createReadStream(backupFile);
      readStream.pipe(psql.stdin);

      let output = '';
      let errorOutput = '';
      
      psql.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      psql.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      psql.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Database restored successfully');
          resolve(output);
        } else {
          console.error('❌ Database restore failed:', errorOutput);
          reject(new Error(`psql failed with code ${code}: ${errorOutput}`));
        }
      });
    });
  }
}

// CLI Usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const backup = new NectiqBackupSystem();
  const command = process.argv[2];

  switch (command) {
    case 'create':
      backup.createFullBackup().catch(console.error);
      break;
    case 'list':
      backup.listBackups().catch(console.error);
      break;
    case 'restore':
      const backupFile = process.argv[3];
      if (!backupFile) {
        console.error('❌ Please specify backup file path');
        process.exit(1);
      }
      backup.restoreDatabase(backupFile).catch(console.error);
      break;
    default:
      console.log(`
🔧 Nectiq Backup System

Usage:
  node backup-system.js create    - Create full backup
  node backup-system.js list      - List available backups  
  node backup-system.js restore <file> - Restore from backup

Examples:
  node backup-system.js create
  node backup-system.js restore ./backups/nectiq-db-2025-06-25.sql
      `);
  }
}

export default NectiqBackupSystem;