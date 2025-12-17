import { useState, useEffect } from "react";
import { Search, Filter, Grid, List, ChevronRight, Plus, FileSpreadsheet, X, Trash2, Lock, Boxes, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Papa from "papaparse";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";

// --- TYPES ---
interface FinishedGood {
  id: number;
  name: string;
  sku: string;
  category: string;
  image: string; // default '📦'
  wholesale_price: number; // changed from string to number for DB consistency
  retail_price: number;
  stock: number;
  status: "active" | "out_of_stock";
  created_at?: string;
}

interface RawMaterial {
  id: string; // BD-RM-000001
  name: string;
  origin_country: string;
  price_effective_date: string;
  supply_price: number;
  created_at?: string;
}

const categories = ["전체", "유산균", "비타민", "오메가", "눈건강", "콜라겐", "기타"];

export default function Products() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [searchQuery, setSearchQuery] = useState("");

  // Tabs: 'works' = Biodot Works (Finished), 'biodot' = Biodot (Raw)
  const [activeTab, setActiveTab] = useState("works");

  // --- FINISHED GOODS STATE (BIODOT WORKS) ---
  const [finishedGoods, setFinishedGoods] = useState<FinishedGood[]>([]);
  const [worksLoading, setWorksLoading] = useState(false);

  // New Product Form State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "유산균",
    sku: "",
    wholesale_price: "",
    retail_price: "",
    stock: "",
  });

  // Import State
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importUrl, setImportUrl] = useState(() => localStorage.getItem("biodot_sheet_url") || "");
  const [isImporting, setIsImporting] = useState(false);

  // Admin Mode State
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isPinDialogOpen, setIsPinDialogOpen] = useState(false);
  const [pinInput, setPinInput] = useState("");

  // --- RAW MATERIALS STATE (BIODOT) ---
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
  const [rawLoading, setRawLoading] = useState(false);

  // --- EFFECTS ---
  useEffect(() => {
    if (importUrl) localStorage.setItem("biodot_sheet_url", importUrl);
  }, [importUrl]);

  useEffect(() => {
    if (activeTab === "works") {
      fetchFinishedGoods();
    } else if (activeTab === "biodot") {
      fetchRawMaterials();
    }
  }, [activeTab]);

  // --- API CALLS ---

  const fetchFinishedGoods = async () => {
    setWorksLoading(true);
    const { data, error } = await supabase
      .from("finished_goods")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching finished goods:", error);
      // Fallback: If table doesn't exist, maybe show empty or cached? 
      // For now, show error toast only once or if explicit
      if (error.code === "42P01") { // undefined_table
        toast.error("DB 테이블이 없습니다. SQL을 실행해주세요.");
      } else {
        toast.error("제품 목록을 불러오지 못했습니다.");
      }
    } else {
      setFinishedGoods(data || []);
    }
    setWorksLoading(false);
  };

  const fetchRawMaterials = async () => {
    setRawLoading(true);
    const { data, error } = await supabase
      .from("raw_materials")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching raw materials:", error);
      toast.error("원자재 정보를 불러오는데 실패했습니다.");
    } else {
      setRawMaterials(data || []);
    }
    setRawLoading(false);
  };

  const handleAddProduct = async () => {
    if (!newProduct.name) {
      toast.error("제품명을 입력해주세요.");
      return;
    }

    const wholesale = parseInt(newProduct.wholesale_price || "0");
    const retail = parseInt(newProduct.retail_price || "0");
    const stock = parseInt(newProduct.stock || "0");

    // Auto-generate SKU if empty
    const sku = newProduct.sku || `PROD-${Math.floor(Math.random() * 10000)}`;

    const productPayload = {
      name: newProduct.name,
      category: newProduct.category,
      sku: sku,
      image: "📦",
      wholesale_price: wholesale,
      retail_price: retail,
      stock: stock,
      status: stock > 0 ? "active" : "out_of_stock",
    };

    const { error } = await supabase
      .from("finished_goods")
      .insert([productPayload]);

    if (error) {
      console.error(error);
      toast.error("제품 추가 실패: " + error.message);
    } else {
      toast.success("제품이 등록되었습니다.");
      setIsAddOpen(false);
      setNewProduct({ name: "", category: "유산균", sku: "", wholesale_price: "", retail_price: "", stock: "" });
      fetchFinishedGoods(); // Refresh
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    const { error } = await supabase
      .from("finished_goods")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("삭제 실패");
    } else {
      toast.success("제품이 삭제되었습니다.");
      fetchFinishedGoods();
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm(`정말 모든 제품(${finishedGoods.length}개)을 삭제하시겠습니까?`)) return;

    // Note: Delete without where clause might be blocked by safe updates
    // Delete all by ID in list
    const ids = finishedGoods.map(p => p.id);
    const { error } = await supabase
      .from("finished_goods")
      .delete()
      .in("id", ids);

    if (error) {
      toast.error("전체 삭제 실패");
    } else {
      toast.success("모든 제품이 삭제되었습니다.");
      fetchFinishedGoods();
    }
  };

  // --- CONSTANTS & UTILS ---
  const copyTemplate = () => {
    const header = "제품명,카테고리,도매가,소비자가,재고\n프로바이오틱스,유산균,15000,22000,100";
    navigator.clipboard.writeText(header);
    toast.success("템플릿 복사 완료!");
  };

  const handlePinSubmit = () => {
    if (pinInput === "1234") {
      setIsAdminMode(true);
      setIsPinDialogOpen(false);
      setPinInput("");
      toast.success("관리자 모드 활성화");
    } else {
      toast.error("PIN 번호 오류");
      setPinInput("");
    }
  };

  // --- FILTERING ---
  const filteredFinishedGoods = finishedGoods.filter((product) => {
    const matchesCategory = selectedCategory === "전체" || product.category === selectedCategory;
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.sku && product.sku.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Helper to format currency
  const formatMoney = (val: number) => `₩${val.toLocaleString()}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">제품 정보 관리</h1>
            {isAdminMode && (
              <Badge variant="destructive" className="gap-1">
                <Lock className="w-3 h-3" />
                관리자 모드
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-1">
            (주)바이오닷웍스(완제품) 및 (주)바이오닷(원료) 제품 DB 관리
          </p>
        </div>

        <div className="flex gap-2">
          {isAdminMode ? (
            <Button
              variant="destructive"
              className="gap-2"
              onClick={() => {
                setIsAdminMode(false);
                toast.info("관리자 모드 해제");
              }}
            >
              <Lock className="w-4 h-4" />
              관리 모드 OFF
            </Button>
          ) : (
            <Dialog open={isPinDialogOpen} onOpenChange={setIsPinDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Lock className="w-4 h-4" />
                  관리자
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                  <DialogTitle>관리자 인증</DialogTitle>
                  <DialogDescription>PIN 번호(1234)를 입력하세요.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <Input
                    type="password"
                    placeholder="PIN"
                    maxLength={4}
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handlePinSubmit()}
                  />
                </div>
                <DialogFooter>
                  <Button onClick={handlePinSubmit}>확인</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="works" className="gap-2">
            <Package className="w-4 h-4" />
            (주)바이오닷웍스 <span className="text-xs opacity-70">(완제품)</span>
          </TabsTrigger>
          <TabsTrigger value="biodot" className="gap-2">
            <Boxes className="w-4 h-4" />
            (주)바이오닷 <span className="text-xs opacity-70">(원료)</span>
          </TabsTrigger>
        </TabsList>

        {/* --- BIODOT WORKS (FINISHED GOODS) CONTENT --- */}
        <TabsContent value="works" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative w-60">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="제품명, SKU 검색..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[140px]">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-muted-foreground" />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="bg-muted p-1 rounded-lg border flex items-center">
                <button
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "p-1.5 rounded-md transition-all",
                    viewMode === "grid" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "p-1.5 rounded-md transition-all",
                    viewMode === "list" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              {isAdminMode && finishedGoods.length > 0 && (
                <Button variant="destructive" className="gap-2" onClick={handleDeleteAll}>
                  <Trash2 className="w-4 h-4" />
                  전체 삭제
                </Button>
              )}

              <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    제품 추가
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>새 제품 추가 (DB)</DialogTitle>
                    <DialogDescription>
                      (주)바이오닷웍스 완제품 정보를 입력해주세요.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">제품명</Label>
                      <Input id="name" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="category" className="text-right">카테고리</Label>
                      <Select value={newProduct.category} onValueChange={(val) => setNewProduct({ ...newProduct, category: val })}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="선택" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.filter(c => c !== "전체").map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="wholesale" className="text-right">도매가</Label>
                      <Input id="wholesale" type="number" placeholder="0" value={newProduct.wholesale_price} onChange={(e) => setNewProduct({ ...newProduct, wholesale_price: e.target.value })} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="retail" className="text-right">소비자가</Label>
                      <Input id="retail" type="number" placeholder="0" value={newProduct.retail_price} onChange={(e) => setNewProduct({ ...newProduct, retail_price: e.target.value })} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="stock" className="text-right">재고</Label>
                      <Input id="stock" type="number" placeholder="0" value={newProduct.stock} onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })} className="col-span-3" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleAddProduct}>DB에 저장</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {worksLoading ? (
            <div className="flex justify-center p-12 text-muted-foreground animate-pulse">DB에서 제품 정보를 불러오는 중...</div>
          ) : finishedGoods.length === 0 ? (
            <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">등록된 제품이 없습니다</h3>
              <p className="text-muted-foreground mt-2 mb-6">새로운 제품을 등록해주세요 (DB 연동됨)</p>
              <Button onClick={() => setIsAddOpen(true)}>첫 제품 등록하기</Button>
            </div>
          ) : (
            viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredFinishedGoods.map((product, index) => (
                  <div
                    key={product.id}
                    className="bg-card rounded-xl border p-5 hover:shadow-md transition-all duration-200 cursor-pointer animate-fade-in group relative"
                  >
                    {isAdminMode && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProduct(product.id);
                        }}
                        className="absolute top-3 right-3 w-6 h-6 rounded-full bg-destructive/10 hover:bg-destructive text-destructive hover:text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-2xl">
                        {product.image}
                      </div>
                      <Badge variant={product.status === "active" ? "default" : "destructive"}>
                        {product.status === "active" ? "판매중" : "품절"}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold text-foreground truncate">{product.name}</h3>
                      <p className="text-xs text-muted-foreground">{product.sku}</p>
                    </div>
                    <div className="mt-4 pt-4 border-t space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">도매가</span>
                        <span className="font-medium">{formatMoney(product.wholesale_price)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">소비자가</span>
                        <span className="font-medium">{formatMoney(product.retail_price)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-card rounded-xl border overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">제품</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">카테고리</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">도매가</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">소비자가</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">재고</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">상태</th>
                      {isAdminMode && <th className="px-4 py-3"></th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredFinishedGoods.map((product) => (
                      <tr key={product.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{product.image}</span>
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-xs text-muted-foreground">{product.sku}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-muted-foreground">{product.category}</td>
                        <td className="px-4 py-4 text-sm font-medium text-foreground">{formatMoney(product.wholesale_price)}</td>
                        <td className="px-4 py-4 text-sm text-muted-foreground">{formatMoney(product.retail_price)}</td>
                        <td className="px-4 py-4 text-sm">{product.stock}</td>
                        <td className="px-4 py-4">
                          <Badge variant={product.status === "active" ? "default" : "destructive"}>
                            {product.status === "active" ? "판매중" : "품절"}
                          </Badge>
                        </td>
                        {isAdminMode && (
                          <td className="px-4 py-4">
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteProduct(product.id)}>
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </TabsContent>

        {/* --- BIODOT (RAW MATERIALS) CONTENT --- */}
        <TabsContent value="biodot" className="space-y-6">
          <div className="bg-card rounded-xl border overflow-hidden">
            {rawLoading ? (
              <div className="p-8 text-center text-muted-foreground">
                원자재 데이터를 불러오는 중입니다...
              </div>
            ) : rawMaterials.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                등록된 원자재가 없습니다.
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">원료 ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">원료명</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">원산지</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">공급가 (KRW)</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">가격 기준일</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {rawMaterials.map((material) => (
                    <tr key={material.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-4 text-sm font-mono text-muted-foreground">{material.id}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Boxes className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium text-foreground">{material.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <Badge variant="outline">{material.origin_country}</Badge>
                      </td>
                      <td className="px-4 py-4 text-sm font-medium">
                        {formatMoney(material.supply_price)}
                      </td>
                      <td className="px-4 py-4 text-sm text-muted-foreground">
                        {material.price_effective_date}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
