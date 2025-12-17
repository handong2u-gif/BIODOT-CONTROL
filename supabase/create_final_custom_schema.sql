-- [최종] 사용자 요청 CSV 헤더 기반 스키마
-- 테이블: finished_goods (이전 raw_materials 통합)
-- 요청 헤더:
-- id, product_name, spec, wholesale_a, wholesale_b, wholesale_c, retail_price, cost_blind, 
-- expiry_date, inbound_date, thumbnail_url, cert_doc_url, report_doc_url, intro_doc_url, 
-- qty_carton, qty_container, active_clients, inactive_clients, unpaid_balance, last_check_date, competitor_comp, memo

DROP TABLE IF EXISTS public.finished_goods;
DROP TABLE IF EXISTS public.raw_materials; -- 기존꺼 정리

CREATE TABLE public.finished_goods (
    id SERIAL PRIMARY KEY,              -- id
    product_name TEXT NOT NULL,         -- product_name
    spec TEXT,                          -- spec
    wholesale_a NUMERIC DEFAULT 0,      -- wholesale_a
    wholesale_b NUMERIC DEFAULT 0,      -- wholesale_b
    wholesale_c NUMERIC DEFAULT 0,      -- wholesale_c
    retail_price NUMERIC DEFAULT 0,     -- retail_price
    cost_blind NUMERIC DEFAULT 0,       -- cost_blind
    expiry_date TEXT,                   -- expiry_date
    inbound_date TEXT,                  -- inbound_date
    thumbnail_url TEXT,                 -- thumbnail_url
    cert_doc_url TEXT,                  -- cert_doc_url
    report_doc_url TEXT,                -- report_doc_url
    intro_doc_url TEXT,                 -- intro_doc_url
    qty_carton TEXT,                    -- qty_carton
    qty_container TEXT,                 -- qty_container
    active_clients TEXT,                -- active_clients
    inactive_clients TEXT,              -- inactive_clients (new)
    unpaid_balance TEXT,                -- unpaid_balance
    last_check_date TEXT,               -- last_check_date
    competitor_comp TEXT,               -- competitor_comp
    memo TEXT,                          -- memo
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS 보안 설정
ALTER TABLE public.finished_goods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Access" ON public.finished_goods FOR ALL TO anon USING (true) WITH CHECK (true);
