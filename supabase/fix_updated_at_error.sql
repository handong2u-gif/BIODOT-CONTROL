-- finished_goods 테이블에 updated_at 컬럼이 없어서 발생한 오류 해결
-- 1. updated_at 컬럼 추가
ALTER TABLE public.finished_goods 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- 2. 기존 데이터에 updated_at 값 채우기 (NULL인 경우)
UPDATE public.finished_goods
SET updated_at = NOW()
WHERE updated_at IS NULL;

-- 3. RPC 함수 다시 컴파일 (안전장치)
CREATE OR REPLACE FUNCTION update_product_sort_order(p_id BIGINT, p_sort_order INTEGER)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.finished_goods
    SET 
        sort_order = p_sort_order,
        updated_at = NOW()
    WHERE id = p_id;
END;
$$;
