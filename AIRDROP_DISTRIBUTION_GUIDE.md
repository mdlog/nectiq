# 🎁 PANDUAN DISTRIBUSI AIRDROP NTIQ

**Date:** January 2025  
**Purpose:** Menjelaskan cara distribusi airdrop yang efisien dan cost-effective  
**Context:** NTIQ Token - 150M total airdrop (50M immediate + 100M vested)

---

## 📋 TABLE OF CONTENTS

1. [Airdrop Challenge](#airdrop-challenge)
2. [3 Methods Comparison](#3-methods-comparison)
3. [Method 1: Merkle Tree Airdrop (RECOMMENDED)](#method-1-merkle-tree-airdrop-recommended)
4. [Method 2: Batch Transfer](#method-2-batch-transfer)
5. [Method 3: Manual Transfer (NOT RECOMMENDED)](#method-3-manual-transfer-not-recommended)
6. [Implementation Guide](#implementation-guide)
7. [NTIQ Airdrop Strategy](#ntiq-airdrop-strategy)

---

## 🎯 AIRDROP CHALLENGE

### **Scenario:**
Anda perlu distribute **50M NTIQ immediate airdrop** ke:
- 1,000+ beta testers
- 500+ early adopters
- 200+ community builders
- 100+ Buildathons participants

**Total: ~2,000 wallets**

### **Problem:**
```
Jika transfer manual satu per satu:
├─ Gas fee per transfer: ~$0.50 (Polygon)
├─ Total gas: $0.50 × 2,000 = $1,000
├─ Time required: ~10 hours (manual work)
├─ Error risk: HIGH (salah address, salah amount)
└─ Scalability: Tidak bisa untuk 10,000+ users
```

---

## 📊 3 METHODS COMPARISON

| Aspect | Merkle Tree | Batch Transfer | Manual |
|--------|-------------|----------------|--------|
| **Gas Cost** | ~$10 (one-time) | ~$200 (multiple batches) | ~$1,000+ |
| **Your Time** | 1 hour setup | 2-3 hours | 10+ hours |
| **Scalability** | ✅ Unlimited users | 🟡 Up to 5,000 | ❌ Max 1,000 |
| **User Experience** | Users claim | Auto receive | Auto receive |
| **Error Risk** | ⭐ Very Low | ⭐⭐ Low | ⭐⭐⭐ High |
| **Industry Standard** | ✅ YES (Uniswap, ENS) | 🟡 Sometimes | ❌ NO |
| **Recommendation** | ✅ **BEST** | 🟡 OK for small | ❌ Avoid |

---

## ✅ METHOD 1: MERKLE TREE AIRDROP (RECOMMENDED)

### **Concept:**
```
1. Create list of all recipients + amounts
2. Generate Merkle Tree dari list tersebut
3. Deploy smart contract dengan Merkle Root
4. Users claim sendiri dengan Merkle Proof
```

### **How It Works:**

```
┌─────────────────────────────────────────────────────────────────┐
│                    MERKLE TREE AIRDROP                           │
└─────────────────────────────────────────────────────────────────┘

STEP 1: Prepare Airdrop List
┌─────────────────────────────────────────────────────────────────┐
│  airdrop.csv:                                                   │
│  0xUser1, 10000                                                 │
│  0xUser2, 5000                                                  │
│  0xUser3, 15000                                                 │
│  ... (2,000 users)                                              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
STEP 2: Generate Merkle Tree
┌─────────────────────────────────────────────────────────────────┐
│  Run script: npm run generate-merkle-tree                       │
│                                                                 │
│  Output:                                                        │
│  • merkle-root: 0xABC123...                                    │
│  • merkle-proofs.json (proof untuk setiap user)               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
STEP 3: Deploy Airdrop Contract
┌─────────────────────────────────────────────────────────────────┐
│  Deploy MerkleAirdrop.sol with:                                 │
│  • Token address: 0xNTIQ...                                    │
│  • Merkle root: 0xABC123...                                    │
│  • Total airdrop: 50M NTIQ                                     │
│                                                                 │
│  Gas cost: ~$10 (one-time!)                                    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
STEP 4: Fund Contract
┌─────────────────────────────────────────────────────────────────┐
│  Transfer 50M NTIQ to airdrop contract                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
STEP 5: Users Claim
┌─────────────────────────────────────────────────────────────────┐
│  User visits: claim.nectiq.io                                   │
│  • Connect wallet                                              │
│  • Click "Claim Airdrop"                                       │
│  • Frontend gets Merkle Proof dari API                         │
│  • Contract verifies proof                                     │
│  • Tokens transferred to user                                  │
│                                                                 │
│  Gas paid by: USER (~$0.10)                                    │
└─────────────────────────────────────────────────────────────────┘
```

### **Benefits:**

| Benefit | Explanation |
|---------|-------------|
| 💰 **Ultra Low Cost** | You only pay 1 deployment (~$10 total) |
| ⚡ **Scalable** | Works for 10,000+ users with same cost |
| 🔒 **Secure** | Cannot claim twice, cryptographically verified |
| 🎯 **User Control** | Users claim when they want (tax optimization) |
| ✅ **Industry Standard** | Used by Uniswap, ENS, Optimism, etc. |

### **Downsides:**

| Downside | Mitigation |
|----------|------------|
| Users must claim | Send notifications, make UI simple |
| Users pay gas | Very cheap on Polygon (~$0.10) |
| Need frontend | Build claim page (or use existing tools) |

---

## 🔄 METHOD 2: BATCH TRANSFER

### **Concept:**
```
Transfer ke multiple addresses dalam 1 transaction
Saves gas compared to manual, but still costs more than Merkle
```

### **How It Works:**

```
┌─────────────────────────────────────────────────────────────────┐
│                      BATCH TRANSFER                              │
└─────────────────────────────────────────────────────────────────┘

STEP 1: Prepare Recipients List
┌─────────────────────────────────────────────────────────────────┐
│  recipients.json:                                               │
│  [                                                              │
│    { address: "0xUser1", amount: "10000" },                    │
│    { address: "0xUser2", amount: "5000" },                     │
│    ... (up to 200 per batch)                                   │
│  ]                                                             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
STEP 2: Deploy/Use Batch Transfer Contract
┌─────────────────────────────────────────────────────────────────┐
│  Options:                                                       │
│  A) Use existing: Disperse.app                                 │
│  B) Deploy own: BatchTransfer.sol                              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
STEP 3: Execute Batch Transfers
┌─────────────────────────────────────────────────────────────────┐
│  Batch 1: Transfer to 200 users                                │
│  Gas cost: ~$20                                                │
│                                                                 │
│  Batch 2: Transfer to 200 users                                │
│  Gas cost: ~$20                                                │
│                                                                 │
│  ... repeat for all batches                                    │
│                                                                 │
│  Total: ~10 batches × $20 = $200                               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
STEP 4: Users Receive Automatically
┌─────────────────────────────────────────────────────────────────┐
│  ✅ Tokens appear in user wallets automatically                │
│  ✅ No action needed from users                                │
└─────────────────────────────────────────────────────────────────┘
```

### **Benefits:**

| Benefit | Explanation |
|---------|-------------|
| 🎁 **Auto Receive** | Users don't need to do anything |
| ⚡ **Fast** | Complete in few hours |
| 📱 **Simple UX** | No claim page needed |

### **Downsides:**

| Downside | Impact |
|----------|--------|
| Higher cost | 20x more expensive than Merkle |
| Not scalable | Difficult for 10,000+ users |
| All at once | Users can't choose claim timing |

---

## ❌ METHOD 3: MANUAL TRANSFER (NOT RECOMMENDED)

### **How It Works:**
```
Call token.transfer() for each recipient
One by one, manually
```

### **Why Avoid:**
- ❌ Very expensive (~$1,000 gas for 2,000 users)
- ❌ Time-consuming (10+ hours of work)
- ❌ High error risk (typos, wrong amounts)
- ❌ Not scalable
- ❌ Unprofessional

**Only use for:** < 10 recipients (friends/family testing)

---

## 💻 IMPLEMENTATION GUIDE

### **RECOMMENDED: Merkle Tree Airdrop**

#### **Step 1: Install Dependencies**
```bash
npm install --save merkletreejs keccak256
```

#### **Step 2: Create Airdrop Smart Contract**

```solidity
// contracts/MerkleAirdrop.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MerkleAirdrop
 * @dev Gas-efficient airdrop using Merkle Tree
 * 
 * Used by: Uniswap, ENS, Optimism, Arbitrum
 * Gas cost: ~$10 deployment (one-time)
 * Scalability: Unlimited users
 */
contract MerkleAirdrop is Ownable {
    IERC20 public immutable token;
    bytes32 public immutable merkleRoot;
    
    // Track claimed addresses
    mapping(address => bool) public hasClaimed;
    
    event Claimed(address indexed user, uint256 amount);
    
    constructor(
        address _token,
        bytes32 _merkleRoot
    ) Ownable(msg.sender) {
        token = IERC20(_token);
        merkleRoot = _merkleRoot;
    }
    
    /**
     * @dev Claim airdrop tokens
     * @param amount Amount to claim
     * @param merkleProof Proof that user is in airdrop list
     */
    function claim(
        uint256 amount,
        bytes32[] calldata merkleProof
    ) external {
        require(!hasClaimed[msg.sender], "Already claimed");
        
        // Verify Merkle Proof
        bytes32 leaf = keccak256(abi.encodePacked(msg.sender, amount));
        require(
            MerkleProof.verify(merkleProof, merkleRoot, leaf),
            "Invalid proof"
        );
        
        // Mark as claimed
        hasClaimed[msg.sender] = true;
        
        // Transfer tokens
        require(token.transfer(msg.sender, amount), "Transfer failed");
        
        emit Claimed(msg.sender, amount);
    }
    
    /**
     * @dev Check if address has claimed
     */
    function isClaimed(address user) external view returns (bool) {
        return hasClaimed[user];
    }
    
    /**
     * @dev Emergency withdraw (only owner)
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = token.balanceOf(address(this));
        require(token.transfer(owner(), balance), "Transfer failed");
    }
}
```

#### **Step 3: Generate Merkle Tree**

```javascript
// scripts/generate-merkle-tree.js
const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');
const fs = require('fs');
const { ethers } = require('hardhat');

async function main() {
  // Load airdrop list from CSV or database
  const airdropList = [
    { address: "0x1234...", amount: ethers.parseUnits("10000", 18) },
    { address: "0x5678...", amount: ethers.parseUnits("5000", 18) },
    { address: "0x9ABC...", amount: ethers.parseUnits("15000", 18) },
    // ... add all 2,000 recipients
  ];
  
  console.log(`Processing ${airdropList.length} recipients...`);
  
  // Create leaves (hash of address + amount)
  const leaves = airdropList.map(item => 
    keccak256(ethers.solidityPacked(
      ["address", "uint256"],
      [item.address, item.amount]
    ))
  );
  
  // Create Merkle Tree
  const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
  const merkleRoot = tree.getHexRoot();
  
  console.log("Merkle Root:", merkleRoot);
  
  // Generate proofs for each recipient
  const proofs = {};
  airdropList.forEach((item, index) => {
    const leaf = leaves[index];
    const proof = tree.getHexProof(leaf);
    proofs[item.address.toLowerCase()] = {
      amount: item.amount.toString(),
      proof: proof
    };
  });
  
  // Save to file
  fs.writeFileSync(
    'merkle-proofs.json',
    JSON.stringify({
      merkleRoot: merkleRoot,
      proofs: proofs
    }, null, 2)
  );
  
  console.log("✅ Merkle tree generated!");
  console.log("✅ Proofs saved to merkle-proofs.json");
  
  // Calculate total airdrop
  const total = airdropList.reduce((sum, item) => sum + item.amount, 0n);
  console.log("Total Airdrop:", ethers.formatUnits(total, 18), "NTIQ");
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
```

#### **Step 4: Deploy Airdrop Contract**

```javascript
// scripts/deploy-airdrop.cjs
const { ethers } = require("hardhat");
const merkleData = require("../merkle-proofs.json");

async function main() {
  const ntiqTokenAddress = process.env.NTIQ_TOKEN_ADDRESS;
  const merkleRoot = merkleData.merkleRoot;
  
  console.log("Deploying MerkleAirdrop...");
  console.log("Token:", ntiqTokenAddress);
  console.log("Merkle Root:", merkleRoot);
  
  const MerkleAirdrop = await ethers.getContractFactory("MerkleAirdrop");
  const airdrop = await MerkleAirdrop.deploy(
    ntiqTokenAddress,
    merkleRoot
  );
  
  await airdrop.waitForDeployment();
  const airdropAddress = await airdrop.getAddress();
  
  console.log("✅ MerkleAirdrop deployed:", airdropAddress);
  
  // Fund the contract
  const ntiqToken = await ethers.getContractAt("NTIQToken", ntiqTokenAddress);
  const airdropAmount = ethers.parseUnits("50000000", 18); // 50M NTIQ
  
  console.log("Funding airdrop contract...");
  await ntiqToken.transfer(airdropAddress, airdropAmount);
  
  console.log("✅ Airdrop funded with 50M NTIQ!");
  console.log("");
  console.log("Next steps:");
  console.log("1. Verify contract on Polygonscan");
  console.log("2. Upload merkle-proofs.json to backend");
  console.log("3. Build claim frontend");
  console.log("4. Announce to community!");
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
```

#### **Step 5: Create Claim Frontend**

```typescript
// client/src/pages/claim-airdrop.tsx
import { useState } from 'react';
import { useAccount, useContractWrite } from 'wagmi';
import { parseUnits } from 'viem';

export function ClaimAirdrop() {
  const { address } = useAccount();
  const [claiming, setClaiming] = useState(false);
  const [airdropData, setAirdropData] = useState(null);
  
  // Load airdrop data for connected wallet
  useEffect(() => {
    if (address) {
      // Fetch from your API
      fetch(`/api/airdrop/proof/${address}`)
        .then(res => res.json())
        .then(data => setAirdropData(data));
    }
  }, [address]);
  
  const { write: claimAirdrop } = useContractWrite({
    address: AIRDROP_CONTRACT_ADDRESS,
    abi: MerkleAirdropABI,
    functionName: 'claim',
  });
  
  const handleClaim = async () => {
    if (!airdropData) return;
    
    setClaiming(true);
    try {
      await claimAirdrop({
        args: [
          parseUnits(airdropData.amount, 18),
          airdropData.proof
        ]
      });
      
      toast.success("Airdrop claimed successfully!");
    } catch (error) {
      toast.error("Claim failed: " + error.message);
    } finally {
      setClaiming(false);
    }
  };
  
  if (!airdropData) {
    return <div>No airdrop available for this wallet</div>;
  }
  
  if (airdropData.claimed) {
    return <div>Airdrop already claimed!</div>;
  }
  
  return (
    <div className="claim-airdrop">
      <h1>Claim Your NTIQ Airdrop</h1>
      <p>You are eligible for: {airdropData.amount} NTIQ</p>
      
      <button 
        onClick={handleClaim}
        disabled={claiming}
      >
        {claiming ? "Claiming..." : "Claim Airdrop"}
      </button>
    </div>
  );
}
```

---

## 🎯 NTIQ AIRDROP STRATEGY

### **Your Tokenomics:**
- **Total Airdrop:** 150M NTIQ
- **Immediate:** 50M NTIQ (5%)
- **Vested:** 100M NTIQ (10%, 12-month linear)

### **Recommended Distribution:**

```
┌─────────────────────────────────────────────────────────────────┐
│                NTIQ AIRDROP DISTRIBUTION PLAN                    │
└─────────────────────────────────────────────────────────────────┘

PHASE 1: IMMEDIATE AIRDROP (50M NTIQ)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Method: Merkle Tree Airdrop ✅
Cost: ~$10 (one-time deployment)

Breakdown:
├─ Wave 1-2 Beta Users (2%):        20M NTIQ (~1,000 users)
├─ Testnet Participants (1.5%):     15M NTIQ (~500 users)
├─ Community Builders (1%):         10M NTIQ (~200 users)
└─ Buildathons Participants (0.5%): 5M NTIQ (~100 users)

Total Recipients: ~2,000 wallets
Avg per user: 25,000 NTIQ

Implementation:
1. Generate Merkle Tree dari list
2. Deploy MerkleAirdrop.sol
3. Fund dengan 50M NTIQ
4. Users claim via claim.nectiq.io

Timeline:
├─ Week 1: Generate list & verify addresses
├─ Week 2: Deploy & fund contract
├─ Week 3: Launch claim page
└─ Week 4+: Users claim (6-month claim window)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PHASE 2: VESTED AIRDROP (100M NTIQ)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Method: Built-in Vesting (from NTIQToken.sol) ✅
Cost: Negligible (use existing function)

Breakdown:
├─ Same recipients as Phase 1
├─ Each user gets 2x their immediate amount
└─ Vested over 12 months (linear, no cliff)

Example:
User got 25,000 NTIQ immediate
→ Also gets 50,000 NTIQ vested (4,167/month)

Implementation:
1. Use createVestingSchedule() for each user
2. No cliff (0 seconds)
3. 12-month duration (31,536,000 seconds)
4. Users claim monthly via releaseVestedTokens()

Timeline:
├─ Month 0: Setup vesting schedules
├─ Month 1-12: Users claim monthly
└─ Month 12: All vested tokens released

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TOTAL DISTRIBUTION COST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Method                          Cost        Time
────────────────────────────────────────────────────
Merkle Airdrop (50M immediate)  $10         2 weeks
Vesting Setup (100M vested)     ~$100       1 week
────────────────────────────────────────────────────
TOTAL                           $110        3 weeks

vs. Manual Distribution:        $1,500+     2 months

SAVINGS: ~$1,400 + 5 weeks time! 🎉
```

---

## 🔐 SECURITY BEST PRACTICES

### **1. Verify Airdrop List**
```javascript
// Double-check all addresses
const { ethers } = require('ethers');

function validateAddresses(list) {
  const errors = [];
  
  list.forEach((item, index) => {
    // Check valid address
    if (!ethers.isAddress(item.address)) {
      errors.push(`Invalid address at line ${index}: ${item.address}`);
    }
    
    // Check positive amount
    if (item.amount <= 0) {
      errors.push(`Invalid amount at line ${index}: ${item.amount}`);
    }
    
    // Check for duplicates
    const duplicates = list.filter(x => 
      x.address.toLowerCase() === item.address.toLowerCase()
    );
    if (duplicates.length > 1) {
      errors.push(`Duplicate address: ${item.address}`);
    }
  });
  
  return errors;
}
```

### **2. Test on Testnet First**
```bash
# Deploy to Amoy first
npx hardhat run scripts/deploy-airdrop.cjs --network amoy

# Test with small group
# Verify everything works
# Then deploy to mainnet
```

### **3. Set Claim Deadline**
```solidity
// Add to MerkleAirdrop.sol
uint256 public immutable claimDeadline;

constructor(..., uint256 _deadline) {
    claimDeadline = _deadline;
}

function claim(...) external {
    require(block.timestamp <= claimDeadline, "Claim period ended");
    // ... rest of claim logic
}
```

### **4. Monitor Claims**
```javascript
// Backend: Track claim events
airdropContract.on('Claimed', (user, amount) => {
  console.log(`${user} claimed ${amount} NTIQ`);
  
  // Update database
  // Send notification
  // Analytics tracking
});
```

---

## 📊 COMPARISON SUMMARY

### **For NTIQ (2,000 recipients):**

| Method | Cost | Time | Scalability | Recommended? |
|--------|------|------|-------------|--------------|
| **Merkle Tree** | $10 | 2 weeks | ⭐⭐⭐⭐⭐ | ✅ **YES** |
| **Batch Transfer** | $200 | 3 weeks | ⭐⭐⭐ | 🟡 OK |
| **Manual** | $1,000+ | 2 months | ⭐ | ❌ NO |

---

## 🚀 QUICK START CHECKLIST

- [ ] Prepare airdrop recipients list (CSV/JSON)
- [ ] Validate all addresses and amounts
- [ ] Install dependencies (`merkletreejs`, `keccak256`)
- [ ] Generate Merkle Tree and proofs
- [ ] Deploy `MerkleAirdrop.sol` to testnet
- [ ] Test claim flow with team
- [ ] Deploy to mainnet
- [ ] Fund contract with 50M NTIQ
- [ ] Build claim frontend
- [ ] Setup backend API for proofs
- [ ] Test end-to-end
- [ ] Verify contract on Polygonscan
- [ ] Announce to community
- [ ] Monitor claims and assist users

---

## 📚 ADDITIONAL RESOURCES

### **Tools:**
- **Merkle Tree Generator:** merkletreejs npm package
- **Disperse.app:** For batch transfers (if you choose Method 2)
- **OpenZeppelin Defender:** For automated airdrop monitoring

### **Examples:**
- **Uniswap:** Uses Merkle Tree for UNI airdrop
- **ENS:** Uses Merkle Tree for ENS airdrop
- **Optimism:** Uses Merkle Tree for OP airdrop

### **Reference:**
- OpenZeppelin MerkleProof: https://docs.openzeppelin.com/contracts/4.x/api/utils#MerkleProof
- Merkle Tree.js: https://github.com/miguelmota/merkletreejs

---

**Document Version:** 1.0  
**Last Updated:** January 2025  
**Prepared By:** NECTIQ Core Team

**For NTIQ Project: Use Merkle Tree Airdrop for 50M immediate + Built-in Vesting for 100M vested** ✅

---

*Gas-Efficient, Scalable, Industry-Standard Solution for Your Airdrop Needs* 🎁

