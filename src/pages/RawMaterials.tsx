
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
            const { data, error } = await supabase
                .from("raw_materials")
                .select("*");
            if (error) throw error;
            return data as any[];
        },
    });

    if (isLoading) return <div className="p-8">Loading raw materials...</div>;
    if (error) return <div className="p-8 text-red-500">Error: {error.message}</div>;

    return (
        <div className="p-8 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Raw Materials (원료 목록)</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>제품명</TableHead>
                                <TableHead>원산지</TableHead>
                                <TableHead>가격적용일</TableHead>
                                <TableHead className="text-right">공급가</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {materials?.map((material) => (
                                <TableRow key={material.id}>
                                    <TableCell className="font-medium">{material.id}</TableCell>
                                    <TableCell>{material.name}</TableCell>
                                    <TableCell>{material.origin_country}</TableCell>
                                    <TableCell>{material.price_effective_date}</TableCell>
                                    <TableCell className="text-right">
                                        {Number(material.supply_price).toLocaleString()}원
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
