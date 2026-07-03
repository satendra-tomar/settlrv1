-- =============================================================================
-- Settlr – Migration 0002: Listing Write RPC Functions
-- Apply AFTER migration 0001.
--
-- Adds two SECURITY DEFINER functions callable via Supabase RPC:
--   • create_listing_with_details(payload jsonb) RETURNS uuid
--   • update_listing_with_details(payload jsonb) RETURNS void
--
-- These are the only permitted schema changes in Phase 1.
-- No tables, enums, RLS policies, indexes, or existing objects are modified.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- create_listing_with_details
--
-- Payload fields (all common unless noted):
--   id              uuid        (optional – client may pre-generate)
--   type            text        'coaching' | 'hostel'
--   city_id         uuid
--   name            text
--   slug            text        (optional – generated from name+id if absent)
--   area            text
--   address         text        (optional)
--   phone           text
--   whatsapp        text        (optional)
--   website         text        (optional – stored in website_url column)
--   description     text        (optional)
--   plan_tier       text        'free' | 'paid'
--   is_active       boolean     (default true for admin-created listings)
--   is_verified     boolean     (default false)
--   amenity_ids     uuid[]      JSON array of amenity UUIDs
--
--   coaching-specific:
--     exam_types    text[]      stored in coaching_details.subjects
--     founded_year  integer     stored in coaching_details.established_year
--     faculty_count integer     stored in coaching_details.faculty_count
--
--   hostel-specific:
--     gender        text        'male' | 'female' | 'co_ed'
--     rent_min      integer
--     rent_max      integer
--     food_included boolean
--
-- Returns: the listing uuid
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION create_listing_with_details(payload JSONB)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_id           UUID;
    v_type         listing_type;
    v_slug         TEXT;
    v_amenity_ids  UUID[];
BEGIN
    -- -----------------------------------------------------------------------
    -- Auth check
    -- -----------------------------------------------------------------------
    IF NOT is_admin() THEN
        RAISE EXCEPTION 'create_listing_with_details: caller is not an admin';
    END IF;

    -- -----------------------------------------------------------------------
    -- Resolve listing id and type
    -- -----------------------------------------------------------------------
    v_id   := COALESCE(NULLIF(payload->>'id', '')::UUID, gen_random_uuid());
    v_type := (payload->>'type')::listing_type;

    -- -----------------------------------------------------------------------
    -- Generate slug: use provided value or derive from name + id prefix
    -- -----------------------------------------------------------------------
    v_slug := COALESCE(
        NULLIF(trim(payload->>'slug'), ''),
        regexp_replace(lower(trim(payload->>'name')), '[^a-z0-9]+', '-', 'g')
            || '-' || substring(v_id::text, 1, 8)
    );

    -- -----------------------------------------------------------------------
    -- Resolve amenity_ids JSON array → UUID array
    -- -----------------------------------------------------------------------
    SELECT array_agg(elem::UUID)
    INTO   v_amenity_ids
    FROM   jsonb_array_elements_text(
               COALESCE(payload->'amenity_ids', '[]'::jsonb)
           ) AS t(elem)
    WHERE  elem IS NOT NULL AND elem <> '';

    -- -----------------------------------------------------------------------
    -- Insert into listings
    -- -----------------------------------------------------------------------
    INSERT INTO listings (
        id,
        type,
        city_id,
        name,
        slug,
        area,
        address,
        phone,
        whatsapp,
        website_url,
        description,
        plan_tier,
        is_active,
        is_verified
    ) VALUES (
        v_id,
        v_type,
        (payload->>'city_id')::UUID,
        payload->>'name',
        v_slug,
        NULLIF(payload->>'area', ''),
        NULLIF(payload->>'address', ''),
        NULLIF(payload->>'phone', ''),
        NULLIF(payload->>'whatsapp', ''),
        NULLIF(payload->>'website', ''),
        NULLIF(payload->>'description', ''),
        COALESCE(NULLIF(payload->>'plan_tier', '')::plan_tier, 'free'),
        COALESCE((payload->>'is_active')::BOOLEAN, true),
        COALESCE((payload->>'is_verified')::BOOLEAN, false)
    );

    -- -----------------------------------------------------------------------
    -- Insert type-specific detail row
    -- -----------------------------------------------------------------------
    IF v_type = 'coaching' THEN
        INSERT INTO coaching_details (
            listing_id,
            subjects,          -- exam_types from payload maps here
            established_year,  -- founded_year from payload maps here
            faculty_count
        ) VALUES (
            v_id,
            ARRAY(
                SELECT jsonb_array_elements_text(
                    COALESCE(payload->'exam_types', '[]'::jsonb)
                )
            ),
            NULLIF(payload->>'founded_year', '')::INTEGER,
            NULLIF(payload->>'faculty_count', '')::INTEGER
        );

    ELSIF v_type = 'hostel' THEN
        INSERT INTO hostel_details (
            listing_id,
            gender,
            rent_min,
            rent_max,
            food_included
        ) VALUES (
            v_id,
            (payload->>'gender')::hostel_gender,
            NULLIF(payload->>'rent_min', '')::INTEGER,
            NULLIF(payload->>'rent_max', '')::INTEGER,
            COALESCE((payload->>'food_included')::BOOLEAN, false)
        );
    END IF;

    -- -----------------------------------------------------------------------
    -- Sync amenities (delete-then-insert is safe here: listing is brand new)
    -- -----------------------------------------------------------------------
    DELETE FROM listing_amenities WHERE listing_id = v_id;

    IF v_amenity_ids IS NOT NULL AND array_length(v_amenity_ids, 1) > 0 THEN
        INSERT INTO listing_amenities (listing_id, amenity_id)
        SELECT v_id, unnest(v_amenity_ids)
        ON CONFLICT DO NOTHING;
    END IF;

    RETURN v_id;

EXCEPTION
    WHEN OTHERS THEN
        -- Re-raise so the entire transaction rolls back
        RAISE;
END;
$$;


-- ---------------------------------------------------------------------------
-- update_listing_with_details
--
-- Payload fields:
--   id              uuid        REQUIRED – identifies the row to update
--   (type is IMMUTABLE and never updated by this function)
--   All other fields same as create_listing_with_details payload.
--
-- Returns: void
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_listing_with_details(payload JSONB)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_id           UUID;
    v_type         listing_type;
    v_amenity_ids  UUID[];
BEGIN
    -- -----------------------------------------------------------------------
    -- Auth check
    -- -----------------------------------------------------------------------
    IF NOT is_admin() THEN
        RAISE EXCEPTION 'update_listing_with_details: caller is not an admin';
    END IF;

    v_id := (payload->>'id')::UUID;
    IF v_id IS NULL THEN
        RAISE EXCEPTION 'update_listing_with_details: payload must include "id"';
    END IF;

    -- -----------------------------------------------------------------------
    -- Look up the immutable type for this listing
    -- -----------------------------------------------------------------------
    SELECT type INTO v_type FROM listings WHERE id = v_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'update_listing_with_details: listing % not found', v_id;
    END IF;

    -- -----------------------------------------------------------------------
    -- Resolve amenity_ids
    -- -----------------------------------------------------------------------
    SELECT array_agg(elem::UUID)
    INTO   v_amenity_ids
    FROM   jsonb_array_elements_text(
               COALESCE(payload->'amenity_ids', '[]'::jsonb)
           ) AS t(elem)
    WHERE  elem IS NOT NULL AND elem <> '';

    -- -----------------------------------------------------------------------
    -- Update listings row (type is intentionally excluded)
    -- -----------------------------------------------------------------------
    UPDATE listings SET
        city_id     = COALESCE(NULLIF(payload->>'city_id', '')::UUID,   city_id),
        name        = COALESCE(NULLIF(payload->>'name', ''),             name),
        area        = NULLIF(payload->>'area', ''),
        address     = NULLIF(payload->>'address', ''),
        phone       = NULLIF(payload->>'phone', ''),
        whatsapp    = NULLIF(payload->>'whatsapp', ''),
        website_url = NULLIF(payload->>'website', ''),
        description = NULLIF(payload->>'description', ''),
        plan_tier   = COALESCE(
                          NULLIF(payload->>'plan_tier', '')::plan_tier,
                          plan_tier
                      ),
        is_active   = COALESCE(
                          (payload->>'is_active')::BOOLEAN,
                          is_active
                      ),
        is_verified = COALESCE(
                          (payload->>'is_verified')::BOOLEAN,
                          is_verified
                      )
    WHERE id = v_id;

    -- -----------------------------------------------------------------------
    -- Upsert type-specific detail row
    -- -----------------------------------------------------------------------
    IF v_type = 'coaching' THEN
        INSERT INTO coaching_details (
            listing_id,
            subjects,
            established_year,
            faculty_count
        ) VALUES (
            v_id,
            ARRAY(
                SELECT jsonb_array_elements_text(
                    COALESCE(payload->'exam_types', '[]'::jsonb)
                )
            ),
            NULLIF(payload->>'founded_year', '')::INTEGER,
            NULLIF(payload->>'faculty_count', '')::INTEGER
        )
        ON CONFLICT (listing_id) DO UPDATE SET
            subjects         = EXCLUDED.subjects,
            established_year = EXCLUDED.established_year,
            faculty_count    = EXCLUDED.faculty_count;

    ELSIF v_type = 'hostel' THEN
        INSERT INTO hostel_details (
            listing_id,
            gender,
            rent_min,
            rent_max,
            food_included
        ) VALUES (
            v_id,
            (payload->>'gender')::hostel_gender,
            NULLIF(payload->>'rent_min', '')::INTEGER,
            NULLIF(payload->>'rent_max', '')::INTEGER,
            COALESCE((payload->>'food_included')::BOOLEAN, false)
        )
        ON CONFLICT (listing_id) DO UPDATE SET
            gender        = EXCLUDED.gender,
            rent_min      = EXCLUDED.rent_min,
            rent_max      = EXCLUDED.rent_max,
            food_included = EXCLUDED.food_included;
    END IF;

    -- -----------------------------------------------------------------------
    -- Sync amenities
    -- -----------------------------------------------------------------------
    DELETE FROM listing_amenities WHERE listing_id = v_id;

    IF v_amenity_ids IS NOT NULL AND array_length(v_amenity_ids, 1) > 0 THEN
        INSERT INTO listing_amenities (listing_id, amenity_id)
        SELECT v_id, unnest(v_amenity_ids)
        ON CONFLICT DO NOTHING;
    END IF;

EXCEPTION
    WHEN OTHERS THEN
        RAISE;
END;
$$;
