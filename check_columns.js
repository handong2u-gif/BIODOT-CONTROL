
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceKey);

async function checkSchema() {
    console.log('Checking finished_goods columns...');
    const { data: fg, error: fgError } = await supabase
        .from('finished_goods')
        .select('*')
        .limit(1);

    if (fgError) console.error('Error fetching finished_goods:', fgError.message);
    else if (fg.length > 0) console.log('finished_goods columns:', Object.keys(fg[0]));
    else console.log('finished_goods is empty, cannot infer columns from data.');

    console.log('\nChecking product_logistics_specs...');
    const { data: pls, error: plsError } = await supabase
        .from('product_logistics_specs')
        .select('*')
        .limit(1);

    if (plsError) console.error('Error fetching product_logistics_specs:', plsError.message);
    else if (pls.length > 0) console.log('product_logistics_specs columns:', Object.keys(pls[0]));
    else console.log('product_logistics_specs is empty.');
}

checkSchema();
