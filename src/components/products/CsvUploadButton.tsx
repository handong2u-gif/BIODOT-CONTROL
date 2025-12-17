import { useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import Papa from 'papaparse';

interface CsvUploadButtonProps {
    tableName: 'finished_goods' | 'raw_materials';
    onUploadComplete: () => void;
}

export function CsvUploadButton({ tableName, onUploadComplete }: CsvUploadButtonProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    const processFile = (file: File) => {
        setIsUploading(true);
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                try {
                    const rows = results.data;
                    if (rows.length === 0) {
                        toast.error("CSV 파일이 비어있습니다.");
                        setIsUploading(false);
                        return;
                    }

                    console.log(`Uploading ${rows.length} rows to ${tableName}`);

                    // Transform data if necessary based on tableName
                    const formattedRows = rows.map((row: any) => {
                        // Remove empty keys
                        const cleanRow: any = {};
                        Object.keys(row).forEach(key => {
                            if (key.trim() !== '') {
                                // Basic normalization: handle "null" string or empty string as null
                                let value = row[key];
                                if (typeof value === 'string') {
                                    value = value.trim();
                                    if (value === '' || value.toLowerCase() === 'null') value = null;
                                }
                                cleanRow[key] = value;
                            }
                        });

                        // Specific transformations for 'raw_materials' if needed
                        // e.g. generate ID if missing? For now assume CSV matches schema.
                        return cleanRow;
                    });

                    // Insert into Supabase
                    const { error } = await (supabase as any)
                        .from(tableName)
                        .insert(formattedRows); // Using insert. Use upsert if ID provided.

                    if (error) throw error;

                    toast.success(`${rows.length}건의 데이터가 업로드되었습니다.`);
                    onUploadComplete();
                } catch (error: any) {
                    console.error("Upload failed:", error);
                    toast.error(`업로드 실패: ${error.message || "알 수 없는 오류"}`);
                } finally {
                    setIsUploading(false);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                }
            },
            error: (error) => {
                console.error("CSV Parse Error:", error);
                toast.error("CSV 파일 파싱 중 오류가 발생했습니다.");
                setIsUploading(false);
            }
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            processFile(file);
        }
    };

    return (
        <>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".csv"
                className="hidden"
            />
            <Button
                onClick={handleButtonClick}
                variant="outline"
                size="sm"
                disabled={isUploading}
                className="gap-2"
            >
                {isUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <FileSpreadsheet className="w-4 h-4 text-green-600" />
                )}
                {isUploading ? '업로드 중...' : 'CSV 업로드'}
            </Button>
        </>
    );
}
