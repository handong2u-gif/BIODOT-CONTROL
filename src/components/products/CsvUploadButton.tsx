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

                    // 1. 매핑 정의 (한국어 헤더 -> DB 컬럼)
                    const rawMaterialMapping: { [key: string]: string } = {
                        '제품명': 'product_name', '품명': 'product_name',
                        '원산지': 'origin_country', '국가': 'origin_country',
                        '공급가': 'wholesale_a', '단가': 'wholesale_a', '가격': 'wholesale_a',
                        '규격': 'spec', '메모': 'memo', '비고': 'memo'
                    };

                    const finishedGoodsMapping: { [key: string]: string } = {
                        '제품명': 'product_name', '품명': 'product_name',
                        '규격': 'spec',
                        '도매가A': 'wholesale_a', '도매가 A': 'wholesale_a', '공급가': 'wholesale_a',
                        '도매가B': 'wholesale_b', '도매가 B': 'wholesale_b',
                        '도매가C': 'wholesale_c', '도매가 C': 'wholesale_c',
                        '소비자가': 'retail_price', '할인가': 'retail_price',
                        '온라인가': 'online_price', '온라인판매가': 'online_price', '판매가': 'online_price',
                        '원가': 'cost_blind', 'Cost': 'cost_blind',
                        '유통기한': 'expiry_date', '유효기간': 'expiry_date', '소비기한': 'expiry_date',
                        '입고일': 'inbound_date',
                        '썸네일': 'thumbnail_url', '이미지': 'thumbnail_url',
                        '상세이미지': 'detail_image_url',
                        '재고상태': 'stock_status', '상태': 'stock_status',
                        '태그': 'tags', '키워드': 'tags',
                        '비고': 'memo', '메모': 'memo'
                    };

                    // 물류 스펙 매핑 (별도 테이블용)
                    const logisticsMapping: { [key: string]: string } = {
                        '바코드': 'logistics_barcode', 'Barcode': 'logistics_barcode', 'barcode': 'logistics_barcode',
                        // 무게/부피
                        '단위중량': 'product_weight_g', '개당중량': 'product_weight_g',
                        '카톤중량': 'carton_weight_kg', '박스중량': 'carton_weight_kg',

                        // 크기
                        '박스가로': 'carton_width_mm', '카톤가로': 'carton_width_mm',
                        '박스세로': 'carton_depth_mm', '카톤세로': 'carton_depth_mm',
                        '박스높이': 'carton_height_mm', '카톤높이': 'carton_height_mm',

                        // 수량
                        '입수': 'units_per_carton', '카톤입수': 'units_per_carton', '박스입수': 'units_per_carton',
                        '팔레트적재': 'cartons_per_pallet', '팔레트박스': 'cartons_per_pallet'
                    };


                    // 2. 데이터 변환 및 분리 (Main Data vs Logistics Data)
                    const mainDataRows: any[] = [];
                    const logisticsDataRows: any[] = [];

                    for (const row of rows as any[]) {
                        const cleanMainRow: any = {};
                        const cleanLogisticsRow: any = {};
                        let hasLogisticsData = false;

                        Object.keys(row).forEach(key => {
                            const trimmedKey = key.trim();
                            let value = row[key];

                            // 값 정제 (쉼표 제거, 빈 문자열 null 처리)
                            if (typeof value === 'string') {
                                value = value.trim();

                                // 숫자 변환 대상인지 확인 (한글 헤더가 wholesale_a 등으로 매핑될 것을 고려)
                                const numericColumns = ['price', 'cost', 'wholesale', 'weight', 'width', 'depth', 'height', 'units', 'cartons', 'qty'];

                                // 현재 키가 숫자형 컬럼에 해당하거나 매핑될 예정인지 확인
                                const isNumeric = numericColumns.some(nc => trimmedKey.toLowerCase().includes(nc)) ||
                                    (tableName === 'finished_goods' && finishedGoodsMapping[trimmedKey] && numericColumns.some(nc => finishedGoodsMapping[trimmedKey].includes(nc))) ||
                                    (tableName === 'finished_goods' && logisticsMapping[trimmedKey] && numericColumns.some(nc => logisticsMapping[trimmedKey].includes(nc)));

                                if (isNumeric) {
                                    value = value.replace(/,/g, '');
                                    // 숫자로 변환 가능한 경우 변환
                                    if (!isNaN(Number(value)) && value !== '') value = Number(value);
                                }
                                if (value === '' || value === 'null') value = null;
                            }

                            // A. Main Table Mapping
                            let mainTargetKey = trimmedKey;
                            if (tableName === 'raw_materials' && rawMaterialMapping[trimmedKey]) {
                                mainTargetKey = rawMaterialMapping[trimmedKey];
                                cleanMainRow[mainTargetKey] = value;
                            }
                            else if (tableName === 'finished_goods') {
                                // Update mapping with missing keys
                                const extendedMapping: { [key: string]: string } = {
                                    ...finishedGoodsMapping,
                                    '원산지': 'origin_country',
                                    '연출사진': 'detail_image_url'
                                };

                                if (extendedMapping[trimmedKey]) {
                                    mainTargetKey = extendedMapping[trimmedKey];
                                    // 태그 처리: 쉼표로 구분된 문자열을 배열로 변환
                                    if (mainTargetKey === 'tags' && typeof value === 'string') {
                                        cleanMainRow[mainTargetKey] = value.split(',').map(t => t.trim());
                                    } else {
                                        cleanMainRow[mainTargetKey] = value;
                                    }
                                } else if (!logisticsMapping[trimmedKey]) {
                                    // 매핑에 없지만 영문 컬럼명인(ASCII) 경우에만 통과시킴 (한글 헤더가 그대로 들어가는 것 방지)
                                    if (/^[a-z_][a-z0-9_]*$/.test(trimmedKey)) {
                                        cleanMainRow[mainTargetKey] = value;
                                    }
                                }

                                // B. Logistics Table Mapping (Only for finished_goods)
                                if (logisticsMapping[trimmedKey]) {
                                    const logKey = logisticsMapping[trimmedKey];
                                    if (value !== null) {
                                        cleanLogisticsRow[logKey] = value;
                                        hasLogisticsData = true;
                                    }
                                }
                            } else {
                                cleanMainRow[mainTargetKey] = value;
                            }
                        });

                        // ID 처리 (업데이트를 위해 필수, CSV에 id가 없다면 제품명으로 조회해야 함 - 여기서는 간단히 pass)
                        // 단, finished_goods는 upsert시 product_name 등을 기준으로 할 수 없으므로, 
                        // 실제로는 id가 있거나 insert 후 생성된 id를 가져와야 합니다.
                        // 이번 수정에서는 'product_name'을 매칭 키로 사용하여 기존 데이터를 덮어쓰거나(upsert), 
                        // 로직을 단순화하여 insert만 수행하되, 중복 방지를 위해 product_name check 등을 할 수 있습니다.
                        // 현장 상황에 맞춰: CSV에 'id'가 있다면 그 id 사용. 없다면 신규 생성.

                        mainDataRows.push(cleanMainRow);
                        if (tableName === 'finished_goods' && hasLogisticsData) {
                            // 물류 데이터는 제품 식별을 위해 product_name 임시 저장
                            cleanLogisticsRow['temp_product_name'] = cleanMainRow['product_name'];
                            logisticsDataRows.push(cleanLogisticsRow);
                        }
                    }

                    // 3. 데이터 저장 실행
                    if (tableName === 'raw_materials') {
                        const { error } = await (supabase as any).from(tableName).upsert(mainDataRows);
                        if (error) throw error;
                    }
                    else if (tableName === 'finished_goods') {
                        // 3-1. 제품 정보 Upsert (product_name 기준 매칭이 어려우니 Upsert시 conflict 낼 컬럼이 필요함.
                        // 보통은 id가 있어야 함. 여기서는 순차적으로 하나씩 처리하며 매칭 시도)

                        let lastError = "";
                        let successCount = 0;

                        // 배치 처리보다는 안전하게 하나씩 처리 (관계형 데이터 연결을 위해)
                        for (const row of mainDataRows) {
                            // 같은 이름의 제품이 있는지 확인 (중복이 있어도 에러 안 나게 limit(1) 사용)
                            const { data: existingList } = await (supabase as any)
                                .from('finished_goods')
                                .select('id')
                                .eq('product_name', row.product_name)
                                .limit(1);

                            const existing = existingList && existingList.length > 0 ? existingList[0] : null;

                            let productId = existing?.id;
                            let processedRow = { ...row };

                            // id가 있으면 업데이트(기존 ID 유지), 없으면 새로 생성
                            if (productId) processedRow.id = productId;
                            else delete processedRow.id;

                            const { data: savedProduct, error: prodError } = await (supabase as any)
                                .from('finished_goods')
                                .upsert(processedRow)
                                .select()
                                .maybeSingle(); // upsert 직후에는 하나만 반환되므로 maybeSingle/single 안전

                            if (prodError) {
                                console.error(`Failed to save product ${row.product_name}:`, prodError);
                                lastError = prodError.message || prodError.details || "알 수 없는 DB 오류";
                                continue;
                            }

                            if (!savedProduct) {
                                lastError = "저장 후 반환된 데이터가 없습니다.";
                                continue;
                            }

                            productId = savedProduct.id;
                            successCount++;

                            // 3-2. 물류 스펙 저장 (해당 제품의 물류 데이터가 있다면)
                            const logData = logisticsDataRows.find(l => l.temp_product_name === row.product_name);
                            if (logData && productId) {
                                delete logData.temp_product_name; // 임시 키 제거

                                // 로직스 테이블도 중복 방지 조회
                                const { data: existingSpecList } = await (supabase as any)
                                    .from('product_logistics_specs')
                                    .select('id')
                                    .eq('product_id', productId)
                                    .limit(1);

                                const existingSpec = existingSpecList && existingSpecList.length > 0 ? existingSpecList[0] : null;

                                const specPayload = { ...logData, product_id: productId };
                                if (existingSpec) specPayload.id = existingSpec.id;

                                await (supabase as any)
                                    .from('product_logistics_specs')
                                    .upsert(specPayload);
                            }
                        }

                        if (successCount < mainDataRows.length) {
                            if (successCount === 0) {
                                toast.error(`전체 실패: ${lastError}`);
                            } else {
                                toast.warning(`${mainDataRows.length}개 중 ${successCount}개만 성공. (마지막 에러: ${lastError})`);
                            }
                        } else {
                            toast.success(`${successCount}건 처리 완료!`);
                        }
                        onUploadComplete();
                    }
                } catch (error: any) {
                    console.error("Upload failed:", error);
                    toast.error(`업로드 로직 오류: ${error.message}`);
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
