
const headers = {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmdm1xb3RraGprZXdkd3ppYnliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1MDU5NjAsImV4cCI6MjA4MTA4MTk2MH0.7NrJDA3l4PnGNLcv4O55gPrmg-HWL59JPKjOwiwrR3c',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmdm1xb3RraGprZXdkd3ppYnliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1MDU5NjAsImV4cCI6MjA4MTA4MTk2MH0.7NrJDA3l4PnGNLcv4O55gPrmg-HWL59JPKjOwiwrR3c',
    'Content-Type': 'application/json'
};

const baseUrl = 'https://qfvmqotkhjkewdwzibyb.supabase.co/rest/v1';

async function check(table) {
    try {
        const url = `${baseUrl}/${table}?select=id,product_name,created_at,updated_at&order=updated_at.desc&limit=3`;
        const res = await fetch(url, { headers });
        const data = await res.json();
        console.log(`--- ${table} (ordered by updated_at) ---`);
        console.log(JSON.stringify(data, null, 2));
    } catch (error) {
        console.error(error);
    }
}

async function run() {
    await check('finished_goods');
    await check('raw_materials');
}

run();
