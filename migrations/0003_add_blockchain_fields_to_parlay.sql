-- Add blockchain integration fields to parlay_predictions table
ALTER TABLE parlay_predictions 
ADD COLUMN blockchain_stake_hash VARCHAR(66),
ADD COLUMN blockchain_reward_hash VARCHAR(66),
ADD COLUMN blockchain_status VARCHAR(20) DEFAULT 'pending';

-- Add indexes for faster blockchain transaction lookups
CREATE INDEX idx_parlay_blockchain_stake_hash ON parlay_predictions(blockchain_stake_hash);
CREATE INDEX idx_parlay_blockchain_reward_hash ON parlay_predictions(blockchain_reward_hash);
CREATE INDEX idx_parlay_blockchain_status ON parlay_predictions(blockchain_status);
