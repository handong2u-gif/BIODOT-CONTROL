import { FileText, Package, Building2, PenTool } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const actions = [
  {
    name: "제품 검색",
    description: "제품 정보를 빠르게 조회합니다",
    icon: Package,
    href: "/products",
    color: "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground",
  },
  {
    name: "제안서 생성",
    description: "거래처 맞춤 제안서를 생성합니다",
    icon: FileText,
    href: "/documents",
    color: "bg-info/10 text-info group-hover:bg-info group-hover:text-info-foreground",
  },
  {
    name: "거래처 조회",
    description: "거래처 정보와 히스토리를 확인합니다",
    icon: Building2,
    href: "/clients",
    color: "bg-success/10 text-success group-hover:bg-success group-hover:text-success-foreground",
  },
  {
    name: "AR 보고서",
    description: "미팅 내용을 보고서로 작성합니다",
    icon: PenTool,
    href: "/documents/ar-report",
    color: "bg-warning/10 text-warning group-hover:bg-warning group-hover:text-warning-foreground",
  },
];

export function QuickActions() {
  return (
    <div className="bg-card rounded-xl border p-5 animate-fade-in">
      <h3 className="text-lg font-semibold text-foreground mb-4">빠른 실행</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <Link
            key={action.name}
            to={action.href}
            className="group flex items-center gap-3 p-4 rounded-lg border border-border bg-background hover:border-primary/30 hover:shadow-sm transition-all duration-200"
          >
            <div className={cn("p-2.5 rounded-lg transition-colors duration-200", action.color)}>
              <action.icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-foreground text-sm">{action.name}</p>
              <p className="text-xs text-muted-foreground truncate">{action.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
