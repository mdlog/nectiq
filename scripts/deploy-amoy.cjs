const hre = require("hardhat");

async function main() {
  console.log("\n╔════════════════════════════════════════════════════════════════╗");
  console.log("║     🚀 DEPLOYING NECTIQVAULT TO POLYGON AMOY TESTNET         ║");
  console.log("╚════════════════════════════════════════════════════════════════╝\n");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  
  console.log("📋 Deployment Information:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`Deployer Address: ${deployer.address}`);
  console.log(`Balance: ${hre.ethers.formatEther(balance)} MATIC`);
  console.log(`Network: Polygon Amoy Testnet (Chain ID: 80002)`);
  console.log(`RPC: https://rpc-amoy.polygon.technology`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Check if deployer has enough balance
  if (balance < hre.ethers.parseEther("0.1")) {
    console.log("❌ ERROR: Insufficient balance!");
    console.log(`   You need at least 0.1 MATIC for deployment`);
    console.log(`   Get testnet MATIC from: https://faucet.polygon.technology\n`);
    process.exit(1);
  }

  // Get backend signer address from environment
  const backendSignerAddress = process.env.BACKEND_SIGNER_ADDRESS;
  
  if (!backendSignerAddress) {
    console.log("❌ ERROR: BACKEND_SIGNER_ADDRESS not found in .env");
    console.log("   Please add BACKEND_SIGNER_ADDRESS to your .env file\n");
    process.exit(1);
  }

  console.log("📝 Backend Signer Address:", backendSignerAddress);
  console.log("\n⏳ Deploying NectiqVault contract...\n");

  // Deploy NectiqVault
  const NectiqVault = await hre.ethers.getContractFactory("NectiqVault");
  const vault = await NectiqVault.deploy(backendSignerAddress);

  await vault.waitForDeployment();
  const vaultAddress = await vault.getAddress();

  console.log("✅ NectiqVault deployed successfully!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`Contract Address: ${vaultAddress}`);
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Backend Signer: ${backendSignerAddress}`);
  console.log(`Explorer: https://amoy.polygonscan.com/address/${vaultAddress}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  console.log("⏳ Waiting for block confirmations...\n");
  
  // Wait for 5 confirmations
  await vault.deploymentTransaction().wait(5);

  console.log("✅ Block confirmations received!\n");

  // Verify contract on Polygonscan
  if (process.env.POLYGONSCAN_API_KEY) {
    console.log("⏳ Verifying contract on Polygonscan...\n");
    
    try {
      await hre.run("verify:verify", {
        address: vaultAddress,
        constructorArguments: [backendSignerAddress],
        contract: "contracts/NectiqVault.sol:NectiqVault"
      });
      
      console.log("✅ Contract verified on Polygonscan!");
      console.log(`   View at: https://amoy.polygonscan.com/address/${vaultAddress}#code\n`);
    } catch (error) {
      if (error.message.includes("Already Verified")) {
        console.log("✅ Contract already verified on Polygonscan!\n");
      } else {
        console.log("⚠️  Verification failed (you can verify manually later)");
        console.log(`   Error: ${error.message}\n`);
      }
    }
  } else {
    console.log("⚠️  POLYGONSCAN_API_KEY not found - skipping verification");
    console.log("   You can verify manually at: https://amoy.polygonscan.com\n");
  }

  console.log("\n╔════════════════════════════════════════════════════════════════╗");
  console.log("║              📋 NEXT STEPS - UPDATE .ENV FILE                 ║");
  console.log("╚════════════════════════════════════════════════════════════════╝\n");
  
  console.log("Add these lines to your .env file:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`VAULT_CONTRACT_ADDRESS=${vaultAddress}`);
  console.log(`VITE_VAULT_CONTRACT_ADDRESS=${vaultAddress}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  console.log("🎉 Deployment complete! Contract is ready to use.\n");
  console.log("📖 Documentation:");
  console.log("   - Contract verified on Polygonscan");
  console.log("   - Backend event listener will auto-detect deposits");
  console.log("   - Frontend can now interact with the contract\n");

  console.log("🔗 Useful Links:");
  console.log(`   Contract: https://amoy.polygonscan.com/address/${vaultAddress}`);
  console.log(`   Network: https://amoy.polygonscan.com`);
  console.log(`   Faucet: https://faucet.polygon.technology\n`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });

