// Test network connection
const { ethers } = require("hardhat");

async function main() {
    console.log("Testing network connection...");
    console.log("Network:", network.name);
    console.log("Chain ID:", (await ethers.provider.getNetwork()).chainId);
    console.log("Network test successful!");
}

main().catch((error) => {
    console.error("Network test failed:", error.message);
    process.exit(1);
});
