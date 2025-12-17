import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

// Extract project ref from URL
const projectRef = supabaseUrl.split('//')[1].split('.')[0];
const dbPassword = serviceRoleKey; // Trying to use the secret as password if applicable, primarily checking connection.

// Construct connection string. Standard Supabase DB connection:
// postgres://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
// OR direct: postgres://postgres:[password]@db.[ref].supabase.co:5432/postgres
// Since we don't know the password for sure, we will try to use the secret provided.
// However, service_role key is NOT a database password.
// Use of 'postgres' user requires the actual database password.
// If the user provided a token, maybe it's for something else?
// We will TRY to connect.

console.log('Attempting to connect to DB via Port 6543 (Pooler)...');

// Try Regional Pooler (Seoul) for IPv4 access
const client = new pg.Client({
    host: 'aws-0-ap-northeast-2.pooler.supabase.com', // Guessed region: Seoul
    port: 6543,
    user: `postgres.${projectRef}`,
    password: serviceRoleKey,
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        console.log(`Connecting to ${client.host}:${client.port} as ${client.user}...`);
        await client.connect();
        console.log('Connected successfully!');

        const sqlPath = path.join(__dirname, 'supabase_schema_suggestion.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Running SQL...');
        await client.query(sql);
        console.log('SQL executed successfully! created tables.');

    } catch (err) {
        console.error('Database connection or execution failed:', err.message);
        if (err.message.includes('password')) {
            console.log('Authentication failed. Please verify the Database Password.');
        }
    } finally {
        await client.end();
    }
}

run();
