import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Package, MapPin, CheckCircle2, AlertCircle, FileText, Download, Truck, Box } from "lucide-react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProductDetailData {
    id: number | string;
    product_name: string;
    spec: string | null;
    origin_country: string | null;
    wholesale_price_a: number;
    wholesale_price_b: number;
    wholesale_price_c: number;
    retail_price: number;
    detail_image_url: string | null;
    thumbnail_url: string | null;
    stock_status: string | null;
    tags: string[] | null;
    selling_point: string | null;
    key_features: string[] | null;
    target_customer: string | null;
    expiry_date: string | null;
    created_at: string;
    memo: string | null;
}

interface ProductDocument {
    id: number;
    name: string;
    url: string;
    is_current: boolean;
    created_at: string;
}

interface SpecialPrice {
    id: number;
    price: number;
    description: string | null;
    is_active: boolean;
}

interface LogisticsSpecs {
    id: number;
    product_weight_g: number | null;
    carton_weight_kg: number | null;
    carton_width_mm: number | null;
    carton_depth_mm: number | null;
    carton_height_mm: number | null;
    units_per_carton: number | null;
    cartons_per_pallet: number | null;
}

// ... internal implementation ...
// usage update:
// product.expiry_date
// logistics.units_per_carton
// logistics.cartons_per_pallet


const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState<ProductDetailData | null>(null);
    const [documents, setDocuments] = useState<ProductDocument[]>([]);
    const [specialPrices, setSpecialPrices] = useState<SpecialPrice[]>([]);
    const [logistics, setLogistics] = useState<LogisticsSpecs | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    const refreshDocuments = async () => {
        if (!id) return;
        const { data: docs } = await (supabase as any)
            .from('product_documents')
            .select('*')
            .eq('product_id', id)
            .eq('is_current', true)
            .order('created_at', { ascending: false });

        if (docs) setDocuments(docs);
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            if (!event.target.files || event.target.files.length === 0) {
                return;
            }
            if (!id) return;

            setUploading(true);
            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${id}/${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            // 1. Upload to Storage
            const { error: uploadError } = await (supabase.storage as any)
                .from('product_documents')
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            // 2. Get Public URL
            const { data: { publicUrl } } = (supabase.storage as any)
                .from('product_documents')
                .getPublicUrl(filePath);

            // 3. Insert into Database
            const { error: dbError } = await (supabase as any)
                .from('product_documents')
                .insert({
                    product_id: id,
                    name: file.name,
                    url: publicUrl,
                    is_current: true
                });

            if (dbError) {
                throw dbError;
            }

            toast.success("문서가 성공적으로 업로드되었습니다.");
            await refreshDocuments();

        } catch (error: any) {
            console.error('Upload error:', error);
            // More detailed error message
            const msg = error.message || "알 수 없는 오류";
            const fullError = JSON.stringify(error, null, 2);

            if (msg.includes('row level security')) {
                const alertMsg = `[권한 오류] 데이터베이스 정책(RLS)이 설정되지 않았습니다.\nSQL Editor에서 정책을 추가해주세요.`;
                toast.error(alertMsg);
                alert(alertMsg);
            } else if (msg.includes('product_documents')) {
                const alertMsg = `[테이블 오류] 'product_documents' 테이블이 없습니다.\nSQL Editor에서 CREATE TABLE 문을 실행해주세요.`;
                toast.error(alertMsg);
                alert(alertMsg);
            } else if (msg.includes('Bucket not found') || msg.includes('The resource was not found')) {
                const alertMsg = `[스토리지 오류] 'product_documents' 버킷이 없습니다.\nSupabase Storage 메뉴에서 새 버킷을 만들고 'Public'으로 설정해주세요.`;
                toast.error(alertMsg);
                alert(alertMsg);
            } else {
                toast.error(`업로드 실패: ${msg}`);
                alert(`업로드 실패 상세:\n${msg}\n\n혹시 프로젝트가 일시 중지(Paused) 상태인지 확인해주세요.\n\n전체 에러:\n${fullError}`);
            }
        } finally {
            setUploading(false);
            // Clear input
            event.target.value = '';
        }
    };

    const handleDeleteDocument = async (docId: number, docName: string) => {
        if (!confirm(`'${docName}' 문서를 삭제하시겠습니까?`)) return;

        try {
            // Soft delete in DB (set is_current to false) or Hard Delete
            // Let's do Hard Delete for now for simplicity, or just update is_current
            const { error } = await (supabase as any)
                .from('product_documents')
                .delete()
                .eq('id', docId);

            if (error) throw error;

            toast.success("문서가 삭제되었습니다.");
            setDocuments(documents.filter(d => d.id !== docId));

        } catch (error: any) {
            console.error('Delete error:', error);
            toast.error(`삭제 실패: ${error.message || "알 수 없는 오류"}`);
        }
    };

    useEffect(() => {
        const fetchProduct = async () => {
            if (!id) return;
            setLoading(true);

            // Try fetching from finished_goods first
            let { data, error } = await (supabase as any)
                .from('finished_goods')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                console.error("Error fetching product:", error);
                toast.error("제품을 불러올 수 없습니다.");
                navigate("/products");
            } else {
                setProduct(data as any);

                // Fetch Sub-tables (Documents & Special Prices)
                const { data: docs } = await (supabase as any)
                    .from('product_documents')
                    .select('*')
                    .eq('product_id', id)
                    .eq('is_current', true);

                if (docs) setDocuments(docs);

                const { data: prices } = await (supabase as any)
                    .from('product_special_prices')
                    .select('*')
                    .eq('product_id', id)
                    .eq('is_active', true);

                if (prices) setSpecialPrices(prices);

                // Fetch Logistics Specs
                const { data: logData } = await (supabase as any)
                    .from('product_logistics_specs')
                    .select('*')
                    .eq('product_id', id)
                    .single(); // Assuming 1:1 relation mostly

                if (logData) setLogistics(logData);
            }
            setLoading(false);
        };

        fetchProduct();
    }, [id, navigate]);

    const formatMoney = (amount: number | null) => {
        if (amount === null || amount === undefined) return "0";
        return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(amount);
    };

    if (loading) {
        return (
            <div className="container max-w-5xl py-8 space-y-8">
                <Skeleton className="h-8 w-32" />
                <div className="grid md:grid-cols-2 gap-8">
                    <Skeleton className="h-[400px] w-full rounded-xl" />
                    <div className="space-y-4">
                        <Skeleton className="h-10 w-3/4" />
                        <Skeleton className="h-6 w-1/2" />
                        <Skeleton className="h-32 w-full" />
                    </div>
                </div>
            </div>
        );
    }

    if (!product) return null;

    return (
        <div className="container max-w-5xl py-8 animate-in fade-in duration-500">
            <Button variant="ghost" className="mb-6 pl-0 hover:pl-2 transition-all gap-2 text-slate-500" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-4 h-4" /> 목록으로 돌아가기
            </Button>

            <div className="grid md:grid-cols-2 gap-10">
                {/* LEFT COLUMN: IMAGE */}
                <div className="space-y-6">
                    <div className="aspect-square bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 shadow-sm flex items-center justify-center relative group">
                        {product.thumbnail_url || product.detail_image_url ? (
                            <img
                                src={product.thumbnail_url || product.detail_image_url || ''}
                                alt={product.product_name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="text-center text-slate-400">
                                <Package className="w-20 h-20 mx-auto mb-4 opacity-50" />
                                <p>등록된 이미지가 없습니다</p>
                            </div>
                        )}
                        {product.stock_status && (
                            <div className="absolute top-4 left-4">
                                {product.stock_status === '품절' || product.stock_status === 'out_of_stock' ? (
                                    <Badge variant="destructive" className="h-8 px-3 text-sm">품절</Badge>
                                ) : product.stock_status === '소량' ? (
                                    <Badge variant="secondary" className="h-8 px-3 text-sm bg-orange-100 text-orange-700 hover:bg-orange-200">소량 (Low Stock)</Badge>
                                ) : (
                                    <Badge className="h-8 px-3 text-sm bg-emerald-600 hover:bg-emerald-700">
                                        {product.stock_status === '충분' ? '충분 (In Stock)' : product.stock_status === '보통' ? '보통 (Normal)' : '판매중'}
                                    </Badge>
                                )}
                            </div>
                        )}
                    </div>

                    {/* META SECTION (Below Image on Desktop) */}
                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 space-y-4">
                        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 제품 관리 정보
                        </h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-slate-500 block text-xs mb-1">재고 상태</span>
                                <span className="font-medium">
                                    {product.stock_status === 'out_of_stock' ? '품절' :
                                        product.stock_status === '충분' ? '충분 (In Stock)' :
                                            product.stock_status === '보통' ? '보통 (Normal)' :
                                                product.stock_status === '소량' ? '소량 (Low)' : '보유중'}
                                </span>
                            </div>
                            <div>
                                <span className="text-slate-500 block text-xs mb-1">유통기한</span>
                                <span className="font-medium">{product.expiry_date || '-'}</span>
                            </div>
                            <div>
                                <span className="text-slate-500 block text-xs mb-1">입고일 (등록일)</span>
                                <span className="font-medium text-slate-600">
                                    {product.created_at ? new Date(product.created_at).toLocaleDateString() : '-'}
                                </span>
                            </div>
                            <div>
                                <span className="text-slate-500 block text-xs mb-1">원산지</span>
                                <span className="font-medium text-slate-600 flex items-center gap-1">
                                    <MapPin className="w-3 h-3" /> {product.origin_country || '한국'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: INFO */}
                <div className="space-y-8">

                    <Tabs defaultValue="info" className="w-full">
                        <TabsList className="bg-slate-100 w-full justify-start rounded-lg p-1 mb-6 h-auto flex-wrap">
                            <TabsTrigger value="info" className="flex-1 min-w-[100px]">상세 정보</TabsTrigger>
                            <TabsTrigger value="documents" className="flex-1 min-w-[100px] gap-2">
                                문서 <span className="text-[10px] bg-slate-200 px-1.5 rounded-full min-w-[16px] h-4 flex items-center justify-center">{documents.length}</span>
                            </TabsTrigger>
                            <TabsTrigger value="logistics" className="flex-1 min-w-[100px] gap-2">
                                물류 스펙 <Truck className="w-3 h-3 opacity-50" />
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="info" className="space-y-8 animate-in slide-in-from-bottom-2 duration-300">

                            {/* HEADER SECTION */}
                            <div>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {product.tags?.map((tag, i) => (
                                        <Badge key={i} variant="secondary" className="px-2 py-0.5 text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-100 cursor-default">#{tag}</Badge>
                                    ))}
                                    {!product.tags && <Badge variant="secondary" className="px-2 py-0.5 text-xs opacity-50">태그 없음</Badge>}
                                </div>
                                <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">{product.product_name}</h1>
                                <p className="text-lg text-slate-500 font-medium">{product.spec || '규격 정보 없음'}</p>
                            </div>

                            <Separator />

                            {/* PRICE SECTION */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-slate-900">가격 정보</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-lg bg-emerald-50/50 border border-emerald-100">
                                        <span className="text-xs text-emerald-600 font-semibold block mb-1">도매가 A</span>
                                        <span className="text-2xl font-bold text-emerald-800">{formatMoney(product.wholesale_price_a)}</span>
                                    </div>
                                    <div className="p-4 rounded-lg bg-white border border-slate-200">
                                        <span className="text-xs text-slate-500 block mb-1">소비자가</span>
                                        <span className="text-xl font-semibold text-slate-700">{formatMoney(product.retail_price)}</span>
                                    </div>
                                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                                        <span className="text-xs text-slate-400 block mb-1">도매가 B</span>
                                        <span className="text-lg text-slate-600">{formatMoney(product.wholesale_price_b)}</span>
                                    </div>
                                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                                        <span className="text-xs text-slate-400 block mb-1">도매가 C</span>
                                        <span className="text-lg text-slate-600">{formatMoney(product.wholesale_price_c)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* SPECIAL PRICES SECTION */}
                            {specialPrices.length > 0 && (
                                <div className="space-y-3 p-4 bg-orange-50/50 rounded-xl border border-orange-100">
                                    <h3 className="text-sm font-semibold text-orange-900 flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4 text-orange-500" />
                                        특별 할인가 (Special Prices)
                                    </h3>
                                    <div className="space-y-2">
                                        {specialPrices.map(sp => (
                                            <div key={sp.id} className="flex justify-between items-center bg-white p-3 rounded-lg border border-orange-100 shadow-sm">
                                                <span className="text-sm text-slate-600 font-medium">{sp.description || '특별 할인'}</span>
                                                <span className="text-lg font-bold text-orange-600">{formatMoney(sp.price)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <Separator />

                            {/* SELLING SECTION */}
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-900 mb-2">Selling Point</h3>
                                    <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100">
                                        {product.selling_point || '등록된 셀링 포인트가 없습니다.'}
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-sm font-semibold text-slate-900 mb-2">Key Features</h3>
                                    {product.key_features && product.key_features.length > 0 ? (
                                        <ul className="grid gap-2">
                                            {product.key_features.map((feature, i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-slate-400 italic">등록된 특징이 없습니다.</p>
                                    )}
                                </div>

                                <div>
                                    <h3 className="text-sm font-semibold text-slate-900 mb-2">타겟 고객</h3>
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-medium">
                                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                                        {product.target_customer || '전체 고객'}
                                    </div>
                                </div>
                            </div>

                            {/* MEMO SECTION */}
                            {(product.memo) && (
                                <div className="bg-yellow-50/50 border border-yellow-100 rounded-lg p-4 text-sm text-yellow-800 flex gap-3 items-start">
                                    <AlertCircle className="w-5 h-5 shrink-0 text-yellow-500" />
                                    <div>
                                        <span className="font-semibold block mb-1 text-yellow-700">관리자 메모</span>
                                        {product.memo}
                                    </div>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="documents" className="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold">문서 목록</h3>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="file"
                                        id="doc-upload"
                                        className="hidden"
                                        onChange={handleFileUpload}
                                        disabled={uploading}
                                    />
                                    <label htmlFor="doc-upload">
                                        <Button variant="outline" size="sm" className="cursor-pointer" asChild disabled={uploading}>
                                            <span>
                                                {uploading ? (
                                                    <>
                                                        <span className="animate-spin mr-2">⏳</span> 업로드 중...
                                                    </>
                                                ) : (
                                                    <>
                                                        <FileText className="w-4 h-4 mr-2" /> 문서 업로드
                                                    </>
                                                )}
                                            </span>
                                        </Button>
                                    </label>
                                </div>
                            </div>

                            {documents.length === 0 ? (
                                <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                    <FileText className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                                    <p className="text-slate-500 font-medium">등록된 문서가 없습니다.</p>
                                    <p className="text-xs text-slate-400">우측 상단 버튼을 눌러 문서를 업로드하세요.</p>
                                </div>
                            ) : (
                                <div className="grid gap-3">
                                    {documents.map(doc => (
                                        <Card key={doc.id} className="hover:border-emerald-200 transition-colors group">
                                            <CardContent className="p-4 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                                                        <FileText className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-900">{doc.name}</p>
                                                        <p className="text-xs text-slate-400">{new Date(doc.created_at).toLocaleDateString()} 등록</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <a href={doc.url} download target="_blank" rel="noreferrer">
                                                        <Button variant="outline" size="sm" className="gap-2 group-hover:border-emerald-200">
                                                            <Download className="w-4 h-4" /> <span className="hidden sm:inline">다운로드</span>
                                                        </Button>
                                                    </a>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                        onClick={() => handleDeleteDocument(doc.id, doc.name)}
                                                    >
                                                        삭제
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="logistics" className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                            {!logistics ? (
                                <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                    <Box className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                                    <p className="text-slate-500 font-medium">등록된 물류 정보가 없습니다.</p>
                                </div>
                            ) : (
                                <div className="grid gap-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                                <Package className="w-4 h-4 text-emerald-600" /> 단위 정보 (Unit Specs)
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="block text-slate-500 text-xs mb-1">단위 중량 (Unit Weight)</span>
                                                    <span className="font-medium">{logistics.product_weight_g ? `${logistics.product_weight_g} g` : '-'}</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                                <Box className="w-4 h-4 text-indigo-600" /> 카톤 정보 (Carton Specs)
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                <div>
                                                    <span className="block text-slate-500 text-xs mb-1">카톤 입수 (Qty/Carton)</span>
                                                    <span className="font-medium">{logistics.units_per_carton ? `${logistics.units_per_carton} ea` : '-'}</span>
                                                </div>
                                                <div>
                                                    <span className="block text-slate-500 text-xs mb-1">카톤 중량 (Carton Weight)</span>
                                                    <span className="font-medium">{logistics.carton_weight_kg ? `${logistics.carton_weight_kg} kg` : '-'}</span>
                                                </div>
                                                <div className="col-span-2">
                                                    <span className="block text-slate-500 text-xs mb-1">카톤 규격 (W x D x H)</span>
                                                    <span className="font-medium">
                                                        {logistics.carton_width_mm && logistics.carton_depth_mm && logistics.carton_height_mm
                                                            ? `${logistics.carton_width_mm} x ${logistics.carton_depth_mm} x ${logistics.carton_height_mm} mm`
                                                            : '-'}
                                                    </span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                                <Truck className="w-4 h-4 text-slate-600" /> 팔레트 정보 (Pallet Specs)
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="block text-slate-500 text-xs mb-1">팔레트 적재량 (Cartons/Pallet)</span>
                                                    <span className="font-medium">{logistics.cartons_per_pallet ? `${logistics.cartons_per_pallet} box` : '-'}</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>

                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
