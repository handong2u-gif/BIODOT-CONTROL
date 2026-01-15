
import { useState, useEffect } from "react";
import {
  Package,
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  LayoutGrid,
  List as ListIcon,
  Eye,
  EyeOff,
  FileText,
  Lock,
  Factory,
  Beaker,
  Image as ImageIcon
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CsvUploadButton } from "@/components/products/CsvUploadButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

// Matches DB Schema - Updated with detail_image_url
interface ProductData {
  id: number | string;
  product_name: string;
  spec: string | null;
  origin_country: string | null;
  wholesale_a: number;
  wholesale_b: number;
  wholesale_c: number;
  retail_price: number;
  cost_blind: number;
  expiry_date: string | null;
  inbound_date: string | null;
  thumbnail_url: string | null;
  detail_image_url: string | null;
  stock_status: string | null; // Added
  tags: string[] | null; // Added
  selling_point: string | null; // Added
  key_features: string[] | null; // Added
  target_customer: string | null; // Added
  cert_doc_url: string | null;
  report_doc_url: string | null;
  intro_doc_url: string | null;
  qty_carton: string | null;
  qty_container: string | null;
  active_clients: string | null;
  inactive_clients: string | null;
  unpaid_balance: string | null;
  last_check_date: string | null;
  competitor_comp: string | null;
  memo: string | null;
  created_at: string;
}

// Import ProductImageManager (Assume it's created)
import { ProductImageManager } from "@/components/products/ProductImageManager";

const Products = () => {
  // Tabs: 'biodot' (Raw Materials) vs 'biodot-works' (Finished Goods)
  const [activeTab, setActiveTab] = useState("biodot-works");

  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [showCost, setShowCost] = useState(false);

  // Admin Mode State (Simple Toggle for now)
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchProducts = async (currentTab: string) => {
    setLoading(true);
    // setProducts([]); // Removed to allow smooth info update
    try {
      const tableName = currentTab === 'biodot' ? 'raw_materials' : 'finished_goods';

      const { data, error } = await (supabase as any)
        .from(tableName)
        .select('*')
        .order('created_at', { ascending: false })
        .order('id', { ascending: true });

      if (error) {
        console.warn(`Error fetching ${tableName}:`, error);
        toast.error("데이터를 불러오지 못했습니다.");
      } else {
        setProducts(data || []);
      }
    } catch (error: any) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch when tab changes
  useEffect(() => {
    setProducts([]);
    fetchProducts(activeTab);
  }, [activeTab]);

  const formatMoney = (amount: number | null) => {
    if (amount === null || amount === undefined) return "0";
    return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(amount);
  };

  const handleAdminToggle = (checked: boolean) => {
    setIsAdmin(checked);
    if (checked) {
      toast.info("관리자 모드가 활성화되었습니다. (이미지 업로드 가능)");
    } else {
      toast.info("관리자 모드가 해제되었습니다.");
    }
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">제품 정보 관리</h1>
          <p className="text-slate-500 mt-1">통합 제품 DB (CSV 연동)</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Admin Toggle */}
          <div className="flex items-center gap-2 mr-4 bg-slate-100 p-1.5 px-3 rounded-full">
            <Switch id="admin-mode" checked={isAdmin} onCheckedChange={handleAdminToggle} className="scale-75 data-[state=checked]:bg-blue-600" />
            <Label htmlFor="admin-mode" className="text-xs font-medium cursor-pointer text-slate-600">
              관리자 모드
            </Label>
          </div>

          <Button onClick={() => fetchProducts(activeTab)} variant="outline" size="sm">
            새로고침
          </Button>
          {isAdmin && (
            <CsvUploadButton
              tableName={activeTab === 'biodot' ? 'raw_materials' : 'finished_goods'}
              onUploadComplete={() => fetchProducts(activeTab)}
            />
          )}
          {isAdmin && (
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <Plus className="w-4 h-4 mr-2" /> 제품 추가
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="biodot-works" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">

          {/* Brand Tabs */}
          <TabsList className="bg-white border shadow-sm p-1">
            <TabsTrigger value="biodot" className="gap-2 data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700">
              <Beaker className="w-4 h-4" /> (주)바이오닷 (원료)
            </TabsTrigger>
            <TabsTrigger value="biodot-works" className="gap-2 data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700">
              <Factory className="w-4 h-4" /> (주)바이오닷웍스 (완제품)
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-3 bg-white p-2 px-4 rounded-lg border shadow-sm">
            {/* View Toggle */}
            <div className="flex items-center border rounded-md overflow-hidden bg-slate-50">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <ListIcon className="w-4 h-4" />
              </button>
              <div className="w-[1px] h-4 bg-slate-200" />
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* Cost Blind Toggle */}
            <div className="flex items-center gap-2">
              <Label htmlFor="cost-blind" className="text-xs font-medium cursor-pointer flex items-center gap-1 select-none">
                {showCost ? <Eye className="w-3 h-3 text-slate-500" /> : <EyeOff className="w-3 h-3 text-slate-400" />}
                원가 표시
              </Label>
              <Switch
                id="cost-blind"
                checked={showCost}
                onCheckedChange={setShowCost}
                className="scale-75"
              />
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="space-y-6">

          {/* FILTER BAR */}
          <div className="flex flex-wrap gap-3 bg-white p-4 rounded-xl border shadow-sm">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input placeholder="제품명, 규격, 메모 검색..." className="pl-9 bg-slate-50 border-slate-200" />
            </div>
            <Button variant="outline" size="icon"><Filter className="w-4 h-4" /></Button>
          </div>

          {loading ? (
            <div className="text-center py-20 text-muted-foreground animate-pulse">데이터를 불러오는 중입니다...</div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed">
              <Package className="w-10 h-10 mx-auto text-muted-foreground mb-3 opacity-20" />
              <p className="text-muted-foreground">등록된 제품이 없습니다 ({activeTab === 'biodot' ? '원료' : '완제품'}).</p>
              <p className="text-xs text-muted-foreground mt-1">
                {activeTab === 'biodot-works' ? "CSV를 'finished_goods' 테이블에 업로드하세요." : "CSV를 'raw_materials' 테이블에 업로드하세요."}
              </p>
            </div>
          ) : viewMode === 'list' ? (
            // --- LIST VIEW ---
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b">
                    <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="px-4 py-3 min-w-[200px]">제품명 / 규격</th>
                      {activeTab === 'biodot' ? (
                        <th className="px-4 py-3 text-center hidden md:table-cell">원산지</th>
                      ) : (
                        <th className="px-4 py-3 text-center">상태</th>
                      )}

                      {activeTab === 'biodot-works' && <th className="px-4 py-3 text-center hidden md:table-cell">태그</th>}

                      <th className="px-4 py-3 text-right text-emerald-600">
                        도매가 A
                        {activeTab !== 'biodot' && (
                          <span className="block text-[10px] font-normal opacity-80">위탁가(배송비별도)</span>
                        )}
                      </th>
                      {/* Removed Columns as per user request to simplify? No, kept as per "config product_list" but maybe hide others? 
                          User specifically asked for: thumbnail_url, product_name, stock_status, price_wholesale_a, tags. 
                          I will keep others but ensure these are prominent. 
                      */}
                      {activeTab === 'biodot-works' && (
                        <th className="px-4 py-3 text-right hidden lg:table-cell">
                          도매가 B
                        </th>
                      )}

                      <th className="px-4 py-3 text-right hidden lg:table-cell">
                        {activeTab === 'biodot' ? "한의원 공급가" : "소비자가"}
                      </th>
                      {showCost && <th className="px-4 py-3 text-right text-red-500 bg-red-50/50">원가</th>}
                      {/* <th className="px-4 py-3 text-center hidden md:table-cell">유효기간</th> */}
                      {isAdmin && <th className="px-4 py-3 w-[50px]"></th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {products.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50/80 transition-colors group text-slate-700 cursor-pointer"
                        onClick={() => window.location.href = `/products/${item.id}`} // Simple navigation for now
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-start gap-3">
                            <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                              <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-emerald-500 hover:ring-offset-1 transition-all">
                                <ProductImageManager
                                  product={item}
                                  tableName={activeTab === 'biodot' ? 'raw_materials' : 'finished_goods'}
                                  isAdmin={isAdmin}
                                  onUpdate={() => fetchProducts(activeTab)}
                                  trigger={
                                    item.thumbnail_url ? (
                                      <img src={item.thumbnail_url} alt={item.product_name} className="w-full h-full object-cover" />
                                    ) : (
                                      <ImageIcon className="w-5 h-5 text-slate-300" />
                                    )
                                  }
                                />
                              </div>
                            </div>
                            <div>
                              <div className="font-medium text-slate-900 line-clamp-2 hover:text-blue-600 transition-colors">{item.product_name}</div>
                              {item.spec && <div className="text-xs text-slate-500 mt-0.5">{item.spec}</div>}
                            </div>
                          </div>
                        </td>

                        {activeTab === 'biodot' ? (
                          <td className="px-4 py-3 text-center text-slate-600 text-sm hidden md:table-cell">
                            {item.origin_country || '-'}
                          </td>
                        ) : (
                          <td className="px-4 py-3 text-center">
                            {item.stock_status === 'out_of_stock' ? (
                              <Badge variant="destructive" className="text-[10px]">품절</Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">판매중</Badge>
                            )}
                          </td>
                        )}

                        {activeTab === 'biodot-works' && (
                          <td className="px-4 py-3 text-center hidden md:table-cell">
                            <div className="flex flex-wrap gap-1 justify-center max-w-[150px] mx-auto">
                              {item.tags?.map(t => <Badge key={t} variant="secondary" className="text-[10px] px-1 py-0">{t}</Badge>)}
                            </div>
                          </td>
                        )}

                        <td className="px-4 py-3 text-right font-medium text-emerald-700">
                          {formatMoney(item.wholesale_a)}
                        </td>
                        {activeTab === 'biodot-works' && (
                          <td className="px-4 py-3 text-right text-slate-600 hidden lg:table-cell">
                            {formatMoney(item.wholesale_b)}
                          </td>
                        )}
                        <td className="px-4 py-3 text-right text-slate-600 hidden lg:table-cell">
                          {formatMoney(item.retail_price)}
                        </td>
                        {showCost && (
                          <td className="px-4 py-3 text-right font-medium text-red-600 bg-red-50/30">
                            {formatMoney(item.cost_blind)}
                          </td>
                        )}

                        {isAdmin && (
                          <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            // --- GRID VIEW ---
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((item) => (
                <Card
                  key={item.id}
                  className="hover:shadow-md transition-shadow group overflow-hidden border-slate-200 cursor-pointer"
                  onClick={() => window.location.href = `/products/${item.id}`}
                >
                  <div className="h-40 bg-slate-100 relative group-hover:bg-slate-200 transition-colors flex items-center justify-center">
                    {item.thumbnail_url ? (
                      <img src={item.thumbnail_url} alt={item.product_name} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-12 h-12 text-slate-300" />
                    )}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 rounded-full p-1 shadow-sm" onClick={e => e.stopPropagation()}>
                      <ProductImageManager
                        product={item}
                        tableName={activeTab === 'biodot' ? 'raw_materials' : 'finished_goods'}
                        isAdmin={isAdmin}
                        onUpdate={() => fetchProducts(activeTab)}
                      />
                    </div>
                    {/* Stock Status Badge */}
                    <div className="absolute top-2 left-2">
                      {item.stock_status === 'out_of_stock' ? (
                        <Badge variant="destructive" className="shadow-sm">품절</Badge>
                      ) : (
                        <Badge className="bg-white/90 text-slate-800 hover:bg-white shadow-sm border-0">
                          {activeTab === 'biodot' ? item.origin_country : '판매중'}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardContent className="p-4 pt-5">
                    <div className="mb-4">
                      <h3 className="font-bold text-lg text-slate-900 line-clamp-1">{item.product_name}</h3>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {item.spec && <Badge variant="secondary" className="font-normal text-xs">{item.spec}</Badge>}
                        {item.tags?.slice(0, 2).map(t => <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>)}
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center bg-slate-50 p-2 rounded">
                        <span className="text-slate-500 font-medium">{activeTab === 'biodot' ? '공급가' : '도매가 A'}</span>
                        <span className="font-bold text-emerald-700 text-base">{formatMoney(item.wholesale_a)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Tabs>
    </div>
  );
};

export default Products;
