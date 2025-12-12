import { useState } from "react";
import { Search, Filter, Grid, List, Package, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const products = [
  {
    id: 1,
    name: "프로바이오틱스 골드",
    sku: "PRO-001",
    category: "유산균",
    image: "🧬",
    wholesalePrice: "₩15,000",
    retailPrice: "₩29,900",
    stock: 1250,
    status: "active",
  },
  {
    id: 2,
    name: "비타민D 3000IU",
    sku: "VIT-D3K",
    category: "비타민",
    image: "☀️",
    wholesalePrice: "₩8,500",
    retailPrice: "₩18,900",
    stock: 890,
    status: "active",
  },
  {
    id: 3,
    name: "오메가3 프리미엄",
    sku: "OMG-003",
    category: "오메가",
    image: "🐟",
    wholesalePrice: "₩22,000",
    retailPrice: "₩45,000",
    stock: 420,
    status: "active",
  },
  {
    id: 4,
    name: "멀티비타민 포뮬러",
    sku: "MUL-001",
    category: "비타민",
    image: "💊",
    wholesalePrice: "₩12,000",
    retailPrice: "₩25,000",
    stock: 680,
    status: "active",
  },
  {
    id: 5,
    name: "루테인 20mg",
    sku: "LUT-020",
    category: "눈건강",
    image: "👁️",
    wholesalePrice: "₩18,000",
    retailPrice: "₩35,000",
    stock: 320,
    status: "active",
  },
  {
    id: 6,
    name: "콜라겐 펩타이드",
    sku: "COL-001",
    category: "콜라겐",
    image: "✨",
    wholesalePrice: "₩25,000",
    retailPrice: "₩49,000",
    stock: 0,
    status: "out_of_stock",
  },
];

const categories = ["전체", "유산균", "비타민", "오메가", "눈건강", "콜라겐"];

export default function Products() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === "전체" || product.category === selectedCategory;
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">제품 정보</h1>
          <p className="text-muted-foreground mt-1">제품 정보를 조회하고 관리합니다</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="제품명 또는 SKU로 검색..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[140px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex border rounded-lg overflow-hidden">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "rounded-none border-r",
                viewMode === "grid" && "bg-muted"
              )}
              onClick={() => setViewMode("grid")}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn("rounded-none", viewMode === "list" && "bg-muted")}
              onClick={() => setViewMode("list")}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Products Grid/List */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((product, index) => (
            <div
              key={product.id}
              className="bg-card rounded-xl border p-5 hover:shadow-md hover:border-primary/30 transition-all duration-200 cursor-pointer animate-fade-in group"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-2xl">
                  {product.image}
                </div>
                <Badge
                  variant={product.status === "active" ? "default" : "destructive"}
                  className={cn(
                    "text-xs",
                    product.status === "active" && "bg-success text-success-foreground"
                  )}
                >
                  {product.status === "active" ? "판매중" : "품절"}
                </Badge>
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {product.name}
                </h3>
                <p className="text-xs text-muted-foreground">{product.sku}</p>
              </div>
              <div className="mt-4 pt-4 border-t space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">도매가</span>
                  <span className="font-medium text-foreground">{product.wholesalePrice}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">소비자가</span>
                  <span className="font-medium text-foreground">{product.retailPrice}</span>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">재고: {product.stock}개</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-xl border overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  제품
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  카테고리
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  도매가
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  소비자가
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  재고
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  상태
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredProducts.map((product) => (
                <tr
                  key={product.id}
                  className="hover:bg-muted/30 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{product.image}</span>
                      <div>
                        <p className="font-medium text-foreground">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-muted-foreground">{product.category}</td>
                  <td className="px-4 py-4 text-sm font-medium text-foreground">
                    {product.wholesalePrice}
                  </td>
                  <td className="px-4 py-4 text-sm text-muted-foreground">{product.retailPrice}</td>
                  <td className="px-4 py-4 text-sm text-muted-foreground">{product.stock}개</td>
                  <td className="px-4 py-4">
                    <Badge
                      variant={product.status === "active" ? "default" : "destructive"}
                      className={cn(
                        "text-xs",
                        product.status === "active" && "bg-success text-success-foreground"
                      )}
                    >
                      {product.status === "active" ? "판매중" : "품절"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
