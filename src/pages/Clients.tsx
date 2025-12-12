import { useState } from "react";
import { Search, Plus, Building2, Phone, Mail, MapPin, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const clients = [
  {
    id: 1,
    name: "코스트코 코리아",
    grade: "VIP",
    contact: "김담당",
    phone: "02-1234-5678",
    email: "contact@costco.kr",
    address: "서울시 강남구 역삼동",
    recentVisit: "2024-12-10",
    outstandingBalance: "₩12,500,000",
    status: "active",
  },
  {
    id: 2,
    name: "롯데마트",
    grade: "A",
    contact: "이과장",
    phone: "02-2345-6789",
    email: "buyer@lotte.kr",
    address: "서울시 송파구 잠실동",
    recentVisit: "2024-12-08",
    outstandingBalance: "₩8,200,000",
    status: "active",
  },
  {
    id: 3,
    name: "이마트 에브리데이",
    grade: "A",
    contact: "박대리",
    phone: "02-3456-7890",
    email: "md@emart.kr",
    address: "경기도 성남시 분당구",
    recentVisit: "2024-12-05",
    outstandingBalance: "₩5,800,000",
    status: "active",
  },
  {
    id: 4,
    name: "GS25 본사",
    grade: "B",
    contact: "최팀장",
    phone: "02-4567-8901",
    email: "purchase@gs25.kr",
    address: "서울시 영등포구 여의도동",
    recentVisit: "2024-11-28",
    outstandingBalance: "₩3,200,000",
    status: "active",
  },
  {
    id: 5,
    name: "홈플러스",
    grade: "B",
    contact: "정과장",
    phone: "02-5678-9012",
    email: "buyer@homeplus.kr",
    address: "서울시 강서구 마곡동",
    recentVisit: "2024-11-25",
    outstandingBalance: "₩0",
    status: "inactive",
  },
];

const gradeColors: Record<string, string> = {
  VIP: "bg-primary text-primary-foreground",
  A: "bg-success text-success-foreground",
  B: "bg-info text-info-foreground",
  C: "bg-muted text-muted-foreground",
};

export default function Clients() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.contact.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">거래처 관리</h1>
          <p className="text-muted-foreground mt-1">거래처 정보와 히스토리를 관리합니다</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          거래처 추가
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="거래처명 또는 담당자 검색..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Clients List */}
      <div className="grid gap-4">
        {filteredClients.map((client, index) => (
          <div
            key={client.id}
            className="bg-card rounded-xl border p-5 hover:shadow-md hover:border-primary/30 transition-all duration-200 animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{client.name}</h3>
                    <Badge className={cn("text-xs", gradeColors[client.grade])}>
                      {client.grade}
                    </Badge>
                    {client.status === "inactive" && (
                      <Badge variant="outline" className="text-xs text-muted-foreground">
                        비활성
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">담당: {client.contact}</p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>상세 보기</DropdownMenuItem>
                  <DropdownMenuItem>방문 기록</DropdownMenuItem>
                  <DropdownMenuItem>제안서 생성</DropdownMenuItem>
                  <DropdownMenuItem>수정</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="mt-4 pt-4 border-t grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">{client.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground truncate">{client.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground truncate">{client.address}</span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">최근 방문: </span>
                <span className="font-medium text-foreground">{client.recentVisit}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t flex items-center justify-between">
              <div>
                <span className="text-sm text-muted-foreground">미수금: </span>
                <span
                  className={cn(
                    "text-sm font-semibold",
                    client.outstandingBalance === "₩0" ? "text-success" : "text-warning"
                  )}
                >
                  {client.outstandingBalance}
                </span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  히스토리
                </Button>
                <Button size="sm">제안서 생성</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
