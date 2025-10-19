-- Add blockchain_battle_id field to prediction_battles table
ALTER TABLE prediction_battles ADD COLUMN blockchain_battle_id VARCHAR(66);

-- Add blockchain_parlay_id field to parlay_predictions table
ALTER TABLE parlay_predictions ADD COLUMN blockchain_parlay_id VARCHAR(66);

-- Add comments for clarity
COMMENT ON COLUMN prediction_battles.blockchain_battle_id IS 'Battle ID used in smart contract for blockchain operations';
COMMENT ON COLUMN parlay_predictions.blockchain_parlay_id IS 'Parlay ID used in smart contract for blockchain operations';
