-- =============================================================================
-- Settlr – Phase 0: Database Schema
-- Apply this file first on a clean Supabase project.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 0. Extensions
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pgcrypto;   -- provides gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pg_trgm;    -- provides GIN trigram indexes for ILIKE search


-- =============================================================================
-- 1. ENUMS
-- =============================================================================

CREATE TYPE user_role AS ENUM ('student', 'admin');

CREATE TYPE listing_type AS ENUM ('coaching', 'hostel');

CREATE TYPE plan_tier AS ENUM ('free', 'basic', 'pro', 'featured');

CREATE TYPE hostel_gender AS ENUM ('boys', 'girls', 'co-ed');

CREATE TYPE lead_event_type AS ENUM (
    'view',
    'call_click',
    'whatsapp_click',
    'direction_click',
    'website_click'
);


-- =============================================================================
-- 2. TABLES
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 2.1 profiles
--     Mirrors auth.users 1-to-1. Created automatically by handle_new_user()
--     trigger; no application code should INSERT here directly.
-- ---------------------------------------------------------------------------
CREATE TABLE profiles (
    id          UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role        user_role   NOT NULL DEFAULT 'student',
    full_name   TEXT,
    phone       TEXT,
    avatar_url  TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- 2.2 cities
-- ---------------------------------------------------------------------------
CREATE TABLE cities (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT        NOT NULL UNIQUE,
    state       TEXT        NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- 2.3 listings  (polymorphic — coaching & hostel)
--     rating and review_count are DERIVED columns written only by the
--     recompute_listing_rating() trigger. No application code may write them.
-- ---------------------------------------------------------------------------
CREATE TABLE listings (
    id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    type            listing_type  NOT NULL,
    city_id         UUID          NOT NULL REFERENCES cities(id) ON DELETE RESTRICT,
    name            TEXT          NOT NULL,
    slug            TEXT          NOT NULL UNIQUE,
    area            TEXT,
    address         TEXT,
    phone           TEXT,
    whatsapp        TEXT,
    website_url     TEXT,
    description     TEXT,
    plan_tier       plan_tier     NOT NULL DEFAULT 'free',
    is_active       BOOLEAN       NOT NULL DEFAULT false,
    is_verified     BOOLEAN       NOT NULL DEFAULT false,
    -- Derived columns — written ONLY by recompute_listing_rating() trigger
    rating          NUMERIC(3,1)  NOT NULL DEFAULT 0.0,
    review_count    INTEGER       NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- 2.4 coaching_details  (1:1 with listings where type = 'coaching')
-- ---------------------------------------------------------------------------
CREATE TABLE coaching_details (
    listing_id          UUID    PRIMARY KEY REFERENCES listings(id) ON DELETE CASCADE,
    subjects            TEXT[], -- e.g. ARRAY['Maths','Physics']
    batches             TEXT[], -- e.g. ARRAY['Morning','Evening']
    medium              TEXT,   -- e.g. 'English', 'Hindi'
    fee_per_month       INTEGER,
    established_year    INTEGER,
    total_students      INTEGER,
    faculty_count       INTEGER,
    has_demo_class      BOOLEAN NOT NULL DEFAULT false,
    has_online_classes  BOOLEAN NOT NULL DEFAULT false
);

-- ---------------------------------------------------------------------------
-- 2.5 hostel_details  (1:1 with listings where type = 'hostel')
-- ---------------------------------------------------------------------------
CREATE TABLE hostel_details (
    listing_id      UUID            PRIMARY KEY REFERENCES listings(id) ON DELETE CASCADE,
    gender          hostel_gender   NOT NULL,
    total_rooms     INTEGER,
    rent_min        INTEGER,
    rent_max        INTEGER,
    food_included   BOOLEAN         NOT NULL DEFAULT false,
    warden_name     TEXT,
    warden_phone    TEXT,
    -- Ensure rent_max is never less than rent_min when both are supplied
    CONSTRAINT chk_rent_range CHECK (
        rent_min IS NULL
        OR rent_max IS NULL
        OR rent_max >= rent_min
    )
);

-- ---------------------------------------------------------------------------
-- 2.6 amenities  (lookup / reference table)
-- ---------------------------------------------------------------------------
CREATE TABLE amenities (
    id      UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
    name    TEXT  NOT NULL UNIQUE,
    icon    TEXT  -- optional icon identifier (e.g. lucide icon name)
);

-- ---------------------------------------------------------------------------
-- 2.7 listing_amenities  (many-to-many join)
-- ---------------------------------------------------------------------------
CREATE TABLE listing_amenities (
    listing_id  UUID NOT NULL REFERENCES listings(id)  ON DELETE CASCADE,
    amenity_id  UUID NOT NULL REFERENCES amenities(id) ON DELETE CASCADE,
    PRIMARY KEY (listing_id, amenity_id)
);

-- ---------------------------------------------------------------------------
-- 2.8 listing_images
-- ---------------------------------------------------------------------------
CREATE TABLE listing_images (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id  UUID        NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    url         TEXT        NOT NULL,
    -- Storage path convention: {listing_id}/{uuid}.{ext}
    storage_path TEXT       NOT NULL,
    is_primary  BOOLEAN     NOT NULL DEFAULT false,
    sort_order  INTEGER     NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- 2.9 reviews
-- ---------------------------------------------------------------------------
CREATE TABLE reviews (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id    UUID        NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    user_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rating        SMALLINT    NOT NULL,
    title         TEXT,
    body          TEXT,
    is_anonymous  BOOLEAN     NOT NULL DEFAULT false,
    is_verified   BOOLEAN     NOT NULL DEFAULT false,
    recommend     BOOLEAN,
    helpful_count INTEGER     NOT NULL DEFAULT 0,
    is_approved   BOOLEAN     NOT NULL DEFAULT false,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    -- Exactly one review per student per listing
    CONSTRAINT uq_review_per_user_listing UNIQUE (listing_id, user_id),
    -- Rating must be between 1 and 5
    CONSTRAINT chk_rating_range CHECK (rating BETWEEN 1 AND 5)
);

-- ---------------------------------------------------------------------------
-- 2.9.1 review_helpful_votes
-- ---------------------------------------------------------------------------
CREATE TABLE review_helpful_votes (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id   UUID        NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_review_helpful UNIQUE (review_id, user_id)
);

-- ---------------------------------------------------------------------------
-- 2.9.2 review_reports
-- ---------------------------------------------------------------------------
CREATE TABLE review_reports (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id   UUID        NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reason      TEXT        NOT NULL,
    status      TEXT        NOT NULL DEFAULT 'pending',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_review_report UNIQUE (review_id, user_id)
);

-- ---------------------------------------------------------------------------
-- 2.10 favorites
-- ---------------------------------------------------------------------------
CREATE TABLE favorites (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    listing_id  UUID        NOT NULL REFERENCES listings(id)  ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_favorite UNIQUE (user_id, listing_id)
);

-- ---------------------------------------------------------------------------
-- 2.11 lead_events
-- ---------------------------------------------------------------------------
CREATE TABLE lead_events (
    id          UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id  UUID            NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    -- user_id is NULL for anonymous visitors — intentional
    user_id     UUID            REFERENCES auth.users(id) ON DELETE SET NULL,
    event_type  lead_event_type NOT NULL,
    metadata    JSONB,
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT now()
);


-- =============================================================================
-- 3. INDEXES
-- =============================================================================

-- listings: partial index for active + verified rows, partitioned by type + city
CREATE INDEX idx_listings_type_city_active
    ON listings (type, city_id)
    WHERE is_active = true;

-- listings: trigram index for ILIKE/fuzzy search on name
CREATE INDEX idx_listings_name_trgm
    ON listings USING GIN (name gin_trgm_ops);

-- listings: index on area for filtering
CREATE INDEX idx_listings_area
    ON listings (area);

-- listings: index on plan_tier for sorting featured/pro listings
CREATE INDEX idx_listings_plan_tier
    ON listings (plan_tier);

-- listing_images: enforce exactly ONE primary image per listing at the DB level
CREATE UNIQUE INDEX uq_listing_primary_image
    ON listing_images (listing_id)
    WHERE is_primary = true;

-- lead_events: analytics query pattern — by listing + time desc
CREATE INDEX idx_lead_events_listing_time
    ON lead_events (listing_id, created_at DESC);

-- lead_events: analytics query pattern — by event_type + time desc
CREATE INDEX idx_lead_events_type_time
    ON lead_events (event_type, created_at DESC);


-- =============================================================================
-- 4. HELPER FUNCTION
-- =============================================================================

-- is_admin() returns TRUE when the calling Postgres session belongs to a user
-- whose profiles.role is 'admin'. Reused across every admin-gated RLS policy
-- so the check logic is defined exactly once.
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM   profiles
        WHERE  id   = auth.uid()
          AND  role = 'admin'
    );
$$;


-- =============================================================================
-- 5. TRIGGERS
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 5.1 set_updated_at — keep listings.updated_at current on every UPDATE
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at := now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_listings_updated_at
    BEFORE UPDATE ON listings
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- Also apply to reviews so updated_at stays accurate there too
CREATE TRIGGER trg_reviews_updated_at
    BEFORE UPDATE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- Also apply to profiles
CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- 5.2 handle_new_user — auto-create a profiles row on signup
--     This is the ONLY code path that creates a profiles row.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO profiles (id, full_name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data ->> 'full_name', NULL)
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_auth_users_new_user
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- ---------------------------------------------------------------------------
-- 5.3 recompute_listing_rating
--     Fires after any INSERT, UPDATE, or DELETE on reviews.
--     Recalculates listings.rating (avg of approved ratings, 1 decimal) and
--     listings.review_count (count of approved reviews) for the affected row.
--     Application code MUST NOT write to listings.rating or listings.review_count.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION recompute_listing_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_listing_id UUID;
BEGIN
    -- Determine which listing_id to recompute.
    -- On DELETE, NEW is NULL — use OLD instead.
    IF TG_OP = 'DELETE' THEN
        v_listing_id := OLD.listing_id;
    ELSE
        v_listing_id := NEW.listing_id;
    END IF;

    UPDATE listings
    SET
        rating       = COALESCE(
                           ROUND(
                               (SELECT AVG(rating::NUMERIC)
                                FROM   reviews
                                WHERE  listing_id  = v_listing_id
                                  AND  is_approved = true),
                               1
                           ),
                           0.0
                       ),
        review_count = (
                           SELECT COUNT(*)
                           FROM   reviews
                           WHERE  listing_id  = v_listing_id
                             AND  is_approved = true
                       )
    WHERE id = v_listing_id;

    RETURN NULL; -- result is ignored for AFTER triggers
END;
$$;

CREATE TRIGGER trg_reviews_recompute_rating
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION recompute_listing_rating();


-- =============================================================================
-- 6. ROW LEVEL SECURITY
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 6.1 profiles
-- ---------------------------------------------------------------------------
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile; admins can read all profiles
CREATE POLICY "profiles: owner or admin can select"
    ON profiles FOR SELECT
    USING (
        auth.uid() = id
        OR is_admin()
    );

-- Users can update only their own profile; admins can update any profile
CREATE POLICY "profiles: owner can update own"
    ON profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles: admin can update any"
    ON profiles FOR UPDATE
    USING (is_admin())
    WITH CHECK (is_admin());

-- Only the trigger (SECURITY DEFINER) inserts profiles — no direct INSERT allowed
-- No INSERT policy = INSERT is blocked for all roles.

-- Only admins can delete profiles
CREATE POLICY "profiles: admin can delete"
    ON profiles FOR DELETE
    USING (is_admin());

-- ---------------------------------------------------------------------------
-- 6.2 cities
-- ---------------------------------------------------------------------------
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;

-- Everyone (including anonymous) can read cities
CREATE POLICY "cities: public read"
    ON cities FOR SELECT
    USING (true);

-- Only admins can insert/update/delete cities
CREATE POLICY "cities: admin insert"
    ON cities FOR INSERT
    WITH CHECK (is_admin());

CREATE POLICY "cities: admin update"
    ON cities FOR UPDATE
    USING (is_admin())
    WITH CHECK (is_admin());

CREATE POLICY "cities: admin delete"
    ON cities FOR DELETE
    USING (is_admin());

-- ---------------------------------------------------------------------------
-- 6.3 listings
-- ---------------------------------------------------------------------------
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

-- Public (including anonymous) can read only active + verified listings
CREATE POLICY "listings: public read active+verified"
    ON listings FOR SELECT
    USING (is_active = true AND is_verified = true);

-- Admins can read ALL listings regardless of status
CREATE POLICY "listings: admin read all"
    ON listings FOR SELECT
    USING (is_admin());

-- Only admins can insert listings
CREATE POLICY "listings: admin insert"
    ON listings FOR INSERT
    WITH CHECK (is_admin());

-- Only admins can update listings
CREATE POLICY "listings: admin update"
    ON listings FOR UPDATE
    USING (is_admin())
    WITH CHECK (is_admin());

-- Only admins can delete listings
CREATE POLICY "listings: admin delete"
    ON listings FOR DELETE
    USING (is_admin());

-- ---------------------------------------------------------------------------
-- 6.4 coaching_details
-- ---------------------------------------------------------------------------
ALTER TABLE coaching_details ENABLE ROW LEVEL SECURITY;

-- Public read only when the parent listing is active + verified
CREATE POLICY "coaching_details: public read via active listing"
    ON coaching_details FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM listings l
            WHERE  l.id          = listing_id
              AND  l.is_active   = true
              AND  l.is_verified = true
        )
    );

-- Admins can read all coaching_details
CREATE POLICY "coaching_details: admin read all"
    ON coaching_details FOR SELECT
    USING (is_admin());

CREATE POLICY "coaching_details: admin insert"
    ON coaching_details FOR INSERT
    WITH CHECK (is_admin());

CREATE POLICY "coaching_details: admin update"
    ON coaching_details FOR UPDATE
    USING (is_admin())
    WITH CHECK (is_admin());

CREATE POLICY "coaching_details: admin delete"
    ON coaching_details FOR DELETE
    USING (is_admin());

-- ---------------------------------------------------------------------------
-- 6.5 hostel_details
-- ---------------------------------------------------------------------------
ALTER TABLE hostel_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hostel_details: public read via active listing"
    ON hostel_details FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM listings l
            WHERE  l.id          = listing_id
              AND  l.is_active   = true
              AND  l.is_verified = true
        )
    );

CREATE POLICY "hostel_details: admin read all"
    ON hostel_details FOR SELECT
    USING (is_admin());

CREATE POLICY "hostel_details: admin insert"
    ON hostel_details FOR INSERT
    WITH CHECK (is_admin());

CREATE POLICY "hostel_details: admin update"
    ON hostel_details FOR UPDATE
    USING (is_admin())
    WITH CHECK (is_admin());

CREATE POLICY "hostel_details: admin delete"
    ON hostel_details FOR DELETE
    USING (is_admin());

-- ---------------------------------------------------------------------------
-- 6.6 amenities
-- ---------------------------------------------------------------------------
ALTER TABLE amenities ENABLE ROW LEVEL SECURITY;

-- Everyone can read the amenity catalogue
CREATE POLICY "amenities: public read"
    ON amenities FOR SELECT
    USING (true);

CREATE POLICY "amenities: admin insert"
    ON amenities FOR INSERT
    WITH CHECK (is_admin());

CREATE POLICY "amenities: admin update"
    ON amenities FOR UPDATE
    USING (is_admin())
    WITH CHECK (is_admin());

CREATE POLICY "amenities: admin delete"
    ON amenities FOR DELETE
    USING (is_admin());

-- ---------------------------------------------------------------------------
-- 6.7 listing_amenities
-- ---------------------------------------------------------------------------
ALTER TABLE listing_amenities ENABLE ROW LEVEL SECURITY;

-- Public read when parent listing is active + verified
CREATE POLICY "listing_amenities: public read via active listing"
    ON listing_amenities FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM listings l
            WHERE  l.id          = listing_id
              AND  l.is_active   = true
              AND  l.is_verified = true
        )
    );

CREATE POLICY "listing_amenities: admin read all"
    ON listing_amenities FOR SELECT
    USING (is_admin());

CREATE POLICY "listing_amenities: admin insert"
    ON listing_amenities FOR INSERT
    WITH CHECK (is_admin());

CREATE POLICY "listing_amenities: admin update"
    ON listing_amenities FOR UPDATE
    USING (is_admin())
    WITH CHECK (is_admin());

CREATE POLICY "listing_amenities: admin delete"
    ON listing_amenities FOR DELETE
    USING (is_admin());

-- ---------------------------------------------------------------------------
-- 6.8 listing_images
-- ---------------------------------------------------------------------------
ALTER TABLE listing_images ENABLE ROW LEVEL SECURITY;

-- Public read when parent listing is active + verified
CREATE POLICY "listing_images: public read via active listing"
    ON listing_images FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM listings l
            WHERE  l.id          = listing_id
              AND  l.is_active   = true
              AND  l.is_verified = true
        )
    );

CREATE POLICY "listing_images: admin read all"
    ON listing_images FOR SELECT
    USING (is_admin());

CREATE POLICY "listing_images: admin insert"
    ON listing_images FOR INSERT
    WITH CHECK (is_admin());

CREATE POLICY "listing_images: admin update"
    ON listing_images FOR UPDATE
    USING (is_admin())
    WITH CHECK (is_admin());

CREATE POLICY "listing_images: admin delete"
    ON listing_images FOR DELETE
    USING (is_admin());

-- ---------------------------------------------------------------------------
-- 6.9 reviews
-- ---------------------------------------------------------------------------
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Public (including anonymous) can read ONLY approved reviews
CREATE POLICY "reviews: public read approved"
    ON reviews FOR SELECT
    USING (is_approved = true);

-- Authenticated students can also read their own unapproved review
CREATE POLICY "reviews: owner reads own"
    ON reviews FOR SELECT
    USING (auth.uid() = user_id);

-- Admins can read all reviews regardless of approval status
CREATE POLICY "reviews: admin read all"
    ON reviews FOR SELECT
    USING (is_admin());

-- A student can insert a review only for themselves
CREATE POLICY "reviews: student insert own"
    ON reviews FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- A student can update only their own review
CREATE POLICY "reviews: student update own"
    ON reviews FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- A student can delete only their own review
CREATE POLICY "reviews: student delete own"
    ON reviews FOR DELETE
    USING (auth.uid() = user_id);

-- Admins have full write access (e.g., to approve reviews)
CREATE POLICY "reviews: admin full write"
    ON reviews FOR ALL
    USING (is_admin())
    WITH CHECK (is_admin());

-- ---------------------------------------------------------------------------
-- 6.9.1 review_helpful_votes
-- ---------------------------------------------------------------------------
ALTER TABLE review_helpful_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "review_helpful_votes: owner read own"
    ON review_helpful_votes FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "review_helpful_votes: owner insert own"
    ON review_helpful_votes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "review_helpful_votes: owner delete own"
    ON review_helpful_votes FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "review_helpful_votes: admin full write"
    ON review_helpful_votes FOR ALL
    USING (is_admin())
    WITH CHECK (is_admin());

-- ---------------------------------------------------------------------------
-- 6.9.2 review_reports
-- ---------------------------------------------------------------------------
ALTER TABLE review_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "review_reports: owner read own"
    ON review_reports FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "review_reports: owner insert own"
    ON review_reports FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "review_reports: admin full write"
    ON review_reports FOR ALL
    USING (is_admin())
    WITH CHECK (is_admin());

-- ---------------------------------------------------------------------------
-- 6.10 favorites
-- ---------------------------------------------------------------------------
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Strictly owner-only: a user can only see their own favorites
CREATE POLICY "favorites: owner read own"
    ON favorites FOR SELECT
    USING (auth.uid() = user_id);

-- A user can only create favorites for themselves
CREATE POLICY "favorites: owner insert own"
    ON favorites FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- A user can only delete their own favorites
CREATE POLICY "favorites: owner delete own"
    ON favorites FOR DELETE
    USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 6.11 lead_events
-- ---------------------------------------------------------------------------
ALTER TABLE lead_events ENABLE ROW LEVEL SECURITY;

-- ANYONE (including unauthenticated/anonymous) can INSERT a lead event.
-- This is intentional: anonymous page views and click events must be captured.
CREATE POLICY "lead_events: anyone can insert"
    ON lead_events FOR INSERT
    WITH CHECK (true);

-- Only admins can SELECT lead event data (analytics)
CREATE POLICY "lead_events: admin read all"
    ON lead_events FOR SELECT
    USING (is_admin());

-- Only admins can update or delete lead events
CREATE POLICY "lead_events: admin update"
    ON lead_events FOR UPDATE
    USING (is_admin())
    WITH CHECK (is_admin());

CREATE POLICY "lead_events: admin delete"
    ON lead_events FOR DELETE
    USING (is_admin());

-- ---------------------------------------------------------------------------
-- 2.12 listing_views
-- ---------------------------------------------------------------------------
CREATE TABLE listing_views (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id      UUID        NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    user_id         UUID        REFERENCES auth.users(id) ON DELETE CASCADE,
    anonymous_id    UUID,
    device_type     TEXT,       -- e.g. 'android', 'ios', 'web'
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_viewed_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_listing_views_identity CHECK (user_id IS NOT NULL OR anonymous_id IS NOT NULL)
);

CREATE UNIQUE INDEX uq_listing_views_user ON listing_views (listing_id, user_id) WHERE user_id IS NOT NULL;
CREATE UNIQUE INDEX uq_listing_views_anon ON listing_views (listing_id, anonymous_id) WHERE anonymous_id IS NOT NULL;

ALTER TABLE listing_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "listing_views: public read"
    ON listing_views FOR SELECT
    USING (true);

CREATE OR REPLACE FUNCTION record_listing_view(
    p_listing_id UUID,
    p_user_id UUID,
    p_anonymous_id UUID,
    p_device_type TEXT
) RETURNS void AS $$
BEGIN
    IF p_user_id IS NOT NULL THEN
        INSERT INTO listing_views (listing_id, user_id, device_type, created_at, last_viewed_at)
        VALUES (p_listing_id, p_user_id, p_device_type, now(), now())
        ON CONFLICT (listing_id, user_id) WHERE user_id IS NOT NULL
        DO UPDATE SET 
            last_viewed_at = now(),
            device_type = COALESCE(p_device_type, listing_views.device_type);
    ELSE
        INSERT INTO listing_views (listing_id, anonymous_id, device_type, created_at, last_viewed_at)
        VALUES (p_listing_id, p_anonymous_id, p_device_type, now(), now())
        ON CONFLICT (listing_id, anonymous_id) WHERE anonymous_id IS NOT NULL
        DO UPDATE SET 
            last_viewed_at = now(),
            device_type = COALESCE(p_device_type, listing_views.device_type);
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

