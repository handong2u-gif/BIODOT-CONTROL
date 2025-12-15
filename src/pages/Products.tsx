
import { useState, useEffect } from "react";
import { Search, Filter, Grid, List, ChevronRight, Plus, Download, FileSpreadsheet } from "lucide-react";
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
import { toast } from "sonner"; // Assuming sonner is installed as per package.json

// Initial empty state
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

  // Initialize with localStorage or empty
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem("biodot_products");
    return saved ? JSON.parse(saved) : initialProducts;
  });

  // Save to localStorage whenever products change
  useEffect(() => {
    localStorage.setItem("biodot_products", JSON.stringify(products));
  }, [products]);

  // New Product Form State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "유산균",
    price: "",
    stock: "",
  });

  // Import State
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importUrl, setImportUrl] = useState(() => {
    const saved = localStorage.getItem("biodot_sheet_url");
    return saved || "";
  });
  const [isImporting, setIsImporting] = useState(false);

  // Save URL to localStorage whenever it changes
  useEffect(() => {
    if (importUrl) {
      localStorage.setItem("biodot_sheet_url", importUrl);
    }
  }, [importUrl]);

  // Template Data for Copy
  const copyTemplate = () => {
    const header = "제품명,카테고리,가격,재고\n프로바이오틱스,유산균,15000,100\n비타민C,비타민,10000,50";
    navigator.clipboard.writeText(header);
    toast.success("템플릿이 클립보드에 복사되었습니다. 구글 시트에 붙여넣으세요.");
  };

  const handleImport = () => {
    if (!importUrl) {
      toast.error("URL을 입력해주세요");
      return;
    }

    setIsImporting(true);

    // Add cache buster to URL to ensure fresh data
    const freshUrl = importUrl.includes('?')
      ? `${importUrl}&t=${Date.now()}`
      : `${importUrl}?t=${Date.now()}`;

    Papa.parse(freshUrl, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const importedProducts: Product[] = results.data.map((item: any, index) => {
            // Flexible column matching
            const name = item['제품명'] || item['name'] || item['Name'] || "이름 없음";
            const category = item['카테고리'] || item['category'] || item['Category'] || "기타";
            const price = parseInt((item['가격'] || item['price'] || item['Price'] || "0").replace(/[^0-9]/g, ""));
            const stock = parseInt((item['재고'] || item['stock'] || item['Stock'] || "0").replace(/[^0-9]/g, ""));

            return {
              id: Date.now() + index, // Unique ID generation
              name: name,
              sku: `IMP-${Math.floor(Math.random() * 10000)}`,
              category: category,
              image: "📦",
              wholesalePrice: `₩${price.toLocaleString()}`,
              retailPrice: `₩${(price * 1.5).toLocaleString()}`,
              stock: stock,
              status: (stock > 0 ? "active" : "out_of_stock") as "active" | "out_of_stock",
            };
          }).filter(p => p.name !== "이름 없음"); // Filter invalid rows

          if (importedProducts.length === 0) {
            console.log("CSV Parsed Results:", results);
            toast.error(`데이터가 없습니다. CSV 헤더를 확인해주세요. (발견된 헤더: ${results.meta.fields?.join(", ")})`);
          } else {
            // Replace all products with imported data (no duplicates)
            setProducts(importedProducts);
            toast.success(`${importedProducts.length}개의 제품을 가져왔습니다!`);
            setIsImportOpen(false);
            // Keep the URL for future imports - don't clear it
          }
        } catch (e) {
          console.error(e);
          toast.error("데이터 처리 중 오류가 발생했습니다.");
        } finally {
          setIsImporting(false);
        }
      },
      error: (err) => {
        console.error(err);
        toast.error("URL에서 데이터를 불러오는데 실패했습니다. '웹에 게시' 설정과 CSV 형식을 확인해주세요.");
        setIsImporting(false);
      }
    });
  };

  const handleAddProduct = () => {
    const id = products.length + 1;
    const product: Product = {
      id,
      name: newProduct.name,
      sku: `PROD-00${id}`,
      category: newProduct.category,
      image: "📦",
      wholesalePrice: `₩${parseInt(newProduct.price || "0").toLocaleString()}`,
      retailPrice: `₩${(parseInt(newProduct.price || "0") * 1.5).toLocaleString()}`,
      stock: parseInt(newProduct.stock || "0"),
      status: (parseInt(newProduct.stock || "0") > 0 ? "active" : "out_of_stock") as "active" | "out_of_stock",
    };

    setProducts([...products, product]);
    setIsAddOpen(false);
    setNewProduct({ name: "", category: "유산균", price: "", stock: "" });
    toast.success("제품이 등록되었습니다.");
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

        <div className="flex gap-2">
          {/* Import Dialog */}
          <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <FileSpreadsheet className="w-4 h-4 text-green-600" />
                구글 시트 가져오기
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>구글 시트에서 가져오기</DialogTitle>
                <DialogDescription>
                  '웹에 게시'된 구글 시트 URL(CSV 형식)을 입력하세요.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="bg-muted/50 p-4 rounded-lg text-sm space-y-2">
                  <p className="font-semibold text-foreground">💡 사용 방법</p>
                  <ol className="list-decimal list-inside text-muted-foreground space-y-1">
                    <li>구글 시트에서 <span className="text-foreground font-medium">파일 {'>'} 공유 {'>'} 웹에 게시</span> 클릭</li>
                    <li>형식을 <span className="text-foreground font-medium">CSV</span>로 선택 후 게시</li>
                    <li>생성된 링크를 아래에 복사/붙여넣기</li>
                  </ol>
                  <Button variant="secondary" size="sm" className="w-full mt-2 h-8" onClick={copyTemplate}>
                    📋 빈 양식(헤더) 복사하기
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label>CSV 링크</Label>
                  <Input
                    placeholder="https://docs.google.com/spreadsheets/d/e/.../pub?output=csv"
                    value={importUrl}
                    onChange={(e) => setImportUrl(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsImportOpen(false)}>취소</Button>
                <Button onClick={handleImport} disabled={isImporting}>
                  {isImporting ? "가져오는 중..." : "가져오기"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

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
      </div>

      {/* Products Grid/List */}
      {products.length === 0 ? (
        <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">등록된 제품이 없습니다</h3>
          <p className="text-muted-foreground mt-2 mb-6">새로운 제품을 등록하거나 구글 시트에서 가져오세요</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => setIsAddOpen(true)}>첫 제품 등록하기</Button>
            <Button variant="outline" onClick={() => setIsImportOpen(true)}>구글 시트 가져오기</Button>
          </div>
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
