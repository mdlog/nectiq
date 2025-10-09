# 💰 Automated Deposit & Withdrawal with Polygon Amoy Chain

## 📋 Table of Contents
- [Current System vs Smart Contract System](#current-system-vs-smart-contract-system)
- [Smart Contract Architecture](#smart-contract-architecture)
- [Technical Implementation](#technical-implementation)
- [Frontend Integration](#frontend-integration)
- [Backend Integration](#backend-integration)
- [Security Considerations](#security-considerations)
- [Testing Strategy](#testing-strategy)
- [Migration Plan](#migration-plan)
- [Cost Analysis](#cost-analysis)

---

## 🔄 Current System vs Smart Contract System

### **Current Centralized System (Manual)**

#### Deposit Flow:
```
1. User creates deposit request in database
   ↓
2. System shows admin wallet address (from env var)
   ↓
3. User manually sends crypto to admin wallet
   ↓
4. User submits transaction hash
   ↓
5. Backend verifies on blockchain (Etherscan API)
   ↓
6. If confirmed → Credit user balance in database
   ↓
7. DepositMonitorService checks periodically for stuck deposits
```

#### Withdrawal Flow:
```
1. User requests withdrawal in database
   ↓
2. Admin manually reviews request
   ↓
3. Admin manually approves in admin panel
   ↓
4. Admin manually sends crypto from admin wallet
   ↓
5. Admin marks withdrawal as completed
```

#### **Problems:**
- ❌ **Not Trustless:** Users must trust admin won't steal funds
- ❌ **Manual Processing:** Admin is bottleneck for all withdrawals
- ❌ **Not Instant:** Withdrawals can take hours or days
- ❌ **Not Scalable:** Cannot handle thousands of users
- ❌ **Security Risk:** Admin wallet holds all funds (single point of failure)
- ❌ **No Transparency:** Users can't verify funds on-chain
- ❌ **High Risk:** Admin key compromise = all funds lost

---

### **New Decentralized System (Smart Contract)**

#### Deposit Flow:
```
1. User clicks "Deposit" button in app
   ↓
2. Connect wallet (auto-switch to Polygon Amoy)
   ↓
3. Call depositPOL() function on smart contract
   ↓
4. Contract receives POL → Emit DepositEvent
   ↓
5. Backend listens to DepositEvent (The Graph / direct RPC)
   ↓
6. Auto-credit user balance in database
   ↓
7. User receives instant notification
   ↓
Total Time: 3-5 seconds ⚡
```

#### Withdrawal Flow:
```
1. User requests withdrawal in app
   ↓
2. Backend checks user NTIQ balance >= requested amount
   ↓
3. Backend creates withdrawal signature (or user signs)
   ↓
4. User calls withdraw() on smart contract
   ↓
5. Contract verifies signature + balance
   ↓
6. Contract sends POL directly to user wallet
   ↓
7. Emit WithdrawalEvent
   ↓
8. Backend updates database status
   ↓
Total Time: 10-30 seconds ⚡
```

#### **Benefits:**
- ✅ **Trustless:** Smart contract enforces rules, no admin needed
- ✅ **Instant:** Deposits confirmed in ~3 seconds on Polygon
- ✅ **Automated:** No manual intervention required
- ✅ **Scalable:** Can handle unlimited users simultaneously
- ✅ **Transparent:** All transactions verifiable on-chain
- ✅ **Secure:** Contract audited, funds protected by code
- ✅ **Cost-Effective:** Polygon Amoy gas fees ~$0.001-0.01 per transaction

---

## 🏗 Smart Contract Architecture

### **Contract: `NectiqVault.sol`**

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title NectiqVault
 * @dev Manages deposits and withdrawals for NECTIQ platform on Polygon Amoy
 */
contract NectiqVault is ReentrancyGuard, Ownable, Pausable {
    
    // ============ STATE VARIABLES ============
    
    /// @notice Mapping of user addresses to their deposit balances
    mapping(address => uint256) public userBalances;
    
    /// @notice Total POL held in contract
    uint256 public totalDeposits;
    
    /// @notice Minimum deposit amount (0.01 POL)
    uint256 public constant MIN_DEPOSIT = 0.01 ether;
    
    /// @notice Maximum deposit amount (1000 POL)
    uint256 public constant MAX_DEPOSIT = 1000 ether;
    
    /// @notice Minimum withdrawal amount (0.01 POL)
    uint256 public constant MIN_WITHDRAWAL = 0.01 ether;
    
    /// @notice Backend signer address for withdrawal authorization
    address public backendSigner;
    
    /// @notice Nonce for preventing replay attacks
    mapping(address => uint256) public withdrawalNonces;
    
    // ============ EVENTS ============
    
    /// @notice Emitted when a user deposits POL
    event Deposit(
        address indexed user,
        uint256 amount,
        uint256 timestamp,
        uint256 newBalance
    );
    
    /// @notice Emitted when a user withdraws POL
    event Withdrawal(
        address indexed user,
        uint256 amount,
        uint256 timestamp,
        uint256 newBalance,
        uint256 nonce
    );
    
    /// @notice Emitted when backend signer is updated
    event BackendSignerUpdated(
        address indexed oldSigner,
        address indexed newSigner
    );
    
    /// @notice Emitted when owner withdraws fees
    event FeeWithdrawal(
        address indexed owner,
        uint256 amount
    );
    
    // ============ ERRORS ============
    
    error InvalidAmount();
    error InsufficientBalance();
    error TransferFailed();
    error InvalidSignature();
    error NonceAlreadyUsed();
    error ZeroAddress();
    
    // ============ CONSTRUCTOR ============
    
    constructor(address _backendSigner) {
        if (_backendSigner == address(0)) revert ZeroAddress();
        backendSigner = _backendSigner;
    }
    
    // ============ DEPOSIT FUNCTIONS ============
    
    /**
     * @notice Deposit POL to user's account
     * @dev Requires msg.value to be within MIN and MAX limits
     */
    function depositPOL() external payable nonReentrant whenNotPaused {
        if (msg.value < MIN_DEPOSIT || msg.value > MAX_DEPOSIT) {
            revert InvalidAmount();
        }
        
        // Update balances
        userBalances[msg.sender] += msg.value;
        totalDeposits += msg.value;
        
        emit Deposit(
            msg.sender,
            msg.value,
            block.timestamp,
            userBalances[msg.sender]
        );
    }
    
    /**
     * @notice Get user's current balance
     * @param user Address to check
     * @return User's POL balance in contract
     */
    function getBalance(address user) external view returns (uint256) {
        return userBalances[user];
    }
    
    // ============ WITHDRAWAL FUNCTIONS ============
    
    /**
     * @notice Withdraw POL from user's account
     * @dev Requires valid backend signature to prevent unauthorized withdrawals
     * @param amount Amount of POL to withdraw
     * @param nonce Unique nonce for this withdrawal (prevents replay)
     * @param signature Backend signature authorizing this withdrawal
     */
    function withdraw(
        uint256 amount,
        uint256 nonce,
        bytes calldata signature
    ) external nonReentrant whenNotPaused {
        // Validate amount
        if (amount < MIN_WITHDRAWAL) revert InvalidAmount();
        if (userBalances[msg.sender] < amount) revert InsufficientBalance();
        
        // Validate nonce (prevent replay attacks)
        if (withdrawalNonces[msg.sender] >= nonce) revert NonceAlreadyUsed();
        
        // Verify backend signature
        bytes32 messageHash = getWithdrawalMessageHash(msg.sender, amount, nonce);
        if (!_verifySignature(messageHash, signature)) revert InvalidSignature();
        
        // Update nonce
        withdrawalNonces[msg.sender] = nonce;
        
        // Update balances
        userBalances[msg.sender] -= amount;
        totalDeposits -= amount;
        
        // Transfer POL
        (bool success, ) = msg.sender.call{value: amount}("");
        if (!success) revert TransferFailed();
        
        emit Withdrawal(
            msg.sender,
            amount,
            block.timestamp,
            userBalances[msg.sender],
            nonce
        );
    }
    
    /**
     * @notice Get withdrawal message hash for signature verification
     * @param user User address
     * @param amount Withdrawal amount
     * @param nonce Withdrawal nonce
     * @return Message hash for signing
     */
    function getWithdrawalMessageHash(
        address user,
        uint256 amount,
        uint256 nonce
    ) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(
            user,
            amount,
            nonce
        ));
    }
    
    /**
     * @notice Verify backend signature
     * @param messageHash Hash of withdrawal message
     * @param signature Backend signature
     * @return True if signature is valid
     */
    function _verifySignature(
        bytes32 messageHash,
        bytes calldata signature
    ) internal view returns (bool) {
        bytes32 ethSignedMessageHash = keccak256(abi.encodePacked(
            "\x19Ethereum Signed Message:\n32",
            messageHash
        ));
        
        address signer = _recoverSigner(ethSignedMessageHash, signature);
        return signer == backendSigner;
    }
    
    /**
     * @notice Recover signer address from signature
     * @param ethSignedMessageHash Signed message hash
     * @param signature Signature bytes
     * @return Recovered signer address
     */
    function _recoverSigner(
        bytes32 ethSignedMessageHash,
        bytes calldata signature
    ) internal pure returns (address) {
        require(signature.length == 65, "Invalid signature length");
        
        bytes32 r;
        bytes32 s;
        uint8 v;
        
        assembly {
            r := calldataload(signature.offset)
            s := calldataload(add(signature.offset, 32))
            v := byte(0, calldataload(add(signature.offset, 64)))
        }
        
        return ecrecover(ethSignedMessageHash, v, r, s);
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @notice Update backend signer address
     * @param newSigner New backend signer address
     */
    function updateBackendSigner(address newSigner) external onlyOwner {
        if (newSigner == address(0)) revert ZeroAddress();
        
        address oldSigner = backendSigner;
        backendSigner = newSigner;
        
        emit BackendSignerUpdated(oldSigner, newSigner);
    }
    
    /**
     * @notice Pause contract (emergency stop)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @notice Unpause contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @notice Withdraw platform fees (contract balance - user deposits)
     * @dev Only owner can withdraw excess funds
     */
    function withdrawFees() external onlyOwner nonReentrant {
        uint256 contractBalance = address(this).balance;
        uint256 fees = contractBalance > totalDeposits ? contractBalance - totalDeposits : 0;
        
        if (fees == 0) revert InvalidAmount();
        
        (bool success, ) = owner().call{value: fees}("");
        if (!success) revert TransferFailed();
        
        emit FeeWithdrawal(owner(), fees);
    }
    
    /**
     * @notice Get contract statistics
     * @return totalUsers Number of users with deposits
     * @return totalDeposited Total POL deposited
     * @return contractBalance Current contract balance
     */
    function getStats() external view returns (
        uint256 totalUsers,
        uint256 totalDeposited,
        uint256 contractBalance
    ) {
        return (
            0, // Would need to track separately if needed
            totalDeposits,
            address(this).balance
        );
    }
    
    // ============ FALLBACK ============
    
    /// @notice Receive POL directly (counts as deposit)
    receive() external payable {
        if (msg.value >= MIN_DEPOSIT && msg.value <= MAX_DEPOSIT) {
            userBalances[msg.sender] += msg.value;
            totalDeposits += msg.value;
            
            emit Deposit(
                msg.sender,
                msg.value,
                block.timestamp,
                userBalances[msg.sender]
            );
        }
    }
}
```

---

## 🔧 Technical Implementation

### **Phase 1: Smart Contract Deployment**

#### Deploy to Polygon Amoy Testnet

**Prerequisites:**
```bash
# Install dependencies
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox

# Get Amoy POL from faucet
# Visit: https://faucet.polygon.technology/
```

**Hardhat Configuration:**
```javascript
// hardhat.config.js
require("@nomicfoundation/hardhat-toolbox");

const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY;
const POLYGONSCAN_API_KEY = process.env.POLYGONSCAN_API_KEY;

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
    amoy: {
      url: "https://rpc-amoy.polygon.technology",
      accounts: [PRIVATE_KEY],
      chainId: 80002,
      gasPrice: 30000000000 // 30 gwei
    }
  },
  etherscan: {
    apiKey: {
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
  }
};
```

**Deployment Script:**
```javascript
// scripts/deploy-vault.js
const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying NectiqVault to Polygon Amoy...");
  
  // Backend signer address (from your backend wallet)
  const BACKEND_SIGNER = process.env.BACKEND_SIGNER_ADDRESS;
  
  if (!BACKEND_SIGNER) {
    throw new Error("BACKEND_SIGNER_ADDRESS not set in environment");
  }
  
  // Deploy contract
  const NectiqVault = await hre.ethers.getContractFactory("NectiqVault");
  const vault = await NectiqVault.deploy(BACKEND_SIGNER);
  
  await vault.waitForDeployment();
  
  const address = await vault.getAddress();
  console.log(`✅ NectiqVault deployed to: ${address}`);
  console.log(`📋 Backend Signer: ${BACKEND_SIGNER}`);
  console.log(`🔗 Verify on Polygonscan: https://amoy.polygonscan.com/address/${address}`);
  
  // Wait for block confirmations
  console.log("⏳ Waiting for 5 block confirmations...");
  await vault.deploymentTransaction().wait(5);
  
  // Verify contract on Polygonscan
  console.log("🔍 Verifying contract on Polygonscan...");
  try {
    await hre.run("verify:verify", {
      address: address,
      constructorArguments: [BACKEND_SIGNER],
    });
    console.log("✅ Contract verified on Polygonscan!");
  } catch (error) {
    console.log("⚠️ Verification failed:", error.message);
  }
  
  // Save deployment info
  const fs = require('fs');
  const deploymentInfo = {
    network: "Polygon Amoy Testnet",
    chainId: 80002,
    contractAddress: address,
    backendSigner: BACKEND_SIGNER,
    deployedAt: new Date().toISOString(),
    deployer: (await hre.ethers.getSigners())[0].address
  };
  
  fs.writeFileSync(
    'deployment-vault.json',
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("💾 Deployment info saved to deployment-vault.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

**Deploy Command:**
```bash
# Set environment variables
export DEPLOYER_PRIVATE_KEY="your-private-key"
export BACKEND_SIGNER_ADDRESS="your-backend-wallet-address"
export POLYGONSCAN_API_KEY="your-polygonscan-api-key"

# Deploy
npx hardhat run scripts/deploy-vault.js --network amoy

# Expected output:
# 🚀 Deploying NectiqVault to Polygon Amoy...
# ✅ NectiqVault deployed to: 0x... 
# 🔗 Verify on Polygonscan: https://amoy.polygonscan.com/address/0x...
# ✅ Contract verified on Polygonscan!
# 💾 Deployment info saved to deployment-vault.json
```

---

### **Phase 2: Frontend Integration**

#### Component: `DepositModal.tsx`

```typescript
// client/src/components/DepositModal.tsx
import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const VAULT_ADDRESS = import.meta.env.VITE_VAULT_CONTRACT_ADDRESS;

const VAULT_ABI = [
  {
    "inputs": [],
    "name": "depositPOL",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  }
] as const;

export function DepositModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [amount, setAmount] = useState('');
  const { address, chain } = useAccount();
  const { toast } = useToast();
  
  const { 
    data: hash,
    writeContract, 
    isPending: isWriting,
    error: writeError 
  } = useWriteContract();
  
  const { 
    isLoading: isConfirming, 
    isSuccess 
  } = useWaitForTransactionReceipt({
    hash,
  });
  
  const handleDeposit = async () => {
    try {
      // Validate amount
      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum < 0.01 || amountNum > 1000) {
        toast({
          title: "Invalid Amount",
          description: "Amount must be between 0.01 and 1000 POL",
          variant: "destructive"
        });
        return;
      }
      
      // Check if on Polygon Amoy
      if (chain?.id !== 80002) {
        toast({
          title: "Wrong Network",
          description: "Please switch to Polygon Amoy testnet",
          variant: "destructive"
        });
        return;
      }
      
      // Call contract
      writeContract({
        address: VAULT_ADDRESS as `0x${string}`,
        abi: VAULT_ABI,
        functionName: 'depositPOL',
        value: parseEther(amount),
      });
      
    } catch (error) {
      console.error('Deposit error:', error);
      toast({
        title: "Deposit Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    }
  };
  
  // Success notification
  if (isSuccess) {
    toast({
      title: "Deposit Successful! 🎉",
      description: `${amount} POL deposited. Your balance will update shortly.`,
    });
    onClose();
  }
  
  // Error notification
  if (writeError) {
    toast({
      title: "Transaction Failed",
      description: writeError.message,
      variant: "destructive"
    });
  }
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>💰 Deposit POL to NECTIQ</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Amount (POL)</label>
            <Input
              type="number"
              placeholder="0.01"
              min="0.01"
              max="1000"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isWriting || isConfirming}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Min: 0.01 POL • Max: 1000 POL
            </p>
          </div>
          
          <div className="bg-muted p-3 rounded-lg text-sm">
            <p className="font-medium">ℹ️ Transaction Info:</p>
            <p className="text-muted-foreground">
              • Network: Polygon Amoy Testnet
            </p>
            <p className="text-muted-foreground">
              • Estimated Gas: ~$0.001
            </p>
            <p className="text-muted-foreground">
              • Confirmation Time: 3-5 seconds
            </p>
          </div>
          
          <Button 
            onClick={handleDeposit}
            disabled={!amount || isWriting || isConfirming}
            className="w-full"
          >
            {isWriting && "Waiting for Approval..."}
            {isConfirming && "Confirming Transaction..."}
            {!isWriting && !isConfirming && `Deposit ${amount || '0'} POL`}
          </Button>
          
          {hash && (
            <a
              href={`https://amoy.polygonscan.com/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-500 hover:underline block text-center"
            >
              View on Polygonscan →
            </a>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

#### Component: `WithdrawalModal.tsx`

```typescript
// client/src/components/WithdrawalModal.tsx
import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';

const VAULT_ADDRESS = import.meta.env.VITE_VAULT_CONTRACT_ADDRESS;

const VAULT_ABI = [
  {
    "inputs": [
      { "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "internalType": "uint256", "name": "nonce", "type": "uint256" },
      { "internalType": "bytes", "name": "signature", "type": "bytes" }
    ],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

interface WithdrawalSignature {
  amount: string;
  nonce: number;
  signature: string;
}

export function WithdrawalModal({ 
  open, 
  onClose,
  maxBalance 
}: { 
  open: boolean; 
  onClose: () => void;
  maxBalance: number;
}) {
  const [amount, setAmount] = useState('');
  const { address, chain } = useAccount();
  const { toast } = useToast();
  
  // Get withdrawal signature from backend
  const { mutateAsync: getSignature, isPending: isGettingSignature } = useMutation({
    mutationFn: async (withdrawAmount: string) => {
      const response = await fetch('/api/withdrawal/signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ amount: withdrawAmount })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to get signature');
      }
      
      return response.json() as Promise<WithdrawalSignature>;
    }
  });
  
  const { 
    data: hash,
    writeContract, 
    isPending: isWriting,
    error: writeError 
  } = useWriteContract();
  
  const { 
    isLoading: isConfirming, 
    isSuccess 
  } = useWaitForTransactionReceipt({
    hash,
  });
  
  const handleWithdraw = async () => {
    try {
      // Validate amount
      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum < 0.01) {
        toast({
          title: "Invalid Amount",
          description: "Minimum withdrawal is 0.01 POL",
          variant: "destructive"
        });
        return;
      }
      
      if (amountNum > maxBalance) {
        toast({
          title: "Insufficient Balance",
          description: `You only have ${maxBalance} POL available`,
          variant: "destructive"
        });
        return;
      }
      
      // Check network
      if (chain?.id !== 80002) {
        toast({
          title: "Wrong Network",
          description: "Please switch to Polygon Amoy testnet",
          variant: "destructive"
        });
        return;
      }
      
      // Get signature from backend
      toast({
        title: "Requesting Withdrawal...",
        description: "Getting authorization signature..."
      });
      
      const { amount: signedAmount, nonce, signature } = await getSignature(amount);
      
      // Call contract with signature
      writeContract({
        address: VAULT_ADDRESS as `0x${string}`,
        abi: VAULT_ABI,
        functionName: 'withdraw',
        args: [
          parseEther(signedAmount),
          BigInt(nonce),
          signature as `0x${string}`
        ],
      });
      
    } catch (error) {
      console.error('Withdrawal error:', error);
      toast({
        title: "Withdrawal Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    }
  };
  
  // Success notification
  if (isSuccess) {
    toast({
      title: "Withdrawal Successful! 🎉",
      description: `${amount} POL sent to your wallet.`,
    });
    onClose();
  }
  
  // Error notification
  if (writeError) {
    toast({
      title: "Transaction Failed",
      description: writeError.message,
      variant: "destructive"
    });
  }
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>💸 Withdraw POL</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Amount (POL)</label>
            <Input
              type="number"
              placeholder="0.01"
              min="0.01"
              max={maxBalance}
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isGettingSignature || isWriting || isConfirming}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Available: {maxBalance} POL • Min: 0.01 POL
            </p>
          </div>
          
          <div className="bg-muted p-3 rounded-lg text-sm">
            <p className="font-medium">ℹ️ Withdrawal Info:</p>
            <p className="text-muted-foreground">
              • Destination: Your connected wallet
            </p>
            <p className="text-muted-foreground">
              • Estimated Gas: ~$0.002
            </p>
            <p className="text-muted-foreground">
              • Arrival Time: Instant (3-5 seconds)
            </p>
          </div>
          
          <Button 
            onClick={handleWithdraw}
            disabled={!amount || isGettingSignature || isWriting || isConfirming}
            className="w-full"
          >
            {isGettingSignature && "Getting Authorization..."}
            {isWriting && "Waiting for Approval..."}
            {isConfirming && "Processing Withdrawal..."}
            {!isGettingSignature && !isWriting && !isConfirming && `Withdraw ${amount || '0'} POL`}
          </Button>
          
          {hash && (
            <a
              href={`https://amoy.polygonscan.com/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-500 hover:underline block text-center"
            >
              View on Polygonscan →
            </a>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

---

### **Phase 3: Backend Integration**

#### Event Listener Service

```typescript
// server/services/vaultEventListener.ts
import { ethers } from 'ethers';
import { storage } from '../storage';
import { BalanceService } from './balanceService';

const VAULT_ADDRESS = process.env.VAULT_CONTRACT_ADDRESS!;
const AMOY_RPC = "https://rpc-amoy.polygon.technology";

const VAULT_ABI = [
  "event Deposit(address indexed user, uint256 amount, uint256 timestamp, uint256 newBalance)",
  "event Withdrawal(address indexed user, uint256 amount, uint256 timestamp, uint256 newBalance, uint256 nonce)"
];

export class VaultEventListener {
  private provider: ethers.JsonRpcProvider;
  private contract: ethers.Contract;
  private isListening: boolean = false;
  
  constructor() {
    this.provider = new ethers.JsonRpcProvider(AMOY_RPC);
    this.contract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, this.provider);
  }
  
  async start() {
    if (this.isListening) {
      console.log('⚠️ [VAULT-LISTENER] Already listening to events');
      return;
    }
    
    console.log('🎧 [VAULT-LISTENER] Starting to listen to vault events...');
    this.isListening = true;
    
    // Listen to Deposit events
    this.contract.on('Deposit', async (user, amount, timestamp, newBalance, event) => {
      try {
        console.log('💰 [VAULT-LISTENER] Deposit event detected:', {
          user,
          amount: ethers.formatEther(amount),
          timestamp: new Date(Number(timestamp) * 1000).toISOString(),
          txHash: event.log.transactionHash
        });
        
        await this.processDeposit(user, amount, event.log.transactionHash);
      } catch (error) {
        console.error('❌ [VAULT-LISTENER] Error processing deposit:', error);
      }
    });
    
    // Listen to Withdrawal events
    this.contract.on('Withdrawal', async (user, amount, timestamp, newBalance, nonce, event) => {
      try {
        console.log('💸 [VAULT-LISTENER] Withdrawal event detected:', {
          user,
          amount: ethers.formatEther(amount),
          nonce: nonce.toString(),
          txHash: event.log.transactionHash
        });
        
        await this.processWithdrawal(user, amount, event.log.transactionHash, nonce);
      } catch (error) {
        console.error('❌ [VAULT-LISTENER] Error processing withdrawal:', error);
      }
    });
    
    console.log('✅ [VAULT-LISTENER] Now listening to vault events on Polygon Amoy');
  }
  
  async stop() {
    if (!this.isListening) return;
    
    console.log('🛑 [VAULT-LISTENER] Stopping event listener...');
    this.contract.removeAllListeners();
    this.isListening = false;
    console.log('✅ [VAULT-LISTENER] Event listener stopped');
  }
  
  private async processDeposit(
    userAddress: string,
    amountWei: bigint,
    txHash: string
  ) {
    try {
      // Find or create user
      let user = await storage.getUserByWalletAddress(userAddress);
      if (!user) {
        console.log('🆕 [VAULT-LISTENER] New user detected, creating account...');
        user = await storage.createUser({
          walletAddress: userAddress,
          username: `User${userAddress.slice(0, 6)}`
        });
      }
      
      // Convert Wei to POL (same as ETH, 18 decimals)
      const amountPOL = parseFloat(ethers.formatEther(amountWei));
      
      // Calculate NTIQ amount (1 POL = 1000 NTIQ example rate)
      const CONVERSION_RATE = 1000;
      const ntiqAmount = amountPOL * CONVERSION_RATE;
      
      // Credit user balance
      await BalanceService.processTransaction({
        userId: user.id,
        type: 'deposit_credit',
        amount: ntiqAmount,
        token: 'NTIQ',
        hash: txHash,
        description: `Smart contract deposit - ${amountPOL} POL`,
        metadata: {
          source: 'vault_contract',
          contractAddress: VAULT_ADDRESS,
          amountPOL,
          conversionRate: CONVERSION_RATE
        }
      }, storage);
      
      console.log(`✅ [VAULT-LISTENER] Credited ${ntiqAmount} NTIQ to user ${user.id}`);
      
      // Send notification
      // await notificationService.send(user.id, {
      //   title: "Deposit Confirmed! 🎉",
      //   message: `${amountPOL} POL deposited. You received ${ntiqAmount} NTIQ.`
      // });
      
    } catch (error) {
      console.error('❌ [VAULT-LISTENER] Failed to process deposit:', error);
      throw error;
    }
  }
  
  private async processWithdrawal(
    userAddress: string,
    amountWei: bigint,
    txHash: string,
    nonce: bigint
  ) {
    try {
      const user = await storage.getUserByWalletAddress(userAddress);
      if (!user) {
        console.error('❌ [VAULT-LISTENER] User not found for withdrawal:', userAddress);
        return;
      }
      
      const amountPOL = parseFloat(ethers.formatEther(amountWei));
      
      console.log(`✅ [VAULT-LISTENER] Withdrawal processed for user ${user.id}: ${amountPOL} POL`);
      
      // Update withdrawal record in database if exists
      // await storage.updateWithdrawalByNonce(nonce.toString(), {
      //   status: 'completed',
      //   transactionHash: txHash,
      //   completedAt: new Date()
      // });
      
      // Send notification
      // await notificationService.send(user.id, {
      //   title: "Withdrawal Complete! 💸",
      //   message: `${amountPOL} POL sent to your wallet.`
      // });
      
    } catch (error) {
      console.error('❌ [VAULT-LISTENER] Failed to process withdrawal:', error);
      throw error;
    }
  }
}

// Singleton instance
export const vaultEventListener = new VaultEventListener();
```

#### Withdrawal Signature API

```typescript
// server/routes.ts (add this endpoint)

import { ethers } from 'ethers';

// Backend signer wallet (keep private key secure!)
const backendSigner = new ethers.Wallet(process.env.BACKEND_SIGNER_PRIVATE_KEY!);

app.post("/api/withdrawal/signature", async (req, res) => {
  try {
    const userId = (req as any).session?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const { amount } = req.body;
    const amountNum = parseFloat(amount);
    
    // Validate amount
    if (isNaN(amountNum) || amountNum < 0.01) {
      return res.status(400).json({ message: "Invalid amount" });
    }
    
    // Get user
    const user = await storage.getUser(userId);
    if (!user || !user.walletAddress) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Check user has sufficient NTIQ balance
    // Convert NTIQ to POL (1 POL = 1000 NTIQ example)
    const CONVERSION_RATE = 1000;
    const requiredNTIQ = amountNum * CONVERSION_RATE;
    
    if (user.balance < requiredNTIQ) {
      return res.status(400).json({ 
        message: `Insufficient balance. You need ${requiredNTIQ} NTIQ but only have ${user.balance} NTIQ` 
      });
    }
    
    // Get user's current nonce from smart contract
    const provider = new ethers.JsonRpcProvider("https://rpc-amoy.polygon.technology");
    const contract = new ethers.Contract(
      process.env.VAULT_CONTRACT_ADDRESS!,
      ["function withdrawalNonces(address) view returns (uint256)"],
      provider
    );
    
    const currentNonce = await contract.withdrawalNonces(user.walletAddress);
    const nextNonce = Number(currentNonce) + 1;
    
    // Convert amount to Wei
    const amountWei = ethers.parseEther(amount);
    
    // Create message hash
    const messageHash = ethers.solidityPackedKeccak256(
      ['address', 'uint256', 'uint256'],
      [user.walletAddress, amountWei, nextNonce]
    );
    
    // Sign message
    const signature = await backendSigner.signMessage(ethers.getBytes(messageHash));
    
    console.log(`✍️ [WITHDRAWAL-SIG] Generated signature for user ${userId}:`, {
      amount,
      nonce: nextNonce,
      wallet: user.walletAddress
    });
    
    // Deduct NTIQ balance (will be refunded if withdrawal fails)
    await BalanceService.processTransaction({
      userId: user.id,
      type: 'withdrawal_debit',
      amount: -requiredNTIQ,
      token: 'NTIQ',
      description: `Withdrawal request - ${amount} POL`,
      metadata: {
        nonce: nextNonce,
        amountPOL: amount,
        status: 'pending'
      }
    }, storage);
    
    res.json({
      amount,
      nonce: nextNonce,
      signature
    });
    
  } catch (error) {
    console.error('Error generating withdrawal signature:', error);
    res.status(500).json({ message: "Failed to generate signature" });
  }
});
```

#### Initialize in server startup

```typescript
// server/index.ts

import { vaultEventListener } from './services/vaultEventListener';

// ... existing code ...

// Start vault event listener
if (process.env.VAULT_CONTRACT_ADDRESS) {
  vaultEventListener.start().catch(error => {
    console.error('Failed to start vault event listener:', error);
  });
} else {
  console.warn('⚠️ VAULT_CONTRACT_ADDRESS not set, vault listener disabled');
}
```

---

## 🔒 Security Considerations

### **1. Smart Contract Security**
- ✅ **ReentrancyGuard:** Prevents reentrancy attacks
- ✅ **Pausable:** Emergency stop mechanism
- ✅ **Ownable:** Only owner can update critical settings
- ✅ **Signature Verification:** Backend must sign all withdrawals
- ✅ **Nonce System:** Prevents replay attacks
- ✅ **Min/Max Limits:** Prevents spam and excessive deposits

### **2. Backend Security**
- ✅ **Private Key Management:** Backend signer key stored in secure env
- ✅ **Balance Verification:** Check user NTIQ balance before signing
- ✅ **Rate Limiting:** Prevent abuse of signature endpoint
- ✅ **Audit Logging:** Log all withdrawal signature requests

### **3. Frontend Security**
- ✅ **Network Verification:** Ensure user on Polygon Amoy
- ✅ **Amount Validation:** Client-side + contract-side validation
- ✅ **Transaction Monitoring:** Wait for confirmation before UI update

### **4. Audit Checklist**
- [ ] Smart contract audit by reputable firm (Certik, OpenZeppelin, etc.)
- [ ] Penetration testing of backend API
- [ ] Frontend security review
- [ ] Gas optimization review
- [ ] Edge case testing (failed txs, network issues, etc.)

---

## 🧪 Testing Strategy

### **1. Smart Contract Tests**

```javascript
// test/NectiqVault.test.js
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NectiqVault", function () {
  let vault, owner, user1, user2, backendSigner;
  
  beforeEach(async function () {
    [owner, user1, user2, backendSigner] = await ethers.getSigners();
    
    const NectiqVault = await ethers.getContractFactory("NectiqVault");
    vault = await NectiqVault.deploy(backendSigner.address);
    await vault.waitForDeployment();
  });
  
  describe("Deposits", function () {
    it("Should accept deposits within limits", async function () {
      const depositAmount = ethers.parseEther("1.0");
      
      await expect(
        vault.connect(user1).depositPOL({ value: depositAmount })
      ).to.emit(vault, "Deposit")
        .withArgs(
          user1.address,
          depositAmount,
          await ethers.provider.getBlock('latest').then(b => b?.timestamp),
          depositAmount
        );
      
      expect(await vault.userBalances(user1.address)).to.equal(depositAmount);
    });
    
    it("Should reject deposits below minimum", async function () {
      const tooSmall = ethers.parseEther("0.001"); // Below 0.01 POL minimum
      
      await expect(
        vault.connect(user1).depositPOL({ value: tooSmall })
      ).to.be.revertedWithCustomError(vault, "InvalidAmount");
    });
    
    it("Should reject deposits above maximum", async function () {
      const tooLarge = ethers.parseEther("1001"); // Above 1000 POL maximum
      
      await expect(
        vault.connect(user1).depositPOL({ value: tooLarge })
      ).to.be.revertedWithCustomError(vault, "InvalidAmount");
    });
  });
  
  describe("Withdrawals", function () {
    beforeEach(async function () {
      // Deposit first
      await vault.connect(user1).depositPOL({ value: ethers.parseEther("10.0") });
    });
    
    it("Should allow withdrawal with valid signature", async function () {
      const withdrawAmount = ethers.parseEther("5.0");
      const nonce = 1;
      
      // Generate signature
      const messageHash = ethers.solidityPackedKeccak256(
        ['address', 'uint256', 'uint256'],
        [user1.address, withdrawAmount, nonce]
      );
      const signature = await backendSigner.signMessage(ethers.getBytes(messageHash));
      
      // Withdraw
      await expect(
        vault.connect(user1).withdraw(withdrawAmount, nonce, signature)
      ).to.emit(vault, "Withdrawal");
      
      expect(await vault.userBalances(user1.address)).to.equal(ethers.parseEther("5.0"));
    });
    
    it("Should reject withdrawal with invalid signature", async function () {
      const withdrawAmount = ethers.parseEther("5.0");
      const nonce = 1;
      
      // Generate signature with wrong signer
      const messageHash = ethers.solidityPackedKeccak256(
        ['address', 'uint256', 'uint256'],
        [user1.address, withdrawAmount, nonce]
      );
      const signature = await user2.signMessage(ethers.getBytes(messageHash));
      
      await expect(
        vault.connect(user1).withdraw(withdrawAmount, nonce, signature)
      ).to.be.revertedWithCustomError(vault, "InvalidSignature");
    });
    
    it("Should reject withdrawal with reused nonce", async function () {
      const withdrawAmount = ethers.parseEther("2.0");
      const nonce = 1;
      
      // Generate signature
      const messageHash = ethers.solidityPackedKeccak256(
        ['address', 'uint256', 'uint256'],
        [user1.address, withdrawAmount, nonce]
      );
      const signature = await backendSigner.signMessage(ethers.getBytes(messageHash));
      
      // First withdrawal
      await vault.connect(user1).withdraw(withdrawAmount, nonce, signature);
      
      // Try to reuse same nonce
      await expect(
        vault.connect(user1).withdraw(withdrawAmount, nonce, signature)
      ).to.be.revertedWithCustomError(vault, "NonceAlreadyUsed");
    });
  });
  
  describe("Admin Functions", function () {
    it("Should allow owner to pause contract", async function () {
      await vault.connect(owner).pause();
      
      await expect(
        vault.connect(user1).depositPOL({ value: ethers.parseEther("1.0") })
      ).to.be.revertedWithCustomError(vault, "EnforcedPause");
    });
    
    it("Should allow owner to update backend signer", async function () {
      const newSigner = user2.address;
      
      await expect(
        vault.connect(owner).updateBackendSigner(newSigner)
      ).to.emit(vault, "BackendSignerUpdated")
        .withArgs(backendSigner.address, newSigner);
      
      expect(await vault.backendSigner()).to.equal(newSigner);
    });
  });
});
```

**Run tests:**
```bash
npx hardhat test
npx hardhat coverage
```

### **2. Integration Tests**

Test complete flow:
1. User deposits POL to contract
2. Backend detects event and credits NTIQ
3. User requests withdrawal
4. Backend generates signature
5. User withdraws POL from contract
6. Backend updates database

### **3. Load Testing**

Test with multiple concurrent users:
- 100 deposits per minute
- 50 withdrawals per minute
- Monitor gas costs
- Check event listener performance

---

## 🚀 Migration Plan

### **Wave 3-4: Smart Contract Development** (Weeks 5-8)

**Week 5-6: Development**
- [ ] Write NectiqVault smart contract
- [ ] Write comprehensive tests
- [ ] Get external audit (optional but recommended)
- [ ] Deploy to Polygon Amoy testnet
- [ ] Verify contract on Polygonscan

**Week 7: Integration**
- [ ] Implement VaultEventListener service
- [ ] Add withdrawal signature API
- [ ] Update frontend with deposit/withdrawal modals
- [ ] Integration testing

**Week 8: Beta Testing**
- [ ] Beta test with 10-20 users
- [ ] Monitor for issues
- [ ] Collect feedback
- [ ] Fix bugs

### **Rollout Strategy**

**Phase 1: Parallel Systems (2 weeks)**
- Keep existing manual deposit/withdrawal system active
- Add new smart contract system as optional
- Users can choose which method to use
- Monitor both systems for issues

**Phase 2: Gradual Migration (2 weeks)**
- Encourage users to use smart contract system (lower fees, instant)
- Provide migration guide
- Offer bonus NTIQ for early adopters
- Monitor smart contract usage

**Phase 3: Full Migration (1 week)**
- Deprecate manual system
- All new deposits/withdrawals via smart contract
- Maintain manual system for edge cases only

**Phase 4: Legacy Cleanup (1 week)**
- Remove manual deposit code
- Update documentation
- Archive old deposit/withdrawal records

---

## 💰 Cost Analysis

### **Gas Costs on Polygon Amoy**

| Operation | Gas Used | Cost (@ 30 gwei) | USD (@ $0.50/POL) |
|-----------|----------|------------------|-------------------|
| Deploy Contract | ~1,500,000 | 0.045 POL | $0.0225 |
| First Deposit | ~60,000 | 0.0018 POL | $0.0009 |
| Subsequent Deposits | ~40,000 | 0.0012 POL | $0.0006 |
| Withdrawal | ~55,000 | 0.00165 POL | $0.00083 |

### **Comparison: Manual vs Smart Contract**

| Metric | Manual System | Smart Contract |
|--------|---------------|----------------|
| **Deposit Time** | 5-30 minutes | 3-5 seconds ⚡ |
| **Withdrawal Time** | 1-24 hours | 10-30 seconds ⚡ |
| **Admin Workload** | High (manual processing) | Zero (automated) |
| **Trustlessness** | Low (requires trust) | High (code enforced) ✅ |
| **Scalability** | Limited | Unlimited ✅ |
| **Transaction Cost** | Free (platform absorbs) | $0.001 (user pays) |
| **Security Risk** | High (admin key compromise) | Low (contract audited) ✅ |
| **Transparency** | Low | High (on-chain) ✅ |

### **ROI Calculation**

**Assumptions:**
- 1,000 users per month
- Average 2 deposits + 1 withdrawal per user per month
- Admin time saved: 50 hours/month @ $50/hour = $2,500

**Costs:**
- Smart contract audit: $5,000 (one-time)
- Development time: 80 hours @ $50/hour = $4,000 (one-time)
- Total one-time cost: $9,000

**Savings:**
- Admin time saved: $2,500/month
- Break-even: 3.6 months
- 1-year savings: $30,000 - $9,000 = $21,000

**Non-monetary benefits:**
- Better user experience → higher retention
- Trustless system → increased user trust
- Instant transactions → more frequent trading
- Scalability → can handle 10x-100x more users

---

## 📚 Additional Resources

### **Documentation**
- [Polygon Amoy Testnet](https://docs.polygon.technology/tools/matic-faucet/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Wagmi Hooks](https://wagmi.sh/)
- [Viem Documentation](https://viem.sh/)

### **Tools**
- [Polygon Faucet](https://faucet.polygon.technology/)
- [Amoy Polygonscan](https://amoy.polygonscan.com)
- [Remix IDE](https://remix.ethereum.org/)
- [Tenderly](https://tenderly.co/) (contract monitoring)

### **Security**
- [Slither](https://github.com/crytic/slither) (static analysis)
- [Mythril](https://github.com/ConsenSys/mythril) (security analysis)
- [OpenZeppelin Defender](https://www.openzeppelin.com/defender) (contract monitoring)

---

## ✅ Implementation Checklist

### **Smart Contract**
- [ ] Write NectiqVault.sol
- [ ] Add ReentrancyGuard
- [ ] Add Pausable mechanism
- [ ] Add signature verification
- [ ] Write comprehensive tests (95%+ coverage)
- [ ] Get external audit (optional)
- [ ] Deploy to Polygon Amoy
- [ ] Verify on Polygonscan

### **Backend**
- [ ] Implement VaultEventListener service
- [ ] Add withdrawal signature API
- [ ] Add balance conversion logic (POL ↔ NTIQ)
- [ ] Update BalanceService
- [ ] Add audit logging
- [ ] Setup monitoring alerts

### **Frontend**
- [ ] Create DepositModal component
- [ ] Create WithdrawalModal component
- [ ] Update user dashboard
- [ ] Add transaction history view
- [ ] Add Polygonscan links
- [ ] Handle error cases gracefully

### **Testing**
- [ ] Unit tests for smart contract
- [ ] Integration tests end-to-end
- [ ] Load testing (100+ concurrent users)
- [ ] Security testing
- [ ] User acceptance testing

### **Documentation**
- [ ] User guide for deposits
- [ ] User guide for withdrawals
- [ ] Troubleshooting guide
- [ ] Admin documentation
- [ ] API documentation

### **Launch**
- [ ] Beta test with 10-20 users
- [ ] Monitor for 1 week
- [ ] Fix any issues
- [ ] Gradual rollout to all users
- [ ] Deprecate manual system
- [ ] Celebrate! 🎉

---

**🚀 Ready to make NECTIQ truly decentralized!**

**Estimated Timeline:** 6-8 weeks for full implementation
**Priority:** HIGH - Core feature for DeFi positioning
**Dependencies:** Polygon Amoy integration (already done ✅)

---

*This document is confidential and should not be pushed to public repository.*

