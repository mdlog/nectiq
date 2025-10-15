-- Add blockchain integration fields to prediction_battles table
ALTER TABLE prediction_battles 
ADD COLUMN blockchain_battle_hash VARCHAR(66),
ADD COLUMN blockchain_accept_hash VARCHAR(66),
ADD COLUMN blockchain_resolve_hash VARCHAR(66),
ADD COLUMN blockchain_status VARCHAR(20) DEFAULT 'pending';

-- Add indexes for faster blockchain transaction lookups
CREATE INDEX idx_battles_blockchain_battle_hash ON prediction_battles(blockchain_battle_hash);
CREATE INDEX idx_battles_blockchain_accept_hash ON prediction_battles(blockchain_accept_hash);
CREATE INDEX idx_battles_blockchain_resolve_hash ON prediction_battles(blockchain_resolve_hash);
CREATE INDEX idx_battles_blockchain_status ON prediction_battles(blockchain_status);
