import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log('--- Data Quality Check ---');

    // 1. Finished Goods Counts
    const { data: allProducts, error: err1 } = await supabase.from('finished_goods').select('id, product_name, expiry_date');
    if (err1) { console.error('Error fetching products:', err1); return; }

    const totalProducts = allProducts.length;
    const missingExpiry = allProducts.filter(p => !p.expiry_date).length;

    console.log(`Total Finished Goods: ${totalProducts}`);
    console.log(`Missing Expiry Date: ${missingExpiry} (${((missingExpiry / totalProducts) * 100).toFixed(1)}%)`);

    // 2. Logistics Specs Counts
    const { data: specs, error: err2 } = await supabase.from('product_logistics_specs').select('product_id');
    if (err2) { console.error('Error fetching specs:', err2); return; }

    const productsWithSpecs = new Set(specs.map(s => s.product_id));
    const missingSpecs = allProducts.filter(p => !productsWithSpecs.has(p.id)).length;

    console.log(`Products with Logistics Specs: ${productsWithSpecs.size}`);
    console.log(`Products Missing Specs: ${missingSpecs} (${((missingSpecs / totalProducts) * 100).toFixed(1)}%)`);

    if (missingSpecs > 0) {
        console.log('\nSample Products Missing Specs:');
        allProducts.filter(p => !productsWithSpecs.has(p.id)).slice(0, 5).forEach(p => console.log(`- ${p.product_name} (ID: ${p.id})`));
    }
}

main();
