import { Bell, User, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AppHeader() {
  return (
    <header className="h-14 md:h-16 border-b border-border bg-card pl-16 md:pl-6 pr-4 md:pr-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-2 md:gap-4 min-w-0">
        <h2 className="text-base md:text-lg font-semibold text-foreground truncate">
          바이오닷 운영 시스템
        </h2>
        <span className="hidden sm:block text-sm text-muted-foreground whitespace-nowrap">
          오늘도 좋은 하루 되세요
        </span>
      </div>

      <div className="flex items-center gap-1 md:gap-2 shrink-0">
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground w-8 h-8 md:w-10 md:h-10">
          <HelpCircle className="w-4 h-4 md:w-5 md:h-5" />
        </Button>

        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground w-8 h-8 md:w-10 md:h-10">
          <Bell className="w-4 h-4 md:w-5 md:h-5" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 md:w-2 md:h-2 bg-destructive rounded-full animate-pulse-soft" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="ml-1">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="font-medium">홍길동</span>
                <span className="text-xs text-muted-foreground">영업팀</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>프로필 설정</DropdownMenuItem>
            <DropdownMenuItem>알림 설정</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">로그아웃</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
