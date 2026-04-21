import { StatCard } from "@/components/ui/stat-card";
import { ProductChatbot } from "@/components/dashboard/ProductChatbot";
import { Package, Boxes, ImageIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface RecentProduct {
  id: string | number;
  product_name: string;
  thumbnail_url: string | null;
  expiry_date: string | null;
}

export default function Dashboard() {
  const [productCount, setProductCount] = useState<number | null>(null);
  const [rawCount, setRawCount] = useState<number | null>(null);
  const [recentProducts, setRecentProducts] = useState<RecentProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    (async () => {
      // 통계 데이터 가져오기
      const { count: fg } = await (supabase as any)
        .from("finished_goods")
        .select("*", { count: "exact", head: true });
      const { count: rm } = await (supabase as any)
        .from("raw_materials")
        .select("*", { count: "exact", head: true });
      setProductCount(fg ?? 0);
      setRawCount(rm ?? 0);

      // 최근 완제품 목록 가져오기
      const { data: productsData } = await (supabase as any)
        .from("finished_goods")
        .select("id, product_name, thumbnail_url, expiry_date")
        .order("created_at", { ascending: false })
        .limit(10);
      
      setRecentProducts(productsData || []);
      setLoadingProducts(false);
    })();
  }, []);

  return (
    <div className="space-y-6">
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
          title="원료"
          value={rawCount !== null ? String(rawCount) : "…"}
          description="등록된 원료 수"
          icon={Boxes}
          variant="success"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 align-top">
        {/* 완제품 목록 리스트 뷰 */}
        <Card className="xl:col-span-1 border-slate-200 shadow-sm h-min">
          <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Package className="w-5 h-5 text-purple-600" /> 완제품 목록
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loadingProducts ? (
              <div className="p-8 text-center text-sm text-slate-400 animate-pulse">
                목록을 불러오는 중입니다...
              </div>
            ) : recentProducts.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">
                등록된 완제품이 없습니다.
              </div>
            ) : (
              <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                <Table>
                  <TableHeader className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                    <TableRow>
                      <TableHead className="w-16 text-center text-xs">사진</TableHead>
                      <TableHead className="text-xs">제품명</TableHead>
                      <TableHead className="text-xs whitespace-nowrap">소비기한</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentProducts.map((product) => (
                      <TableRow key={product.id} className="hover:bg-slate-50 transition-colors">
                        <TableCell className="p-2 text-center">
                          <div className="w-10 h-10 mx-auto rounded-md bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                            {product.thumbnail_url ? (
                              <img src={product.thumbnail_url} alt={product.product_name} className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon className="w-4 h-4 text-slate-300" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-sm text-slate-700 py-3">
                          {product.product_name}
                        </TableCell>
                        <TableCell className="text-sm text-slate-500 py-3 whitespace-nowrap">
                          {product.expiry_date || "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI 검색 챗봇 — 3컬럼 중 2컬럼 차지 */}
        <div className="xl:col-span-2">
          <ProductChatbot />
        </div>
      </div>
    </div>
  );
}

