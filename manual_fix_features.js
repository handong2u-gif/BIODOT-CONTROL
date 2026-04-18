const headers = {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmdm1xb3RraGprZXdkd3ppYnliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1MDU5NjAsImV4cCI6MjA4MTA4MTk2MH0.7NrJDA3l4PnGNLcv4O55gPrmg-HWL59JPKjOwiwrR3c',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmdm1xb3RraGprZXdkd3ppYnliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1MDU5NjAsImV4cCI6MjA4MTA4MTk2MH0.7NrJDA3l4PnGNLcv4O55gPrmg-HWL59JPKjOwiwrR3c',
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
};

const baseUrl = 'https://qfvmqotkhjkewdwzibyb.supabase.co/rest/v1';

const manualFixes = {
    4: [
        '체력 회복, 면역력 강화, 피로 개선에 도움',
        '녹용과 주요 한약재를 5회 이상 정성껏 빚고 건조하여 완성',
        '꿀로 반죽하여 은은하고 부드러운 목넘김',
        '피로 누적 직장인, 원기 회복 필요 중장년층, 건강 선물용 추천'
    ],
    5: [
        '체력 회복, 면역력 강화, 피로 개선에 도움',
        '녹용과 주요 한약재를 5회 이상 정성껏 빚고 건조하여 완성',
        '꿀로 반죽하여 은은하고 부드러운 맛',
        '피로 누적 직장인, 원기 회복 필요 중장년층, 건강 선물용 추천'
    ],
    12: [
        '녹용, 당귀, 작약, 대추, 감초, 계피 6가지 한방 원료 블렌딩',
        '직접 파우치에 넣고 달여 마시는 형태로 깊고 부드러운 맛 (진하기 조절 가능)',
        '카페인 무함유로 밤에도 안심 섭취',
        '피로 누적 오후나 취침 전 원기 회복에 효과적'
    ],
    15: [
        '한동녹용연구소 베스트 상품: 오랜 시간 검증된 대표 제품으로 고객 만족도 1위',
        '고급 포장 + 보자기 + 쇼핑백 증정: 선물 가치를 극대화하는 프리미엄 패키지',
        '유네스코 세계유산 알타이 황금 산맥의 청정 녹용',
        '부모님 효도 선물, 명절 선물 최적',
        '체력 저하, 피로 누적, 원기 회복 필요한 분께 추천',
        '남녀노소 누구나 섭취 가능: 최적 배합 비율로 온 가족이 함께'
    ],
    16: [
        '국내산 100% 흑염소 사용: 자연에서 자란 국내산 흑염소만을 100% 사용하여 믿을 수 있는 진한 영양과 기력을 선사합니다.',
        '러시아산 녹용 전지 배합: 상대, 중대, 하대가 모두 포함된 고품질 러시아산 녹용을 더해 흑염소 본연의 영양에 강인한 생명력을 더했습니다.',
        '잡내 제거 공법: 흑염소 특유의 누린내와 잡내를 제거하여 누구나 거부감 없이 깔끔하게 드실 수 있습니다.',
        '정성으로 달인 14가지 부원료: 뽕나무잎, 작약, 감초 등 흑염소와 조화가 좋은 14가지 전통 원료를 엄선하여 영양의 균형을 맞췄습니다.',
        '영양소 파괴 최소화 저온 추출 고농축: 저온 추출 공법을 통해 원료가 가진 본연의 영양소 파괴를 최소화하고 진한 풍미를 그대로 살렸습니다.'
    ],
    17: [
        '40년 전통의 신뢰와 고집: 40년 전통 한동녹용연구소의 숙련된 기술력과 타협하지 않는 원료 선별 원칙을 담아 완성했습니다.',
        '임금님께 진상되던 귀한 원료: 예로부터 기력 보강을 위해 임금님께 진상되던 귀한 보양식인 국내산 민물장어의 기운을 그대로 담았습니다.',
        '러시아산 녹용과의 성질 조화: 혹독한 추위를 견뎌낸 러시아산 녹용과 장어의 조화를 통해, 서로의 성질을 보완하고 활력 시너지를 극대화했습니다.',
        '비린내 없이 깔끔한 20가지 부원료: 대추, 숙지황, 당귀 등 20가지 전통 부원료를 한동만의 황금 비율로 배합하여 장어 특유의 비린 맛을 완벽하게 잡았습니다.',
        '검증된 안전성 (HACCP 인증): HACCP 인증을 받은 위생적인 제조 시설에서 엄격하게 생산하여 온 가족이 안심하고 섭취할 수 있습니다.'
    ]
};

async function applyManualFixes() {
    console.log('=== 수동 수정 적용 시작 ===\n');

    for (const [id, features] of Object.entries(manualFixes)) {
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

applyManualFixes();
