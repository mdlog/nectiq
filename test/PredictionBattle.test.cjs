const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PredictionBattle", function () {
  let ntiq, priceOracle, predictionBattle;
  let owner, user1, user2, oracle;
  
  const ONE_HOUR = 3600;
  const INITIAL_PRICE = ethers.utils.parseEther("43000"); // $43,000
  const PREDICTED_PRICE = ethers.utils.parseEther("45000"); // $45,000
  const STAKE_AMOUNT = ethers.utils.parseEther("100"); // 100 NTIQ
  
  beforeEach(async function () {
    [owner, user1, user2, oracle] = await ethers.getSigners();
    
    // Deploy NTIQ Token
    const NTIQ = await ethers.getContractFactory("NTIQ");
    ntiq = await NTIQ.deploy();
    await ntiq.deployed();
    
    // Deploy Price Oracle
    const PriceOracle = await ethers.getContractFactory("PriceOracle");
    priceOracle = await PriceOracle.deploy();
    await priceOracle.deployed();
    
    // Deploy Prediction Battle
    const PredictionBattle = await ethers.getContractFactory("PredictionBattle");
    predictionBattle = await PredictionBattle.deploy(ntiq.address, priceOracle.address);
    await predictionBattle.deployed();
    
    // Setup
    await priceOracle.setAuthorizedFeeder(oracle.address, true);
    await priceOracle.updatePrice("bitcoin", INITIAL_PRICE);
    
    // Give users some NTIQ tokens
    await ntiq.transfer(user1.address, ethers.utils.parseEther("1000"));
    await ntiq.transfer(user2.address, ethers.utils.parseEther("1000"));
    
    // Approve prediction battle to spend user tokens
    await ntiq.connect(user1).approve(predictionBattle.address, ethers.utils.parseEther("1000"));
    await ntiq.connect(user2).approve(predictionBattle.address, ethers.utils.parseEther("1000"));
  });
  
  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await predictionBattle.owner()).to.equal(owner.address);
    });
    
    it("Should set the right stake token", async function () {
      expect(await predictionBattle.stakeToken()).to.equal(ntiq.address);
    });
    
    it("Should set the right price oracle", async function () {
      expect(await predictionBattle.priceOracle()).to.equal(priceOracle.address);
    });
  });
  
  describe("Submit Prediction", function () {
    it("Should allow users to submit predictions", async function () {
      await expect(
        predictionBattle.connect(user1).submitPrediction(
          "bitcoin",
          PREDICTED_PRICE,
          STAKE_AMOUNT,
          ONE_HOUR
        )
      ).to.emit(predictionBattle, "PredictionSubmitted");
      
      const prediction = await predictionBattle.getPrediction(1);
      expect(prediction.user).to.equal(user1.address);
      expect(prediction.cryptocurrency).to.equal("bitcoin");
      expect(prediction.predictedPrice).to.equal(PREDICTED_PRICE);
      expect(prediction.stakeAmount).to.equal(STAKE_AMOUNT);
    });
    
    it("Should fail with invalid stake amount", async function () {
      await expect(
        predictionBattle.connect(user1).submitPrediction(
          "bitcoin",
          PREDICTED_PRICE,
          ethers.utils.parseEther("0.5"), // Below minimum
          ONE_HOUR
        )
      ).to.be.revertedWith("Invalid stake amount");
    });
    
    it("Should fail with invalid duration", async function () {
      await expect(
        predictionBattle.connect(user1).submitPrediction(
          "bitcoin",
          PREDICTED_PRICE,
          STAKE_AMOUNT,
          1800 // 30 minutes - invalid
        )
      ).to.be.revertedWith("Invalid duration");
    });
    
    it("Should transfer stake tokens from user", async function () {
      const userBalanceBefore = await ntiq.balanceOf(user1.address);
      const contractBalanceBefore = await ntiq.balanceOf(predictionBattle.address);
      
      await predictionBattle.connect(user1).submitPrediction(
        "bitcoin",
        PREDICTED_PRICE,
        STAKE_AMOUNT,
        ONE_HOUR
      );
      
      const userBalanceAfter = await ntiq.balanceOf(user1.address);
      const contractBalanceAfter = await ntiq.balanceOf(predictionBattle.address);
      
      expect(userBalanceAfter).to.equal(userBalanceBefore.sub(STAKE_AMOUNT));
      expect(contractBalanceAfter).to.equal(contractBalanceBefore.add(STAKE_AMOUNT));
    });
  });
  
  describe("Resolve Prediction", function () {
    beforeEach(async function () {
      await predictionBattle.connect(user1).submitPrediction(
        "bitcoin",
        PREDICTED_PRICE,
        STAKE_AMOUNT,
        ONE_HOUR
      );
    });
    
    it("Should allow oracle to resolve predictions", async function () {
      // Fast forward time
      await ethers.provider.send("evm_increaseTime", [ONE_HOUR + 1]);
      await ethers.provider.send("evm_mine");
      
      const actualPrice = ethers.utils.parseEther("44000"); // $44,000
      
      await expect(
        predictionBattle.connect(oracle).resolvePrediction(1, actualPrice)
      ).to.emit(predictionBattle, "PredictionResolved");
      
      const prediction = await predictionBattle.getPrediction(1);
      expect(prediction.resolved).to.be.true;
      expect(prediction.actualPrice).to.equal(actualPrice);
    });
    
    it("Should fail to resolve before expiry", async function () {
      const actualPrice = ethers.utils.parseEther("44000");
      
      await expect(
        predictionBattle.connect(oracle).resolvePrediction(1, actualPrice)
      ).to.be.revertedWith("Prediction not expired");
    });
    
    it("Should fail if not oracle or owner", async function () {
      await ethers.provider.send("evm_increaseTime", [ONE_HOUR + 1]);
      await ethers.provider.send("evm_mine");
      
      const actualPrice = ethers.utils.parseEther("44000");
      
      await expect(
        predictionBattle.connect(user2).resolvePrediction(1, actualPrice)
      ).to.be.revertedWith("Only oracle or owner");
    });
  });
  
  describe("Claim Reward", function () {
    beforeEach(async function () {
      await predictionBattle.connect(user1).submitPrediction(
        "bitcoin",
        PREDICTED_PRICE, // $45,000
        STAKE_AMOUNT,
        ONE_HOUR
      );
      
      // Fast forward time
      await ethers.provider.send("evm_increaseTime", [ONE_HOUR + 1]);
      await ethers.provider.send("evm_mine");
    });
    
    it("Should allow users to claim rewards for accurate predictions", async function () {
      // Actual price close to prediction (within 1% = 3x multiplier)
      const actualPrice = ethers.utils.parseEther("44550"); // $44,550 (~1% error)
      
      await predictionBattle.connect(oracle).resolvePrediction(1, actualPrice);
      
      const userBalanceBefore = await ntiq.balanceOf(user1.address);
      
      await expect(
        predictionBattle.connect(user1).claimReward(1)
      ).to.emit(predictionBattle, "RewardClaimed");
      
      const userBalanceAfter = await ntiq.balanceOf(user1.address);
      const prediction = await predictionBattle.getPrediction(1);
      
      expect(prediction.claimed).to.be.true;
      expect(userBalanceAfter).to.be.gt(userBalanceBefore);
    });
    
    it("Should return stake for inaccurate predictions", async function () {
      // Very inaccurate prediction
      const actualPrice = ethers.utils.parseEther("40000"); // $40,000 (~11% error)
      
      await predictionBattle.connect(oracle).resolvePrediction(1, actualPrice);
      
      const userBalanceBefore = await ntiq.balanceOf(user1.address);
      
      await predictionBattle.connect(user1).claimReward(1);
      
      const userBalanceAfter = await ntiq.balanceOf(user1.address);
      const prediction = await predictionBattle.getPrediction(1);
      
      expect(prediction.claimed).to.be.true;
      // Should get stake back (1x multiplier)
      expect(userBalanceAfter).to.equal(userBalanceBefore.add(STAKE_AMOUNT));
    });
    
    it("Should fail if not prediction owner", async function () {
      const actualPrice = ethers.utils.parseEther("44000");
      await predictionBattle.connect(oracle).resolvePrediction(1, actualPrice);
      
      await expect(
        predictionBattle.connect(user2).claimReward(1)
      ).to.be.revertedWith("Not your prediction");
    });
    
    it("Should fail if already claimed", async function () {
      const actualPrice = ethers.utils.parseEther("44000");
      await predictionBattle.connect(oracle).resolvePrediction(1, actualPrice);
      
      await predictionBattle.connect(user1).claimReward(1);
      
      await expect(
        predictionBattle.connect(user1).claimReward(1)
      ).to.be.revertedWith("Already claimed");
    });
  });
  
  describe("Accuracy Calculation", function () {
    it("Should calculate perfect accuracy (5x multiplier)", async function () {
      const predictedPrice = ethers.utils.parseEther("45000");
      const actualPrice = ethers.utils.parseEther("45040"); // 0.089% error
      
      await predictionBattle.connect(user1).submitPrediction(
        "bitcoin",
        predictedPrice,
        STAKE_AMOUNT,
        ONE_HOUR
      );
      
      await ethers.provider.send("evm_increaseTime", [ONE_HOUR + 1]);
      await ethers.provider.send("evm_mine");
      
      await predictionBattle.connect(oracle).resolvePrediction(1, actualPrice);
      
      const prediction = await predictionBattle.getPrediction(1);
      // Should get 5x multiplier for perfect accuracy
      expect(prediction.rewardAmount).to.equal(STAKE_AMOUNT.mul(5));
    });
    
    it("Should calculate high accuracy (3x multiplier)", async function () {
      const predictedPrice = ethers.utils.parseEther("45000");
      const actualPrice = ethers.utils.parseEther("44550"); // ~1% error
      
      await predictionBattle.connect(user1).submitPrediction(
        "bitcoin",
        predictedPrice,
        STAKE_AMOUNT,
        ONE_HOUR
      );
      
      await ethers.provider.send("evm_increaseTime", [ONE_HOUR + 1]);
      await ethers.provider.send("evm_mine");
      
      await predictionBattle.connect(oracle).resolvePrediction(1, actualPrice);
      
      const prediction = await predictionBattle.getPrediction(1);
      // Should get 3x multiplier for high accuracy
      expect(prediction.rewardAmount).to.equal(STAKE_AMOUNT.mul(3));
    });
  });
  
  describe("Batch Operations", function () {
    it("Should batch resolve multiple predictions", async function () {
      // Submit multiple predictions
      await predictionBattle.connect(user1).submitPrediction(
        "bitcoin",
        ethers.utils.parseEther("45000"),
        STAKE_AMOUNT,
        ONE_HOUR
      );
      
      await predictionBattle.connect(user2).submitPrediction(
        "ethereum",
        ethers.utils.parseEther("2700"),
        STAKE_AMOUNT,
        ONE_HOUR
      );
      
      await ethers.provider.send("evm_increaseTime", [ONE_HOUR + 1]);
      await ethers.provider.send("evm_mine");
      
      await predictionBattle.connect(oracle).batchResolvePredictions(
        [1, 2],
        [ethers.utils.parseEther("44000"), ethers.utils.parseEther("2650")]
      );
      
      const prediction1 = await predictionBattle.getPrediction(1);
      const prediction2 = await predictionBattle.getPrediction(2);
      
      expect(prediction1.resolved).to.be.true;
      expect(prediction2.resolved).to.be.true;
    });
  });
  
  describe("Statistics", function () {
    it("Should return correct contract statistics", async function () {
      await predictionBattle.connect(user1).submitPrediction(
        "bitcoin",
        PREDICTED_PRICE,
        STAKE_AMOUNT,
        ONE_HOUR
      );
      
      await predictionBattle.connect(user2).submitPrediction(
        "ethereum",
        ethers.utils.parseEther("2700"),
        STAKE_AMOUNT,
        ONE_HOUR
      );
      
      const stats = await predictionBattle.getStats();
      expect(stats.totalPredictions).to.equal(2);
      expect(stats.totalStaked).to.equal(STAKE_AMOUNT.mul(2));
    });
  });
});