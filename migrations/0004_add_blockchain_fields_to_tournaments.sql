-- Add blockchain integration fields to survival_tournaments table
ALTER TABLE survival_tournaments 
ADD COLUMN blockchain_tournament_hash VARCHAR(66),
ADD COLUMN blockchain_distribute_hash VARCHAR(66),
ADD COLUMN blockchain_status VARCHAR(20) DEFAULT 'pending';

-- Add indexes for faster blockchain transaction lookups
CREATE INDEX idx_tournaments_blockchain_tournament_hash ON survival_tournaments(blockchain_tournament_hash);
CREATE INDEX idx_tournaments_blockchain_distribute_hash ON survival_tournaments(blockchain_distribute_hash);
CREATE INDEX idx_tournaments_blockchain_status ON survival_tournaments(blockchain_status);
