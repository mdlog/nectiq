import { storage } from './server/storage.ts';

console.log('Storage object created:', !!storage);
console.log('Available methods:');
const proto = Object.getPrototypeOf(storage);
const methods = Object.getOwnPropertyNames(proto).filter(name => 
  name !== 'constructor' && typeof storage[name] === 'function'
);
console.log(methods);

console.log('getUserSurvivalStatus method exists:', typeof storage.getUserSurvivalStatus);

// Test the method call
if (typeof storage.getUserSurvivalStatus === 'function') {
  storage.getUserSurvivalStatus(62).then(result => {
    console.log('Method call successful:', result);
  }).catch(error => {
    console.log('Method call failed:', error.message);
  });
} else {
  console.log('Method is not a function');
}