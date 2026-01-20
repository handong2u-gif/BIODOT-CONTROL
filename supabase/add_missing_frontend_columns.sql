
-- [Frontend Sync Fix] Add missing columns required by CsvUploadButton.tsx
-- This script ensures all columns mapped in the frontend application or Google Script exist in the database.

DO $$
BEGIN
    -- 1. 'detail_image_url' (상세이미지)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'finished_goods' AND column_name = 'detail_image_url') THEN
        ALTER TABLE public.finished_goods ADD COLUMN detail_image_url TEXT;
    END IF;

    -- 2. 'stock_status' (재고상태)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'finished_goods' AND column_name = 'stock_status') THEN
        ALTER TABLE public.finished_goods ADD COLUMN stock_status TEXT;
    END IF;

    -- 3. 'tags' (태그 - Array of Text)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'finished_goods' AND column_name = 'tags') THEN
        ALTER TABLE public.finished_goods ADD COLUMN tags TEXT[];
    END IF;

    -- 4. 'online_price' (온라인 판매가 - Previously added but ensuring it's here)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'finished_goods' AND column_name = 'online_price') THEN
        ALTER TABLE public.finished_goods ADD COLUMN online_price NUMERIC DEFAULT 0;
    END IF;

    -- 5. 'selling_point' (From Product Interface)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'finished_goods' AND column_name = 'selling_point') THEN
        ALTER TABLE public.finished_goods ADD COLUMN selling_point TEXT;
    END IF;

    -- 6. 'key_features' (From Product Interface - Array)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'finished_goods' AND column_name = 'key_features') THEN
        ALTER TABLE public.finished_goods ADD COLUMN key_features TEXT[];
    END IF;

    -- 7. 'target_customer' (From Product Interface)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'finished_goods' AND column_name = 'target_customer') THEN
        ALTER TABLE public.finished_goods ADD COLUMN target_customer TEXT;
    END IF;

    -- 8. Ensure 'finished_goods' has RLS enabled and accessible
    ALTER TABLE public.finished_goods ENABLE ROW LEVEL SECURITY;
    
    -- Re-apply grants just in case
    GRANT ALL ON TABLE public.finished_goods TO anon, authenticated, service_role;
    GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

END $$;
