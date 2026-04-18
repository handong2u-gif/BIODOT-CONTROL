
const headers = {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmdm1xb3RraGprZXdkd3ppYnliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1MDU5NjAsImV4cCI6MjA4MTA4MTk2MH0.7NrJDA3l4PnGNLcv4O55gPrmg-HWL59JPKjOwiwrR3c',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmdm1xb3RraGprZXdkd3ppYnliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1MDU5NjAsImV4cCI6MjA4MTA4MTk2MH0.7NrJDA3l4PnGNLcv4O55gPrmg-HWL59JPKjOwiwrR3c',
    'Content-Type': 'application/json'
};

const baseUrl = 'https://qfvmqotkhjkewdwzibyb.supabase.co/rest/v1';

async function checkAllData() {
    try {
        const url = `${baseUrl}/finished_goods?id=in.(16,17)&select=*`;
        const res = await fetch(url, { headers });
        const data = await res.json();
        console.log('=== 전체 데이터 확인 ===');
        console.log(JSON.stringify(data, null, 2));
    } catch (error) {
        console.error(error);
    }
}

checkAllData();
