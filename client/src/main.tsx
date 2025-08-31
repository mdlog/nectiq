import React from 'react';
import { createRoot } from "react-dom/client";
import TestApp from "./test-app";

// For debugging - let's start with a simple app first
console.log('🚀 Starting Nectiq application...');

const root = document.getElementById("root");
if (!root) {
  console.error('❌ Root element not found!');
} else {
  console.log('✅ Root element found, rendering TestApp...');
  try {
    createRoot(root).render(<TestApp />);
    console.log('✅ TestApp rendered successfully!');
  } catch (error) {
    console.error('❌ Failed to render TestApp:', error);
  }
}
