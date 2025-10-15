-- Add blockchain integration fields to predictions table
ALTER TABLE predictions 
ADD COLUMN blockchain_stake_hash VARCHAR(66),
ADD COLUMN blockchain_reward_hash VARCHAR(66),
ADD COLUMN blockchain_status VARCHAR(20) DEFAULT 'pending';

-- Add index for faster blockchain transaction lookups
CREATE INDEX idx_predictions_blockchain_stake_hash ON predictions(blockchain_stake_hash);
CREATE INDEX idx_predictions_blockchain_reward_hash ON predictions(blockchain_reward_hash);
CREATE INDEX idx_predictions_blockchain_status ON predictions(blockchain_status);
