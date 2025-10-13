require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || "0000000000000000000000000000000000000000000000000000000000000001";
const POLYGONSCAN_API_KEY = process.env.POLYGONSCAN_API_KEY || "";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    // Polygon Amoy Testnet
    amoy: {
      url: "https://rpc-amoy.polygon.technology",
      accounts: [DEPLOYER_PRIVATE_KEY],
      chainId: 80002,
      gasPrice: 30000000000, // 30 gwei
      timeout: 60000
    },
    // Polygon Mainnet
    polygon: {
      url: "https://polygon-rpc.com",
      accounts: [DEPLOYER_PRIVATE_KEY],
      chainId: 137,
      gasPrice: 30000000000, // 30 gwei
      timeout: 60000
    },
    // Hardhat local network
    hardhat: {
      chainId: 31337
    }
  },
  etherscan: {
    apiKey: {
      polygon: POLYGONSCAN_API_KEY,
      polygonAmoy: POLYGONSCAN_API_KEY
    },
    customChains: [
      {
        network: "polygonAmoy",
        chainId: 80002,
        urls: {
          apiURL: "https://api-amoy.polygonscan.com/api",
          browserURL: "https://amoy.polygonscan.com"
        }
      }
    ]
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};
