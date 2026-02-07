-- Rollback: Drop campaigns table
DROP INDEX IF EXISTS idx_campaigns_dates;
DROP INDEX IF EXISTS idx_campaigns_status;
DROP TABLE IF EXISTS campaigns;
