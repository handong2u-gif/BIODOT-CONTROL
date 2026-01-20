-- [FINAL FIX] Safe Policy Reset & Column Check
-- 이 스크립트는 삭제 시 에러가 나지 않도록 안전하게 작성되었습니다.
-- Supabase SQL Editor에서 실행해주세요.

-- 1. 컬럼 확인 (없으면 추가)
DO $$
BEGIN
    -- online_price
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'finished_goods' AND column_name = 'online_price') THEN
        ALTER TABLE public.finished_goods ADD COLUMN online_price NUMERIC DEFAULT 0;
    END IF;

    -- sort_order
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'finished_goods' AND column_name = 'sort_order') THEN
        ALTER TABLE public.finished_goods ADD COLUMN sort_order INTEGER;
    END IF;
END $$;

-- 2. sort_order 초기화 (없는 경우 id로 채움)
UPDATE public.finished_goods 
SET sort_order = id 
WHERE sort_order IS NULL;

-- 3. 안전한 정책 재설정 (중복 에러 방지)
DO $$
BEGIN
    -- 기존 정책이 있으면 삭제
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'finished_goods' AND policyname = 'Public Read') THEN DROP POLICY "Public Read" ON public.finished_goods; END IF;
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'finished_goods' AND policyname = 'Public Insert') THEN DROP POLICY "Public Insert" ON public.finished_goods; END IF;
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'finished_goods' AND policyname = 'Public Update') THEN DROP POLICY "Public Update" ON public.finished_goods; END IF;
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'finished_goods' AND policyname = 'Public Delete') THEN DROP POLICY "Public Delete" ON public.finished_goods; END IF;

    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'finished_goods' AND policyname = 'Allow Anon Read') THEN DROP POLICY "Allow Anon Read" ON public.finished_goods; END IF;
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'finished_goods' AND policyname = 'Allow Anon Insert') THEN DROP POLICY "Allow Anon Insert" ON public.finished_goods; END IF;
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'finished_goods' AND policyname = 'Allow Anon Update') THEN DROP POLICY "Allow Anon Update" ON public.finished_goods; END IF;
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'finished_goods' AND policyname = 'Allow Anon Delete') THEN DROP POLICY "Allow Anon Delete" ON public.finished_goods; END IF;
END $$;

-- 4. 정책 새로 생성 (RLS 활성화)
ALTER TABLE public.finished_goods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow Anon Read" ON public.finished_goods FOR SELECT TO anon, authenticated, service_role USING (true);
CREATE POLICY "Allow Anon Insert" ON public.finished_goods FOR INSERT TO anon, authenticated, service_role WITH CHECK (true);
CREATE POLICY "Allow Anon Update" ON public.finished_goods FOR UPDATE TO anon, authenticated, service_role USING (true);
CREATE POLICY "Allow Anon Delete" ON public.finished_goods FOR DELETE TO anon, authenticated, service_role USING (true);
