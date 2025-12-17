import { FileText, FileSpreadsheet, PenTool, Image, Plus, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const documentTypes = [
  {
    id: "proposal",
    name: "제안서",
    description: "거래처 맞춤 제안서를 자동 생성합니다",
    icon: FileText,
    color: "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground",
    action: "제안서 생성",
  },
  {
    id: "techsheet",
    name: "기술서",
    description: "제품 기술 스펙과 인증 정보를 포함합니다",
    icon: FileSpreadsheet,
    color: "bg-info/10 text-info group-hover:bg-info group-hover:text-info-foreground",
    action: "기술서 생성",
  },
  {
    id: "ar-report",
    name: "AR 보고서",
    description: "미팅 내용을 보고서로 변환합니다",
    icon: PenTool,
    color: "bg-success/10 text-success group-hover:bg-success group-hover:text-success-foreground",
    action: "보고서 작성",
  },
  {
    id: "comparison",
    name: "경쟁사 비교표",
    description: "경쟁사 대비 가격/구성품 비교표",
    icon: Image,
    color: "bg-warning/10 text-warning group-hover:bg-warning group-hover:text-warning-foreground",
    action: "비교표 생성",
  },
];

const recentDocuments = [
  {
    id: 1,
    name: "코스트코 프로바이오틱스 제안서",
    type: "제안서",
    createdAt: "2024-12-12 10:30",
    status: "완료",
  },
  {
    id: 2,
    name: "비타민D 3000IU 기술서",
    type: "기술서",
    createdAt: "2024-12-11 15:20",
    status: "완료",
  },
  {
    id: 3,
    name: "롯데마트 미팅 AR 보고서",
    type: "AR 보고서",
    createdAt: "2024-12-10 17:45",
    status: "완료",
  },
  {
    id: 4,
    name: "오메가3 경쟁사 비교표",
    type: "비교표",
    createdAt: "2024-12-09 11:00",
    status: "완료",
  },
];

export default function Documents() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">문서 생성</h1>
          <p className="text-muted-foreground mt-1">AI 기반 문서 자동 생성 도구</p>
        </div>
      </div>

      {/* Document Types */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {documentTypes.map((docType, index) => (
          <div
            key={docType.id}
            className="bg-card rounded-xl border p-6 hover:shadow-md hover:border-primary/30 transition-all duration-200 cursor-pointer animate-fade-in group"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-colors duration-200", docType.color)}>
              <docType.icon className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">{docType.name}</h3>
            <p className="text-sm text-muted-foreground mb-4">{docType.description}</p>
            <Button size="sm" className="w-full gap-2">
              <Plus className="w-4 h-4" />
              {docType.action}
            </Button>
          </div>
        ))}
      </div>

      {/* Recent Documents */}
      <div className="bg-card rounded-xl border p-5 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">최근 생성 문서</h3>
          <Button variant="ghost" size="sm" className="text-primary">
            전체 보기
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  문서명
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  유형
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  생성일시
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  상태
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  액션
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {recentDocuments.map((doc) => (
                <tr key={doc.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-primary" />
                      <span className="font-medium text-foreground">{doc.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-muted-foreground">{doc.type}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {doc.createdAt}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success">
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        보기
                      </Button>
                      <Button variant="ghost" size="sm">
                        다운로드
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
