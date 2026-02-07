-- Rollback: Drop clicks table
DROP INDEX IF EXISTS idx_clicks_timestamp;
DROP INDEX IF EXISTS idx_clicks_banner_id;
DROP INDEX IF EXISTS idx_clicks_impression_id;
DROP TABLE IF EXISTS clicks;
