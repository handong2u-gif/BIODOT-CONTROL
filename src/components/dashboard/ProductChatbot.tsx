import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Send, Bot, User, Package, Boxes, Search, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// ─── 타입 ─────────────────────────────────────────────────────────
interface Message {
  id: string;
  role: "user" | "bot";
  text: string;
  results?: SearchResult[];
  timestamp: Date;
}

interface LogisticsInfo {
  logistics_barcode?: string | null;
  storage_condition?: string | null;
  shelf_life_note?: string | null;
  packaging_type?: string | null;
  product_width_mm?: number | null;
  product_depth_mm?: number | null;
  product_height_mm?: number | null;
  product_weight_g?: number | null;
  carton_width_mm?: number | null;
  carton_depth_mm?: number | null;
  carton_height_mm?: number | null;
  carton_weight_kg?: number | null;
  units_per_carton?: number | null;
  cartons_per_pallet?: number | null;
}

interface SearchResult {
  id: number | string;
  product_name: string;
  spec?: string | null;
  origin_country?: string | null;
  wholesale_a?: number | null;   // 위탁가
  wholesale_b?: number | null;   // 일반 도매가 (주력)
  retail_price?: number | null;
  online_price?: number | null;
  stock_status?: string | null;
  tags?: string[] | null;
  ingredients?: string | null;
  table: "finished_goods" | "raw_materials";
  logistics?: LogisticsInfo | null;
}

// ─── 금액 포맷 ────────────────────────────────────────────────────
const fmt = (n: number | null | undefined) => {
  if (!n) return "-";
  return new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW" }).format(n);
};

// ─── 정지어 사전 ─────────────────────────────────────────────────
// 의도 키워드 (검색어에서 제거되어야 할 기능어)
const INTENT_WORDS = [
  "가격", "단가", "원가", "공급가", "도매가", "도매", "소비자가", "소비자", "판매가",
  "온라인가", "위탁가", "공급단가",
  "규격", "사이즈", "크기", "치수", "용량",
  "성분", "원재료", "원재료명", "함량", "원료",
  "재고", "입고", "품절", "상태",
  "물류", "바코드", "카톤", "입수", "박스",
  "제품", "정보",
];
// 불필요 단어 (조사/어미/일반 동사)
const STOP_WORDS = [
  "알려줘", "알려주세요", "가르쳐줘", "가르쳐주세요", "뭐야", "어때",
  "검색", "찾아줘", "찾아주세요", "보여줘", "보여주세요",
  "이랑", "하고", "이고", "이랑", "랑", "과", "와",
  "어디야", "있어", "인가요", "입니까", "인지",
];

// ─── 질문 분석 (멀티 인텐트) ─────────────────────────────────────
function parseQuery(text: string): { keyword: string; tokens: string[]; intents: string[] } {
  const t = text;

  // 멀티 인텐트 감지
  const intents: string[] = [];
  if (/가격|단가|원가|공급가|도매|소비자가|판매가|위탁가|온라인가/.test(t)) intents.push("price");
  if (/규격|사이즈|크기|치수|mm|cm|ml|g(?!\w)/.test(t)) intents.push("spec");
  if (/성분|원재료|함량/.test(t)) intents.push("ingredients");
  if (/재고|입고|품절|상태/.test(t)) intents.push("stock");
  if (/물류|바코드|카톤|입수|박스/.test(t)) intents.push("logistics");
  if (intents.length === 0) intents.push("general");

  // 키워드 추출: 정지어 & 의도어 제거 (긴 것부터 처리하여 오작동 방지)
  let cleaned = t;
  const allRemovals = [...INTENT_WORDS, ...STOP_WORDS].sort((a, b) => b.length - a.length);
  allRemovals.forEach((w) => {
    cleaned = cleaned.replace(new RegExp(w, "g"), " ");
  });
  // 조사 단독 글자 제거 (한 글자짜리 조사)
  cleaned = cleaned.replace(/\s[은는이가을를의]{1}\s/g, " ");
  cleaned = cleaned.replace(/\s+/g, " ").trim();

  // 토큰화 (2글자 이상만 의미있는 키워드로)
  const tokens = cleaned.split(" ").filter((t) => t.length >= 2);
  const keyword = tokens.join(" ");

  return { keyword, tokens, intents };
}

// ─── 물류 정보 조회 ──────────────────────────────────────────────
async function fetchLogistics(productIds: number[]): Promise<Map<number, LogisticsInfo>> {
  if (productIds.length === 0) return new Map();

  const { data } = await (supabase as any)
    .from("product_logistics_specs")
    .select(`
      product_id,
      logistics_barcode,
      storage_condition,
      shelf_life_note,
      packaging_type,
      product_width_mm,
      product_depth_mm,
      product_height_mm,
      product_weight_g,
      carton_width_mm,
      carton_depth_mm,
      carton_height_mm,
      carton_weight_kg,
      units_per_carton,
      cartons_per_pallet
    `)
    .in("product_id", productIds);

  const map = new Map<number, LogisticsInfo>();
  if (data) {
    data.forEach((row: any) => {
      map.set(row.product_id, row);
    });
  }
  return map;
}

// ─── Supabase 검색 ──────────────────────────────────────────────
async function searchDB(keyword: string, tokens: string[], intents: string[]) {
  // 검색어 우선순위: 전체 키워드 → 개별 토큰
  const searchTerms: string[] = [];
  if (keyword && keyword.length >= 2) searchTerms.push(keyword);
  tokens.forEach(t => {
    if (t.length >= 2 && t !== keyword) searchTerms.push(t);
  });
  if (searchTerms.length === 0 && keyword.length > 0) searchTerms.push(keyword);
  if (searchTerms.length === 0) return [];

  const seenIds = new Set<string>();
  const allFg: SearchResult[] = [];
  const allRm: SearchResult[] = [];

  for (const term of searchTerms) {
    // 완제품 검색 (이름)
    const { data: fg } = await (supabase as any)
      .from("finished_goods")
      .select("id, product_name, spec, origin_country, wholesale_a, wholesale_b, retail_price, online_price, stock_status, tags, ingredients")
      .ilike("product_name", `%${term}%`)
      .limit(10);

    // 완제품 검색 (성분)
    const { data: fgIng } = await (supabase as any)
      .from("finished_goods")
      .select("id, product_name, spec, origin_country, wholesale_a, wholesale_b, retail_price, online_price, stock_status, tags, ingredients")
      .ilike("ingredients", `%${term}%`)
      .limit(5);

    // 원료 검색
    const { data: rm } = await (supabase as any)
      .from("raw_materials")
      .select("id, product_name, spec, origin_country, wholesale_a")
      .ilike("product_name", `%${term}%`)
      .limit(5);

    for (const r of [...(fg || []), ...(fgIng || [])]) {
      if (!seenIds.has(`fg-${r.id}`)) {
        seenIds.add(`fg-${r.id}`);
        allFg.push({ ...r, table: "finished_goods", logistics: null });
      }
    }
    for (const r of rm || []) {
      if (!seenIds.has(`rm-${r.id}`)) {
        seenIds.add(`rm-${r.id}`);
        allRm.push({ ...r, table: "raw_materials", logistics: null });
      }
    }
    if (allFg.length + allRm.length >= 8) break;
  }

  // 규격·물류 인텐트가 포함된 경우 → 완제품에 대해 물류 정보 추가 조회
  const needsLogistics = intents.includes("spec") || intents.includes("logistics");
  if (needsLogistics && allFg.length > 0) {
    const fgIds = allFg.map(r => r.id as number);
    const logisticsMap = await fetchLogistics(fgIds);
    allFg.forEach(r => {
      r.logistics = logisticsMap.get(r.id as number) ?? null;
    });
  }

  return [...allFg, ...allRm];
}

// ─── 봇 응답 생성 ─────────────────────────────────────────────────
async function getBotResponse(text: string): Promise<{ text: string; results: SearchResult[] }> {
  const { keyword, tokens, intents } = parseQuery(text);

  if (tokens.length === 0 && keyword.length < 1) {
    return {
      text: "제품명이나 성분명을 포함해서 질문해 주세요!\n예) '뉴질랜드 녹용 가격', '장어진액 규격', '흑염소 성분'",
      results: [],
    };
  }

  const searchKeyword = keyword || tokens[0] || text.trim();
  const results = await searchDB(searchKeyword, tokens, intents);

  if (results.length === 0) {
    return {
      text: "'" + searchKeyword + "' 에 해당하는 제품을 찾지 못했습니다.\n\n💡 검색 팁: 제품명 일부만 입력해보세요\n예) '녹용', '장어', '키즈'",
      results: [],
    };
  }

  // 멀티 인텐트 응답 메시지 생성
  const intentLabels: Record<string, string> = {
    price: "💰 가격 (위탁가·소비자가·온라인가 포함)",
    spec: "📐 제품 규격 및 치수",
    ingredients: "🧪 원재료 성분",
    stock: "📦 재고 상태",
    logistics: "🚚 물류 정보 (바코드·카톤·치수)",
    general: "🔍 전체 정보",
  };
  const intentText = intents.map((i) => intentLabels[i]).join("\n");
  const responseLabel = "'" + searchKeyword + "'";

  return {
    text: `${responseLabel} 검색 결과 ${results.length}건\n\n${intentText}`,
    results,
  };
}

// ─── 물류 정보 패널 ──────────────────────────────────────────────
function LogisticsPanel({ lg }: { lg: LogisticsInfo }) {
  const hasDimensions = lg.product_width_mm || lg.product_depth_mm || lg.product_height_mm;
  const hasCarton = lg.carton_width_mm || lg.carton_depth_mm || lg.carton_height_mm;
  const hasAny = lg.logistics_barcode || lg.storage_condition || lg.shelf_life_note ||
    lg.packaging_type || hasDimensions || hasCarton ||
    lg.product_weight_g || lg.carton_weight_kg || lg.units_per_carton || lg.cartons_per_pallet;

  if (!hasAny) return null;

  return (
    <div className="mt-3 border-t border-slate-100 pt-3 space-y-2">
      <p className="text-xs font-semibold text-slate-500">📐 규격 / 물류 정보</p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm text-slate-700">
        {lg.logistics_barcode && (
          <div className="col-span-2"><span className="text-slate-400 text-xs mr-1">바코드</span><span className="font-mono text-xs">{lg.logistics_barcode}</span></div>
        )}
        {lg.packaging_type && (
          <div><span className="text-slate-400 text-xs mr-1">포장형태</span>{lg.packaging_type}</div>
        )}
        {lg.storage_condition && (
          <div><span className="text-slate-400 text-xs mr-1">보관방법</span>{lg.storage_condition}</div>
        )}
        {lg.shelf_life_note && (
          <div className="col-span-2"><span className="text-slate-400 text-xs mr-1">유통기한</span>{lg.shelf_life_note}</div>
        )}
        {hasDimensions && (
          <div className="col-span-2">
            <span className="text-slate-400 text-xs mr-1">제품 치수</span>
            <span className="font-medium">
              {[lg.product_width_mm, lg.product_depth_mm, lg.product_height_mm]
                .map(v => v ? `${v}` : "?").join(" × ")} mm
              {lg.product_weight_g ? ` / ${lg.product_weight_g}g` : ""}
            </span>
          </div>
        )}
        {hasCarton && (
          <div className="col-span-2">
            <span className="text-slate-400 text-xs mr-1">카톤 치수</span>
            <span className="font-medium">
              {[lg.carton_width_mm, lg.carton_depth_mm, lg.carton_height_mm]
                .map(v => v ? `${v}` : "?").join(" × ")} mm
              {lg.carton_weight_kg ? ` / ${lg.carton_weight_kg}kg` : ""}
            </span>
          </div>
        )}
        {lg.units_per_carton && (
          <div><span className="text-slate-400 text-xs mr-1">박스 입수</span><span className="font-medium">{lg.units_per_carton}개</span></div>
        )}
        {lg.cartons_per_pallet && (
          <div><span className="text-slate-400 text-xs mr-1">팔레트 입수</span><span className="font-medium">{lg.cartons_per_pallet}박스</span></div>
        )}
      </div>
    </div>
  );
}

// ─── 결과 카드 ───────────────────────────────────────────────────
function ResultCard({ item }: { item: SearchResult }) {
  const isFinished = item.table === "finished_goods";
  return (
    <div
      className="bg-white border border-slate-200 rounded-xl p-4 hover:border-emerald-300 hover:shadow-sm transition-all cursor-pointer group"
      onClick={() => isFinished && (window.location.href = `/products/${item.id}`)}
    >
      {/* 제품명 + 뱃지 */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          {isFinished ? (
            <Package className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <Boxes className="w-4 h-4 text-blue-600 shrink-0" />
          )}
          <span className="font-bold text-slate-900 text-base group-hover:text-emerald-700 transition-colors leading-snug">
            {item.product_name}
          </span>
        </div>
        <Badge
          variant="outline"
          className={`text-xs shrink-0 px-2 py-0.5 font-medium ${isFinished ? "border-emerald-200 text-emerald-700 bg-emerald-50" : "border-blue-200 text-blue-700 bg-blue-50"}`}
        >
          {isFinished ? "완제품" : "원료"}
        </Badge>
      </div>

      {/* 데이터 그리드 */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        {item.spec && (
          <div><span className="text-slate-400 text-xs">규격  </span><span className="text-slate-700 font-medium">{item.spec}</span></div>
        )}
        {item.origin_country && (
          <div><span className="text-slate-400 text-xs">원산지  </span><span className="text-slate-700 font-medium">{item.origin_country}</span></div>
        )}
        {/* 도매가B = 일반 도매가 (주력 단가) */}
        {isFinished && (item as any).wholesale_b ? (
          <div><span className="text-slate-400 text-xs">도매가  </span><span className="font-bold text-indigo-700">{fmt((item as any).wholesale_b)}</span></div>
        ) : null}
        {/* 도매가A = 위탁가 */}
        {item.wholesale_a ? (
          <div><span className="text-slate-400 text-xs">{isFinished ? "위탁가  " : "공급단가  "}</span><span className="font-semibold text-emerald-700">{fmt(item.wholesale_a)}</span></div>
        ) : null}
        {isFinished && item.retail_price ? (
          <div><span className="text-slate-400 text-xs">소비자가  </span><span className="font-medium text-slate-800">{fmt(item.retail_price)}</span></div>
        ) : null}
        {isFinished && item.online_price ? (
          <div><span className="text-slate-400 text-xs">온라인가  </span><span className="font-semibold text-blue-700">{fmt(item.online_price)}</span></div>
        ) : null}
        {isFinished && item.stock_status && (
          <div>
            <span className="text-slate-400 text-xs">재고  </span>
            <span className={`font-semibold ${item.stock_status === "out_of_stock" || item.stock_status === "품절" ? "text-red-600" : "text-emerald-600"}`}>
              {item.stock_status === "out_of_stock" ? "품절" : item.stock_status}
            </span>
          </div>
        )}
      </div>

      {item.ingredients && (
        <p className="text-xs text-slate-500 mt-3 line-clamp-2 border-t border-slate-100 pt-2 leading-relaxed">
          {item.ingredients}
        </p>
      )}

      {/* 규격/물류 정보 패널 */}
      {item.logistics && <LogisticsPanel lg={item.logistics} />}

      {item.tags && item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {item.tags.slice(0, 4).map((t, i) => (
            <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">#{t}</span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── 추천 질문 ───────────────────────────────────────────────────
const SUGGESTIONS = [
  "녹용 가격",
  "장어진액 규격",
  "흑염소 성분",
  "젤리 단가",
  "뉴질랜드 원료",
  "키즈 제품",
];

// ─── 메인 컴포넌트 ────────────────────────────────────────────────
export function ProductChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      role: "bot",
      text: "안녕하세요! 바이오닷 제품 AI 검색입니다 🌿\n제품명, 성분, 가격 등 궁금한 것을 물어보세요.",
      results: [],
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text?: string) => {
    const query = (text ?? input).trim();
    if (!query || loading) return;

    setInput("");
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text: query,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const { text: botText, results } = await getBotResponse(query);
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "bot",
        text: botText,
        results,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), role: "bot", text: "오류가 발생했습니다. 다시 시도해 주세요.", results: [], timestamp: new Date() },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  return (
    <div className="flex flex-col bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden" style={{ height: "min(580px, calc(100svh - 160px))" }}>
      {/* 헤더 */}
      <div className="flex items-center gap-3 px-4 md:px-5 py-3 md:py-4 border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-white shrink-0">
        <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-emerald-600 flex items-center justify-center shadow-sm shrink-0">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="font-bold text-slate-900 text-base">제품 AI 검색</p>
          <p className="text-xs text-slate-400">DB 실시간 연동</p>
        </div>
        <span className="ml-auto flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          온라인
        </span>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto px-3 md:px-4 py-4 space-y-5 bg-slate-50/50">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            {/* 아바타 */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                msg.role === "bot" ? "bg-emerald-100 text-emerald-700" : "bg-slate-700 text-white"
              }`}
            >
              {msg.role === "bot" ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
            </div>

            <div className={`flex flex-col gap-2 max-w-[88%] ${msg.role === "user" ? "items-end" : ""}`}>
              {/* 말풍선 */}
              <div
                className={`px-4 py-3 rounded-2xl text-sm md:text-[15px] whitespace-pre-line leading-relaxed ${
                  msg.role === "bot"
                    ? "bg-white border border-slate-200 text-slate-800 rounded-tl-sm"
                    : "bg-emerald-600 text-white rounded-tr-sm"
                }`}
              >
                {msg.text}
              </div>

              {/* 검색 결과 카드 */}
              {msg.results && msg.results.length > 0 && (
                <div className="space-y-2.5 w-full">
                  {msg.results.map((r, i) => (
                    <ResultCard key={i} item={r} />
                  ))}
                </div>
              )}

              <span className="text-xs text-slate-400">
                {msg.timestamp.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          </div>
        ))}

        {/* 로딩 */}
        {loading && (
          <div className="flex gap-2.5">
            <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center">
              <Bot className="w-3.5 h-3.5 text-emerald-700" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1 items-center h-4">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* 추천 질문 */}
      {messages.length <= 1 && (
        <div className="px-3 md:px-4 py-2.5 flex gap-2 overflow-x-auto shrink-0 border-t border-slate-100 bg-white">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="shrink-0 text-sm px-3.5 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full hover:bg-emerald-100 active:bg-emerald-200 transition-colors flex items-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              {s}
            </button>
          ))}
        </div>
      )}

      {/* 입력창 */}
      <div className="flex gap-2 px-3 md:px-4 py-3 border-t border-slate-200 bg-white shrink-0">
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
          placeholder="제품명, 성분, 가격 등 검색..."
          className="flex-1 bg-slate-50 border-slate-200 focus:border-emerald-400 text-sm md:text-base rounded-xl h-11"
          disabled={loading}
        />
        <Button
          onClick={() => send()}
          disabled={!input.trim() || loading}
          size="icon"
          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shrink-0 w-11 h-11"
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
