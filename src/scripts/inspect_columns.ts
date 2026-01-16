
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log('--- Probing Product Logistics Specs Columns ---');

    // Try to insert a dummy row for product_id 1 to see columns
    // Assuming product_id 1 exists (from previous run)

    const payload = { product_id: 1 };

    const { data, error } = await supabase
        .from('product_logistics_specs')
        .insert(payload)
        .select();

    if (error) {
        console.log('Insert Error:', error);
    } else if (data && data.length > 0) {
        console.log('Insert Success. Columns:', Object.keys(data[0]));

        // Cleanup
        const { error: delError } = await supabase
            .from('product_logistics_specs')
            .delete()
            .eq('id', data[0].id);

        if (delError) console.log('Cleanup Error:', delError);
    } else {
        console.log('Insert returned no data');
    }
}

main();
