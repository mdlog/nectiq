const { ethers } = require("ethers");

const VAULT_ADDRESS = "0x07d47A12F2f1224e8a1bE4e25fA5Ce7d3C6812d2";
const USER_ADDRESS = "0x3e4d881819768fab30c5a79F3A9A7e69f0a935a4"; // CryptoPrince7298
const USDC_ADDRESS = "0x8B0180f2101c8260d49339abfEe87927412494B4";
const POL_ADDRESS = "0x0000000000000000000000000000000000000000"; // native

const VAULT_ABI = [
    "function getUserBalance(address user, address token) view returns (uint256)",
    "function getUserBalances(address user) view returns (uint256 polBalance, uint256 wethBalance, uint256 usdcBalance, uint256 linkBalance)"
];

async function main() {
    console.log("🔍 Checking user vault balances...\n");
    
    const provider = new ethers.JsonRpcProvider("https://rpc-amoy.polygon.technology");
    const vault = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, provider);
    
    // Get all balances
    const balances = await vault.getUserBalances(USER_ADDRESS);
    
    console.log("📊 VAULT BALANCES FOR:", USER_ADDRESS);
    console.log("════════════════════════════════════════════════════════════");
    console.log("💎 POL Balance:", ethers.formatEther(balances.polBalance), "POL");
    console.log("💠 WETH Balance:", ethers.formatEther(balances.wethBalance), "WETH");
    console.log("💵 USDC Balance:", ethers.formatUnits(balances.usdcBalance, 6), "USDC");
    console.log("🔗 LINK Balance:", ethers.formatEther(balances.linkBalance), "LINK");
    console.log("════════════════════════════════════════════════════════════\n");
    
    // Check individual POL balance
    const polBalance = await vault.getUserBalance(USER_ADDRESS, POL_ADDRESS);
    console.log("🔍 POL Balance (individual check):", ethers.formatEther(polBalance), "POL");
    
    // Check if user has sufficient balance for 100 NTIQ withdrawal
    const ntiqToWithdraw = 100;
    // Formula: NTIQ → USD → POL
    // 100 NTIQ = $1.00 USD
    // $1.00 / $0.40 (POL price) = 2.5 POL
    const usdValue = ntiqToWithdraw * 0.01;
    const polPrice = 0.40; // Estimate
    const polEquivalent = usdValue / polPrice;
    
    const polBalanceNum = parseFloat(ethers.formatEther(polBalance));
    
    console.log("\n💰 WITHDRAWAL FEASIBILITY CHECK:");
    console.log("   User wants to withdraw: 100 NTIQ");
    console.log("   USD Value: $" + usdValue.toFixed(2));
    console.log("   POL equivalent (@ $0.40): ~" + polEquivalent.toFixed(4), "POL");
    console.log("   User's vault POL balance:", polBalanceNum, "POL");
    console.log("   Sufficient balance?", polBalanceNum >= polEquivalent ? "✅ YES" : "❌ NO - USER HAS ZERO BALANCE IN VAULT!");
    
    if (polBalanceNum === 0) {
        console.log("\n❌ ROOT CAUSE: VAULT BALANCE = 0");
        console.log("   User needs to DEPOSIT first before withdrawing!");
    }
}

main().catch(console.error);
