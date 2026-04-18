const headers = {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmdm1xb3RraGprZXdkd3ppYnliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1MDU5NjAsImV4cCI6MjA4MTA4MTk2MH0.7NrJDA3l4PnGNLcv4O55gPrmg-HWL59JPKjOwiwrR3c',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmdm1xb3RraGprZXdkd3ppYnliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1MDU5NjAsImV4cCI6MjA4MTA4MTk2MH0.7NrJDA3l4PnGNLcv4O55gPrmg-HWL59JPKjOwiwrR3c',
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
};

const baseUrl = 'https://qfvmqotkhjkewdwzibyb.supabase.co/rest/v1';

const products = [
    {
        id: 16,
        name: '흑염소진액',
        data: {
            ingredients: '흑염소추출물[흑염소혼합추출액(고형분3%이상); 정제수(70%), 흑염소(18%), 참당귀뿌리(1%), 칡뿌리(1%), 뽕나무어린가지(1%), 약쑥잎(1%), 작약뿌리(1%), 건조감귤껍질(1%), 익모초지상부(1%), 두충수피(0.5%), 오갈피나무(0.5%), 지황(0.5%), 건생강(0.5%), 계피(1%), 대추(1%), 맥아(1%)](94.67%), 녹용추출액[고형분1%이상; 정제수(99.75%), 녹용(0.25%)](3.00%), 프락토올리고당(2.33%)',
            selling_point: '국내산 100% 흑염소의 진한 영양에 러시아산 녹용의 생명력을 더해, 잡내 없이 깔끔하게 채우는 고품격 기력 에너지를 경험해 보세요.',
            key_features: [
                '국내산 100% 흑염소 사용: 자연에서 자란 국내산 흑염소만을 100% 사용하여 믿을 수 있는 진한 영양과 기력을 선사합니다.',
                '러시아산 녹용 전지 배합: 상대, 중대, 하대가 모두 포함된 고품질 러시아산 녹용을 더해 흑염소 본연의 영양에 강인한 생명력을 더했습니다.',
                '잡내 제거 공법: 흑염소 특유의 누린내와 잡내를 제거하여 누구나 거부감 없이 깔끔하게 드실 수 있습니다.',
                '정성으로 달인 14가지 부원료: 뽕나무잎, 작약, 감초 등 흑염소와 조화가 좋은 14가지 전통 원료를 엄선하여 영양의 균형을 맞췄습니다.',
                '영양소 파괴 최소화 저온 추출 고농축: 저온 추출 공법을 통해 원료가 가진 본연의 영양소 파괴를 최소화하고 진한 풍미를 그대로 살렸습니다.'
            ]
        }
    },
    {
        id: 17,
        name: '장어진액',
        data: {
            ingredients: '정제수(65.49%), 장어(18.00%), 녹용추출액(3.00%), 참당귀(1.00%), 대추(1.00%), 두충수피(0.80%), 황기(0.80%), 지황[숙지황](0.80%), 구기자나무열매(0.80%), 건조불로초자실체[영지](0.80%), 감귤껍질[진피](0.80%), 더덕뿌리(0.80%), 감초(0.80%), 둥굴레(0.80%), 계피(0.80%), 건조비수리[야관문](0.50%), 복분자(0.50%), 생강(0.50%), 사철쑥[인진쑥](0.50%), 도라지뿌리(0.50%), 마뿌리[산약](0.50%), 칡뿌리(0.50%), 상어연골추출물분말(0.01%)',
            selling_point: '40년 전통의 노하우로 장어 특유의 비린내는 깔끔하게 잡고, 러시아산 녹용의 기운과 20가지 전통 원료의 진함을 가득 채운 프리미엄 활력 한 포입니다.',
            key_features: [
                '40년 전통의 신뢰와 고집: 40년 전통 한동녹용연구소의 숙련된 기술력과 타협하지 않는 원료 선별 원칙을 담아 완성했습니다.',
                '임금님께 진상되던 귀한 원료: 예로부터 기력 보강을 위해 임금님께 진상되던 귀한 보양식인 국내산 민물장어의 기운을 그대로 담았습니다.',
                '러시아산 녹용과의 성질 조화: 혹독한 추위를 견뎌낸 러시아산 녹용과 장어의 조화를 통해, 서로의 성질을 보완하고 활력 시너지를 극대화했습니다.',
                '비린내 없이 깔끔한 20가지 부원료: 대추, 숙지황, 당귀 등 20가지 전통 부원료를 한동만의 황금 비율로 배합하여 장어 특유의 비린 맛을 완벽하게 잡았습니다.',
                '검증된 안전성 (HACCP 인증): HACCP 인증을 받은 위생적인 제조 시설에서 엄격하게 생산하여 온 가족이 안심하고 섭취할 수 있습니다.'
            ]
        }
    }
];

async function reuploadAll() {
    console.log('=== 마케팅 데이터 재업로드 시작 ===\n');

    for (const product of products) {
        try {
            console.log(`${product.name} (ID: ${product.id}) 업로드 중...`);

            const url = `${baseUrl}/finished_goods?id=eq.${product.id}`;
            const res = await fetch(url, {
                method: 'PATCH',
                headers,
                body: JSON.stringify(product.data)
            });

            if (res.ok) {
                console.log(`✅ ${product.name} 업로드 성공\n`);
            } else {
                const error = await res.text();
                console.log(`❌ ${product.name} 업로드 실패: ${error}\n`);
            }
        } catch (error) {
            console.error(`Error uploading ${product.name}:`, error);
        }
    }

    console.log('=== 재업로드 완료 ===');
}

reuploadAll();
