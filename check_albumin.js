import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://qfvmqotkhjkewdwzibyb.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmdm1xb3RraGprZXdkd3ppYnliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1MDU5NjAsImV4cCI6MjA4MTA4MTk2MH0.7NrJDA3l4PnGNLcv4O55gPrmg-HWL59JPKjOwiwrR3c";

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log('=== 알부민 검색 (finished_goods) ===');
    const { data: fg, error: fgErr } = await supabase
        .from('finished_goods')
        .select('id, product_name, spec, shelf_life_days, shelf_life_note')
        .ilike('product_name', '%알부민%');
    if (fgErr) console.error('finished_goods 오류:', fgErr.message);
    else console.log('finished_goods 결과:', JSON.stringify(fg, null, 2));

    console.log('\n=== 알부민 검색 (raw_materials) ===');
    const { data: rm, error: rmErr } = await supabase
        .from('raw_materials')
        .select('id, product_name, spec, shelf_life_days, shelf_life_note')
        .ilike('product_name', '%알부민%');
    if (rmErr) console.error('raw_materials 오류:', rmErr.message);
    else console.log('raw_materials 결과:', JSON.stringify(rm, null, 2));

    console.log('\n=== product_logistics_specs 테이블 알부민 검색 ===');
    // product_logistics_specs에 shelf_life_note가 있는지 확인
    const { data: ls, error: lsErr } = await supabase
        .from('product_logistics_specs')
        .select('*')
        .limit(3);
    if (lsErr) console.error('product_logistics_specs 오류:', lsErr.message);
    else {
        console.log('product_logistics_specs 컬럼 샘플:', ls?.[0] ? Object.keys(ls[0]) : '데이터 없음');
        console.log('샘플 데이터:', JSON.stringify(ls?.slice(0,2), null, 2));
    }

    console.log('\n=== finished_goods 전체 컬럼 확인 ===');
    const { data: fgSample } = await supabase
        .from('finished_goods')
        .select('*')
        .limit(1);
    if (fgSample?.[0]) console.log('컬럼 목록:', Object.keys(fgSample[0]));

    console.log('\n=== shelf_life 관련 컬럼이 있는 데이터 조회 ===');
    const { data: withShelf } = await supabase
        .from('finished_goods')
        .select('id, product_name, spec')
        .ilike('product_name', '%알부%')
        .limit(10);
    console.log('알부 검색:', JSON.stringify(withShelf, null, 2));
}

check().catch(console.error);
