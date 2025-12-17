import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceKey);

async function checkTables() {
    console.log('Checking for country_master table...');
    const { data, error } = await supabase
        .from('country_master')
        .select('*')
        .limit(1);

    if (error) {
        console.log('Error querying country_master:', error.message);
        if (error.code === '42P01') { // undefined_table
            console.log('Table "country_master" does NOT exist.');
        }
    } else {
        console.log('Table "country_master" exists!');
    }
}

checkTables();
