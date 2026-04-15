import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
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

interface SearchResult {
  id: number | string;
  product_name: string;
  spec?: string | null;
  origin_country?: string | null;
  wholesale_a?: number | null;
  retail_price?: number | null;
  online_price?: number | null;
  stock_status?: string | null;
  tags?: string[] | null;
  ingredients?: string | null;
  table: "finished_goods" | "raw_materials";
}

// ─── 금액 포맷 ────────────────────────────────────────────────────
const fmt = (n: number | null | undefined) => {
  if (!n) return "-";
  return new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW" }).format(n);
};

// ─── 질문 분석 ────────────────────────────────────────────────────
function parseQuery(text: string): { keyword: string; intent: string } {
  const t = text.toLowerCase();
  let intent = "general";
  if (/가격|단가|원가|공급가|도매|소비자|판매가/.test(t)) intent = "price";
  else if (/규격|사이즈|크기|용량|ml|g\b|포|환|스틱/.test(t)) intent = "spec";
  else if (/성분|원재료|함량|원료/.test(t)) intent = "ingredients";
  else if (/재고|입고|품절|상태/.test(t)) intent = "stock";
  else if (/물류|바코드|카톤|입수|박스/.test(t)) intent = "logistics";

  // 키워드에서 불필요한 조사/동사 제거
  const keyword = text
    .replace(/가격|단가|원가|공급가|도매가|소비자가|판매가|규격|사이즈|크기|성분|원재료|함량|재고|물류|정보|알려줘|가르쳐줘|뭐야|어때|검색|찾아줘|보여줘/g, "")
    .replace(/[은는이가을를의도]/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .trim();

  return { keyword, intent };
}

// ─── 봇 응답 생성 ─────────────────────────────────────────────────
async function getBotResponse(text: string): Promise<{ text: string; results: SearchResult[] }> {
  const { keyword, intent } = parseQuery(text);
  const lowerText = text.toLowerCase();

  if (!keyword || keyword.length < 1) {
    return {
      text: "제품명이나 성분명을 포함해서 다시 질문해 주세요!\n예: '녹용 가격', '장어진액 규격', '흑염소 성분'",
      results: [],
    };
  }

  // finished_goods 검색
  const { data: fg } = await (supabase as any)
    .from("finished_goods")
    .select("id, product_name, spec, origin_country, wholesale_a, retail_price, online_price, stock_status, tags, ingredients")
    .or(`product_name.ilike.%${keyword}%,spec.ilike.%${keyword}%,tags.cs.{${keyword}},ingredients.ilike.%${keyword}%`)
    .limit(5);

  // raw_materials 검색
  const { data: rm } = await (supabase as any)
    .from("raw_materials")
    .select("id, product_name, spec, origin_country, wholesale_a")
    .or(`product_name.ilike.%${keyword}%,spec.ilike.%${keyword}%`)
    .limit(5);

  const fgResults: SearchResult[] = (fg || []).map((r: any) => ({ ...r, table: "finished_goods" }));
  const rmResults: SearchResult[] = (rm || []).map((r: any) => ({ ...r, table: "raw_materials" }));
  const results = [...fgResults, ...rmResults];

  if (results.length === 0) {
    return {
      text: `'${keyword}' 에 해당하는 제품을 찾지 못했습니다.\n다른 키워드로 검색해 보시겠어요?`,
      results: [],
    };
  }

  // 의도에 따른 응답 생성
  const intentGuide: Record<string, string> = {
    price: "💰 가격 정보입니다.",
    spec: "📐 규격 정보입니다.",
    ingredients: "🧪 성분 정보입니다.",
    stock: "📦 재고 상태입니다.",
    logistics: "🚚 물류 정보는 제품 상세 페이지 > 물류 탭을 확인해 주세요.",
    general: "🔍 검색 결과입니다.",
  };

  return {
    text: `'${keyword}' 검색 결과 ${results.length}건 — ${intentGuide[intent]}`,
    results,
  };
}

// ─── 결과 카드 ───────────────────────────────────────────────────
function ResultCard({ item }: { item: SearchResult }) {
  const isFinished = item.table === "finished_goods";
  return (
    <div
      className="bg-white border border-slate-200 rounded-xl p-3 hover:border-emerald-300 hover:shadow-sm transition-all cursor-pointer group"
      onClick={() => isFinished && (window.location.href = `/products/${item.id}`)}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5">
          {isFinished ? (
            <Package className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          ) : (
            <Boxes className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          )}
          <span className="font-semibold text-slate-900 text-sm group-hover:text-emerald-700 transition-colors line-clamp-1">
            {item.product_name}
          </span>
        </div>
        <Badge
          variant="outline"
          className={`text-[10px] shrink-0 ${isFinished ? "border-emerald-200 text-emerald-700 bg-emerald-50" : "border-blue-200 text-blue-700 bg-blue-50"}`}
        >
          {isFinished ? "완제품" : "원료"}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-600">
        {item.spec && (
          <div><span className="text-slate-400">규격</span> {item.spec}</div>
        )}
        {item.origin_country && (
          <div><span className="text-slate-400">원산지</span> {item.origin_country}</div>
        )}
        {isFinished && item.retail_price ? (
          <div><span className="text-slate-400">소비자가</span> <span className="font-medium text-slate-800">{fmt(item.retail_price)}</span></div>
        ) : null}
        {isFinished && item.online_price ? (
          <div><span className="text-slate-400">온라인가</span> <span className="font-semibold text-blue-700">{fmt(item.online_price)}</span></div>
        ) : null}
        {item.wholesale_a ? (
          <div><span className="text-slate-400">{isFinished ? "위탁가" : "공급단가"}</span> <span className="font-semibold text-emerald-700">{fmt(item.wholesale_a)}</span></div>
        ) : null}
        {isFinished && item.stock_status && (
          <div>
            <span className="text-slate-400">재고</span>{" "}
            <span className={item.stock_status === "out_of_stock" || item.stock_status === "품절" ? "text-red-600 font-semibold" : "text-emerald-600"}>
              {item.stock_status === "out_of_stock" ? "품절" : item.stock_status}
            </span>
          </div>
        )}
      </div>

      {item.ingredients && (
        <p className="text-[10px] text-slate-400 mt-2 line-clamp-2 border-t border-slate-100 pt-1.5">
          {item.ingredients}
        </p>
      )}

      {item.tags && item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {item.tags.slice(0, 3).map((t, i) => (
            <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full">#{t}</span>
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
    <div className="flex flex-col bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden" style={{ height: "580px" }}>
      {/* 헤더 */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-white shrink-0">
        <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center shadow-sm">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="font-semibold text-slate-900 text-sm">제품 AI 검색</p>
          <p className="text-xs text-slate-400">Supabase DB 실시간 연동</p>
        </div>
        <span className="ml-auto flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          온라인
        </span>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-slate-50/50">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            {/* 아바타 */}
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                msg.role === "bot" ? "bg-emerald-100 text-emerald-700" : "bg-slate-700 text-white"
              }`}
            >
              {msg.role === "bot" ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
            </div>

            <div className={`flex flex-col gap-2 max-w-[85%] ${msg.role === "user" ? "items-end" : ""}`}>
              {/* 말풍선 */}
              <div
                className={`px-4 py-2.5 rounded-2xl text-sm whitespace-pre-line leading-relaxed ${
                  msg.role === "bot"
                    ? "bg-white border border-slate-200 text-slate-800 rounded-tl-sm"
                    : "bg-emerald-600 text-white rounded-tr-sm"
                }`}
              >
                {msg.text}
              </div>

              {/* 검색 결과 카드 */}
              {msg.results && msg.results.length > 0 && (
                <div className="space-y-2 w-full">
                  {msg.results.map((r, i) => (
                    <ResultCard key={i} item={r} />
                  ))}
                </div>
              )}

              <span className="text-[10px] text-slate-400">
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
        <div className="px-4 py-2 flex gap-2 overflow-x-auto shrink-0 border-t border-slate-100 bg-white">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="shrink-0 text-xs px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full hover:bg-emerald-100 transition-colors flex items-center gap-1"
            >
              <Search className="w-3 h-3" />
              {s}
            </button>
          ))}
        </div>
      )}

      {/* 입력창 */}
      <div className="flex gap-2 px-4 py-3 border-t border-slate-200 bg-white shrink-0">
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
          placeholder="제품명, 성분, 가격 등 검색..."
          className="flex-1 bg-slate-50 border-slate-200 focus:border-emerald-400 text-sm rounded-xl"
          disabled={loading}
        />
        <Button
          onClick={() => send()}
          disabled={!input.trim() || loading}
          size="icon"
          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shrink-0"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
