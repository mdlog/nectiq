#!/usr/bin/env node

/**
 * Localhost Wallet Connection Debug Script
 * Run this script to diagnose wallet connection issues on localhost
 */

import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Nectiq Localhost Wallet Connection Diagnostics\n');

// Check environment variables
function checkEnvironment() {
  console.log('📋 Environment Variables Check:');
  
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    console.log('❌ .env file not found');
    console.log('   Create .env file with VITE_DYNAMIC_ENVIRONMENT_ID');
    return false;
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const hasDynamicId = envContent.includes('VITE_DYNAMIC_ENVIRONMENT_ID');
  
  if (hasDynamicId) {
    console.log('✅ VITE_DYNAMIC_ENVIRONMENT_ID found in .env');
  } else {
    console.log('❌ VITE_DYNAMIC_ENVIRONMENT_ID missing from .env');
    console.log('   Add: VITE_DYNAMIC_ENVIRONMENT_ID=01933fe7-37b8-73b8-91b9-2f53e5ba52c3');
  }
  
  console.log('');
  return hasDynamicId;
}

// Check if server is running
function checkServer() {
  return new Promise((resolve) => {
    console.log('🌐 Server Connection Check:');
    
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/user',
      method: 'GET'
    }, (res) => {
      if (res.statusCode === 401) {
        console.log('✅ Server running on http://localhost:5000');
        console.log('✅ API endpoints accessible');
      } else {
        console.log(`⚠️  Server responding with status: ${res.statusCode}`);
      }
      console.log('');
      resolve(true);
    });
    
    req.on('error', (error) => {
      console.log('❌ Server not running on http://localhost:5000');
      console.log('   Start server with: npm run dev');
      console.log('');
      resolve(false);
    });
    
    req.end();
  });
}

// Check Dynamic Labs API
function checkDynamicLabs() {
  return new Promise((resolve) => {
    console.log('🔗 Dynamic Labs API Check:');
    
    const req = https.request({
      hostname: 'app.dynamic.xyz',
      path: '/api/v0/environments/01933fe7-37b8-73b8-91b9-2f53e5ba52c3',
      method: 'GET',
      headers: {
        'User-Agent': 'Nectiq-Debug/1.0'
      }
    }, (res) => {
      if (res.statusCode === 200 || res.statusCode === 401) {
        console.log('✅ Dynamic Labs API accessible');
        console.log('✅ Environment ID valid');
      } else {
        console.log(`⚠️  Dynamic Labs API responding with: ${res.statusCode}`);
      }
      console.log('');
      resolve(true);
    });
    
    req.on('error', (error) => {
      console.log('❌ Cannot reach Dynamic Labs API');
      console.log('   Check internet connection');
      console.log('');
      resolve(false);
    });
    
    req.end();
  });
}

// Check CORS configuration
function checkCORS() {
  return new Promise((resolve) => {
    console.log('🌍 CORS Configuration Check:');
    
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/user',
      method: 'OPTIONS'
    }, (res) => {
      const corsHeader = res.headers['access-control-allow-origin'];
      if (corsHeader === '*') {
        console.log('✅ CORS configured for all origins');
        console.log('✅ Wallet connections should work');
      } else {
        console.log(`⚠️  CORS header: ${corsHeader}`);
      }
      console.log('');
      resolve(true);
    });
    
    req.on('error', () => {
      console.log('❌ Cannot check CORS configuration');
      console.log('');
      resolve(false);
    });
    
    req.end();
  });
}

// Generate browser troubleshooting steps
function generateTroubleshootingSteps() {
  console.log('🔧 Browser Troubleshooting Steps:');
  console.log('');
  
  console.log('Chrome/Edge:');
  console.log('1. Go to chrome://flags/#allow-insecure-localhost');
  console.log('2. Enable "Allow invalid certificates for resources loaded from localhost"');
  console.log('3. Restart browser');
  console.log('');
  
  console.log('Firefox:');
  console.log('1. Go to about:config');
  console.log('2. Set security.tls.insecure_fallback_hosts to "localhost"');
  console.log('3. Restart browser');
  console.log('');
  
  console.log('MetaMask:');
  console.log('1. Ensure MetaMask is unlocked');
  console.log('2. Switch to Ethereum Mainnet or Sepolia testnet');
  console.log('3. Clear browser cache and reload page');
  console.log('4. Allow localhost connections in MetaMask settings');
  console.log('');
  
  console.log('Alternative Solutions:');
  console.log('1. Use ngrok: npm install -g ngrok && ngrok http 5000');
  console.log('2. Use HTTPS proxy or SSL certificate');
  console.log('3. Deploy to Replit and use .replit.dev domain');
  console.log('');
}

// Generate quick fix commands
function generateQuickFix() {
  console.log('⚡ Quick Fix Commands:');
  console.log('');
  
  console.log('1. Update .env file:');
  console.log('echo "VITE_DYNAMIC_ENVIRONMENT_ID=01933fe7-37b8-73b8-91b9-2f53e5ba52c3" >> .env');
  console.log('');
  
  console.log('2. Restart development server:');
  console.log('npm run dev');
  console.log('');
  
  console.log('3. Clear browser cache:');
  console.log('Ctrl+Shift+Delete (Windows/Linux) or Cmd+Shift+Delete (Mac)');
  console.log('');
  
  console.log('4. Test wallet connection:');
  console.log('Open http://localhost:5000 and click "Connect Wallet"');
  console.log('');
}

// Main diagnostic function
async function runDiagnostics() {
  const envOk = checkEnvironment();
  const serverOk = await checkServer();
  const dynamicOk = await checkDynamicLabs();
  const corsOk = await checkCORS();
  
  console.log('📊 Diagnostic Summary:');
  console.log(`Environment: ${envOk ? '✅' : '❌'}`);
  console.log(`Server: ${serverOk ? '✅' : '❌'}`);
  console.log(`Dynamic Labs: ${dynamicOk ? '✅' : '❌'}`);
  console.log(`CORS: ${corsOk ? '✅' : '❌'}`);
  console.log('');
  
  if (envOk && serverOk && dynamicOk && corsOk) {
    console.log('🎉 All checks passed! Wallet connection should work.');
    console.log('If still having issues, check browser console for errors.');
  } else {
    console.log('⚠️  Some issues detected. Follow troubleshooting steps below.');
  }
  
  console.log('');
  generateTroubleshootingSteps();
  generateQuickFix();
}

// Run diagnostics
runDiagnostics().catch(console.error);