import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Package, MapPin, Calendar, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

interface ProductDetailData {
    id: number | string;
    name: string; // product_name mapped
    spec: string | null;
    origin_country: string | null;
    wholesale_price_a: number; // price_wholesale_a
    wholesale_price_b: number; // price_wholesale_b
    wholesale_price_c: number; // price_wholesale_c
    retail_price: number; // price_retail
    detail_image_url: string | null; // display_image_url
    stock_status: string | null; // meta
    tags: string[] | null; // header
    selling_point: string | null; // section selling
    key_features: string[] | null; // section selling
    target_customer: string | null; // section selling
    expiration_date: string | null; // meta
    created_at: string; // meta (inbound_date placeholder)
    memo: string | null; // section memo
}

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState<ProductDetailData | null>(null);
    const [loading, setLoading] = useState(true);

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
                // Fallback to raw_materials if not found (optional, but good for robust routing)
                // For now, assume id comes from finished_goods as per plan
                console.error("Error fetching product:", error);
                toast.error("제품을 불러올 수 없습니다.");
                navigate("/products");
            } else {
                setProduct(data as any);
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
                        {product.detail_image_url ? (
                            <img
                                src={product.detail_image_url}
                                alt={product.name}
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
                                {product.stock_status === 'out_of_stock' ? (
                                    <Badge variant="destructive" className="h-8 px-3 text-sm">품절</Badge>
                                ) : (
                                    <Badge className="h-8 px-3 text-sm bg-emerald-600 hover:bg-emerald-700">판매중</Badge>
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
                                    {product.stock_status === 'out_of_stock' ? '품절' : '보유중 (In Stock)'}
                                </span>
                            </div>
                            <div>
                                <span className="text-slate-500 block text-xs mb-1">유통기한</span>
                                <span className="font-medium">{product.expiration_date || '-'}</span>
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

                    {/* HEADER SECTION */}
                    <div>
                        <div className="flex flex-wrap gap-2 mb-3">
                            {product.tags?.map((tag, i) => (
                                <Badge key={i} variant="secondary" className="px-2 py-0.5 text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100">#{tag}</Badge>
                            ))}
                            {!product.tags && <Badge variant="secondary" className="px-2 py-0.5 text-xs opacity-50">태그 없음</Badge>}
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">{product.name}</h1>
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

                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
