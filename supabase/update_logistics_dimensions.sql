-- ============================================================
-- 물류 치수 직접 업데이트 (product_id 16, 17, 18)
-- 구글 시트에서 동기화가 안 된 경우 이 SQL을 Supabase SQL Editor에서 실행
-- 값은 구글 시트 실제 입력값으로 교체해서 쓰세요.
-- ============================================================

-- [제품 16] 한동 녹용 더:한 흑염소진액
UPDATE public.product_logistics_specs
SET
    product_width_mm   = NULL,   -- ← 실제 가로 입력 (mm)
    product_depth_mm   = NULL,   -- ← 실제 세로 입력 (mm)
    product_height_mm  = NULL,   -- ← 실제 높이 입력 (mm)
    carton_width_mm    = NULL,   -- ← 카톤 가로 (mm)
    carton_depth_mm    = NULL,   -- ← 카톤 세로 (mm)
    carton_height_mm   = NULL,   -- ← 카톤 높이 (mm)
    carton_weight_kg   = NULL,   -- ← 카톤 중량 (kg)
    units_per_carton   = 4       -- ← 카톤 입수 (현재 4개)
WHERE product_id = 16;

-- [제품 17] 한동 녹용 더:한 장어진액
UPDATE public.product_logistics_specs
SET
    product_width_mm   = NULL,
    product_depth_mm   = NULL,
    product_height_mm  = NULL,
    carton_width_mm    = NULL,
    carton_depth_mm    = NULL,
    carton_height_mm   = NULL,
    carton_weight_kg   = NULL,
    units_per_carton   = 4
WHERE product_id = 17;

-- [제품 18] 한동 발효녹용 엑소부스트 알부민
UPDATE public.product_logistics_specs
SET
    product_width_mm   = NULL,
    product_depth_mm   = NULL,
    product_height_mm  = NULL,
    carton_width_mm    = NULL,
    carton_depth_mm    = NULL,
    carton_height_mm   = NULL,
    carton_weight_kg   = NULL,
    units_per_carton   = 6
WHERE product_id = 18;

-- 업데이트 후 확인
SELECT
    fg.id,
    fg.product_name,
    ls.product_width_mm,
    ls.product_depth_mm,
    ls.product_height_mm,
    ls.carton_width_mm,
    ls.carton_depth_mm,
    ls.carton_height_mm,
    ls.units_per_carton,
    ls.carton_weight_kg
FROM public.finished_goods fg
JOIN public.product_logistics_specs ls ON ls.product_id = fg.id
WHERE fg.id IN (16, 17, 18)
ORDER BY fg.id;
