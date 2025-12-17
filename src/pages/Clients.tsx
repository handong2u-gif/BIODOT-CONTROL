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

import { supabase } from "@/integrations/supabase/client";

interface Client {
  id: number;
  name: string;
  grade: string;
  contact: string;
  phone: string;
  email: string;
  address: string;
  recentVisit: string;
  outstandingBalance: string;
  status: string;
}

// ... imports remain the same

export default function Clients() {
  const [searchQuery, setSearchQuery] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const mappedClients = data.map((client: any) => ({
          id: client.id,
          name: client.name,
          grade: client.grade,
          contact: client.contact,
          phone: client.phone,
          email: client.email,
          address: client.address,
          recentVisit: client.recent_visit,
          outstandingBalance: client.outstanding_balance,
          status: client.status,
        }));
        setClients(mappedClients);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const gradeColors: Record<string, string> = {
    VIP: "bg-primary text-primary-foreground",
    A: "bg-success text-success-foreground",
    B: "bg-info text-info-foreground",
    C: "bg-muted text-muted-foreground",
  };


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
