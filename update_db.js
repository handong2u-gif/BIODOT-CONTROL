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

const projectRef = supabaseUrl.split('//')[1].split('.')[0];
const sqlPath = path.join(__dirname, 'supabase/create_finished_goods.sql');
const sql = fs.readFileSync(sqlPath, 'utf8');

const configs = [
    {
        name: 'Pooler (Seoul)',
        host: 'aws-0-ap-northeast-2.pooler.supabase.com',
        port: 6543,
        user: `postgres.${projectRef}`,
        password: serviceRoleKey
    },
    {
        name: 'Pooler (Tokyo)',
        host: 'aws-0-ap-northeast-1.pooler.supabase.com',
        port: 6543,
        user: `postgres.${projectRef}`,
        password: serviceRoleKey
    },
    {
        name: 'Pooler (US East 1)',
        host: 'aws-0-us-east-1.pooler.supabase.com',
        port: 6543,
        user: `postgres.${projectRef}`,
        password: serviceRoleKey
    },
    {
        name: 'Direct Connection',
        host: `db.${projectRef}.supabase.co`,
        port: 5432,
        user: 'postgres',
        password: serviceRoleKey
    }
];

async function tryConnect(config) {
    console.log(`Trying ${config.name} (${config.host})...`);
    const client = new pg.Client({
        host: config.host,
        port: config.port,
        user: config.user,
        password: config.password,
        database: 'postgres',
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 5000
    });

    try {
        await client.connect();
        console.log(`Connected to ${config.name}!`);
        await client.query(sql);
        console.log('SQL executed successfully!');
        await client.end();
        return true;
    } catch (err) {
        console.log(`Failed ${config.name}: ${err.message}`); // Only log message to avoid noise
        await client.end();
        return false;
    }
}

async function run() {
    for (const config of configs) {
        if (await tryConnect(config)) {
            console.log("Success!");
            process.exit(0);
        }
    }
    console.error("All connection attempts failed.");
    process.exit(1);
}

run();
