const headers = {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmdm1xb3RraGprZXdkd3ppYnliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1MDU5NjAsImV4cCI6MjA4MTA4MTk2MH0.7NrJDA3l4PnGNLcv4O55gPrmg-HWL59JPKjOwiwrR3c',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmdm1xb3RraGprZXdkd3ppYnliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1MDU5NjAsImV4cCI6MjA4MTA4MTk2MH0.7NrJDA3l4PnGNLcv4O55gPrmg-HWL59JPKjOwiwrR3c',
    'Content-Type': 'application/json'
};

const baseUrl = 'https://qfvmqotkhjkewdwzibyb.supabase.co/rest/v1';

async function getAllProducts() {
    try {
        const url = `${baseUrl}/finished_goods?select=id,product_name,key_features&order=id.asc`;
        const res = await fetch(url, { headers });
        const products = await res.json();

        console.log('=== 전체 제품 key_features 현황 ===\n');

        products.forEach(product => {
            console.log(`ID ${product.id}: ${product.product_name}`);
            if (product.key_features && product.key_features.length > 0) {
                product.key_features.forEach((f, idx) => {
                    console.log(`  ${idx + 1}. ${f}`);
                });
            } else {
                console.log('  (key_features 없음)');
            }
            console.log('');
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

getAllProducts();
