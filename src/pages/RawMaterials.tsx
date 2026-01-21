import { useState, useEffect } from "react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
    Package,
    Search,
    Filter,
    List as ListIcon,
    LayoutGrid,
    Eye,
    EyeOff,
    MoreHorizontal,
    Image as ImageIcon,
    Plus,
    Boxes
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CsvUploadButton } from "@/components/products/CsvUploadButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { SortableProductRow } from "@/components/products/SortableProductRow";
import { ProductImageManager } from "@/components/products/ProductImageManager";

// Interface matching the Raw Materials Table
interface RawMaterialData {
    id: string; // UUID
    product_name: string;
    spec: string | null;
    origin_country: string | null;
    wholesale_a: number | null; // Supply Price
    cost_price: number | null; // Optional Cost Price
    memo: string | null;
    thumbnail_url: string | null;
    detail_image_url: string | null;
    sort_order: number | null;
}

const RawMaterials = () => {
    const [products, setProducts] = useState<RawMaterialData[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<RawMaterialData[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [showCost, setShowCost] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    // Sort Configuration
    interface SortConfig {
        key: keyof RawMaterialData;
        direction: 'asc' | 'desc';
    }
    const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const { data, error } = await (supabase as any)
                .from('raw_materials')
                .select('*')
                .order('sort_order', { ascending: true }) // Order by user defined sort order
                .order('product_name', { ascending: true }); // Fallback

            if (error) {
                console.warn(`Error fetching raw_materials:`, error);
                toast.error("데이터를 불러오지 못했습니다.");
            } else {
                setProducts(data || []);
                setFilteredProducts(data || []);
            }
        } catch (error: any) {
            console.error('Error fetching products:', error);
            toast.error("알 수 없는 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const formatMoney = (amount: number | null) => {
        if (amount === null || amount === undefined) return "-";
        return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(amount);
    };

    const handleSort = (key: keyof RawMaterialData) => {
        setSortConfig((current) => {
            if (current?.key === key) {
                if (current.direction === 'asc') return { key, direction: 'desc' };
                return null;
            }
            return { key, direction: 'asc' };
        });
    };

    const sortedProducts = [...filteredProducts].sort((a, b) => {
        if (!sortConfig) return 0;
        const { key, direction } = sortConfig;
        const modifier = direction === 'asc' ? 1 : -1;

        const valA = a[key] ?? '';
        const valB = b[key] ?? '';

        if (valA < valB) return -1 * modifier;
        if (valA > valB) return 1 * modifier;
        return 0;
    });

    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            const oldIndex = filteredProducts.findIndex((item) => item.id === active.id);
            const newIndex = filteredProducts.findIndex((item) => item.id === over?.id);

            const newItems = arrayMove(filteredProducts, oldIndex, newIndex);

            // Optimistic Update
            setFilteredProducts(newItems);

            if (!searchTerm && !sortConfig) {
                setProducts(newItems);

                // Sync to Server
                const updates = newItems.map((item, index) => ({
                    id: item.id,
                    sort_order: index + 1
                }));

                (async () => {
                    try {
                        const promises = updates.map(u =>
                            supabase.rpc('update_raw_material_sort_order', {
                                p_id: u.id,
                                p_sort_order: u.sort_order
                            })
                        );
                        await Promise.all(promises);
                        toast.success("순서가 저장되었습니다.");
                    } catch (err: any) {
                        console.error('Sort save error:', err);
                        toast.error("순서 저장 실패");
                    }
                })();
            }
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                        <Boxes className="w-6 h-6 text-emerald-600" /> 원료 자재 관리
                    </h1>
                    <p className="text-slate-500 mt-1">원료 및 자재 DB 관리 (순서 변경, 이미지 등록)</p>
                </div>
                <div className="flex items-center gap-2">
                    {/* Admin Toggle */}
                    <div className="flex items-center gap-2 mr-4 bg-slate-100 p-1.5 px-3 rounded-full">
                        <Switch
                            id="admin-mode"
                            checked={isAdmin}
                            onCheckedChange={(c) => {
                                setIsAdmin(c);
                                if (c) toast.info("관리자 모드: 순서 변경 및 이미지 업로드가 가능합니다.");
                            }}
                            className="scale-75 data-[state=checked]:bg-emerald-600"
                        />
                        <Label htmlFor="admin-mode" className="text-xs font-medium cursor-pointer text-slate-600">
                            관리자 모드
                        </Label>
                    </div>

                    <Button onClick={fetchProducts} variant="outline" size="sm">
                        새로고침
                    </Button>

                    {isAdmin && (
                        <>
                            <CsvUploadButton
                                tableName="raw_materials"
                                onUploadComplete={fetchProducts}
                            />
                            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                <Plus className="w-4 h-4 mr-2" /> 추가
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* CONTROLS */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px] w-full sm:w-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="제품명, 규격, 원산지 검색..."
                        className="pl-9 bg-white border-slate-200"
                        value={searchTerm}
                        onChange={(e) => {
                            const term = e.target.value.toLowerCase();
                            setSearchTerm(term);
                            if (!term) {
                                setFilteredProducts(products);
                            } else {
                                setFilteredProducts(products.filter(p =>
                                    p.product_name?.toLowerCase().includes(term) ||
                                    p.origin_country?.toLowerCase().includes(term) ||
                                    p.memo?.toLowerCase().includes(term)
                                ));
                            }
                        }}
                    />
                </div>

                <div className="flex items-center gap-3 bg-white p-2 px-4 rounded-lg border shadow-sm w-full sm:w-auto justify-end">
                    {/* View Toggle */}
                    <div className="flex items-center border rounded-md overflow-hidden bg-slate-50">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <ListIcon className="w-4 h-4" />
                        </button>
                        <div className="w-[1px] h-4 bg-slate-200" />
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                    </div>

                    <Separator orientation="vertical" className="h-6" />

                    {/* Cost Blind Toggle */}
                    <div className="flex items-center gap-2">
                        <Label htmlFor="cost-blind" className="text-xs font-medium cursor-pointer flex items-center gap-1 select-none">
                            {showCost ? <Eye className="w-3 h-3 text-slate-500" /> : <EyeOff className="w-3 h-3 text-slate-400" />}
                            원가
                        </Label>
                        <Switch
                            id="cost-blind"
                            checked={showCost}
                            onCheckedChange={setShowCost}
                            className="scale-75"
                        />
                    </div>
                </div>
            </div>

            {/* CONTENT */}
            {loading ? (
                <div className="text-center py-20 text-muted-foreground animate-pulse">데이터를 불러오는 중입니다...</div>
            ) : products.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-dashed">
                    <Boxes className="w-10 h-10 mx-auto text-muted-foreground mb-3 opacity-20" />
                    <p className="text-muted-foreground">등록된 원료가 없습니다.</p>
                </div>
            ) : viewMode === 'list' ? (
                // LIST VIEW
                <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 border-b">
                                    <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        {isAdmin && !searchTerm && !sortConfig && <th className="w-[40px]"></th>}

                                        <th className="px-4 py-3 min-w-[200px] cursor-pointer hover:text-slate-700" onClick={() => handleSort('product_name')}>
                                            제품명 / 규격 {sortConfig?.key === 'product_name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                        </th>

                                        <th className="px-4 py-3 text-center cursor-pointer hover:text-slate-700" onClick={() => handleSort('origin_country')}>
                                            원산지 {sortConfig?.key === 'origin_country' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                        </th>

                                        <th className="px-4 py-3 text-left mobile-hide">메모</th>

                                        <th className="px-4 py-3 text-right text-emerald-600 cursor-pointer hover:text-emerald-800" onClick={() => handleSort('wholesale_a')}>
                                            공급단가 {sortConfig?.key === 'wholesale_a' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                        </th>

                                        {showCost && <th className="px-4 py-3 text-right text-red-500 bg-red-50/50">원가</th>}
                                        {isAdmin && <th className="px-4 py-3 w-[50px]"></th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    <SortableContext items={sortedProducts.map(p => p.id)} strategy={verticalListSortingStrategy}>
                                        {sortedProducts.map((item) => (
                                            <SortableProductRow
                                                key={item.id}
                                                id={item.id}
                                                isAdmin={isAdmin && !searchTerm && !sortConfig}
                                                // Raw materials details not implemented yet, disable click nav
                                                onClick={() => { }}
                                            >
                                                <td className="px-4 py-3">
                                                    <div className="flex items-start gap-3">
                                                        <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                                                            <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-emerald-500 hover:ring-offset-1 transition-all">
                                                                <ProductImageManager
                                                                    product={item}
                                                                    tableName="raw_materials"
                                                                    isAdmin={isAdmin}
                                                                    onUpdate={fetchProducts}
                                                                    trigger={
                                                                        item.thumbnail_url ? (
                                                                            <img src={item.thumbnail_url} alt={item.product_name} className="w-full h-full object-cover" />
                                                                        ) : (
                                                                            <ImageIcon className="w-4 h-4 text-slate-300" />
                                                                        )
                                                                    }
                                                                />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            {/* Combine Name and Spec */}
                                                            <div className="font-medium text-slate-900">{item.product_name}</div>
                                                            {item.spec && <div className="text-xs text-slate-500 mt-0.5">{item.spec}</div>}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-center text-slate-600">
                                                    {item.origin_country || '-'}
                                                </td>
                                                <td className="px-4 py-3 text-xs text-slate-500 max-w-[200px] truncate" title={item.memo || ''}>
                                                    {item.memo || '-'}
                                                </td>
                                                <td className="px-4 py-3 text-right font-medium text-emerald-700">
                                                    {formatMoney(item.wholesale_a)}
                                                </td>
                                                {showCost && (
                                                    <td className="px-4 py-3 text-right font-medium text-red-600 bg-red-50/30">
                                                        {formatMoney(item.cost_price)}
                                                    </td>
                                                )}
                                                {isAdmin && (
                                                    <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                                                            <MoreHorizontal className="w-4 h-4" />
                                                        </Button>
                                                    </td>
                                                )}
                                            </SortableProductRow>
                                        ))}
                                    </SortableContext>
                                </tbody>
                            </table>
                        </DndContext>
                    </div>
                </div>
            ) : (
                // GRID VIEW
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {sortedProducts.map((item) => (
                        <Card key={item.id} className="hover:shadow-md transition-shadow group overflow-hidden border-slate-200">
                            <div className="h-40 bg-slate-100 relative group-hover:bg-slate-200 transition-colors flex items-center justify-center">
                                {item.thumbnail_url ? (
                                    <img src={item.thumbnail_url} alt={item.product_name} className="w-full h-full object-cover" />
                                ) : (
                                    <Boxes className="w-12 h-12 text-slate-300" />
                                )}
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 rounded-full p-1 shadow-sm" onClick={e => e.stopPropagation()}>
                                    <ProductImageManager
                                        product={item}
                                        tableName="raw_materials"
                                        isAdmin={isAdmin}
                                        onUpdate={fetchProducts}
                                    />
                                </div>
                                <div className="absolute top-2 left-2">
                                    <Badge className="bg-white/90 text-slate-800 hover:bg-white shadow-sm border-0">
                                        {item.origin_country || '원료'}
                                    </Badge>
                                </div>
                            </div>
                            <CardContent className="p-4 pt-5">
                                <div className="mb-4">
                                    <h3 className="font-bold text-lg text-slate-900 line-clamp-1">{item.product_name}</h3>
                                    {item.spec && <Badge variant="secondary" className="font-normal text-xs mt-1">{item.spec}</Badge>}
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between items-center bg-emerald-50 p-2 rounded">
                                        <span className="text-emerald-600 font-medium">공급단가</span>
                                        <span className="font-bold text-base text-emerald-800">
                                            {formatMoney(item.wholesale_a)}
                                        </span>
                                    </div>
                                    {item.memo && (
                                        <p className="text-xs text-slate-400 truncate mt-2">{item.memo}</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RawMaterials;
