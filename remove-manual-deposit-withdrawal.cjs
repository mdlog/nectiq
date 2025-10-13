#!/usr/bin/env node

/**
 * Script to remove Manual Deposit/Withdrawal (Traditional Method) section
 * from multi-chain-financial.tsx
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'client/src/components/multi-chain-financial.tsx');

console.log('🔧 Removing Manual Deposit/Withdrawal (Traditional Method) section...');

try {
    // Read the file
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    console.log(`📄 Original file has ${lines.length} lines`);
    
    // Find the start and end of the manual deposit/withdrawal section
    let startLine = -1;
    let endLine = -1;
    
    // Look for the start of the manual section
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('Manual Deposit/Withdrawal (Traditional Method)')) {
            startLine = i - 1; // Include the comment line
            console.log(`📍 Found start of manual section at line ${startLine + 1}: ${lines[i].trim()}`);
            break;
        }
    }
    
    // Look for the end of the manual section (before Smart Contract Modals)
    for (let i = startLine + 1; i < lines.length; i++) {
        if (lines[i].includes('Smart Contract Modals') && lines[i].includes('{/*')) {
            endLine = i - 1; // Don't include the Smart Contract Modals comment
            console.log(`📍 Found end of manual section at line ${endLine + 1}: ${lines[i].trim()}`);
            break;
        }
    }
    
    if (startLine === -1 || endLine === -1) {
        console.error('❌ Could not find the manual deposit/withdrawal section boundaries');
        process.exit(1);
    }
    
    console.log(`🗑️  Removing lines ${startLine + 1} to ${endLine + 1} (${endLine - startLine + 1} lines)`);
    
    // Create new content without the manual section
    const newLines = [
        ...lines.slice(0, startLine),
        ...lines.slice(endLine + 1)
    ];
    
    console.log(`📄 New file will have ${newLines.length} lines`);
    console.log(`📉 Removed ${lines.length - newLines.length} lines`);
    
    // Write the new content
    fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
    
    console.log('✅ Successfully removed Manual Deposit/Withdrawal (Traditional Method) section!');
    console.log('🎯 Now only Multi Token Smart Contract functionality remains');
    
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}
