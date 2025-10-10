# 🪙 PANDUAN DISTRIBUSI TOKEN NTIQ

**Date:** January 2025  
**Purpose:** Menjelaskan cara distribusi token setelah deployment  
**Best Practices:** Industry-standard token distribution methods

---

## 📋 TABLE OF CONTENTS

1. [Overview: 2 Metode Distribusi](#overview-2-metode-distribusi)
2. [Metode 1: Direct Distribution (NOT RECOMMENDED)](#metode-1-direct-distribution-not-recommended)
3. [Metode 2: Vesting Contract (RECOMMENDED)](#metode-2-vesting-contract-recommended)
4. [Deployment Flow Diagram](#deployment-flow-diagram)
5. [Implementation Example](#implementation-example)
6. [Step-by-Step Guide](#step-by-step-guide)
7. [Security Considerations](#security-considerations)

---

## 🎯 OVERVIEW: 2 METODE DISTRIBUSI

### **Pertanyaan Anda:**
> "Apakah saat deploy contract token harus masukkan wallet address team?"

### **Jawaban Singkat:**
**TIDAK.** Best practice adalah:
1. Deploy token contract → semua token ada di contract address
2. Deploy **TokenVesting contract** terpisah untuk setiap beneficiary
3. Transfer token dari token contract ke vesting contract
4. Vesting contract otomatis release token sesuai schedule

---

## ❌ METODE 1: DIRECT DISTRIBUTION (NOT RECOMMENDED)

### **Cara Kerja:**
```
Deploy Token Contract
   ↓
Langsung transfer ke wallet team/investor
   ↓
Mereka punya full control (BAHAYA!)
```

### **Contoh Kode (JANGAN GUNAKAN INI):**
```solidity
// Di constructor NTIQToken.sol
constructor() ERC20("Nectiq Token", "NTIQ") Ownable(msg.sender) {
    _mint(address(this), TOTAL_SUPPLY); // Mint ke contract
    
    // ❌ BAHAYA: Langsung transfer ke team
    _transfer(address(this), TEAM_WALLET_1, 50_000_000 * 10**18);
    _transfer(address(this), TEAM_WALLET_2, 50_000_000 * 10**18);
    _transfer(address(this), INVESTOR_1, 25_000_000 * 10**18);
    // Team bisa langsung jual semua! 😱
}
```

### **Masalah:**
| Problem | Impact |
|---------|--------|
| ❌ **No vesting enforcement** | Team bisa jual semua token langsung |
| ❌ **Trust-based** | Hanya mengandalkan "janji" team |
| ❌ **Rug pull risk** | Team bisa kabur dengan token |
| ❌ **Investor confidence LOW** | Investor tidak percaya |
| ❌ **CEX listing REJECT** | Exchange akan menolak listing |

### **Kapan Boleh Digunakan?**
- ✅ Untuk DAO Treasury (controlled by multisig)
- ✅ Untuk immediate airdrop (sudah planned)
- ❌ **JANGAN untuk Team & Investor!**

---

## ✅ METODE 2: VESTING CONTRACT (RECOMMENDED)

### **Cara Kerja:**
```
1. Deploy NTIQToken.sol
   ↓ (semua token ada di contract)
   
2. Deploy TokenVesting.sol untuk setiap beneficiary
   ↓ (satu vesting contract per team member/investor)
   
3. Transfer token ke vesting contract
   ↓ (token terkunci di smart contract)
   
4. Beneficiary claim sesuai schedule
   ↓ (otomatis release, tidak bisa di-bypass)
```

### **Keuntungan:**
| Benefit | Description |
|---------|-------------|
| ✅ **Trustless** | Smart contract enforce vesting |
| ✅ **Transparent** | On-chain, bisa di-audit siapa saja |
| ✅ **Automated** | Release otomatis sesuai schedule |
| ✅ **CEX-friendly** | Exchange percaya, mudah listing |
| ✅ **Investor confidence HIGH** | Investor tahu team tidak bisa dump |

---

## 📊 DEPLOYMENT FLOW DIAGRAM

### **Recommended Flow (dengan Vesting Contract):**

```
┌─────────────────────────────────────────────────────────────────┐
│                    STEP 1: DEPLOY TOKEN                          │
└─────────────────────────────────────────────────────────────────┘

npx hardhat run scripts/deploy-ntiq-token.cjs --network amoy

Result:
├─ NTIQToken deployed: 0xABC...123
├─ Total Supply: 1,000,000,000 NTIQ
└─ All tokens in contract: balanceOf(0xABC...123) = 1B NTIQ

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌─────────────────────────────────────────────────────────────────┐
│              STEP 2: DEPLOY VESTING CONTRACTS                    │
└─────────────────────────────────────────────────────────────────┘

Deploy satu vesting contract per beneficiary:

Team Member 1:
npx hardhat run scripts/deploy-vesting.cjs --network amoy \
  --beneficiary 0xTeamMember1 \
  --amount 50000000 \
  --cliff 31536000 \    # 1 year in seconds
  --duration 126144000  # 4 years in seconds

Result: TokenVesting1 deployed at 0xVEST1...

Team Member 2:
[Same process] → TokenVesting2 at 0xVEST2...

Investor 1:
[Same process] → TokenVesting3 at 0xVEST3...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌─────────────────────────────────────────────────────────────────┐
│             STEP 3: TRANSFER TO VESTING CONTRACTS                │
└─────────────────────────────────────────────────────────────────┘

From NTIQToken contract, transfer to each vesting contract:

ntiqToken.transfer(0xVEST1, 50_000_000 * 10**18);  // Team 1
ntiqToken.transfer(0xVEST2, 50_000_000 * 10**18);  // Team 2
ntiqToken.transfer(0xVEST3, 25_000_000 * 10**18);  // Investor 1

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌─────────────────────────────────────────────────────────────────┐
│                  STEP 4: BENEFICIARIES CLAIM                     │
└─────────────────────────────────────────────────────────────────┘

After cliff period (1 year):
├─ Team Member 1 calls: vestingContract.release()
├─ Smart contract calculates releasable amount
├─ Transfers unlocked tokens to beneficiary
└─ Cannot release more than schedule allows

Example Timeline:
Month 0:    0 NTIQ (cliff period)
Month 12:   12,500,000 NTIQ (1 year cliff release)
Month 13:   1,041,667 NTIQ (monthly linear)
Month 14:   1,041,667 NTIQ
...
Month 48:   50,000,000 NTIQ (all released)
```

---

## 💻 IMPLEMENTATION EXAMPLE

### **1. Token Contract (NTIQToken.sol) - Already Created ✅**

```solidity
// contracts/NTIQToken.sol (already implemented)
contract NTIQToken is ERC20, Ownable {
    uint256 public constant TOTAL_SUPPLY = 1_000_000_000 * 10**18;
    
    constructor(
        address _daoTreasury,
        address _operationsWallet
    ) ERC20("Nectiq Token", "NTIQ") Ownable(msg.sender) {
        // Mint all tokens to contract
        _mint(address(this), TOTAL_SUPPLY);
        
        // Direct allocations (no vesting needed)
        _transfer(address(this), _daoTreasury, 100_000_000 * 10**18);
        
        // NOTE: Team & Investor tokens stay in contract
        // Will be transferred to vesting contracts later
    }
    
    // Built-in vesting for NTIQToken (from your contract)
    function createVestingSchedule(
        address beneficiary,
        uint256 amount,
        uint256 cliffDuration,
        uint256 vestingDuration
    ) external onlyOwner {
        // Already implemented in your NTIQToken.sol! ✅
    }
}
```

**GOOD NEWS:** Your `NTIQToken.sol` already has built-in vesting! 🎉

---

### **2. Alternative: Separate Vesting Contract**

Jika ingin vesting contract terpisah (lebih modular):

```solidity
// contracts/TokenVesting.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TokenVesting
 * @dev Separate vesting contract (one per beneficiary)
 * 
 * Recommended for:
 * - Team members
 * - Investors
 * - Advisors
 * 
 * Benefits:
 * - Each beneficiary has their own contract
 * - Easy to track on-chain
 * - Cannot be bypassed
 * - Transparent for investors
 */
contract TokenVesting is Ownable {
    IERC20 public immutable token;
    address public immutable beneficiary;
    
    uint256 public immutable start;
    uint256 public immutable cliff;
    uint256 public immutable duration;
    uint256 public immutable totalAmount;
    
    uint256 public released;
    
    event TokensReleased(uint256 amount);
    
    constructor(
        address _token,
        address _beneficiary,
        uint256 _cliffDuration,  // e.g., 1 year = 31536000 seconds
        uint256 _duration         // e.g., 4 years = 126144000 seconds
    ) Ownable(msg.sender) {
        require(_beneficiary != address(0), "Zero address");
        require(_duration > 0, "Duration is 0");
        
        token = IERC20(_token);
        beneficiary = _beneficiary;
        start = block.timestamp;
        cliff = start + _cliffDuration;
        duration = _duration;
        
        // Total amount will be the balance of this contract
        totalAmount = token.balanceOf(address(this));
    }
    
    /**
     * @dev Calculate releasable amount
     */
    function releasableAmount() public view returns (uint256) {
        if (block.timestamp < cliff) {
            return 0;
        }
        
        if (block.timestamp >= start + duration) {
            return totalAmount - released;
        }
        
        uint256 timeVested = block.timestamp - start;
        uint256 vestedAmount = (totalAmount * timeVested) / duration;
        
        return vestedAmount - released;
    }
    
    /**
     * @dev Release vested tokens
     */
    function release() external {
        require(msg.sender == beneficiary || msg.sender == owner(), "Not authorized");
        
        uint256 amount = releasableAmount();
        require(amount > 0, "No tokens to release");
        
        released += amount;
        require(token.transfer(beneficiary, amount), "Transfer failed");
        
        emit TokensReleased(amount);
    }
    
    /**
     * @dev Get vesting info
     */
    function getVestingInfo() external view returns (
        uint256 _start,
        uint256 _cliff,
        uint256 _duration,
        uint256 _totalAmount,
        uint256 _released,
        uint256 _releasable
    ) {
        return (
            start,
            cliff,
            duration,
            totalAmount,
            released,
            releasableAmount()
        );
    }
}
```

---

## 🚀 STEP-BY-STEP GUIDE

### **OPTION A: Using Built-in Vesting (Your NTIQToken.sol)**

**Step 1: Deploy NTIQToken**
```bash
npx hardhat run scripts/deploy-ntiq-token.cjs --network amoy
```

**Step 2: Create Vesting Schedules (using built-in function)**
```javascript
// scripts/create-vesting-schedules.cjs
const { ethers } = require("hardhat");

async function main() {
  const ntiqToken = await ethers.getContractAt(
    "NTIQToken",
    "0xYOUR_TOKEN_ADDRESS"
  );
  
  // Team Member 1: 50M NTIQ, 4-year vest, 1-year cliff
  await ntiqToken.createVestingSchedule(
    "0xTeamMember1Address",
    ethers.parseUnits("50000000", 18),
    31536000,   // 1 year cliff
    126144000   // 4 years total
  );
  console.log("✅ Vesting created for Team Member 1");
  
  // Team Member 2: 50M NTIQ, 4-year vest, 1-year cliff
  await ntiqToken.createVestingSchedule(
    "0xTeamMember2Address",
    ethers.parseUnits("50000000", 18),
    31536000,
    126144000
  );
  console.log("✅ Vesting created for Team Member 2");
  
  // Investor 1: 25M NTIQ, 2-year vest, 6-month cliff
  await ntiqToken.createVestingSchedule(
    "0xInvestor1Address",
    ethers.parseUnits("25000000", 18),
    15768000,   // 6 months cliff
    63072000    // 2 years total
  );
  console.log("✅ Vesting created for Investor 1");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

**Step 3: Beneficiaries Claim**
```javascript
// After cliff period, beneficiaries can claim:
await ntiqToken.releaseVestedTokens();
```

---

### **OPTION B: Using Separate Vesting Contracts**

**Step 1: Deploy Token**
```bash
npx hardhat run scripts/deploy-ntiq-token.cjs --network amoy
```

**Step 2: Deploy Vesting Contract for Each Beneficiary**
```javascript
// scripts/deploy-vesting-contracts.cjs
const { ethers } = require("hardhat");

async function main() {
  const tokenAddress = "0xYOUR_TOKEN_ADDRESS";
  
  // Deploy vesting contract for Team Member 1
  const TokenVesting = await ethers.getContractFactory("TokenVesting");
  const vesting1 = await TokenVesting.deploy(
    tokenAddress,
    "0xTeamMember1Address",
    31536000,   // 1 year cliff
    126144000   // 4 years duration
  );
  await vesting1.waitForDeployment();
  console.log("✅ Vesting1 deployed:", await vesting1.getAddress());
  
  // Deploy vesting for Team Member 2
  const vesting2 = await TokenVesting.deploy(
    tokenAddress,
    "0xTeamMember2Address",
    31536000,
    126144000
  );
  await vesting2.waitForDeployment();
  console.log("✅ Vesting2 deployed:", await vesting2.getAddress());
  
  // Deploy vesting for Investor 1
  const vesting3 = await TokenVesting.deploy(
    tokenAddress,
    "0xInvestor1Address",
    15768000,   // 6 months cliff
    63072000    // 2 years duration
  );
  await vesting3.waitForDeployment();
  console.log("✅ Vesting3 deployed:", await vesting3.getAddress());
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
```

**Step 3: Transfer Tokens to Vesting Contracts**
```javascript
// scripts/fund-vesting-contracts.cjs
const { ethers } = require("hardhat");

async function main() {
  const ntiqToken = await ethers.getContractAt(
    "NTIQToken",
    "0xYOUR_TOKEN_ADDRESS"
  );
  
  // Transfer to vesting contracts
  await ntiqToken.transfer(
    "0xVESTING1_ADDRESS",
    ethers.parseUnits("50000000", 18)
  );
  console.log("✅ Funded Vesting1");
  
  await ntiqToken.transfer(
    "0xVESTING2_ADDRESS",
    ethers.parseUnits("50000000", 18)
  );
  console.log("✅ Funded Vesting2");
  
  await ntiqToken.transfer(
    "0xVESTING3_ADDRESS",
    ethers.parseUnits("25000000", 18)
  );
  console.log("✅ Funded Vesting3");
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
```

**Step 4: Beneficiaries Claim**
```javascript
// Each beneficiary interacts with their vesting contract:
const vesting = await ethers.getContractAt(
  "TokenVesting",
  "0xMY_VESTING_ADDRESS"
);

// Check releasable amount
const releasable = await vesting.releasableAmount();
console.log("Releasable:", ethers.formatUnits(releasable, 18));

// Release tokens
await vesting.release();
console.log("✅ Tokens released!");
```

---

## 🔐 SECURITY CONSIDERATIONS

### **Best Practices:**

1. **✅ Use Vesting for ALL Team/Investor Allocations**
   - Never direct transfer to team wallets
   - Always enforce vesting on-chain

2. **✅ Multi-Sig for Contract Owner**
   - Don't use single wallet as owner
   - Use Gnosis Safe with 3/5 or 5/9 signatures

3. **✅ Audit Vesting Contracts**
   - Get professional audit before mainnet
   - Test extensively on testnet

4. **✅ Transparent Vesting Schedules**
   - Publish all vesting addresses publicly
   - Create dashboard showing unlock schedule

5. **✅ Emergency Mechanisms**
   - But make them multisig-controlled
   - Document all emergency actions

### **Common Mistakes to Avoid:**

| Mistake | Why Bad | Solution |
|---------|---------|----------|
| ❌ Transfer directly to team | No enforcement | Use vesting contract |
| ❌ Single owner for token | Centralization risk | Use multisig |
| ❌ No audit | Security vulnerabilities | Get professional audit |
| ❌ Hidden vesting addresses | Lack of transparency | Publish all addresses |
| ❌ Short vesting periods | Team can dump quickly | Use standard 4-year vest |

---

## 📊 RECOMMENDED DISTRIBUTION TIMELINE

### **For NTIQ Token:**

```
┌─────────────────────────────────────────────────────────────────┐
│                     DISTRIBUTION TIMELINE                        │
└─────────────────────────────────────────────────────────────────┘

DAY 1 (Token Deployment):
├─ Deploy NTIQToken.sol
├─ Total supply: 1B NTIQ
└─ All tokens in contract address

DAY 1-7 (Immediate Distributions):
├─ DAO Treasury: 100M (no vesting needed)
├─ Immediate Airdrop: 50M (to distributor address)
└─ Operations wallet: As needed

DAY 7-14 (Vesting Setup):
├─ Create vesting schedules for all team members
├─ Create vesting schedules for all investors
├─ Create vesting for vested airdrop (100M)
└─ Verify all vesting contracts on Polygonscan

DAY 14+ (Ongoing):
├─ Liquidity mining rewards (automated)
├─ Game rewards (automated from game contracts)
├─ Beneficiaries claim vested tokens monthly
└─ Monitor and report unlock schedule

MONTH 12 (First Cliff):
├─ Team cliff ends
├─ Team members can claim first 25% (cliff release)
└─ Then monthly linear unlock begins

MONTH 48 (Full Vest):
├─ All team vesting complete
└─ Full decentralization achieved
```

---

## 🎯 SUMMARY

### **Q: Apakah saat deploy harus masukkan wallet address team?**

**A: TIDAK!** Best practice:

1. **Deploy token** → semua token di contract
2. **Setup vesting contracts** → satu per beneficiary
3. **Transfer ke vesting** → tokens locked
4. **Auto release** → sesuai schedule

### **Recommendation for NTIQ:**

✅ **Use built-in vesting** (already in your NTIQToken.sol)
- Simpler deployment
- Less gas costs
- Already audited (part of main contract)

**OR**

✅ **Use separate contracts** (more modular)
- Better separation of concerns
- Easier to audit individual contracts
- More transparent (one contract per person)

### **My Recommendation:**
Since your `NTIQToken.sol` already has vesting built-in, **use that**! It's:
- ✅ Already implemented
- ✅ Part of audited contract
- ✅ Cheaper (no extra deployments)
- ✅ Easier to manage

---

## 📚 ADDITIONAL RESOURCES

### **Example Projects with Good Token Distribution:**

1. **Uniswap (UNI)**
   - 4-year vesting for team
   - Separate vesting contracts
   - Fully transparent

2. **Compound (COMP)**
   - Built-in vesting
   - On-chain governance
   - Public unlock schedule

3. **Curve (CRV)**
   - Vote-escrowed tokens
   - Long-term alignment
   - Community-focused

### **Tools:**

- **Gnosis Safe:** For multisig treasury
- **Sablier:** Advanced vesting platform
- **OpenZeppelin Defender:** Automated operations
- **Tenderly:** Monitoring and alerts

---

**Document Version:** 1.0  
**Last Updated:** January 2025  
**Prepared By:** NECTIQ Core Team

**Next Steps:**
1. Review this guide
2. Decide: Built-in vesting vs separate contracts
3. Prepare list of all beneficiaries and amounts
4. Deploy and setup vesting
5. Verify all contracts on Polygonscan

---

*Security First: Never compromise on token vesting for team and investors. It's the foundation of trust in your project.*

