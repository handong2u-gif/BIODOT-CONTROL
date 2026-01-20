-- Add product dimension columns to product_logistics_specs
ALTER TABLE public.product_logistics_specs 
ADD COLUMN IF NOT EXISTS product_width_mm NUMERIC,
ADD COLUMN IF NOT EXISTS product_depth_mm NUMERIC,
ADD COLUMN IF NOT EXISTS product_height_mm NUMERIC;

-- Comment on columns
COMMENT ON COLUMN public.product_logistics_specs.product_width_mm IS '제품(단품) 가로 길이 (mm)';
COMMENT ON COLUMN public.product_logistics_specs.product_depth_mm IS '제품(단품) 세로/폭 길이 (mm)';
COMMENT ON COLUMN public.product_logistics_specs.product_height_mm IS '제품(단품) 높이 (mm)';
