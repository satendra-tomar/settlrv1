-- =============================================================================
-- Settlr – Phase 0: Seed Data
-- Apply this file AFTER schema.sql and storage_policies.sql.
--
-- Seeds ONLY:
--   • cities     — exactly one row: Indore
--   • amenities  — exactly eight standard amenities
--
-- NO listings, reviews, ratings, or any fabricated data are seeded here.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Cities
-- ---------------------------------------------------------------------------
INSERT INTO cities (name, state)
VALUES ('Indore', 'Madhya Pradesh')
ON CONFLICT (name) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Amenities — eight standard amenities
-- ---------------------------------------------------------------------------
INSERT INTO amenities (name)
VALUES
    ('WiFi'),
    ('AC'),
    ('Mess'),
    ('Power Backup'),
    ('Library'),
    ('CCTV'),
    ('Laundry'),
    ('Parking')
ON CONFLICT (name) DO NOTHING;
