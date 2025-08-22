// Test script to verify storage.getUserNotifications method
import { storage } from './server/storage';

console.log('🔍 [TEST] Testing storage object...');
console.log('🔍 [TEST] Storage object type:', typeof storage);
console.log('🔍 [TEST] Available methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(storage)));

// Test if getUserNotifications exists
console.log('🔍 [TEST] getUserNotifications type:', typeof storage.getUserNotifications);

if (typeof storage.getUserNotifications === 'function') {
  try {
    console.log('✅ [TEST] getUserNotifications exists, testing with userId 4...');
    const notifications = await storage.getUserNotifications(4, 5);
    console.log('✅ [TEST] Found', notifications.length, 'notifications for user 4');
    console.log('🔍 [TEST] First notification:', notifications[0]);
  } catch (error) {
    console.error('❌ [TEST] Error calling getUserNotifications:', error);
  }
} else {
  console.error('❌ [TEST] getUserNotifications is not a function!');
}

process.exit(0);