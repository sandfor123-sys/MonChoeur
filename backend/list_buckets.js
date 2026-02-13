require('dotenv').config();
const { supabase } = require('./src/config/supabase');

async function listBuckets() {
    console.log('--- LISTING SUPABASE BUCKETS ---');
    try {
        const { data, error } = await supabase.storage.listBuckets();
        if (error) {
            console.error('Error listing buckets:', error.message);
            return;
        }
        console.log('Available buckets:');
        data.forEach(b => {
            console.log(`- Name: "${b.name}" | Public: ${b.public}`);
        });
    } catch (err) {
        console.error('Unhandled error:', err);
    }
}

listBuckets();
