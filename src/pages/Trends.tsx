import { Newspaper, TrendingUp, AlertCircle, ExternalLink, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const newsItems = [
  {
    id: 1,
    title: "2024년 프로바이오틱스 시장 15% 성장 전망",
    source: "식품산업신문",
    date: "2024-12-12",
    category: "시장동향",
    isImportant: true,
  },
  {
    id: 2,
    title: "비타민D 일일 권장량 상향 검토 중",
    source: "식약처",
    date: "2024-12-11",
    category: "규제",
    isImportant: true,
  },
  {
    id: 3,
    title: "오메가3 원료가격 10% 인상 예고",
    source: "원료협회",
    date: "2024-12-10",
    category: "원료",
    isImportant: false,
  },
  {
    id: 4,
    title: "콜라겐 시장 MZ세대 타겟 마케팅 확대",
    source: "마케팅뉴스",
    date: "2024-12-09",
    category: "마케팅",
    isImportant: false,
  },
];

const competitors = [
  {
    name: "A사",
    product: "프로바이오틱스 골드",
    price: "₩32,000",
    priceChange: -5,
    promo: "1+1 행사 진행 중",
  },
  {
    name: "B사",
    product: "비타민D 5000IU",
    price: "₩25,000",
    priceChange: 0,
    promo: "신제품 출시",
  },
  {
    name: "C사",
    product: "오메가3 플래티넘",
    price: "₩48,000",
    priceChange: 3,
    promo: null,
  },
];

const regulations = [
  {
    title: "건강기능식품 표시광고 가이드라인 개정",
    effectiveDate: "2025-01-01",
    status: "예정",
  },
  {
    title: "기능성 원료 인정 심사 기준 변경",
    effectiveDate: "2025-03-01",
    status: "검토중",
  },
];

const categoryColors: Record<string, string> = {
  시장동향: "bg-primary/10 text-primary",
  규제: "bg-destructive/10 text-destructive",
  원료: "bg-warning/10 text-warning",
  마케팅: "bg-info/10 text-info",
};

export default function Trends() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">업계 동향</h1>
        <p className="text-muted-foreground mt-1">시장 정보와 경쟁사 동향을 확인하세요</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* News */}
        <div className="lg:col-span-2 bg-card rounded-xl border p-5 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">시장 뉴스</h3>
            </div>
            <Button variant="ghost" size="sm" className="text-primary gap-1">
              더보기 <ExternalLink className="w-3 h-3" />
            </Button>
          </div>
          <div className="space-y-4">
            {newsItems.map((news) => (
              <div
                key={news.id}
                className="flex items-start gap-4 p-4 rounded-lg border bg-background hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={cn("text-xs", categoryColors[news.category])}>
                      {news.category}
                    </Badge>
                    {news.isImportant && (
                      <AlertCircle className="w-4 h-4 text-warning" />
                    )}
                  </div>
                  <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">
                    {news.title}
                  </h4>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span>{news.source}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {news.date}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Competitor Updates */}
          <div className="bg-card rounded-xl border p-5 animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">경쟁사 동향</h3>
            </div>
            <div className="space-y-4">
              {competitors.map((comp) => (
                <div key={comp.name} className="p-3 rounded-lg border bg-background">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-foreground">{comp.name}</span>
                    <span
                      className={cn(
                        "text-xs font-medium",
                        comp.priceChange < 0
                          ? "text-success"
                          : comp.priceChange > 0
                          ? "text-destructive"
                          : "text-muted-foreground"
                      )}
                    >
                      {comp.priceChange !== 0 &&
                        (comp.priceChange > 0 ? "↑" : "↓") + Math.abs(comp.priceChange) + "%"}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{comp.product}</p>
                  <p className="text-sm font-medium text-foreground">{comp.price}</p>
                  {comp.promo && (
                    <Badge variant="secondary" className="mt-2 text-xs">
                      {comp.promo}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Regulations */}
          <div className="bg-card rounded-xl border p-5 animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-warning" />
              <h3 className="text-lg font-semibold text-foreground">규제 변경</h3>
            </div>
            <div className="space-y-3">
              {regulations.map((reg) => (
                <div key={reg.title} className="p-3 rounded-lg border bg-background">
                  <p className="text-sm font-medium text-foreground mb-2">{reg.title}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">시행: {reg.effectiveDate}</span>
                    <Badge
                      variant="outline"
                      className={cn(
                        reg.status === "예정"
                          ? "border-warning text-warning"
                          : "border-muted-foreground text-muted-foreground"
                      )}
                    >
                      {reg.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
