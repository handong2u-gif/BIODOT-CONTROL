const headers = {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmdm1xb3RraGprZXdkd3ppYnliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1MDU5NjAsImV4cCI6MjA4MTA4MTk2MH0.7NrJDA3l4PnGNLcv4O55gPrmg-HWL59JPKjOwiwrR3c',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmdm1xb3RraGprZXdkd3ppYnliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1MDU5NjAsImV4cCI6MjA4MTA4MTk2MH0.7NrJDA3l4PnGNLcv4O55gPrmg-HWL59JPKjOwiwrR3c',
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
};

const baseUrl = 'https://qfvmqotkhjkewdwzibyb.supabase.co/rest/v1';

const remainingFixes = {
    7: [
        '작두콩, 수세미, 녹용 함유 어린이용 건강 음료',
        '총명탕 베이스의 녹용청명농축액 함유',
        '한방 재료 특유의 향을 줄이고 부드럽고 깔끔한 맛',
        '12개월 전후부터 섭취 가능',
        '인공 색소나 향료 무첨가로 안심'
    ],
    10: [
        '9번 숙성·증숙으로 사포닌 함량과 항산화력 극대화한 흑도라지',
        '흑도라지에 러시아산 녹용의 배합으로 목 건강과 면역 강화',
        '그대로 섭취하거나 따뜻한 물에 타서 간편 섭취',
        '환절기 기관지, 목건강 지킴이',
        '개봉 후 냉장 보관으로 신선도 유지'
    ],
    11: [
        '700년 전통 공진단 레시피 기반 제조',
        '40년 전통 한동녹용연구소의 검증된 기술력',
        '고급 한약재와 천연 꿀 사용으로 원기 회복 효과',
        '천연 꿀 반죽으로 은은하고 부드러운 단맛',
        '잦은 피로, 체력 저하, 회복 더딘 분께 추천'
    ]
};

async function fixRemaining() {
    console.log('=== 나머지 제품 정리 시작 ===\n');

    for (const [id, features] of Object.entries(remainingFixes)) {
        try {
            const url = `${baseUrl}/finished_goods?id=eq.${id}`;
            const res = await fetch(url, {
                method: 'PATCH',
                headers,
                body: JSON.stringify({ key_features: features })
            });

            if (res.ok) {
                const data = await res.json();
                console.log(`✅ ID ${id} (${data[0].product_name}) 업데이트 성공`);
                features.forEach((f, idx) => console.log(`  ${idx + 1}. ${f}`));
                console.log('');
            } else {
                console.log(`❌ ID ${id} 업데이트 실패:`, await res.text());
            }
        } catch (error) {
            console.error(`Error updating ID ${id}:`, error);
        }
    }

    console.log('=== 완료 ===');
}

fixRemaining();
