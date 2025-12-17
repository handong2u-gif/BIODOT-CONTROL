import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log('Checking connection to:', supabaseUrl);

    const { data, error } = await supabase
        .from('finished_goods')
        .select('*')
        .limit(5);

    if (error) {
        console.error('Error fetching finished_goods:', error);
    } else {
        console.log('Successfully fetched finished_goods. Count:', data.length);
        console.log('Sample data:', data);
    }
}

check();
