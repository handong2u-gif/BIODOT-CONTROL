import { useState } from "react";
import { BookOpen, MessageSquare, AlertTriangle, FileText, ChevronRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const policyCategories = [
  {
    id: "etiquette",
    name: "영업 에티켓",
    description: "방문 매너와 커뮤니케이션 가이드",
    icon: MessageSquare,
    color: "bg-primary/10 text-primary",
    count: 8,
  },
  {
    id: "prohibited",
    name: "금지 언행",
    description: "하면 안 되는 말과 행동 목록",
    icon: AlertTriangle,
    color: "bg-destructive/10 text-destructive",
    count: 12,
  },
  {
    id: "templates",
    name: "메시지 템플릿",
    description: "방문 후 문자/메일 템플릿",
    icon: FileText,
    color: "bg-info/10 text-info",
    count: 15,
  },
  {
    id: "onboarding",
    name: "신입 가이드",
    description: "바이오닷 업무 프로세스와 인재상",
    icon: BookOpen,
    color: "bg-success/10 text-success",
    count: 6,
  },
];

const popularPolicies = [
  {
    id: 1,
    title: "첫 방문 시 인사 매너",
    category: "영업 에티켓",
    isNew: true,
    preview: "거래처 첫 방문 시 반드시 명함 교환 후 인사를 시작합니다...",
  },
  {
    id: 2,
    title: "가격 협상 시 금지 표현",
    category: "금지 언행",
    isNew: false,
    preview: "경쟁사 제품을 비하하는 표현은 절대 사용하지 않습니다...",
  },
  {
    id: 3,
    title: "방문 후 감사 문자 템플릿",
    category: "메시지 템플릿",
    isNew: true,
    preview: "안녕하세요, {담당자명} 님. 오늘 귀한 시간 내주셔서 감사합니다...",
  },
  {
    id: 4,
    title: "바이오닷 핵심 가치",
    category: "신입 가이드",
    isNew: false,
    preview: "우리는 고객의 건강한 삶을 위해 최고 품질의 제품을 제공합니다...",
  },
  {
    id: 5,
    title: "미팅 전 준비 체크리스트",
    category: "영업 에티켓",
    isNew: false,
    preview: "미팅 전 반드시 확인해야 할 10가지 항목을 소개합니다...",
  },
];

const documents = [
  { name: "회사소개서 2024", type: "PDF", updated: "2024-12-01" },
  { name: "브랜드 가이드북", type: "PDF", updated: "2024-11-15" },
  { name: "제품 카탈로그", type: "PDF", updated: "2024-12-10" },
];

export default function Policies() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPolicies = popularPolicies.filter(
    (policy) =>
      policy.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      policy.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">내부 정책 가이드</h1>
        <p className="text-muted-foreground mt-1">영업 에티켓과 회사 정책을 확인하세요</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="정책 검색..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {policyCategories.map((category, index) => (
          <div
            key={category.id}
            className="bg-card rounded-xl border p-5 hover:shadow-md hover:border-primary/30 transition-all duration-200 cursor-pointer animate-fade-in group"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={cn("p-3 rounded-lg", category.color)}>
                <category.icon className="w-5 h-5" />
              </div>
              <Badge variant="secondary" className="text-xs">
                {category.count}개
              </Badge>
            </div>
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
              {category.name}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Popular Policies */}
        <div className="lg:col-span-2 bg-card rounded-xl border p-5 animate-fade-in">
          <h3 className="text-lg font-semibold text-foreground mb-4">자주 찾는 정책</h3>
          <div className="space-y-3">
            {filteredPolicies.map((policy) => (
              <div
                key={policy.id}
                className="flex items-start gap-4 p-4 rounded-lg border bg-background hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">
                      {policy.title}
                    </h4>
                    {policy.isNew && (
                      <Badge className="bg-primary text-primary-foreground text-xs">NEW</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{policy.category}</p>
                  <p className="text-sm text-muted-foreground line-clamp-2">{policy.preview}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
              </div>
            ))}
          </div>
        </div>

        {/* Documents */}
        <div className="bg-card rounded-xl border p-5 animate-fade-in">
          <h3 className="text-lg font-semibold text-foreground mb-4">공용 문서</h3>
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.name}
                className="flex items-center gap-3 p-3 rounded-lg border bg-background hover:border-primary/30 transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-destructive" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm group-hover:text-primary transition-colors truncate">
                    {doc.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {doc.type} · {doc.updated}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
