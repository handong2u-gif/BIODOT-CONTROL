-- product_logistics_specs 테이블에 logistics_barcode 컬럼 추가
ALTER TABLE product_logistics_specs 
ADD COLUMN IF NOT EXISTS logistics_barcode TEXT;

-- 코멘트 추가 (선택사항)
COMMENT ON COLUMN product_logistics_specs.logistics_barcode IS '완제품 바코드 번호 (GTIN/EAN)';
