const headers = {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmdm1xb3RraGprZXdkd3ppYnliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1MDU5NjAsImV4cCI6MjA4MTA4MTk2MH0.7NrJDA3l4PnGNLcv4O55gPrmg-HWL59JPKjOwiwrR3c',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmdm1xb3RraGprZXdkd3ppYnliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1MDU5NjAsImV4cCI6MjA4MTA4MTk2MH0.7NrJDA3l4PnGNLcv4O55gPrmg-HWL59JPKjOwiwrR3c',
    'Content-Type': 'application/json'
};

const baseUrl = 'https://qfvmqotkhjkewdwzibyb.supabase.co/rest/v1';

async function testSearch(term) {
    try {
        const url = `${baseUrl}/finished_goods?product_name=ilike.*${encodeURIComponent(term)}*&select=id,product_name`;
        console.log(`Searching for: ${term} (URL: ${url})`);
        const res = await fetch(url, { headers });
        const data = await res.json();
        console.log('Results:', data);
    } catch (error) {
        console.error('Error:', error);
    }
}

async function run() {
    await testSearch('녹용칼슘스틱');
    await testSearch('녹용');
    await testSearch('칼슘');
}

run();
