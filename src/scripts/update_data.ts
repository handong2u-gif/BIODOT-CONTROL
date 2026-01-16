
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const sheetData = [
    {
        "Product Name": "러시아 알타이 녹용(30포)",
        "Expiration Date": "2027.09.01",
        "Logistics Specs": "제품사이즈(cm) : 33 x 11 x 22.3, BOX 가로*세로*높이cm : 45 X 35 X 25, BOX 무게 : 9.61KG, BOX 입수량 : 4set, 파레트 입수량 : 36카톤BOX (144 set), 24ft 컨테이너 기준 : 1,440set(360카톤BOX)"
    },
    {
        "Product Name": "러시아 알타이 녹용(30포) 선물세트",
        "Expiration Date": "2026.09.01",
        "Logistics Specs": "제품사이즈(cm) : 40 x 21.5 x 11.5, BOX 가로*세로*높이cm : 53x41x46 (바이오닷 2호박스), BOX 무게 : 13KG, BOX 입수량 : 4set, 파레트 입수량 : 12카톤(48set), 24ft 컨테이너 기준 : 480set(120카톤BOX)"
    },
    {
        "Product Name": "뉴질랜드 아오테아로아 녹용",
        "Expiration Date": "2027.10.29.",
        "Logistics Specs": "제품사이즈(cm) : 33 x 10.5 x 22, BOX 입수량 : 5set"
    },
    {
        "Product Name": "효력환(10환)",
        "Expiration Date": "2027.12.23",
        "Logistics Specs": "제품사이즈(cm) : 22 x 27 x 19, BOX 가로*세로*높이cm : 18.5 X 18.5 X 4, BOX 무게 : 4.6KG, BOX 입수량 : 10set"
    },
    {
        "Product Name": "효력환(30환)",
        "Expiration Date": "2027.12.23",
        "Logistics Specs": "BOX 가로*세로*높이cm : 34 x 22 x 4, BOX 무게 : 9KG, BOX 입수량 : 10set"
    },
    {
        "Product Name": "한동 키즈튼튼 녹용칼슘스틱",
        "Expiration Date": "2026.12.25",
        "Logistics Specs": "BOX 가로*세로*높이cm : 33.5 X 25 X 18, BOX 무게 : 7KG, BOX 입수량 : 20set, 파레트 입수량 : 108BOX(2,160 set), 24ft 컨테이너 기준 : 21,600set(1,080카톤BOX)"
    },
    {
        "Product Name": "한동 키즈튼튼 맑은숨 녹용",
        "Expiration Date": "2027.08.11.",
        "Logistics Specs": ""
    },
    {
        "Product Name": "관절N칼슘부스팅젤리",
        "Expiration Date": "2027.02.07.",
        "Logistics Specs": "제품사이즈(cm) : 7.5 x 16.5 x 3.5, BOX 가로*세로*높이cm : 32 X 20 X 18.5, BOX 무게 : 4.95KG, BOX 입수량 : 20set, 파레트 입수량 : 120BOX (2,400 set), 24ft 컨테이너 기준 : 24,000set(1,200카톤BOX)"
    },
    {
        "Product Name": "한동녹용 더:한 흑염소진액",
        "Expiration Date": "2026.05.03",
        "Logistics Specs": "BOX 가로*세로*높이cm : 57x 35x 20, BOX 무게 : 14KG, BOX 입수량 : 4set, 파레트 입수량 : 24박스(96set)"
    },
    {
        "Product Name": "한동녹용 더:한 흑도라지청",
        "Expiration Date": "2027.02.27.",
        "Logistics Specs": "제품사이즈(cm) : 10 x 10 x 12, BOX 가로*세로*높이cm : 33.5×43.5×26.5, BOX 무게 : 15KG (박스무게 730g), BOX 입수량 : 24set, 파레트 입수량 : 36박스(864set), 24ft 컨테이너 기준 : 8,640set(360카톤BOX)"
    },
    {
        "Product Name": "디어V슬림",
        "Expiration Date": "2025.11.19.",
        "Logistics Specs": "BOX 가로*세로*높이cm : 47 X 29 X 24.5, BOX 무게 : 2KG, BOX 입수량 : 8set, 파레트 입수량 : 32BOX(256 set)"
    },
    {
        "Product Name": "DVtea",
        "Expiration Date": "수시변경",
        "Logistics Specs": ""
    }
];

function normalize(str: string): string {
    // Remove spaces, (, ), :, -, and lowercase
    return str.replace(/[\s\(\):-]/g, '').toLowerCase();
}

function parseLogistics(specStr: string) {
    const result = {
        carton_weight_kg: null as number | null,
        carton_width_mm: null as number | null,
        carton_depth_mm: null as number | null,
        carton_height_mm: null as number | null,
        units_per_carton: null as number | null,
        cartons_per_pallet: null as number | null,
    };

    if (!specStr) return result;

    // Dimensions
    const dimRegex = /BOX 가로\*세로\*높이cm\s*[:\s]*([\d\.]+)\s*[xX]\s*([\d\.]+)\s*[xX]\s*([\d\.]+)/i;
    let dimMatch = specStr.match(dimRegex);
    if (!dimMatch) {
        const dimRegex2 = /BOX 가로\*세로\*높이cm\s*[:\s]*([\d\.]+)[×xX]([\d\.]+)[×xX]([\d\.]+)/i;
        dimMatch = specStr.match(dimRegex2);
    }

    if (dimMatch) {
        result.carton_width_mm = parseFloat(dimMatch[1]) * 10;
        result.carton_depth_mm = parseFloat(dimMatch[2]) * 10;
        result.carton_height_mm = parseFloat(dimMatch[3]) * 10;
    }

    // Weight
    const weightRegex = /BOX 무게\s*[:\s]*([\d\.]+)/;
    const weightMatch = specStr.match(weightRegex);
    if (weightMatch) {
        result.carton_weight_kg = parseFloat(weightMatch[1]);
    }

    // Units per carton (BOX 입수량)
    const qtyCartonRegex = /BOX 입수량\s*[:\s]*(\d+)/;
    const qtyCartonMatch = specStr.match(qtyCartonRegex);
    if (qtyCartonMatch) {
        result.units_per_carton = parseInt(qtyCartonMatch[1]);
    }

    // Cartons per pallet (파레트 입수량)
    // Logic: "36카톤BOX" or "24박스"
    const qtyPalletRegex = /파레트 입수량\s*[:\s]*(\d+)[\s]*(카톤|박스|BOX)/i;
    const qtyPalletMatch = specStr.match(qtyPalletRegex);
    if (qtyPalletMatch) {
        result.cartons_per_pallet = parseInt(qtyPalletMatch[1]);
    }

    return result;
}

function parseDate(dateStr: string): string | null {
    if (!dateStr || dateStr.includes('수시') || dateStr.trim() === '') return null;
    return dateStr.replace(/\./g, '-').replace(/-+$/, '');
}

async function main() {
    console.log('Starting data sync...');

    const { data: products, error: prodError } = await supabase
        .from('finished_goods')
        .select('id, product_name');

    if (prodError) {
        console.error('Error fetching products:', prodError);
        return;
    }

    for (const item of sheetData) {
        const sheetName = item["Product Name"];
        const normSheetName = normalize(sheetName);

        let product = products.find(p => normalize(p.product_name) === normSheetName);

        // Fuzzy check if exact norm failed
        if (!product) {
            // if one contains the other
            product = products.find(p => {
                const normP = normalize(p.product_name);
                return normP.includes(normSheetName) || normSheetName.includes(normP);
            });
        }

        if (!product) {
            // Special case for "DVtea" -> "DV tea 6"
            if (normSheetName.includes('dvtea')) {
                product = products.find(p => normalize(p.product_name).includes('dvtea'));
            }
        }

        if (!product) {
            console.warn(`Product not found in DB: ${sheetName}`);
            continue;
        }

        console.log(`Processing: ${sheetName} -> Match: ${product.product_name} (ID: ${product.id})`);

        // 1. Update Expiry Date
        const expDate = parseDate(item["Expiration Date"]);
        if (expDate) {
            const { error: expError } = await supabase
                .from('finished_goods')
                .update({ expiry_date: expDate }) // Column is expiry_date!
                .eq('id', product.id);

            if (expError) console.error(`  Failed to update expiry:`, expError);
            else console.log(`  Updated expiry date: ${expDate}`);
        }

        // 2. Update Logistics
        const specs = parseLogistics(item["Logistics Specs"]);
        if (Object.values(specs).some(v => v !== null)) {
            const { data: existingLogistics } = await supabase
                .from('product_logistics_specs')
                .select('id')
                .eq('product_id', product.id)
                .single();

            const payload = {
                product_id: product.id,
                ...specs
            };

            let logError;
            if (existingLogistics) {
                const { error } = await supabase
                    .from('product_logistics_specs')
                    .update(payload)
                    .eq('id', existingLogistics.id);
                logError = error;
            } else {
                const { error } = await supabase
                    .from('product_logistics_specs')
                    .insert(payload);
                logError = error;
            }

            if (logError) console.error(`  Failed to update logistics:`, logError);
            else console.log(`  Updated logistics specs.`);
        }
    }

    console.log('Sync complete.');
}

main();
