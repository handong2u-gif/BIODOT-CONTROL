
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
// Need Service Key to check storage buckets reliably or create them.
// If valid, use it.

if (!supabaseUrl || !serviceKey) {
    console.error('Missing URL or Service Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function check() {
    console.log('--- Checking Columns ---');
    // Try to select the new column. If it fails, it doesn't exist.
    const { data: colData, error: colError } = await supabase
        .from('raw_materials')
        .select('detail_image_url')
        .limit(1);

    if (colError) {
        console.log('Column detail_image_url check failed:', colError.message);
    } else {
        console.log('Column detail_image_url EXISTS!');
    }

    console.log('\n--- Checking Storage Buckets ---');
    const { data: buckets, error: bucketError } = await supabase
        .storage
        .listBuckets();

    if (bucketError) {
        console.error('Error listing buckets:', bucketError.message);
    } else {
        const exists = buckets.find(b => b.name === 'product-images');
        if (exists) {
            console.log('Bucket "product-images" EXISTS!');
        } else {
            console.log('Bucket "product-images" does NOT exist.');
            console.log('Existing buckets:', buckets.map(b => b.name));

            // Try to create it if it doesn't exist (since we have Service Key)
            console.log('Attempting to create "product-images" bucket...');
            const { data: newBucket, error: createError } = await supabase
                .storage
                .createBucket('product-images', {
                    public: true
                });

            if (createError) {
                console.error('Failed to create bucket:', createError.message);
            } else {
                console.log('Successfully created bucket "product-images"!');
            }
        }
    }
}

check();
