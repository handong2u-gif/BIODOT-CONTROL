import { StatCard } from "@/components/ui/stat-card";
import { ProductChatbot } from "@/components/dashboard/ProductChatbot";
import { Package, Boxes } from "lucide-react";
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
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">대시보드</h1>
        <p className="text-muted-foreground mt-1">바이오닷 운영 현황을 한눈에 확인하세요</p>
      </div>

      {/* 실제 DB 데이터 기반 통계 카드만 표시 */}
      <div className="grid grid-cols-2 gap-4 max-w-sm">
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
          icon={Boxes}
          variant="success"
        />
      </div>

      {/* AI 검색 챗봇 — 풀 너비 */}
      <ProductChatbot />
    </div>
  );
}

