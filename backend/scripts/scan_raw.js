require('dotenv').config();
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

async function checkRawOnly() {
    console.log('--- TARGETED RAW SCAN ---');
    try {
        const result = await cloudinary.api.resources({
            resource_type: 'raw',
            type: 'upload',
            max_results: 100
        });
        console.log(`Found ${result.resources.length} raw upload resources.`);
        result.resources.forEach(r => {
            console.log(`ID: ${r.public_id} | Mode: ${r.access_mode} | URL: ${r.secure_url}`);
        });
    } catch (err) {
        console.log(`Error raw upload: ${err.message}`);
    }

    try {
        const resultPrivate = await cloudinary.api.resources({
            resource_type: 'raw',
            type: 'private',
            max_results: 100
        });
        console.log(`Found ${resultPrivate.resources.length} raw private resources.`);
        resultPrivate.resources.forEach(r => {
            console.log(`ID: ${r.public_id} | Mode: ${r.access_mode} | URL: ${r.secure_url}`);
        });
    } catch (err) {
        console.log(`Error raw private: ${err.message}`);
    }
}

checkRawOnly();
