#!/usr/bin/env node
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔨 Starting Hardhat deployment with proper configuration...\n');

// Run hardhat with explicit CommonJS mode
const hardhat = spawn('npx', [
    'hardhat',
    'run',
    'scripts/deploy-vault.cjs',
    '--network',
    'amoy',
    '--config',
    'hardhat.config.cjs'
], {
    cwd: __dirname,
    stdio: 'inherit',
    shell: true,
    env: {
        ...process.env,
        NODE_OPTIONS: '--loader ts-node/esm/transpile-only'
    }
});

hardhat.on('close', (code) => {
    if (code === 0) {
        console.log('\n✅ Deployment completed successfully!');
    } else {
        console.log(`\n❌ Deployment failed with code ${code}`);
        process.exit(code);
    }
});

hardhat.on('error', (err) => {
    console.error('❌ Failed to start deployment:', err);
    process.exit(1);
});

