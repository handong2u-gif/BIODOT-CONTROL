
import { useState } from "react";
import { Search, Filter, Grid, List, ChevronRight, Plus } from "lucide-react";
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

// Initial empty state as requested
const initialProducts: Product[] = [];

interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
  image: string;
  wholesalePrice: string;
  retailPrice: string;
  stock: number;
  status: "active" | "out_of_stock";
}

const categories = ["전체", "유산균", "비타민", "오메가", "눈건강", "콜라겐"];

export default function Products() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>(initialProducts);

  // New Product Form State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "유산균",
    price: "",
    stock: "",
  });

  const handleAddProduct = () => {
    const id = products.length + 1;
    const product: Product = {
      id,
      name: newProduct.name,
      sku: `PROD-00${id}`, // Simple SKU generation
      category: newProduct.category,
      image: "📦", // Default icon
      wholesalePrice: `₩${parseInt(newProduct.price || "0").toLocaleString()}`,
      retailPrice: `₩${(parseInt(newProduct.price || "0") * 1.5).toLocaleString()}`, // Mock retail price
      stock: parseInt(newProduct.stock || "0"),
      status: "active",
    };

    setProducts([...products, product]);
    setIsAddOpen(false);
    setNewProduct({ name: "", category: "유산균", price: "", stock: "" }); // Reset form
  };

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
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              제품 추가
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>새 제품 추가</DialogTitle>
              <DialogDescription>
                새로운 제품의 정보를 입력해주세요.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  제품명
                </Label>
                <Input
                  id="name"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  카테고리
                </Label>
                <Select
                  value={newProduct.category}
                  onValueChange={(val) => setNewProduct({ ...newProduct, category: val })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="카테고리 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.filter(c => c !== "전체").map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">
                  단가 (원)
                </Label>
                <Input
                  id="price"
                  type="number"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="stock" className="text-right">
                  재고
                </Label>
                <Input
                  id="stock"
                  type="number"
                  value={newProduct.stock}
                  onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleAddProduct}>저장하기</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
      {products.length === 0 ? (
        <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">등록된 제품이 없습니다</h3>
          <p className="text-muted-foreground mt-2 mb-6">새로운 제품을 등록하여 관리를 시작하세요</p>
          <Button onClick={() => setIsAddOpen(true)}>첫 제품 등록하기</Button>
        </div>
      ) : (
        viewMode === "grid" ? (
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
        )
      )}
    </div>
  );
}
