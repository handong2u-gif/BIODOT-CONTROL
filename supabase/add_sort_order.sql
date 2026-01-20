
-- finished_goods 테이블에 정렬 순서를 위한 sort_order 컬럼 추가
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'finished_goods' AND column_name = 'sort_order') THEN
        ALTER TABLE public.finished_goods ADD COLUMN sort_order INTEGER DEFAULT 0;
        
        -- 기존 데이터 초기화 (ID 순서대로)
        WITH numbered AS (
            SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) as rn
            FROM public.finished_goods
        )
        UPDATE public.finished_goods
        SET sort_order = numbered.rn
        FROM numbered
        WHERE public.finished_goods.id = numbered.id;
    END IF;
END $$;
