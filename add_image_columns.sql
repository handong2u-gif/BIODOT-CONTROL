
-- Add detail_image_url column to raw_materials
ALTER TABLE raw_materials 
ADD COLUMN IF NOT EXISTS detail_image_url text;

-- Add detail_image_url column to finished_goods
ALTER TABLE finished_goods 
ADD COLUMN IF NOT EXISTS detail_image_url text;

-- Create storage bucket for product images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow public read access
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'product-images' );

-- Policy to allow authenticated (or public for this demo) upload access
-- Since auth is not implemented, we might need to allow anon uploads or handle it via client key
CREATE POLICY "Public Upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'product-images' );

CREATE POLICY "Public Update"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'product-images' );
