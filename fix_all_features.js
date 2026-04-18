const headers = {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmdm1xb3RraGprZXdkd3ppYnliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1MDU5NjAsImV4cCI6MjA4MTA4MTk2MH0.7NrJDA3l4PnGNLcv4O55gPrmg-HWL59JPKjOwiwrR3c',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmdm1xb3RraGprZXdkd3ppYnliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1MDU5NjAsImV4cCI6MjA4MTA4MTk2MH0.7NrJDA3l4PnGNLcv4O55gPrmg-HWL59JPKjOwiwrR3c',
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
};

const baseUrl = 'https://qfvmqotkhjkewdwzibyb.supabase.co/rest/v1';

// 제목과 설명을 합치는 함수
function mergeFeatures(features) {
    if (!features || features.length === 0) return [];

    const merged = [];
    let i = 0;

    while (i < features.length) {
        const current = features[i].trim();

        // 짧은 텍스트 (제목으로 추정) + 다음 항목이 설명인 경우
        if (current.length < 30 && i + 1 < features.length) {
            const next = features[i + 1].trim();

            // 다음 항목이 설명처럼 보이면 (길거나 마침표로 끝남)
            if (next.length > 30 || next.endsWith('.') || next.endsWith('다') || next.endsWith('요')) {
                merged.push(`${current}: ${next}`);
                i += 2;
                continue;
            }
        }

        // 그 외의 경우 그대로 추가
        merged.push(current);
        i++;
    }

    return merged;
}

async function fixAllProducts() {
    try {
        console.log('=== 전체 제품 key_features 정리 시작 ===\n');

        // 모든 제품 가져오기
        const url = `${baseUrl}/finished_goods?select=id,product_name,key_features&order=id.asc`;
        const res = await fetch(url, { headers });
        const products = await res.json();

        for (const product of products) {
            if (!product.key_features || product.key_features.length === 0) {
                console.log(`ID ${product.id} (${product.product_name}): key_features 없음 - 건너뜀`);
                continue;
            }

            const original = product.key_features;
            const fixed = mergeFeatures(original);

            // 변경사항이 있는 경우에만 업데이트
            if (JSON.stringify(original) !== JSON.stringify(fixed)) {
                console.log(`\nID ${product.id}: ${product.product_name}`);
                console.log('변경 전:', original.length, '개');
                console.log('변경 후:', fixed.length, '개');

                // 업데이트
                const updateUrl = `${baseUrl}/finished_goods?id=eq.${product.id}`;
                const updateRes = await fetch(updateUrl, {
                    method: 'PATCH',
                    headers,
                    body: JSON.stringify({ key_features: fixed })
                });

                if (updateRes.ok) {
                    console.log('✅ 업데이트 성공');
                    fixed.forEach((f, idx) => console.log(`  ${idx + 1}. ${f}`));
                } else {
                    console.log('❌ 업데이트 실패:', await updateRes.text());
                }
            } else {
                console.log(`ID ${product.id} (${product.product_name}): 변경 불필요`);
            }
        }

        console.log('\n=== 완료 ===');
    } catch (error) {
        console.error('Error:', error);
    }
}

fixAllProducts();
