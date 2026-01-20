
import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import Papa from 'papaparse';

dotenv.config();

// Config
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY; // Use Anon Key to simulate frontend
const supabase = createClient(supabaseUrl, supabaseKey);

const CSV_FILE = 'product_upload_template.csv';

// Mappings from CsvUploadButton.tsx
const finishedGoodsMapping = {
    '제품명': 'product_name', '품명': 'product_name',
    '규격': 'spec',
    '도매가A': 'wholesale_a', '도매가 A': 'wholesale_a', '공급가': 'wholesale_a',
    '도매가B': 'wholesale_b', '도매가 B': 'wholesale_b',
    '도매가C': 'wholesale_c', '도매가 C': 'wholesale_c',
    '소비자가': 'retail_price', '할인가': 'retail_price',
    '원가': 'cost_blind', 'Cost': 'cost_blind',
    '유통기한': 'expiry_date', '유효기간': 'expiry_date', '소비기한': 'expiry_date',
    '입고일': 'inbound_date',
    '썸네일': 'thumbnail_url', '이미지': 'thumbnail_url',
    '상세이미지': 'detail_image_url',
    '재고상태': 'stock_status', '상태': 'stock_status',
    '태그': 'tags', '키워드': 'tags',
    '비고': 'memo', '메모': 'memo',

    // Extended mappings added in recent fix
    '원산지': 'origin_country',
    '연출사진': 'detail_image_url'
};

const logisticsMapping = {
    '바코드': 'logistics_barcode', 'Barcode': 'logistics_barcode', 'barcode': 'logistics_barcode',
    '단위중량': 'product_weight_g', '개당중량': 'product_weight_g',
    '카톤중량': 'carton_weight_kg', '박스중량': 'carton_weight_kg',
    '박스가로': 'carton_width_mm', '카톤가로': 'carton_width_mm',
    '박스세로': 'carton_depth_mm', '카톤세로': 'carton_depth_mm',
    '박스높이': 'carton_height_mm', '카톤높이': 'carton_height_mm',
    '입수': 'units_per_carton', '카톤입수': 'units_per_carton', '박스입수': 'units_per_carton',
    '팔레트적재': 'cartons_per_pallet', '팔레트박스': 'cartons_per_pallet'
};

async function runDebug() {
    console.log('--- STARTING DEBUG ---');

    const fileContent = fs.readFileSync(CSV_FILE, 'utf8');

    Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
            const rows = results.data;
            console.log(`Parsed ${rows.length} rows.`);

            for (const [index, row] of rows.entries()) {
                console.log(`\nProcessing Row ${index + 1}:`, row['제품명']);

                const cleanMainRow = {};

                Object.keys(row).forEach(key => {
                    const trimmedKey = key.trim();
                    let value = row[key];

                    if (typeof value === 'string') {
                        value = value.trim();
                        // Number conversion
                        if (['wholesale_a', 'wholesale_b', 'wholesale_c', 'retail_price', 'cost_blind'].some(k => trimmedKey.includes(k))) {
                            value = value.replace(/,/g, '');
                            if (!isNaN(Number(value)) && value !== '') value = Number(value);
                        }
                        if (value === '' || value === 'null') value = null;
                    }

                    // Mapping Logic
                    let mainTargetKey = trimmedKey;
                    if (finishedGoodsMapping[trimmedKey]) {
                        mainTargetKey = finishedGoodsMapping[trimmedKey];
                        if (mainTargetKey === 'tags' && typeof value === 'string') {
                            cleanMainRow[mainTargetKey] = value.split(',').map(t => t.trim());
                        } else {
                            cleanMainRow[mainTargetKey] = value;
                        }
                    } else if (logisticsMapping[trimmedKey]) {
                        // Skip logistics for main table
                    } else if (/^[a-z_][a-z0-9_]*$/.test(trimmedKey)) {
                        // Pass through ASCII keys
                        cleanMainRow[mainTargetKey] = value;
                    } else {
                        console.log(`Skipping key: ${trimmedKey} (No mapping and not ASCII)`);
                    }
                });

                console.log('Payload for insert:', cleanMainRow);

                // Try Insert
                const { error } = await supabase
                    .from('finished_goods')
                    .upsert(cleanMainRow)
                    .select()
                    .single();

                if (error) {
                    console.error('❌ INSERT FAILED:', error);
                    console.error('Details:', error.details);
                    console.error('Hint:', error.hint);
                    console.error('Message:', error.message);
                } else {
                    console.log('✅ INSERT SUCCESS');
                }
            }
        }
    });
}

runDebug();
