import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  Building2,
  FileText,
  BookOpen,
  TrendingUp,
  Settings,
  X,
  Menu,
  Boxes,
} from "lucide-react";
import { useState, useEffect } from "react";

const navigation = [
  { name: "대시보드", href: "/", icon: LayoutDashboard },
  { name: "제품 정보", href: "/products", icon: Package },
  // { name: "원료 관리", href: "/raw-materials", icon: Boxes },
  // { name: "거래처 관리", href: "/clients", icon: Building2 },
  { name: "문서 생성", href: "/documents", icon: FileText },
  // { name: "내부 정책", href: "/policies", icon: BookOpen },
  // { name: "업계 동향", href: "/trends", icon: TrendingUp },
];

const bottomNav = [
  { name: "설정", href: "/settings", icon: Settings },
];

export function AppSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // 모바일에서 페이지 이동 시 메뉴 닫기
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // 모바일 메뉴 열릴 때 스크롤 잠금
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const NavItems = () => (
    <>
      <nav className="flex-1 px-2 py-2 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href ||
            (item.href !== "/" && location.pathname.startsWith(item.href));
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-glow"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>
      <div className="px-2 py-2 border-t border-sidebar-border">
        {bottomNav.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </div>
    </>
  );

  return (
    <>
      {/* ── 모바일 햄버거 버튼 (md 미만에서만 표시) ── */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 w-10 h-10 flex items-center justify-center rounded-xl bg-sidebar-background text-sidebar-foreground shadow-lg border border-sidebar-border"
        aria-label="메뉴 열기"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* ── 모바일 Overlay ── */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── 모바일 드로어 ── */}
      <aside
        className={cn(
          "md:hidden fixed top-0 left-0 z-50 h-full w-[280px] gradient-sidebar flex flex-col transition-transform duration-300 ease-in-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center shadow-glow">
              <span className="text-sidebar-primary-foreground font-bold text-lg">B</span>
            </div>
            <div>
              <h1 className="text-sidebar-foreground font-semibold font-heading text-xl tracking-tight">Biodotworks</h1>
              <p className="text-sidebar-muted text-xs font-medium tracking-wide">Desk</p>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <NavItems />
      </aside>

      {/* ── 데스크탑 사이드바 (md 이상에서만 표시) ── */}
      <aside className="hidden md:flex gradient-sidebar flex-col h-screen sticky top-0 border-r border-sidebar-border w-[240px] lg:w-[260px]">
        {/* Logo */}
        <div className="flex items-center h-16 px-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center shadow-glow">
              <span className="text-sidebar-primary-foreground font-bold text-lg">B</span>
            </div>
            <div className="animate-fade-in">
              <h1 className="text-sidebar-foreground font-semibold font-heading text-2xl tracking-tight">Biodotworks</h1>
              <p className="text-sidebar-muted text-xs font-medium tracking-wide">Desk</p>
            </div>
          </div>
        </div>
        <NavItems />
      </aside>
    </>
  );
}
