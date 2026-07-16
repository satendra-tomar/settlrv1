-- =============================================================================
-- Settlr – Migration 0003: Add Listing Features to Detail Tables
-- Apply AFTER migration 0002.
--
-- Adds new columns to coaching_details and hostel_details to support
-- Pros, Cons, and numeric Experience Scores, replacing Phase 2.5A placeholders.
-- Ensures full backward compatibility.
-- =============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. coaching_details modifications
-- ---------------------------------------------------------------------------
ALTER TABLE coaching_details
    ADD COLUMN IF NOT EXISTS pros text[] DEFAULT '{}'::text[],
    ADD COLUMN IF NOT EXISTS cons text[] DEFAULT '{}'::text[],
    ADD COLUMN IF NOT EXISTS teaching_score numeric(3,1),
    ADD COLUMN IF NOT EXISTS notes_score numeric(3,1),
    ADD COLUMN IF NOT EXISTS test_series_score numeric(3,1),
    ADD COLUMN IF NOT EXISTS doubt_support_score numeric(3,1),
    ADD COLUMN IF NOT EXISTS competition_score numeric(3,1),
    ADD COLUMN IF NOT EXISTS personal_attention_score numeric(3,1);

-- ---------------------------------------------------------------------------
-- 2. hostel_details modifications
-- ---------------------------------------------------------------------------
ALTER TABLE hostel_details
    ADD COLUMN IF NOT EXISTS room_types text[] DEFAULT '{}'::text[],
    ADD COLUMN IF NOT EXISTS pros text[] DEFAULT '{}'::text[],
    ADD COLUMN IF NOT EXISTS cons text[] DEFAULT '{}'::text[],
    ADD COLUMN IF NOT EXISTS cleanliness_score numeric(3,1),
    ADD COLUMN IF NOT EXISTS food_quality_score numeric(3,1),
    ADD COLUMN IF NOT EXISTS safety_score numeric(3,1),
    ADD COLUMN IF NOT EXISTS study_environment_score numeric(3,1),
    ADD COLUMN IF NOT EXISTS warden_support_score numeric(3,1),
    ADD COLUMN IF NOT EXISTS location_score numeric(3,1);

-- ---------------------------------------------------------------------------
-- 3. Update create_listing_with_details
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
    IF NOT is_admin() THEN
        RAISE EXCEPTION 'create_listing_with_details: caller is not an admin';
    END IF;

    v_id   := COALESCE(NULLIF(payload->>'id', '')::UUID, gen_random_uuid());
    v_type := (payload->>'type')::listing_type;

    v_slug := COALESCE(
        NULLIF(trim(payload->>'slug'), ''),
        regexp_replace(lower(trim(payload->>'name')), '[^a-z0-9]+', '-', 'g')
            || '-' || substring(v_id::text, 1, 8)
    );

    SELECT array_agg(elem::UUID)
    INTO   v_amenity_ids
    FROM   jsonb_array_elements_text(
               COALESCE(payload->'amenity_ids', '[]'::jsonb)
           ) AS t(elem)
    WHERE  elem IS NOT NULL AND elem <> '';

    INSERT INTO listings (
        id, type, city_id, name, slug, area, address, phone, whatsapp, website_url,
        description, plan_tier, is_active, is_verified
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

    IF v_type = 'coaching' THEN
        INSERT INTO coaching_details (
            listing_id, subjects, established_year, faculty_count, fee_per_month,
            pros, cons,
            teaching_score, notes_score, test_series_score, doubt_support_score, competition_score, personal_attention_score
        ) VALUES (
            v_id,
            ARRAY(
                SELECT jsonb_array_elements_text(
                    COALESCE(payload->'exam_types', '[]'::jsonb)
                )
            ),
            NULLIF(payload->>'founded_year', '')::INTEGER,
            NULLIF(payload->>'faculty_count', '')::INTEGER,
            NULLIF(payload->>'fee_per_month', '')::INTEGER,
            ARRAY(SELECT jsonb_array_elements_text(COALESCE(payload->'pros', '[]'::jsonb))),
            ARRAY(SELECT jsonb_array_elements_text(COALESCE(payload->'cons', '[]'::jsonb))),
            NULLIF(payload->>'teaching_score', '')::NUMERIC,
            NULLIF(payload->>'notes_score', '')::NUMERIC,
            NULLIF(payload->>'test_series_score', '')::NUMERIC,
            NULLIF(payload->>'doubt_support_score', '')::NUMERIC,
            NULLIF(payload->>'competition_score', '')::NUMERIC,
            NULLIF(payload->>'personal_attention_score', '')::NUMERIC
        );

    ELSIF v_type = 'hostel' THEN
        INSERT INTO hostel_details (
            listing_id, gender, rent_min, rent_max, food_included,
            room_types, pros, cons,
            cleanliness_score, food_quality_score, safety_score, study_environment_score, warden_support_score, location_score
        ) VALUES (
            v_id,
            (payload->>'gender')::hostel_gender,
            NULLIF(payload->>'rent_min', '')::INTEGER,
            NULLIF(payload->>'rent_max', '')::INTEGER,
            COALESCE((payload->>'food_included')::BOOLEAN, false),
            ARRAY(SELECT jsonb_array_elements_text(COALESCE(payload->'room_types', '[]'::jsonb))),
            ARRAY(SELECT jsonb_array_elements_text(COALESCE(payload->'pros', '[]'::jsonb))),
            ARRAY(SELECT jsonb_array_elements_text(COALESCE(payload->'cons', '[]'::jsonb))),
            NULLIF(payload->>'cleanliness_score', '')::NUMERIC,
            NULLIF(payload->>'food_quality_score', '')::NUMERIC,
            NULLIF(payload->>'safety_score', '')::NUMERIC,
            NULLIF(payload->>'study_environment_score', '')::NUMERIC,
            NULLIF(payload->>'warden_support_score', '')::NUMERIC,
            NULLIF(payload->>'location_score', '')::NUMERIC
        );
    END IF;

    DELETE FROM listing_amenities WHERE listing_id = v_id;

    IF v_amenity_ids IS NOT NULL AND array_length(v_amenity_ids, 1) > 0 THEN
        INSERT INTO listing_amenities (listing_id, amenity_id)
        SELECT v_id, unnest(v_amenity_ids)
        ON CONFLICT DO NOTHING;
    END IF;

    RETURN v_id;

EXCEPTION
    WHEN OTHERS THEN
        RAISE;
END;
$$;


-- ---------------------------------------------------------------------------
-- 4. Update update_listing_with_details
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
    IF NOT is_admin() THEN
        RAISE EXCEPTION 'update_listing_with_details: caller is not an admin';
    END IF;

    v_id := (payload->>'id')::UUID;
    IF v_id IS NULL THEN
        RAISE EXCEPTION 'update_listing_with_details: payload must include "id"';
    END IF;

    SELECT type INTO v_type FROM listings WHERE id = v_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'update_listing_with_details: listing % not found', v_id;
    END IF;

    SELECT array_agg(elem::UUID)
    INTO   v_amenity_ids
    FROM   jsonb_array_elements_text(
               COALESCE(payload->'amenity_ids', '[]'::jsonb)
           ) AS t(elem)
    WHERE  elem IS NOT NULL AND elem <> '';

    UPDATE listings SET
        city_id     = COALESCE(NULLIF(payload->>'city_id', '')::UUID,   city_id),
        name        = COALESCE(NULLIF(payload->>'name', ''),             name),
        area        = NULLIF(payload->>'area', ''),
        address     = NULLIF(payload->>'address', ''),
        phone       = NULLIF(payload->>'phone', ''),
        whatsapp    = NULLIF(payload->>'whatsapp', ''),
        website_url = NULLIF(payload->>'website', ''),
        description = NULLIF(payload->>'description', ''),
        plan_tier   = COALESCE(NULLIF(payload->>'plan_tier', '')::plan_tier, plan_tier),
        is_active   = COALESCE((payload->>'is_active')::BOOLEAN, is_active),
        is_verified = COALESCE((payload->>'is_verified')::BOOLEAN, is_verified)
    WHERE id = v_id;

    IF v_type = 'coaching' THEN
        INSERT INTO coaching_details (
            listing_id, subjects, established_year, faculty_count, fee_per_month,
            pros, cons,
            teaching_score, notes_score, test_series_score, doubt_support_score, competition_score, personal_attention_score
        ) VALUES (
            v_id,
            ARRAY(SELECT jsonb_array_elements_text(COALESCE(payload->'exam_types', '[]'::jsonb))),
            NULLIF(payload->>'founded_year', '')::INTEGER,
            NULLIF(payload->>'faculty_count', '')::INTEGER,
            NULLIF(payload->>'fee_per_month', '')::INTEGER,
            ARRAY(SELECT jsonb_array_elements_text(COALESCE(payload->'pros', '[]'::jsonb))),
            ARRAY(SELECT jsonb_array_elements_text(COALESCE(payload->'cons', '[]'::jsonb))),
            NULLIF(payload->>'teaching_score', '')::NUMERIC,
            NULLIF(payload->>'notes_score', '')::NUMERIC,
            NULLIF(payload->>'test_series_score', '')::NUMERIC,
            NULLIF(payload->>'doubt_support_score', '')::NUMERIC,
            NULLIF(payload->>'competition_score', '')::NUMERIC,
            NULLIF(payload->>'personal_attention_score', '')::NUMERIC
        )
        ON CONFLICT (listing_id) DO UPDATE SET
            subjects         = EXCLUDED.subjects,
            established_year = EXCLUDED.established_year,
            faculty_count    = EXCLUDED.faculty_count,
            fee_per_month    = EXCLUDED.fee_per_month,
            pros             = EXCLUDED.pros,
            cons             = EXCLUDED.cons,
            teaching_score   = EXCLUDED.teaching_score,
            notes_score      = EXCLUDED.notes_score,
            test_series_score = EXCLUDED.test_series_score,
            doubt_support_score = EXCLUDED.doubt_support_score,
            competition_score = EXCLUDED.competition_score,
            personal_attention_score = EXCLUDED.personal_attention_score;

    ELSIF v_type = 'hostel' THEN
        INSERT INTO hostel_details (
            listing_id, gender, rent_min, rent_max, food_included,
            room_types, pros, cons,
            cleanliness_score, food_quality_score, safety_score, study_environment_score, warden_support_score, location_score
        ) VALUES (
            v_id,
            (payload->>'gender')::hostel_gender,
            NULLIF(payload->>'rent_min', '')::INTEGER,
            NULLIF(payload->>'rent_max', '')::INTEGER,
            COALESCE((payload->>'food_included')::BOOLEAN, false),
            ARRAY(SELECT jsonb_array_elements_text(COALESCE(payload->'room_types', '[]'::jsonb))),
            ARRAY(SELECT jsonb_array_elements_text(COALESCE(payload->'pros', '[]'::jsonb))),
            ARRAY(SELECT jsonb_array_elements_text(COALESCE(payload->'cons', '[]'::jsonb))),
            NULLIF(payload->>'cleanliness_score', '')::NUMERIC,
            NULLIF(payload->>'food_quality_score', '')::NUMERIC,
            NULLIF(payload->>'safety_score', '')::NUMERIC,
            NULLIF(payload->>'study_environment_score', '')::NUMERIC,
            NULLIF(payload->>'warden_support_score', '')::NUMERIC,
            NULLIF(payload->>'location_score', '')::NUMERIC
        )
        ON CONFLICT (listing_id) DO UPDATE SET
            gender        = EXCLUDED.gender,
            rent_min      = EXCLUDED.rent_min,
            rent_max      = EXCLUDED.rent_max,
            food_included = EXCLUDED.food_included,
            room_types    = EXCLUDED.room_types,
            pros          = EXCLUDED.pros,
            cons          = EXCLUDED.cons,
            cleanliness_score = EXCLUDED.cleanliness_score,
            food_quality_score = EXCLUDED.food_quality_score,
            safety_score = EXCLUDED.safety_score,
            study_environment_score = EXCLUDED.study_environment_score,
            warden_support_score = EXCLUDED.warden_support_score,
            location_score = EXCLUDED.location_score;
    END IF;

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

COMMIT;
