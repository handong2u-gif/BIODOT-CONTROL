import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// ─── 정지어/의도어 사전 ────────────────────────────────────────
const INTENT_WORDS = [
  "가격","단가","원가","공급가","도매가","도매","소비자가","소비자","판매가",
  "온라인가","위탁가","공급단가",
  "규격","사이즈","크기","치수","용량","소비기한","유통기한","기한","수명",
  "성분","원재료","원재료명","함량","원료","배합비",
  "재고","입고","품절","상태",
  "물류","바코드","카톤","입수","박스",
  "제품","정보",
];
const STOP_WORDS = [
  "알려줘","알려주세요","가르쳐줘","가르쳐주세요","뭐야","어때","어떻게",
  "검색","찾아줘","찾아주세요","보여줘","보여주세요","해줘","해주라",
  "이랑","하고","이고","랑","과","와",
  "어디야","있어","인가요","입니까","인지","어느정도","얼마야","얼마인가요",
  "언제야","언제","얼마","계산해줘","계산","들어가","들어있","들었","들어가있어",
  "몇프로","몇퍼센트","퍼센트","몇","어떤","얼마나",
];

function parseQuery(text: string) {
  let t = text;
  t = t.replace(/러알용/g, "러시아 알타이 녹용");
  t = t.replace(/뉴아[녹록]/g, "뉴질랜드 아오테아로아 녹용");
  t = t.replace(/키녹칼/g, "한동 키즈튼튼 녹용칼슘스틱");

  const intents: string[] = [];
  if (/가격|단가|원가|공급가|도매|소비자가|판매가|위탁가|온라인가/.test(t)) intents.push("price");
  if (/규격|사이즈|크기|치수|mm|cm|ml|g(?!\w)|소비기한|유통기한|기한/.test(t)) intents.push("spec");
  if (/성분|원재료|함량|배합비/.test(t)) intents.push("ingredients");
  if (/재고|입고|품절|상태/.test(t)) intents.push("stock");
  if (/물류|바코드|카톤|입수|박스/.test(t)) intents.push("logistics");
  if (intents.length === 0) intents.push("general");

  let cleaned = t;
  const allRemovals = [...INTENT_WORDS, ...STOP_WORDS].sort((a, b) => b.length - a.length);
  allRemovals.forEach((w) => {
    cleaned = cleaned.replace(new RegExp(w, "g"), " ");
  });
  cleaned = cleaned.replace(/[?!,.]/g, " ").replace(/\s+/g, " ").trim();

  let rawTokens = cleaned.split(" ");
  rawTokens = rawTokens.map((tok) => tok.replace(/[은는이가을를의에]$/, ""));
  const tokens = rawTokens.filter((tok) => tok.length >= 2);
  const keyword = tokens.join(" ");
  return { keyword, tokens, intents };
}

async function fetchLogistics(supabase: any, productIds: number[]) {
  if (productIds.length === 0) return new Map();
  const { data } = await supabase
    .from("product_logistics_specs")
    .select(
      "product_id, logistics_barcode, storage_condition, shelf_life_note, packaging_type, product_width_mm, product_depth_mm, product_height_mm, product_weight_g, carton_width_mm, carton_depth_mm, carton_height_mm, carton_weight_kg, units_per_carton, cartons_per_pallet"
    )
    .in("product_id", productIds);
  const map = new Map<number, any>();
  (data || []).forEach((row: any) => map.set(row.product_id, row));
  return map;
}

async function searchDB(
  supabase: any,
  keyword: string,
  tokens: string[],
  intents: string[]
) {
  const validTokens = tokens.filter((t) => t.length >= 2);
  const searchTerms = validTokens.length > 0 ? validTokens : [keyword];
  if (searchTerms.length === 0) return [];

  const seen = new Set<string>();
  const allFg: any[] = [];
  const allRm: any[] = [];

  const push = (fg: any[], rm: any[]) => {
    for (const r of fg || []) {
      if (!seen.has(`fg-${r.id}`)) {
        seen.add(`fg-${r.id}`);
        allFg.push({ ...r, table: "finished_goods", logistics: null });
      }
    }
    for (const r of rm || []) {
      if (!seen.has(`rm-${r.id}`)) {
        seen.add(`rm-${r.id}`);
        allRm.push({ ...r, table: "raw_materials", logistics: null });
      }
    }
  };

  const fgSelect =
    "id, product_name, spec, origin_country, wholesale_a, wholesale_b, retail_price, online_price, stock_status, tags, ingredients";
  const rmSelect = "id, product_name, spec, origin_country, wholesale_a";

  const longest = [...searchTerms].sort((a, b) => b.length - a.length)[0];

  const [{ data: fgBase }, { data: rmBase }] = await Promise.all([
    supabase.from("finished_goods").select(fgSelect).ilike("product_name", `%${longest}%`).limit(50),
    supabase.from("raw_materials").select(rmSelect).ilike("product_name", `%${longest}%`).limit(30),
  ]);

  const fgAnd = (fgBase || []).filter((r: any) =>
    searchTerms.every((t) => r.product_name && r.product_name.includes(t))
  );
  const rmAnd = (rmBase || []).filter((r: any) =>
    searchTerms.every((t) => r.product_name && r.product_name.includes(t))
  );
  push(fgAnd, rmAnd);

  if (allFg.length + allRm.length === 0) {
    for (const term of searchTerms) {
      if (allFg.length + allRm.length >= 8) break;
      const { data: fgFb } = await supabase
        .from("finished_goods").select(fgSelect).ilike("product_name", `%${term}%`).limit(5);
      const { data: rmFb } = await supabase
        .from("raw_materials").select(rmSelect).ilike("product_name", `%${term}%`).limit(3);
      push(fgFb || [], rmFb || []);
    }
  }

  if (allFg.length === 0) {
    const { data: fgIng } = await supabase
      .from("finished_goods").select(fgSelect).ilike("ingredients", `%${longest}%`).limit(5);
    push(fgIng || [], []);
  }

  const needsLogistics = intents.includes("spec") || intents.includes("logistics");
  if (needsLogistics && allFg.length > 0) {
    const ids = allFg.map((r) => r.id as number);
    const lmap = await fetchLogistics(supabase, ids);
    allFg.forEach((r) => {
      r.logistics = lmap.get(r.id) ?? null;
    });
  }

  return [...allFg, ...allRm];
}

async function callGemini(query: string, results: any[]) {
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) return "> ⚠️ GEMINI_API_KEY가 설정되지 않았습니다.";

  const ctx = results.slice(0, 5).map((r) => `
제품명: ${r.product_name}
규격: ${r.spec || "없음"}
원재료/성분: ${r.ingredients || "없음"}
도매가: ${r.wholesale_b || "없음"}
소비자가: ${r.retail_price || "없음"}
`).join("\n---");

  const prompt = `당신은 바이오닷 운영팀의 스마트 업무 보조 AI입니다.
사용자의 질문에 대해 제공된 제품 데이터를 바탕으로 답변을 도출하세요.

[사용자 질문]
${query}

[검색된 제품 데이터 (Context)]
${ctx}

조건:
1. 데이터에 없는 내용은 추측하지 말고 모른다고 할 것.
2. 배합비, 1포당 용량, 단가 등 산수 계산을 요구하면 명확한 수식을 보여줄 것.
3. 보기 편한 마크다운을 사용할 것. 요점만 간결하게 설명할 것.`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );
    const data = await res.json();
    if (data.error) {
      return `> ⚠️ **Gemini API 예외**\n> \`\`\`json\n> ${JSON.stringify(data.error, null, 2)}\n> \`\`\``;
    }
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "AI 응답을 생성하지 못했습니다.";
  } catch (e) {
    console.error("Gemini error:", e);
    return "> API 호출 중 오류가 발생했습니다.";
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, mode = "search", results: providedResults } = await req.json();
    if (!query || typeof query !== "string") {
      return new Response(JSON.stringify({ error: "query is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    if (mode === "infer") {
      const aiResponse = await callGemini(query, providedResults || []);
      return new Response(JSON.stringify({ aiResponse }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // mode === "search"
    const { keyword, tokens, intents } = parseQuery(query);
    if (tokens.length === 0 && keyword.length < 1) {
      return new Response(
        JSON.stringify({
          keyword: "",
          tokens: [],
          intents,
          results: [],
          empty: true,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const searchKeyword = keyword || tokens[0] || query.trim();
    const results = await searchDB(supabase, searchKeyword, tokens, intents);

    // 로깅
    try {
      await supabase.from("chat_queries").insert([{ query_text: query }]);
    } catch (e) {
      console.error("logQuery:", e);
    }

    return new Response(
      JSON.stringify({ keyword: searchKeyword, tokens, intents, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("product-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});