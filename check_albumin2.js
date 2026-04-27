import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://qfvmqotkhjkewdwzibyb.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmdm1xb3RraGprZXdkd3ppYnliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1MDU5NjAsImV4cCI6MjA4MTA4MTk2MH0.7NrJDA3l4PnGNLcv4O55gPrmg-HWL59JPKjOwiwrR3c";

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    // 1. 알부민 제품 전체 정보
    console.log('=== 알부민 제품 전체 (finished_goods) ===');
    const { data: fg } = await supabase
        .from('finished_goods')
        .select('*')
        .ilike('product_name', '%알부민%');
    console.log(JSON.stringify(fg, null, 2));

    // 2. product_logistics_specs에 id=18 데이터 있는지
    console.log('\n=== id=18 logistics 데이터 ===');
    const { data: ls, error: lsErr } = await supabase
        .from('product_logistics_specs')
        .select('*')
        .eq('product_id', 18);
    if (lsErr) console.error('오류:', lsErr.message);
    else console.log(JSON.stringify(ls, null, 2));

    // 3. expiry_date 컬럼 확인
    console.log('\n=== finished_goods.expiry_date 확인 (알부민) ===');
    const { data: ed } = await supabase
        .from('finished_goods')
        .select('id, product_name, expiry_date')
        .ilike('product_name', '%알부민%');
    console.log(JSON.stringify(ed, null, 2));
}

check().catch(console.error);
