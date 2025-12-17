import { User, Bell, Shield, Database, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const settingsSections = [
  {
    id: "profile",
    name: "프로필 설정",
    description: "개인 정보 및 계정 설정",
    icon: User,
  },
  {
    id: "notifications",
    name: "알림 설정",
    description: "알림 및 이메일 수신 설정",
    icon: Bell,
  },
  {
    id: "security",
    name: "보안",
    description: "비밀번호 및 보안 설정",
    icon: Shield,
  },
  {
    id: "data",
    name: "데이터 관리",
    description: "데이터 동기화 및 백업",
    icon: Database,
  },
  {
    id: "help",
    name: "도움말",
    description: "FAQ 및 지원 문의",
    icon: HelpCircle,
  },
];

const notificationSettings = [
  { id: "email", name: "이메일 알림", description: "중요 업데이트를 이메일로 받습니다", enabled: true },
  { id: "push", name: "푸시 알림", description: "실시간 알림을 받습니다", enabled: true },
  { id: "report", name: "주간 리포트", description: "매주 월요일 업무 요약을 받습니다", enabled: false },
];

export default function Settings() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">설정</h1>
        <p className="text-muted-foreground mt-1">시스템 및 개인 설정을 관리합니다</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {settingsSections.map((section, index) => (
          <div
            key={section.id}
            className="bg-card rounded-xl border p-5 hover:shadow-md hover:border-primary/30 transition-all duration-200 cursor-pointer animate-fade-in group"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <section.icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {section.name}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">{section.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Notification Settings Preview */}
      <div className="bg-card rounded-xl border p-5 animate-fade-in">
        <h3 className="text-lg font-semibold text-foreground mb-4">알림 설정</h3>
        <div className="space-y-4">
          {notificationSettings.map((setting) => (
            <div
              key={setting.id}
              className="flex items-center justify-between p-4 rounded-lg border bg-background"
            >
              <div>
                <p className="font-medium text-foreground">{setting.name}</p>
                <p className="text-sm text-muted-foreground">{setting.description}</p>
              </div>
              <Switch defaultChecked={setting.enabled} />
            </div>
          ))}
        </div>
      </div>

      {/* System Info */}
      <div className="bg-card rounded-xl border p-5 animate-fade-in">
        <h3 className="text-lg font-semibold text-foreground mb-4">시스템 정보</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">버전</span>
            <p className="font-medium text-foreground">1.0.0</p>
          </div>
          <div>
            <span className="text-muted-foreground">마지막 동기화</span>
            <p className="font-medium text-foreground">2024-12-12 09:30</p>
          </div>
          <div>
            <span className="text-muted-foreground">데이터 소스</span>
            <p className="font-medium text-foreground">Google Sheets + ERP</p>
          </div>
          <div>
            <span className="text-muted-foreground">상태</span>
            <p className="font-medium text-success">정상 운영 중</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t">
          <Button variant="outline" size="sm">
            데이터 수동 동기화
          </Button>
        </div>
      </div>
    </div>
  );
}
