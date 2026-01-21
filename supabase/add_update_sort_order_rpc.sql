-- Create a stored procedure to update sort order securely
-- This bypasses complex RLS checks on the table by running as SECURITY DEFINER (owner privileges)

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

-- Grant execute permission to everyone
GRANT EXECUTE ON FUNCTION update_product_sort_order(BIGINT, INTEGER) TO anon, authenticated, service_role;
