
-- 1. Create the bucket if it doesn't validly exist (Idempotent)
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Drop existing policies to avoid conflicts/duplicates
DROP POLICY IF EXISTS "Public Select" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload" ON storage.objects;
DROP POLICY IF EXISTS "Public Update" ON storage.objects;

-- 3. Create Permissive Policies for 'product-images' bucket
-- Allow anyone (public/anon) to VIEW images
CREATE POLICY "Public Select"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'product-images' );

-- Allow anyone (public/anon) to UPLOAD images
CREATE POLICY "Public Upload"
ON storage.objects FOR INSERT
TO public
WITH CHECK ( bucket_id = 'product-images' );

-- Allow anyone (public/anon) to UPDATE images
CREATE POLICY "Public Update"
ON storage.objects FOR UPDATE
TO public
USING ( bucket_id = 'product-images' );
