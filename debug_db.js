
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Supabase URL:', supabaseUrl);
// console.log('Service Key:', serviceKey); // Do not print key

if (!supabaseUrl || !serviceKey) {
    console.error('Error: Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function checkTable(tableName) {
    console.log(`\nChecking table: ${tableName}`);
    try {
        const { count, error } = await supabase
            .from(tableName)
            .select('*', { count: 'exact', head: true });

        if (error) {
            console.error(`Error checking ${tableName}:`, error.message);
        } else {
            console.log(`Table ${tableName} exists. Row count: ${count}`);
        }
    } catch (e) {
        console.error("Exception during fetch:", e);
    }
}

async function main() {
    await checkTable('raw_materials');
    await checkTable('finished_goods');
}

main();
