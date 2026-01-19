-- Supabase DB Policies & Constraints Setup
-- 이 SQL을 실행해야 Google Sheets 연동 시 권한 오류나 충돌이 발생하지 않습니다.

-- 1. 중복 방지 제약조건 추가 (Upsert 기능 허용을 위해 필요하지만, 현재는 스크립트가 우회 처리 중)
-- 그래도 데이터 무결성을 위해 있으면 좋습니다.
ALTER TABLE finished_goods ADD CONSTRAINT finished_goods_product_name_key UNIQUE (product_name);
ALTER TABLE product_logistics_specs ADD CONSTRAINT product_logistics_specs_product_id_key UNIQUE (product_id);

-- 2. RLS(Row Level Security) 정책 설정
-- 익명 사용자(Anon Key)가 테이블을 수정할 수 있도록 허용합니다.
-- 주의: 실제 운영 환경에서는 로그인한 사용자만 수정하도록 제한하는 것이 좋습니다.
ALTER TABLE finished_goods ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_logistics_specs ENABLE ROW LEVEL SECURITY;

-- 모든 사용자(anon 포함)에게 모든 권한 허용
CREATE POLICY "Enable all access for finished_goods" 
ON finished_goods FOR ALL 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Enable all access for product_logistics_specs" 
ON product_logistics_specs FOR ALL 
USING (true) 
WITH CHECK (true);
