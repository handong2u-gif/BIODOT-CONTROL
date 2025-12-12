import { TrendingUp, TrendingDown } from "lucide-react";

const topProducts = [
  { name: "프로바이오틱스 골드", sales: "₩45,200,000", change: 12.5, isUp: true },
  { name: "비타민D 3000IU", sales: "₩38,500,000", change: 8.3, isUp: true },
  { name: "오메가3 프리미엄", sales: "₩32,100,000", change: -2.1, isUp: false },
  { name: "멀티비타민 포뮬러", sales: "₩28,900,000", change: 5.7, isUp: true },
];

export function SalesOverview() {
  return (
    <div className="bg-card rounded-xl border p-5 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">월간 판매 TOP</h3>
        <span className="text-sm text-muted-foreground">12월 기준</span>
      </div>
      <div className="space-y-4">
        {topProducts.map((product, index) => (
          <div key={product.name} className="flex items-center gap-4">
            <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
              {index + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
              <p className="text-xs text-muted-foreground">{product.sales}</p>
            </div>
            <div
              className={`flex items-center gap-1 text-xs font-medium ${
                product.isUp ? "text-success" : "text-destructive"
              }`}
            >
              {product.isUp ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              <span>{Math.abs(product.change)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
