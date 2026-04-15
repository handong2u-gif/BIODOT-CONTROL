import { StatCard } from "@/components/ui/stat-card";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentActivities } from "@/components/dashboard/RecentActivities";
import { ProductChatbot } from "@/components/dashboard/ProductChatbot";
import { Package, Building2, FileText, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function Dashboard() {
  const [productCount, setProductCount] = useState<number | null>(null);
  const [rawCount, setRawCount] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const { count: fg } = await (supabase as any)
        .from("finished_goods")
        .select("*", { count: "exact", head: true });
      const { count: rm } = await (supabase as any)
        .from("raw_materials")
        .select("*", { count: "exact", head: true });
      setProductCount(fg ?? 0);
      setRawCount(rm ?? 0);
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">대시보드</h1>
        <p className="text-muted-foreground mt-1">바이오닷 운영 현황을 한눈에 확인하세요</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="완제품"
          value={productCount !== null ? String(productCount) : "…"}
          description="등록된 완제품 수"
          icon={Package}
          variant="primary"
        />
        <StatCard
          title="원자재"
          value={rawCount !== null ? String(rawCount) : "…"}
          description="등록된 원료 수"
          icon={Building2}
          variant="success"
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
        {/* 챗봇 — 메인 영역 (2/3) */}
        <div className="lg:col-span-2">
          <ProductChatbot />
        </div>

        {/* 우측 사이드 (1/3) */}
        <div className="space-y-6">
          <QuickActions />
          <RecentActivities />
        </div>
      </div>
    </div>
  );
}
