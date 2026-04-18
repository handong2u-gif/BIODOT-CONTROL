const headers = {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmdm1xb3RraGprZXdkd3ppYnliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1MDU5NjAsImV4cCI6MjA4MTA4MTk2MH0.7NrJDA3l4PnGNLcv4O55gPrmg-HWL59JPKjOwiwrR3c',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmdm1xb3RraGprZXdkd3ppYnliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1MDU5NjAsImV4cCI6MjA4MTA4MTk2MH0.7NrJDA3l4PnGNLcv4O55gPrmg-HWL59JPKjOwiwrR3c',
    'Content-Type': 'application/json'
};

const baseUrl = 'https://qfvmqotkhjkewdwzibyb.supabase.co/rest/v1';

async function checkAllProducts() {
    try {
        const url = `${baseUrl}/finished_goods?select=id,product_name,selling_point,key_features,ingredients,updated_at&order=id.asc`;
        const res = await fetch(url, { headers });
        const data = await res.json();

        console.log('=== 전체 제품 마케팅 데이터 확인 ===\n');

        data.forEach(product => {
            console.log(`ID ${product.id}: ${product.product_name}`);
            console.log(`  selling_point: ${product.selling_point ? '✅ 있음' : '❌ 없음'}`);
            console.log(`  key_features: ${product.key_features ? '✅ 있음 (' + product.key_features.length + '개)' : '❌ 없음'}`);
            console.log(`  ingredients: ${product.ingredients ? '✅ 있음' : '❌ 없음'}`);
            console.log(`  updated_at: ${product.updated_at}`);
            console.log('');
        });

        console.log('\n=== 마케팅 데이터 없는 제품 ===');
        const missing = data.filter(p => !p.selling_point && !p.key_features && !p.ingredients);
        if (missing.length > 0) {
            missing.forEach(p => console.log(`- ID ${p.id}: ${p.product_name}`));
        } else {
            console.log('모든 제품에 마케팅 데이터가 있습니다!');
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

checkAllProducts();
