-- =============================================================================
-- Settlr – Phase 0: Storage Policies
-- Apply this file AFTER schema.sql on a clean Supabase project.
--
-- Storage path convention (enforced by application layer, documented here):
--   listing-images/{listing_id}/{uuid}.{ext}
--   e.g. listing-images/3f4a1b2c-…/a9e12f44-….jpg
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Create the public listing-images bucket.
-- public = true means the bucket's objects are readable via the CDN URL
-- without requiring an authenticated token (anonymous public read).
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'listing-images',
    'listing-images',
    true,                              -- publicly readable via CDN
    5242880,                           -- 5 MB per file
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Storage RLS policies
--
-- Supabase Storage enforces access via policies on storage.objects.
-- We use the is_admin() helper from schema.sql to keep admin checks DRY.
-- ---------------------------------------------------------------------------

-- 1. Public read — anyone (anon or authenticated) can GET any object in this bucket
CREATE POLICY "storage listing-images: public read"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'listing-images');

-- 2. Admin insert — only admins may upload new files
CREATE POLICY "storage listing-images: admin insert"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'listing-images'
        AND is_admin()
    );

-- 3. Admin update — only admins may overwrite / replace existing files
CREATE POLICY "storage listing-images: admin update"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'listing-images'
        AND is_admin()
    )
    WITH CHECK (
        bucket_id = 'listing-images'
        AND is_admin()
    );

-- 4. Admin delete — only admins may remove files
CREATE POLICY "storage listing-images: admin delete"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'listing-images'
        AND is_admin()
    );
