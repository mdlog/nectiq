#!/usr/bin/env node

// Force CommonJS mode for Hardhat
require('dotenv').config();

// Set environment to force CommonJS
process.env.NODE_OPTIONS = '--loader ts-node/esm/transpile-only';

// Import and run Hardhat CLI
const { main } = require('hardhat/internal/cli/cli');

// Run Hardhat with arguments
main(process.argv.slice(2))
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

