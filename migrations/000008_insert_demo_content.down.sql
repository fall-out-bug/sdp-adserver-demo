-- +migrate Down
-- Delete demo slots
DELETE FROM demo_slots WHERE slot_id LIKE 'demo-%';

-- Delete demo banners
DELETE FROM demo_banners WHERE name LIKE '%Demo%';
