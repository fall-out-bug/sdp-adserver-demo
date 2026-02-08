-- +migrate Down
-- Drop demo tables
DROP INDEX IF EXISTS idx_demo_slots_format;
DROP INDEX IF EXISTS idx_demo_slots_slot_id;
DROP TABLE IF EXISTS demo_slots;

DROP INDEX IF EXISTS idx_demo_banners_active;
DROP INDEX IF EXISTS idx_demo_banners_format;
DROP TABLE IF EXISTS demo_banners;
