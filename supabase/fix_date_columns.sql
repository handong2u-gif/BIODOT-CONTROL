-- expiry_date와 inbound_date 컬럼이 혹시 숫자로 설정되어 있다면 DATE 타입으로 변경
-- 기존 데이터가 숫자(20250101)일 수도 있고 텍스트일 수도 있으므로 안전하게 변환

DO $$
BEGIN
    -- 1. expiry_date가 NUMERIC인지 확인하고 변경
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'finished_goods' 
        AND column_name = 'expiry_date' 
        AND data_type IN ('numeric', 'integer', 'bigint', 'double precision')
    ) THEN
        ALTER TABLE public.finished_goods 
        ALTER COLUMN expiry_date TYPE DATE 
        USING TO_DATE(expiry_date::TEXT, 'YYYYMMDD');
    ELSE
        -- 이미 텍스트나 날짜일 수 있지만, 명확히 DATE로 통일 (텍스트라면 변환 시도)
        -- 실패할 수 있으므로 안전한 캐스팅 시도
        BEGIN
            ALTER TABLE public.finished_goods 
            ALTER COLUMN expiry_date TYPE DATE 
            USING expiry_date::DATE;
        EXCEPTION WHEN OTHERS THEN
            -- 변환 실패 시 무시 (로그만 남김)
            RAISE NOTICE 'expiry_date 변환 중 오류 발생 (기존 데이터 유지)';
        END;
    END IF;

    -- 2. inbound_date 도 동일하게 처리
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'finished_goods' 
        AND column_name = 'inbound_date' 
        AND data_type IN ('numeric', 'integer', 'bigint', 'double precision')
    ) THEN
        ALTER TABLE public.finished_goods 
        ALTER COLUMN inbound_date TYPE DATE 
        USING TO_DATE(inbound_date::TEXT, 'YYYYMMDD');
    END IF;
END $$;
