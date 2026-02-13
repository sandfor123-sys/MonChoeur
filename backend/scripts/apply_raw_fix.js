require('dotenv').config();
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

async function fixAllRaw() {
    console.log('--- FIXING RAW PERMISSIONS ---');
    try {
        const result = await cloudinary.api.resources({
            resource_type: 'raw',
            type: 'upload',
            max_results: 100
        });

        for (const res of result.resources) {
            console.log(`Fixing ${res.public_id}...`);
            await cloudinary.api.update(res.public_id, {
                resource_type: 'raw',
                access_mode: 'public'
            });
            console.log(`  Done.`);
        }
    } catch (err) {
        console.log(`Error: ${err.message}`);
    }
}

fixAllRaw();
