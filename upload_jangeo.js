const headers = {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmdm1xb3RraGprZXdkd3ppYnliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1MDU5NjAsImV4cCI6MjA4MTA4MTk2MH0.7NrJDA3l4PnGNLcv4O55gPrmg-HWL59JPKjOwiwrR3c',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmdm1xb3RraGprZXdkd3ppYnliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1MDU5NjAsImV4cCI6MjA4MTA4MTk2MH0.7NrJDA3l4PnGNLcv4O55gPrmg-HWL59JPKjOwiwrR3c',
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
};

const baseUrl = 'https://qfvmqotkhjkewdwzibyb.supabase.co/rest/v1';

async function uploadJangeo() {
    // 장어진액 데이터
    const payload = {
        ingredients: '정제수(65.49%), 장어(18.00%), 녹용추출액(3.00%), 참당귀(1.00%), 대추(1.00%), 두충수피(0.80%), 황기(0.80%), 지황[숙지황](0.80%), 구기자나무열매(0.80%), 건조불로초자실체[영지](0.80%), 감귤껍질[진피](0.80%), 더덕뿌리(0.80%), 감초(0.80%), 둥굴레(0.80%), 계피(0.80%), 건조비수리[야관문](0.50%), 복분자(0.50%), 생강(0.50%), 사철쑥[인진쑥](0.50%), 도라지뿌리(0.50%), 마뿌리[산약](0.50%), 칡뿌리(0.50%), 상어연골추출물분말(0.01%)',
        selling_point: '40년 전통의 노하우로 장어 특유의 비린내는 깔끔하게 잡고, 러시아산 녹용의 기운과 20가지 전통 원료의 진함을 가득 채운 프리미엄 활력 한 포입니다.',
        key_features: [
            '40년 전통의 신뢰와 고집: 40년 전통 한동녹용연구소의 숙련된 기술력과 타협하지 않는 원료 선별 원칙을 담아 완성했습니다.',
            '임금님께 진상되던 귀한 원료: 예로부터 기력 보강을 위해 임금님께 진상되던 귀한 보양식인 국내산 민물장어의 기운을 그대로 담았습니다.',
            '러시아산 녹용과의 성질 조화: 혹독한 추위를 견뎌낸 러시아산 녹용과 장어의 조화를 통해, 서로의 성질을 보완하고 활력 시너지를 극대화했습니다.',
            '비린내 없이 깔끔한 20가지 부원료: 대추, 숙지황, 당귀 등 20가지 전통 부원료를 한동만의 황금 비율로 배합하여 장어 특유의 비린 맛을 완벽하게 잡았습니다.',
            '검증된 안전성 (HACCP 인증): HACCP 인증을 받은 위생적인 제조 시설에서 엄격하게 생산하여 온 가족이 안심하고 섭취할 수 있습니다.'
        ]
    };

    try {
        console.log('=== 장어진액 업로드 시도 ===');

        const url = `${baseUrl}/finished_goods?id=eq.17`;
        const res = await fetch(url, {
            method: 'PATCH',
            headers,
            body: JSON.stringify(payload)
        });

        console.log('Status:', res.status);
        const data = await res.json();
        console.log('Response:', JSON.stringify(data, null, 2));

        if (res.ok) {
            console.log('\n✅ 장어진액 업로드 성공!');
        } else {
            console.log('\n❌ 업로드 실패');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

uploadJangeo();
