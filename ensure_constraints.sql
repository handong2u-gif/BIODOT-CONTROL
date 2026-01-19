DO $$ 
BEGIN 
    -- Ensure product_name is unique in finished_goods
    BEGIN
        ALTER TABLE finished_goods ADD CONSTRAINT finished_goods_product_name_key UNIQUE (product_name);
    EXCEPTION
        WHEN duplicate_table OR duplicate_object OR others THEN 
            RAISE NOTICE 'Constraint finished_goods_product_name_key might already exist or check logs: %', SQLERRM;
    END;

    -- Ensure product_id is unique in product_logistics_specs
    BEGIN
        ALTER TABLE product_logistics_specs ADD CONSTRAINT product_logistics_specs_product_id_key UNIQUE (product_id);
    EXCEPTION
        WHEN duplicate_table OR duplicate_object OR others THEN 
            RAISE NOTICE 'Constraint product_logistics_specs_product_id_key might already exist or check logs: %', SQLERRM;
    END;
END $$;
