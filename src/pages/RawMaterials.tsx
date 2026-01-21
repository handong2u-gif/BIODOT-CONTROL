
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const RawMaterials = () => {
    const { data: materials, isLoading, error } = useQuery({
        queryKey: ["raw_materials"],
        queryFn: async () => {
            const { data, error } = await (supabase as any)
                .from("raw_materials")
                .select("*")
                .order('product_name', { ascending: true }); // 정렬 추가
            if (error) throw error;
            return data as any[];
        },
    });

    if (isLoading) return <div className="p-8">Loading raw materials...</div>;
    if (error) return <div className="p-8 text-red-500">Error: {error.message}</div>;

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <Card>
                <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                        <span>Raw Materials (원료 목록)</span>
                        <span className="text-sm font-normal text-muted-foreground">{materials?.length || 0} items</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">ID</TableHead>
                                <TableHead>제품명</TableHead>
                                <TableHead>규격</TableHead>
                                <TableHead>원산지</TableHead>
                                <TableHead>메모</TableHead>
                                <TableHead className="text-right">공급단가</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {materials?.map((material) => (
                                <TableRow key={material.id}>
                                    <TableCell className="font-mono text-xs text-muted-foreground">
                                        {String(material.id).substring(0, 8)}...
                                    </TableCell>
                                    <TableCell className="font-medium">{material.product_name}</TableCell>
                                    <TableCell>{material.spec || '-'}</TableCell>
                                    <TableCell>{material.origin_country || '-'}</TableCell>
                                    <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate" title={material.memo}>
                                        {material.memo || '-'}
                                    </TableCell>
                                    <TableCell className="text-right font-bold">
                                        {material.wholesale_a
                                            ? Number(material.wholesale_a).toLocaleString() + '원'
                                            : (material.cost_price ? Number(material.cost_price).toLocaleString() + '원' : '-')}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default RawMaterials;
