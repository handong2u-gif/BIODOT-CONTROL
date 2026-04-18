const headers = {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmdm1xb3RraGprZXdkd3ppYnliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1MDU5NjAsImV4cCI6MjA4MTA4MTk2MH0.7NrJDA3l4PnGNLcv4O55gPrmg-HWL59JPKjOwiwrR3c',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmdm1xb3RraGprZXdkd3ppYnliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1MDU5NjAsImV4cCI6MjA4MTA4MTk2MH0.7NrJDA3l4PnGNLcv4O55gPrmg-HWL59JPKjOwiwrR3c',
    'Content-Type': 'application/json'
};

const baseUrl = 'https://qfvmqotkhjkewdwzibyb.supabase.co/rest/v1';

async function checkProduct() {
    try {
        // 캡처에 보이는 제품 확인 (ID 4로 추정)
        const url = `${baseUrl}/finished_goods?id=eq.4&select=id,product_name,key_features,selling_point,ingredients`;
        const res = await fetch(url, { headers });
        const data = await res.json();

        if (data.length > 0) {
            const product = data[0];
            console.log('제품명:', product.product_name);
            console.log('\n=== Key Features ===');
            if (product.key_features) {
                product.key_features.forEach((feature, idx) => {
                    console.log(`${idx + 1}. ${feature}`);
                });
            } else {
                console.log('없음');
            }

            console.log('\n=== Selling Point ===');
            console.log(product.selling_point || '없음');

            console.log('\n=== Ingredients ===');
            console.log(product.ingredients || '없음');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

checkProduct();
