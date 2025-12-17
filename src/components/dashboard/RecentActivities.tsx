import { FileText, Package, Building2, User } from "lucide-react";
import { cn } from "@/lib/utils";

const activities = [
  {
    id: 1,
    type: "document",
    title: "제안서 생성 완료",
    description: "코스트코 - 프로바이오틱스 제안서",
    time: "10분 전",
    icon: FileText,
    iconColor: "bg-info/10 text-info",
  },
  {
    id: 2,
    type: "client",
    title: "거래처 방문 등록",
    description: "롯데마트 본사 미팅",
    time: "1시간 전",
    icon: Building2,
    iconColor: "bg-success/10 text-success",
  },
  {
    id: 3,
    type: "product",
    title: "제품 정보 조회",
    description: "비타민D 3000IU 규격 확인",
    time: "2시간 전",
    icon: Package,
    iconColor: "bg-primary/10 text-primary",
  },
  {
    id: 4,
    type: "user",
    title: "김영업 님의 AR 보고서",
    description: "이마트 에브리데이 방문 보고",
    time: "3시간 전",
    icon: User,
    iconColor: "bg-warning/10 text-warning",
  },
];

export function RecentActivities() {
  return (
    <div className="bg-card rounded-xl border p-5 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">최근 활동</h3>
        <button className="text-sm text-primary hover:underline">전체 보기</button>
      </div>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3">
            <div className={cn("p-2 rounded-lg flex-shrink-0", activity.iconColor)}>
              <activity.icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{activity.title}</p>
              <p className="text-xs text-muted-foreground truncate">{activity.description}</p>
            </div>
            <span className="text-xs text-muted-foreground flex-shrink-0">{activity.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
