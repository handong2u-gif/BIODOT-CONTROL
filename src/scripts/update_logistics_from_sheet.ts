
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// 1. Scraped Data (From Browser Subagent)
const rawData = [
    { name: "러시아 알타이 녹용(30포)", expiry: "2027.09.01", spec: "제품사이즈(cm): 33x11x22.3, BOX: 47.5x34x24.5, 무게: 10.1KG, 입수량: 4set, 파레트: 24BOX(96set)", barcode: "8809967010099" },
    { name: "러시아 알타이 녹용(30포) 선물세트", expiry: "2026.09.01", spec: "제품사이즈(cm): 40x21.5x11.5, BOX: 43.5x41.5x38, 무게: 18KG, 입수량: 6set, 파레트: 24BOX(144set)", barcode: "8809967010129" },
    { name: "뉴질랜드 아오테아로아 녹용", expiry: "2027.10.29.", spec: "제품사이즈(cm): 33x10.5x22, BOX: 47.5x34x24.5, 무게: 10.1KG, 입수량: 4set, 파레트: 24BOX(96set)", barcode: "8809967010334" },
    { name: "효력환(10환)", expiry: "2027.12.23", spec: "제품사이즈(cm): 22x27x19, BOX: 40x28x21.5, 무게: 2.5KG, 입수량: 6set, 파레트: 64BOX(384set)", barcode: "8809967010020" },
    { name: "효력환(30환)", expiry: "2027.12.23", spec: "제품사이즈(cm): 22x27x19, BOX: 40x28x21.5, 무게: 2.5KG, 입수량: 6set, 파레트: 64BOX(384set)", barcode: "8809967010112" },
    { name: "한동 키즈튼튼 녹용칼슘스틱", expiry: "2026.12.25", spec: "BOX: 33.5x25x18, 무게: 5.8KG, 입수량: 10set, 파레트: 40BOX(400set)", barcode: "8809967010082" },
    { name: "한동 키즈튼튼 맑은숨 녹용", expiry: "2027.08.11.", spec: "-", barcode: "8809967010280" },
    { name: "관절N칼슘부스팅젤리", expiry: "2027.02.07.", spec: "제품사이즈(cm): 7.5x16.5x3.5, BOX: 32x20x18.5, 무게: 4.95KG, 입수량: 20set, 파레트: 120BOX", barcode: "8809967010068" },
    { name: "한동녹용 더:한 흑염소진액", expiry: "2026.05.03", spec: "BOX: 57x35x20, 무게: 14KG, 입수량: 4set, 파레트: 24박스(96set)", barcode: "-" },
    { name: "한동녹용 더:한 흑도라지청", expiry: "2027.02.27.", spec: "제품사이즈(cm): 10x10x12, BOX: 33.5x43.5*26.5, 무게: 15KG, 입수량: 24set, 파레트: 36박스", barcode: "8809616411024" },
    { name: "디어V슬림", expiry: "2025.11.19.", spec: "BOX: 47x29x24.5, 무게: 2KG, 입수량: 8set, 파레트: 32BOX(256set)", barcode: "-" },
    { name: "진심명품환(10환)", expiry: "-", spec: "BOX: 33.5x43.5x26.5, 무게: 6.1KG, 입수량: 10set, 파레트: 16박스(160set)", barcode: "-" },
    { name: "Pre-care DV2.2 (강아지 면역)", expiry: "2027.05.24", spec: "BOX: 38x30.5x27, 무게: 7.2KG, 입수량: 40set, 파레트: 45BOX(1,800set)", barcode: "-" },
    { name: "Pre-care DA2.2 (강아지 관절)", expiry: "2027.05.24", spec: "BOX: 38x30.5x27, 무게: 7.2KG, 입수량: 40set, 파레트: 45BOX(1,800set)", barcode: "-" },
    { name: "Pre-care DV2.2 for cats (고양이 면역)", expiry: "2027.05.17", spec: "BOX: 35x30x24.5, 무게: 3.2KG, 입수량: 40set, 파레트: 45BOX(1,800set)", barcode: "-" },
    { name: "Pre-care DA2.2 for cats (고양이 관절)", expiry: "2027.05.17", spec: "BOX: 35x30x24.5, 무게: 3.2KG, 입수량: 40set, 파레트: 45BOX(1,800set)", barcode: "-" }
];

async function updateData() {
    console.log("Starting data update...");

    // Fetch existing products to map names
    const { data: dbProducts, error } = await supabase.from('finished_goods').select('id, product_name');
    if (error) {
        console.error("Error fetching contents:", error);
        return;
    }

    for (const item of rawData) {
        // 1. Match Product Name (Fuzzy or Direct)
        // Normalize name: remove spaces, lowercase, remove special chars
        const normalize = (s: string) => s.replace(/[\s\(\)\[\]\-]/g, '').toLowerCase();

        const targetProduct = dbProducts.find(p =>
            normalize(p.product_name).includes(normalize(item.name)) ||
            normalize(item.name).includes(normalize(p.product_name))
        );

        if (!targetProduct) {
            console.warn(`⚠️ Skipped: Could not find product match for "${item.name}"`);
            continue;
        }

        console.log(`✅ Updating: "${item.name}" -> DB: "${targetProduct.product_name}" (ID: ${targetProduct.id})`);

        // 2. Parse Expiry Date
        let expiryDate = null;
        if (item.expiry && item.expiry !== '-' && item.expiry !== '수시변경') {
            expiryDate = item.expiry.replace(/\./g, '-');
            if (expiryDate.endsWith('-')) expiryDate = expiryDate.slice(0, -1); // remove trailing dot
        }

        // 3. Update Finished Goods (Expiry)
        if (expiryDate) {
            await supabase.from('finished_goods').update({ expiry_date: expiryDate }).eq('id', targetProduct.id);
        }

        // 4. Parse Logistics Spec
        const specs: any = { product_id: targetProduct.id };
        if (item.barcode !== '-') specs.logistics_barcode = item.barcode;

        if (item.spec && item.spec !== '-') {
            // Parse Logic
            // Example: "제품사이즈(cm): 33x11x22.3, BOX: 47.5x34x24.5, 무게: 10.1KG, 입수량: 4set, 파레트: 24BOX(96set)"

            // A. Product Size (mm)
            const prodSizeMatch = item.spec.match(/제품사이즈\(cm\):\s*([\d\.]+)[xX*]([\d\.]+)[xX*]([\d\.]+)/);
            if (prodSizeMatch) {
                specs.product_width_mm = parseFloat(prodSizeMatch[1]) * 10;
                specs.product_depth_mm = parseFloat(prodSizeMatch[2]) * 10;
                specs.product_height_mm = parseFloat(prodSizeMatch[3]) * 10;
            }

            // B. Box Size (mm)
            const boxSizeMatch = item.spec.match(/BOX:\s*([\d\.]+)[xX*]([\d\.]+)[xX*]([\d\.]+)/);
            if (boxSizeMatch) {
                specs.carton_width_mm = parseFloat(boxSizeMatch[1]) * 10;
                specs.carton_depth_mm = parseFloat(boxSizeMatch[2]) * 10;
                specs.carton_height_mm = parseFloat(boxSizeMatch[3]) * 10;
            }

            // C. Weight (kg) -> Assuming Carton Weight
            const weightMatch = item.spec.match(/무게:\s*([\d\.]+)KG/i);
            if (weightMatch) {
                specs.carton_weight_kg = parseFloat(weightMatch[1]);
            }

            // D. Units per Carton
            const unitsMatch = item.spec.match(/입수량:\s*(\d+)set/i);
            if (unitsMatch) {
                specs.units_per_carton = parseInt(unitsMatch[1]);
            }

            // E. Cartons per Pallet
            const palletMatch = item.spec.match(/파레트:\s*(\d+)BOX/i) || item.spec.match(/파레트:\s*(\d+)박스/i);
            if (palletMatch) {
                specs.cartons_per_pallet = parseInt(palletMatch[1]);
            }
        }

        // Update Logistics Specs
        // Check if exists
        const { data: existingSpec } = await supabase.from('product_logistics_specs').select('id').eq('product_id', targetProduct.id).maybeSingle();

        if (existingSpec) {
            await supabase.from('product_logistics_specs').update(specs).eq('id', existingSpec.id);
        } else {
            await supabase.from('product_logistics_specs').insert(specs);
        }
    }
    console.log("Update Complete!");
}

updateData();
