-- [재설계] 원자재(Raw Materials) 전체 스키마 v2.0
-- 기존 테이블 삭제 후 새로 생성 (데이터가 초기화됩니다)

DROP TABLE IF EXISTS public.raw_materials;

CREATE TABLE public.raw_materials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- 1. 기본 정보
    name TEXT NOT NULL,                -- 제품명
    spec TEXT,                         -- 제품규격 (예: 600g, 1kg)
    origin_country TEXT,               -- 원산지
    
    -- 2. 가격 정보
    wholesale_price_a NUMERIC DEFAULT 0, -- 도매가 A
    wholesale_price_b NUMERIC DEFAULT 0, -- 도매가 B
    wholesale_price_c NUMERIC DEFAULT 0, -- 도매가 C
    retail_price NUMERIC DEFAULT 0,      -- 소매가
    cost_price NUMERIC DEFAULT 0,        -- 원가 (블라인드 처리용)
    
    -- 3. 날짜 및 재고
    expiration_date DATE,              -- 소비기한 (유통기한)
    inbound_date DATE,                 -- 입고일자
    stock_quantity INTEGER DEFAULT 0,  -- 재고 수량
    
    -- 4. 물류 정보
    carton_unit TEXT,                  -- 카톤 포장 단위 (예: 10box/CTN)
    container_capacity TEXT,           -- 컨테이너 적재 수량
    
    -- 5. 미디어 및 서류 (URL 링크 또는 파일 경로)
    thumbnail_url TEXT,                -- 섬네일 이미지
    test_report_url TEXT,              -- 시험성적서
    manufacturing_report_url TEXT,     -- 품목제조보고서
    brochure_url TEXT,                 -- 제품소개서
    
    -- 6. 영업/관리 정보
    active_clients TEXT,               -- 구매중인 업체 (활성/비활성)
    receivables_status TEXT,           -- 미수금 현황 (메모)
    competitor_comparison JSONB,       -- 경쟁사 비교 차트 데이터 (JSON)
    quality_issues TEXT,               -- 품질 이슈 사항
    last_inspection_date DATE,         -- 상태 점검일
    memo TEXT,                         -- 비고/메모

    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS 보안 설정 Re-apply
ALTER TABLE public.raw_materials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON public.raw_materials FOR SELECT TO anon USING (true);
CREATE POLICY "Allow public insert access" ON public.raw_materials FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.raw_materials FOR UPDATE TO anon USING (true);
CREATE POLICY "Allow public delete access" ON public.raw_materials FOR DELETE TO anon USING (true);

-- 샘플 데이터 입력
INSERT INTO public.raw_materials 
(name, spec, origin_country, wholesale_price_a, retail_price, cost_price, stock_quantity, active_clients)
VALUES 
('뉴질랜드 녹용 분골특', '600g', '뉴질랜드', 1100000, 1500000, 900000, 50, '활성 업체 다수'),
('러시아 녹용 상대', '1kg', '러시아', 450000, 600000, 350000, 100, '신규 진입 예정');
