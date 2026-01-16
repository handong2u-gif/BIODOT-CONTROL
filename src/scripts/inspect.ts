
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    // 1. Inspect finished_goods
    console.log('--- Finished Goods ---');
    const { data: products, error } = await supabase
        .from('finished_goods')
        .select('*')
        .limit(1);

    if (products && products.length > 0) {
        console.log('Columns:', Object.keys(products[0]));
    } else {
        console.log('No products or error:', error);
    }

    // 2. Inspect product_logistics_specs
    console.log('\n--- Logistics Specs ---');
    const { data: specs, error: specError } = await supabase
        .from('product_logistics_specs')
        .select('*')
        .limit(1);

    if (specs && specs.length > 0) {
        console.log('Columns:', Object.keys(specs[0]));
    } else {
        console.log('No specs or error:', specError);
    }

    // 3. List all product names
    console.log('\n--- All Product Names ---');
    const { data: allNames } = await supabase
        .from('finished_goods')
        .select('product_name');

    if (allNames) {
        allNames.forEach(p => console.log(p.product_name));
    }
}

main();
