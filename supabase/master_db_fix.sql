-- [최종 통합 수정] 모든 컬럼 및 권한 문제 해결
-- 이 스크립트를 실행하면 바코드, 온라인 판매가 등 모든 연동 오류가 해결됩니다.

-- 1. finished_goods 테이블에 'online_price' 컬럼이 없으면 추가
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'finished_goods' AND column_name = 'online_price') THEN
        ALTER TABLE public.finished_goods ADD COLUMN online_price NUMERIC DEFAULT 0;
    END IF;
END $$;

-- 2. product_logistics_specs 테이블에 'logistics_barcode' 컬럼이 없으면 추가
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'product_logistics_specs' AND column_name = 'logistics_barcode') THEN
        ALTER TABLE public.product_logistics_specs ADD COLUMN logistics_barcode TEXT;
    END IF;
END $$;

-- 3. finished_goods (완제품) 테이블 권한 재설정
ALTER TABLE public.finished_goods ENABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.finished_goods TO anon, authenticated, service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

DROP POLICY IF EXISTS "Public Read FG" ON public.finished_goods;
DROP POLICY IF EXISTS "Public Insert FG" ON public.finished_goods;
DROP POLICY IF EXISTS "Public Update FG" ON public.finished_goods;
DROP POLICY IF EXISTS "Public Delete FG" ON public.finished_goods;

CREATE POLICY "Public Read FG" ON public.finished_goods FOR SELECT TO anon USING (true);
CREATE POLICY "Public Insert FG" ON public.finished_goods FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Public Update FG" ON public.finished_goods FOR UPDATE TO anon USING (true);
CREATE POLICY "Public Delete FG" ON public.finished_goods FOR DELETE TO anon USING (true);


-- 4. product_logistics_specs (물류) 테이블 권한 재설정
ALTER TABLE public.product_logistics_specs ENABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.product_logistics_specs TO anon, authenticated, service_role;

DROP POLICY IF EXISTS "Public Read Log" ON public.product_logistics_specs;
DROP POLICY IF EXISTS "Public Insert Log" ON public.product_logistics_specs;
DROP POLICY IF EXISTS "Public Update Log" ON public.product_logistics_specs;
DROP POLICY IF EXISTS "Public Delete Log" ON public.product_logistics_specs;

CREATE POLICY "Public Read Log" ON public.product_logistics_specs FOR SELECT TO anon USING (true);
CREATE POLICY "Public Insert Log" ON public.product_logistics_specs FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Public Update Log" ON public.product_logistics_specs FOR UPDATE TO anon USING (true);
CREATE POLICY "Public Delete Log" ON public.product_logistics_specs FOR DELETE TO anon USING (true);
