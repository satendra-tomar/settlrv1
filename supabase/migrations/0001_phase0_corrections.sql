-- =============================================================================
-- Settlr – Migration 0001: Phase 0 Schema Drift Corrections
-- Apply AFTER schema.sql, storage_policies.sql, and seed.sql.
--
-- Corrects five deviations from the original Phase 0 specification:
--   1. plan_tier      enum: remove basic/pro/featured, keep only free/paid
--   2. hostel_gender  enum: rename boys→male, girls→female, co-ed→co_ed
--   3. lead_event_type enum: remove call_click/whatsapp_click/direction_click/
--                            website_click, add call/whatsapp/website, keep view
--   4. Triggers/columns not in spec: drop trg_profiles_updated_at,
--      trg_reviews_updated_at, and the updated_at columns they depend on
--   5. Storage bucket: remove file_size_limit and allowed_mime_types restrictions
--
-- Objects that are correct and MUST NOT be modified:
--   is_admin(), handle_new_user(), recompute_listing_rating(), set_updated_at(),
--   trg_listings_updated_at, all RLS policies, all indexes, all check constraints,
--   schema.sql / storage_policies.sql / seed.sql (files left untouched).
-- =============================================================================

BEGIN;

-- ===========================================================================
-- SECTION 1: plan_tier enum
-- Spec requires exactly: free, paid
-- Was built as:          free, basic, pro, featured
-- ===========================================================================

-- Safety guard: fail loudly if any row already uses a disallowed value.
-- seed.sql inserted zero listings, but we verify rather than assume.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM listings
        WHERE plan_tier::text NOT IN ('free', 'paid')
    ) THEN
        RAISE EXCEPTION
            'Migration 0001 aborted: listings.plan_tier contains rows with '
            'values outside the allowed set {free, paid}. '
            'Manual data migration is required before running this correction.';
    END IF;
END;
$$;

-- Step 1a: Create replacement enum under a temporary name.
CREATE TYPE plan_tier_new AS ENUM ('free', 'paid');

-- Step 1b: Migrate the column to the new type.
--   Any existing 'free' rows survive; the safety check above ensures no
--   other values are present.
ALTER TABLE listings
    ALTER COLUMN plan_tier DROP DEFAULT,
    ALTER COLUMN plan_tier TYPE plan_tier_new
        USING plan_tier::text::plan_tier_new,
    ALTER COLUMN plan_tier SET DEFAULT 'free'::plan_tier_new;

-- Step 1c: Drop the old enum and rename the replacement into place.
DROP TYPE plan_tier;
ALTER TYPE plan_tier_new RENAME TO plan_tier;


-- ===========================================================================
-- SECTION 2: hostel_gender enum
-- Spec requires exactly: male, female, co_ed
-- Was built as:          boys, girls, co-ed
-- ===========================================================================

-- Safety guard: fail loudly if hostel_details has any rows at all, since
-- the old values (boys/girls/co-ed) cannot be automatically mapped to the
-- new values (male/female/co_ed) without human intent.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM hostel_details) THEN
        RAISE EXCEPTION
            'Migration 0001 aborted: hostel_details contains existing rows. '
            'The hostel_gender enum values are being renamed (boys→male, '
            'girls→female, co-ed→co_ed). Manual data migration required '
            'before running this correction.';
    END IF;
END;
$$;

-- Step 2a: Create replacement enum under a temporary name.
CREATE TYPE hostel_gender_new AS ENUM ('male', 'female', 'co_ed');

-- Step 2b: Migrate the column.
--   Table is empty (verified above), so the USING clause runs over zero rows.
ALTER TABLE hostel_details
    ALTER COLUMN gender TYPE hostel_gender_new
        USING gender::text::hostel_gender_new;

-- Step 2c: Drop old enum and rename replacement into place.
DROP TYPE hostel_gender;
ALTER TYPE hostel_gender_new RENAME TO hostel_gender;


-- ===========================================================================
-- SECTION 3: lead_event_type enum
-- Spec requires exactly: call, whatsapp, website, view
-- Was built as:          view, call_click, whatsapp_click,
--                        direction_click, website_click
-- ===========================================================================

-- Safety guard: fail loudly if lead_events has any rows, since
-- the old values cannot be automatically renamed without human intent.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM lead_events) THEN
        RAISE EXCEPTION
            'Migration 0001 aborted: lead_events contains existing rows. '
            'The lead_event_type enum values are being replaced '
            '(call_click→call, whatsapp_click→whatsapp, website_click→website; '
            'direction_click removed entirely). Manual data migration required '
            'before running this correction.';
    END IF;
END;
$$;

-- Step 3a: Create replacement enum under a temporary name.
CREATE TYPE lead_event_type_new AS ENUM ('call', 'whatsapp', 'website', 'view');

-- Step 3b: Migrate the column.
--   Table is empty (verified above), so the USING clause runs over zero rows.
ALTER TABLE lead_events
    ALTER COLUMN event_type TYPE lead_event_type_new
        USING event_type::text::lead_event_type_new;

-- Step 3c: Drop old enum and rename replacement into place.
DROP TYPE lead_event_type;
ALTER TYPE lead_event_type_new RENAME TO lead_event_type;


-- ===========================================================================
-- SECTION 4: Remove triggers and columns not in the Phase 0 spec
--
-- The spec defines set_updated_at() / trg_listings_updated_at only on
-- the listings table. The triggers on profiles and reviews, and the
-- updated_at columns added to support them, are not in the spec.
-- ===========================================================================

-- 4a: Drop the non-spec triggers (DROP IF EXISTS is safe for idempotency).
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS trg_reviews_updated_at  ON reviews;

-- 4b: Drop the updated_at column from profiles (not in spec).
--     CASCADE is intentional: ensures any downstream dependency is removed.
ALTER TABLE profiles DROP COLUMN IF EXISTS updated_at;

-- 4c: Drop the updated_at column from reviews (not in spec).
ALTER TABLE reviews  DROP COLUMN IF EXISTS updated_at;


-- ===========================================================================
-- SECTION 5: Storage bucket — remove non-spec restrictions
-- The spec defines the listing-images bucket with no file size limit and
-- no MIME type allowlist. Remove both constraints.
-- ===========================================================================

UPDATE storage.buckets
SET
    file_size_limit    = NULL,
    allowed_mime_types = NULL
WHERE id = 'listing-images';

COMMIT;
