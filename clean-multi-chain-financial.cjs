#!/usr/bin/env node

/**
 * Script to clean up multi-chain-financial.tsx by removing remaining manual deposit/withdrawal content
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'client/src/components/multi-chain-financial.tsx');

console.log('🔧 Cleaning up multi-chain-financial.tsx...');

try {
    // Read the file
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    console.log(`📄 Original file has ${lines.length} lines`);

    // Find the line with "Smart Contract Modals" comment
    let smartContractModalsLine = -1;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('{/* Smart Contract Modals */}')) {
            smartContractModalsLine = i;
            console.log(`📍 Found Smart Contract Modals comment at line ${i + 1}`);
            break;
        }
    }

    if (smartContractModalsLine === -1) {
        console.error('❌ Could not find Smart Contract Modals comment');
        process.exit(1);
    }

    // Find the line with MultiTokenVaultDepositModal
    let multiTokenModalLine = -1;
    for (let i = smartContractModalsLine + 1; i < lines.length; i++) {
        if (lines[i].includes('MultiTokenVaultDepositModal')) {
            multiTokenModalLine = i;
            console.log(`📍 Found MultiTokenVaultDepositModal at line ${i + 1}`);
            break;
        }
    }

    if (multiTokenModalLine === -1) {
        console.error('❌ Could not find MultiTokenVaultDepositModal');
        process.exit(1);
    }

    // Remove all content between Smart Contract Modals comment and MultiTokenVaultDepositModal
    const linesToRemove = multiTokenModalLine - smartContractModalsLine - 1;
    console.log(`🗑️  Removing ${linesToRemove} lines between Smart Contract Modals and MultiTokenVaultDepositModal`);

    // Create new content
    const newLines = [
        ...lines.slice(0, smartContractModalsLine + 1), // Keep Smart Contract Modals comment
        ...lines.slice(multiTokenModalLine) // Keep from MultiTokenVaultDepositModal onwards
    ];

    console.log(`📄 New file will have ${newLines.length} lines`);
    console.log(`📉 Removed ${lines.length - newLines.length} lines`);

    // Write the new content
    fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');

    console.log('✅ Successfully cleaned up multi-chain-financial.tsx!');
    console.log('🎯 Now only Multi Token Smart Contract functionality remains');

} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}
