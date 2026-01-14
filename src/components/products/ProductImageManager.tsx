
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Upload, Download, Image as ImageIcon, ExternalLink } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface ProductImageManagerProps {
    product: any;
    tableName: string;
    isAdmin: boolean;
    onUpdate: () => void;
    trigger?: React.ReactNode; // Optional custom trigger
}

export function ProductImageManager({ product, tableName, isAdmin, onUpdate, trigger }: ProductImageManagerProps) {
    const [open, setOpen] = useState(false);
    const [uploading, setUploading] = useState<'thumbnail' | 'detail' | null>(null);

    // ... handleUpload and PreviewImage function remain same ...

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'thumbnail' | 'detail') => {
        try {
            const file = event.target.files?.[0];
            if (!file) return;

            if (!isAdmin) {
                toast.error("관리자만 업로드할 수 있습니다.");
                return;
            }

            setUploading(type);
            const fileExt = file.name.split('.').pop();
            const fileName = `${product.id}_${type}_${Date.now()}.${fileExt}`;
            const filePath = `${tableName}/${fileName}`;

            // 1. Upload to Storage
            const { error: uploadError } = await supabase.storage
                .from('product-images')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('product-images')
                .getPublicUrl(filePath);

            // 3. Update Database
            const column = type === 'thumbnail' ? 'thumbnail_url' : 'detail_image_url';
            const { error: dbError } = await supabase
                .from(tableName)
                .update({ [column]: publicUrl })
                .eq('id', product.id);

            if (dbError) throw dbError;

            toast.success("이미지가 성공적으로 업로드되었습니다.");
            onUpdate();
        } catch (error: any) {
            console.error(error);
            toast.error(`업로드 실패: ${error.message}`);
        } finally {
            setUploading(null);
            // Reset input (hacky but works for simple inputs)
            event.target.value = '';
        }
    };

    const PreviewImage = ({ url, type }: { url: string | null, type: string }) => {
        if (!url) return <div className="w-full aspect-square bg-slate-100 rounded-md flex items-center justify-center text-slate-400 text-sm">이미지 없음</div>;
        return (
            <div className="relative group rounded-md overflow-hidden border bg-slate-50 w-full">
                <div className="relative w-full aspect-square flex items-center justify-center bg-white">
                    <img
                        src={url}
                        alt={type}
                        className="w-full h-full object-contain"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button size="icon" variant="secondary" onClick={() => window.open(url, '_blank')}>
                            <ExternalLink className="w-4 h-4" />
                        </Button>
                        <a href={url} download target="_blank" rel="noreferrer">
                            <Button size="icon" variant="secondary">
                                <Download className="w-4 h-4" />
                            </Button>
                        </a>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger ? (
                    trigger
                ) : (
                    <Button variant="ghost" size="sm" className="h-8 gap-1 text-slate-500 hover:text-blue-600">
                        <ImageIcon className="w-4 h-4" />
                        <span className="text-xs">이미지</span>
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>제품 이미지 관리 - {product.product_name}</DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Thumbnail Section */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <Label className="text-base font-semibold">썸네일 (Thumbnail)</Label>
                            {isAdmin && (
                                <div className="relative">
                                    <Input
                                        type="file"
                                        className="hidden"
                                        id="upload-thumbnail"
                                        accept="image/*"
                                        onChange={(e) => handleUpload(e, 'thumbnail')}
                                        disabled={!!uploading}
                                    />
                                    <Label
                                        htmlFor="upload-thumbnail"
                                        className={`cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {uploading === 'thumbnail' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                                        업로드
                                    </Label>
                                </div>
                            )}
                        </div>
                        <PreviewImage url={product.thumbnail_url} type="Thumbnail" />
                    </div>

                    <Separator />

                    {/* Detail Image Section */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <Label className="text-base font-semibold">연출 사진 (Detail)</Label>
                            {isAdmin && (
                                <div className="relative">
                                    <Input
                                        type="file"
                                        className="hidden"
                                        id="upload-detail"
                                        accept="image/*"
                                        onChange={(e) => handleUpload(e, 'detail')}
                                        disabled={!!uploading}
                                    />
                                    <Label
                                        htmlFor="upload-detail"
                                        className={`cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {uploading === 'detail' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                                        업로드
                                    </Label>
                                </div>
                            )}
                        </div>
                        <PreviewImage url={product.detail_image_url} type="Detail" />
                        <p className="text-xs text-slate-400">
                            * 연출 사진이 등록되지 않은 경우 표시되지 않습니다.
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
