
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
    const payload = {
        product_name: 'Debug Product ' + Date.now(),
        spec: 'Debug Spec',
        wholesale_a: 1000,
        // tags: ['debug', 'test'], // Comment out array first to isolate causes if needed, but let's try with it since that was the new column
        tags: ['debug', 'test'],
        detail_image_url: 'http://example.com/img.jpg',
        stock_status: 'in_stock'
    };

    console.log('Attempting insert with payload:', payload);

    const { data, error } = await supabase
        .from('finished_goods')
        .upsert(payload)
        .select()
        .single();

    if (error) {
        console.error('Insert Failed details:', JSON.stringify(error, null, 2));
    } else {
        console.log('Insert Success:', data);
    }
}

testInsert();
