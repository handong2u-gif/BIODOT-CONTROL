import { StatCard } from "@/components/ui/stat-card";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentActivities } from "@/components/dashboard/RecentActivities";
import { SalesOverview } from "@/components/dashboard/SalesOverview";
import { Package, Building2, FileText, AlertCircle } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">대시보드</h1>
        <p className="text-muted-foreground mt-1">BIODOT 운영 현황을 한눈에 확인하세요</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="등록 제품"
          value="128"
          description="활성 제품 수"
          icon={Package}
          variant="primary"
          trend={{ value: 5.2, isPositive: true }}
        />
        <StatCard
          title="거래처"
          value="67"
          description="활성 거래처"
          icon={Building2}
          variant="success"
          trend={{ value: 3.1, isPositive: true }}
        />
        <StatCard
          title="이번 달 제안서"
          value="24"
          description="발행 건수"
          icon={FileText}
          trend={{ value: 12.5, isPositive: true }}
        />
        <StatCard
          title="미수금"
          value="₩45.2M"
          description="총 미수금액"
          icon={AlertCircle}
          variant="warning"
          trend={{ value: 8.3, isPositive: false }}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <QuickActions />
          <RecentActivities />
        </div>
        <div>
          <SalesOverview />
        </div>
      </div>
    </div>
  );
}
