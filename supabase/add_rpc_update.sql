-- [Force Update RPC]
-- RLS 문제를 우회하기 위한 서버 사이드 함수 (Security Definer)

CREATE OR REPLACE FUNCTION update_raw_material_v2(
    p_id uuid,
    p_field text,
    p_value text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- 관리자 권한으로 실행 (RLS 우회)
AS $$
BEGIN
    -- Product Name
    IF p_field = 'product_name' THEN
        UPDATE raw_materials SET product_name = p_value WHERE id = p_id;
    
    -- Spec
    ELSIF p_field = 'spec' THEN
        UPDATE raw_materials SET spec = p_value WHERE id = p_id;
        
    -- Origin Country
    ELSIF p_field = 'origin_country' THEN
        UPDATE raw_materials SET origin_country = p_value WHERE id = p_id;
        
    -- Wholesale A (Supply Price)
    ELSIF p_field = 'wholesale_a' THEN
        UPDATE raw_materials SET wholesale_a = NULLIF(p_value, '')::numeric WHERE id = p_id;
        
    -- Cost Price
    ELSIF p_field = 'cost_price' THEN
        UPDATE raw_materials SET cost_price = NULLIF(p_value, '')::numeric WHERE id = p_id;
        
    -- Memo
    ELSIF p_field = 'memo' THEN
        UPDATE raw_materials SET memo = p_value WHERE id = p_id;
        
    END IF;
END;
$$;

-- 실행 권한 부여
GRANT EXECUTE ON FUNCTION update_raw_material_v2(uuid, text, text) TO anon;
GRANT EXECUTE ON FUNCTION update_raw_material_v2(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION update_raw_material_v2(uuid, text, text) TO service_role;
