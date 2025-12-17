import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// User provided password
const DB_PASSWORD = 'gksehd3347!';
const supabaseUrl = process.env.VITE_SUPABASE_URL;

if (!supabaseUrl) {
    console.error('Missing VITE_SUPABASE_URL.');
    process.exit(1);
}

// Parse URL: https://[ref].supabase.co
const projectRef = supabaseUrl.split('//')[1].split('.')[0];
console.log(`Project Ref: ${projectRef}`);

// Direct connection (IPv4/IPv6 dependent) or Pooler
// We'll try poolers first as they are safer for external access typically
const regions = [
    { host: 'aws-0-ap-northeast-2.pooler.supabase.com', region: 'Seoul' },
    { host: 'aws-0-ap-northeast-1.pooler.supabase.com', region: 'Tokyo' },
    { host: 'aws-0-us-east-1.pooler.supabase.com', region: 'Virginia' },
    { host: 'aws-0-us-west-1.pooler.supabase.com', region: 'Oregon' },
    { host: 'aws-0-ap-southeast-1.pooler.supabase.com', region: 'Singapore' },
    { host: 'aws-0-eu-central-1.pooler.supabase.com', region: 'Frankfurt' }
];

async function tryConnect(hostUrl, regionName) {
    console.log(`Trying ${regionName} (${hostUrl})...`);
    // Note: Pooler usually needs user to be postgres.[ref]
    const user = `postgres.${projectRef}`;

    const client = new pg.Client({
        host: hostUrl,
        port: 6543,
        user: user,
        password: DB_PASSWORD,
        database: 'postgres',
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 5000
    });

    try {
        await client.connect();
        console.log(`✓ Connected to ${regionName}!`);
        return client;
    } catch (err) {
        console.log(`x Failed ${regionName}: ${err.message}`);
        try { await client.end(); } catch (e) { }
        return null;
    }
}

async function run() {
    let client = null;

    // 1. Try Direct (Port 5432) - "db.[ref].supabase.co"
    // Sometimes works better if IPv4 enabled or IPv6 network
    const directHost = `db.${projectRef}.supabase.co`;
    console.log(`Trying Direct Connection (${directHost})...`);
    client = new pg.Client({
        host: directHost,
        port: 5432,
        user: 'postgres', // User is just 'postgres' for direct
        password: DB_PASSWORD,
        database: 'postgres',
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 5000
    });

    try {
        await client.connect();
        console.log(`✓ Connected via Direct Connection!`);
    } catch (err) {
        console.log(`x Failed Direct: ${err.message}`);
        client = null;
    }

    // 2. If Direct failed, try Poolers
    if (!client) {
        for (const r of regions) {
            client = await tryConnect(r.host, r.region);
            if (client) break;
        }
    }

    if (!client) {
        console.error('Could not connect to database. Password might be wrong or network locked.');
        process.exit(1);
    }

    try {
        // Read SQLs
        // We know we need finished_goods first.
        const files = [
            'supabase/create_finished_goods.sql',
            'supabase_schema_suggestion.sql'
        ];

        for (const file of files) {
            const sqlPath = path.join(__dirname, file);
            if (fs.existsSync(sqlPath)) {
                console.log(`Running ${file}...`);
                const sql = fs.readFileSync(sqlPath, 'utf8');
                await client.query(sql);
                console.log(`✓ ${file} executed.`);
            } else {
                console.warn(`! ${file} not found.`);
            }
        }

        console.log('All migrations completed successfully.');

    } catch (err) {
        console.error('Migration execution failed:', err.message);
    } finally {
        if (client) await client.end();
    }
}

run();
