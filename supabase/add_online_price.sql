-- finished_goods 테이블에 온라인판매가(online_price) 컬럼 추가
ALTER TABLE public.finished_goods 
ADD COLUMN IF NOT EXISTS online_price NUMERIC DEFAULT 0;

-- 코멘트 추가
COMMENT ON COLUMN public.finished_goods.online_price IS '온라인 판매가 (Online Price)';
