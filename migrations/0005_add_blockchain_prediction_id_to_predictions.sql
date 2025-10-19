-- Add blockchain_prediction_id field to predictions table
ALTER TABLE predictions ADD COLUMN blockchain_prediction_id VARCHAR(66);

-- Add comment for clarity
COMMENT ON COLUMN predictions.blockchain_prediction_id IS 'Prediction ID used in smart contract for blockchain operations';
