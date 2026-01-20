
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'finished_goods' AND column_name = 'origin_country') THEN
        ALTER TABLE public.finished_goods ADD COLUMN origin_country TEXT;
    END IF;
END $$;
