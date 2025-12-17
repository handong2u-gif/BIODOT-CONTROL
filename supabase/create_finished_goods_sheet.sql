-- [구글 시트 기반] 완제품(Finished Goods) 스키마 변경
-- 시트 헤더 순서 및 매핑:
-- 연번 -> id (Serial, 자동생성)
-- 제품명 -> name
-- 제품규격 -> spec
-- 도매가_A -> wholesale_price_a
-- 도매가_B -> wholesale_price_b
-- 도매가_C -> wholesale_price_c
-- 소매가 -> retail_price
-- 원가_블라인드 -> cost_price
-- 유통기한 -> expiration_date
-- 카톤포장단위 -> carton_unit
-- 컨테이너수량 -> container_capacity
-- 시험성적서 -> test_report_url
-- 품목제조보고서 -> manufacturing_report_url
-- 제품소개서 -> brochure_url
-- 활성업체 -> active_clients
-- 비활성업체 -> inactive_clients
-- 미수금현황 -> receivables_status
-- 상태점검일 -> last_inspection_date
-- 경쟁사비교 -> competitor_comparison
-- 비고메모 -> memo

DROP TABLE IF EXISTS public.finished_goods;

CREATE TABLE public.finished_goods (
    id SERIAL PRIMARY KEY,             -- 연번 (자동 증가)
    name TEXT NOT NULL,                -- 제품명
    spec TEXT,                         -- 제품규격
    wholesale_price_a NUMERIC DEFAULT 0, -- 도매가_A
    wholesale_price_b NUMERIC DEFAULT 0, -- 도매가_B
    wholesale_price_c NUMERIC DEFAULT 0, -- 도매가_C
    retail_price NUMERIC DEFAULT 0,      -- 소매가
    cost_price NUMERIC DEFAULT 0,        -- 원가_블라인드
    expiration_date TEXT,              -- 유통기한 (날짜/문자열 호환)
    carton_unit TEXT,                  -- 카톤포장단위
    container_capacity TEXT,           -- 컨테이너수량
    test_report_url TEXT,              -- 시험성적서
    manufacturing_report_url TEXT,     -- 품목제조보고서
    brochure_url TEXT,                 -- 제품소개서
    active_clients TEXT,               -- 활성업체
    inactive_clients TEXT,             -- 비활성업체
    receivables_status TEXT,           -- 미수금현황
    last_inspection_date TEXT,         -- 상태점검일
    competitor_comparison TEXT,        -- 경쟁사비교
    memo TEXT,                         -- 비고메모
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 보안 정책 (RLS) 재설정
ALTER TABLE public.finished_goods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read" ON public.finished_goods FOR SELECT TO anon USING (true);
CREATE POLICY "Public Insert" ON public.finished_goods FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Public Update" ON public.finished_goods FOR UPDATE TO anon USING (true);
CREATE POLICY "Public Delete" ON public.finished_goods FOR DELETE TO anon USING (true);
