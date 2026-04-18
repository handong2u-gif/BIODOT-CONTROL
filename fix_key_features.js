const headers = {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmdm1xb3RraGprZXdkd3ppYnliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1MDU5NjAsImV4cCI6MjA4MTA4MTk2MH0.7NrJDA3l4PnGNLcv4O55gPrmg-HWL59JPKjOwiwrR3c',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmdm1xb3RraGprZXdkd3ppYnliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1MDU5NjAsImV4cCI6MjA4MTA4MTk2MH0.7NrJDA3l4PnGNLcv4O55gPrmg-HWL59JPKjOwiwrR3c',
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
};

const baseUrl = 'https://qfvmqotkhjkewdwzibyb.supabase.co/rest/v1';

async function fixKeyFeatures() {
    // 흑염소진액 key_features 수정
    const payload = {
        key_features: [
            '국내산 100% 흑염소 사용: 자연에서 자란 국내산 흑염소만을 100% 사용하여 믿을 수 있는 진한 영양과 기력을 선사합니다.',
            '러시아산 녹용 전지 배합: 상대, 중대, 하대가 모두 포함된 고품질 러시아산 녹용을 더해 흑염소 본연의 영양에 강인한 생명력을 더했습니다.',
            '잡내 제거 공법: 흑염소 특유의 누린내와 잡내를 제거하여 누구나 거부감 없이 깔끔하게 드실 수 있습니다.',
            '정성으로 달인 14가지 부원료: 뽕나무잎, 작약, 감초 등 흑염소와 조화가 좋은 14가지 전통 원료를 엄선하여 영양의 균형을 맞췄습니다.',
            '영양소 파괴 최소화 저온 추출 고농축: 저온 추출 공법을 통해 원료가 가진 본연의 영양소 파괴를 최소화하고 진한 풍미를 그대로 살렸습니다.'
        ]
    };

    try {
        console.log('=== 흑염소진액 key_features 수정 ===');

        const url = `${baseUrl}/finished_goods?id=eq.16`;
        const res = await fetch(url, {
            method: 'PATCH',
            headers,
            body: JSON.stringify(payload)
        });

        console.log('Status:', res.status);
        const data = await res.json();

        if (res.ok) {
            console.log('\n✅ key_features 수정 성공!');
            console.log('\n수정된 내용:');
            data[0].key_features.forEach((feature, idx) => {
                console.log(`${idx + 1}. ${feature}`);
            });
        } else {
            console.log('\n❌ 수정 실패');
            console.log(data);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

fixKeyFeatures();
