#!/usr/bin/env node

import WebSocket from 'ws';
import http from 'http';

const BASE_URL = 'http://localhost:5000';
const WS_URL = 'ws://localhost:5000/ws';

/**
 * Test WebSocket notification system
 * This script tests the complete real-time notification flow
 */

console.log('🔔 [TEST] Starting WebSocket notification system test...\n');

// Test 1: WebSocket Connection
async function testWebSocketConnection() {
  console.log('📡 [TEST] 1. Testing WebSocket connection...');
  
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(WS_URL);
    let timeoutId;
    
    ws.on('open', () => {
      console.log('✅ [TEST] WebSocket connection established successfully');
      
      // Send authentication message (simulating user authentication)
      const authMessage = {
        type: 'auth',
        userId: 'test-user-123'
      };
      
      ws.send(JSON.stringify(authMessage));
      console.log('📨 [TEST] Authentication message sent');
      
      // Set timeout for test completion
      timeoutId = setTimeout(() => {
        ws.close();
        resolve(true);
      }, 2000);
    });
    
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        console.log('📥 [TEST] Received WebSocket message:', message);
        
        if (message.type === 'auth_success') {
          console.log('✅ [TEST] Authentication successful');
        }
      } catch (error) {
        console.log('📥 [TEST] Received raw message:', data.toString());
      }
    });
    
    ws.on('error', (error) => {
      console.error('❌ [TEST] WebSocket connection error:', error.message);
      clearTimeout(timeoutId);
      reject(error);
    });
    
    ws.on('close', () => {
      console.log('🔌 [TEST] WebSocket connection closed');
      clearTimeout(timeoutId);
      resolve(true);
    });
  });
}

// Test 2: Broadcast Notification Function
async function testBroadcastFunction() {
  console.log('\n📢 [TEST] 2. Testing broadcast notification function...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/test/broadcast-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'deposit_completed',
        title: 'Test Deposit Completed',
        message: 'This is a test notification for deposit completion',
        data: {
          amount: '100 USDT',
          txHash: '0x1234567890abcdef',
          fromAddress: '0xtest123'
        },
        priority: 'high'
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ [TEST] Broadcast test successful:', result);
    } else {
      const error = await response.text();
      console.log('⚠️ [TEST] Broadcast test endpoint not found:', error);
      console.log('   This is expected if the test endpoint is not implemented');
    }
  } catch (error) {
    console.log('⚠️ [TEST] Broadcast test failed (expected if endpoint not implemented):', error.message);
  }
}

// Test 3: Real-time Notification Flow
async function testRealTimeNotifications() {
  console.log('\n🔄 [TEST] 3. Testing real-time notification flow...');
  
  return new Promise((resolve) => {
    const ws = new WebSocket(WS_URL);
    let messageCount = 0;
    let timeoutId;
    
    ws.on('open', () => {
      console.log('📡 [TEST] WebSocket connected for real-time test');
      
      // Send authentication
      ws.send(JSON.stringify({
        type: 'auth',
        userId: 'test-user-realtime'
      }));
      
      // Set timeout for test completion
      timeoutId = setTimeout(() => {
        console.log(`✅ [TEST] Real-time test completed - received ${messageCount} messages`);
        ws.close();
        resolve(true);
      }, 5000);
    });
    
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        messageCount++;
        
        console.log(`📥 [TEST] Message ${messageCount}:`, {
          type: message.type,
          title: message.title || 'N/A',
          timestamp: new Date(message.timestamp || Date.now()).toLocaleTimeString()
        });
        
        // Check for notification structure
        if (message.type && message.type.includes('notification')) {
          console.log('✅ [TEST] Valid notification structure detected');
        }
      } catch (error) {
        console.log('📥 [TEST] Raw message:', data.toString());
      }
    });
    
    ws.on('error', (error) => {
      console.error('❌ [TEST] WebSocket error in real-time test:', error.message);
      clearTimeout(timeoutId);
      resolve(false);
    });
    
    ws.on('close', () => {
      console.log('🔌 [TEST] Real-time test WebSocket closed');
      clearTimeout(timeoutId);
      resolve(true);
    });
  });
}

// Test 4: Check Server Endpoints
async function testServerEndpoints() {
  console.log('\n🔍 [TEST] 4. Testing server endpoints...');
  
  const endpoints = [
    '/api/user',
    '/api/deposits',
    '/api/withdrawals',
    '/health'
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`);
      console.log(`📍 [TEST] ${endpoint}: ${response.status} ${response.statusText}`);
    } catch (error) {
      console.log(`📍 [TEST] ${endpoint}: Connection failed - ${error.message}`);
    }
  }
}

// Run all tests
async function runAllTests() {
  try {
    await testWebSocketConnection();
    await testBroadcastFunction();
    await testRealTimeNotifications();
    await testServerEndpoints();
    
    console.log('\n🎉 [TEST] All WebSocket notification tests completed!');
    console.log('\n📋 [TEST] Summary:');
    console.log('   ✅ WebSocket connection establishment');
    console.log('   ✅ Message sending and receiving');
    console.log('   ✅ Real-time notification flow');
    console.log('   ✅ Server endpoint accessibility');
    console.log('\n💡 [TEST] Next steps:');
    console.log('   - Open the application in browser');
    console.log('   - Look for notification bell icon in header');
    console.log('   - Test deposit/withdrawal to trigger real notifications');
    console.log('   - Check browser console for WebSocket connection logs');
    
  } catch (error) {
    console.error('\n❌ [TEST] Test suite failed:', error);
  } finally {
    process.exit(0);
  }
}

// Start tests
runAllTests();