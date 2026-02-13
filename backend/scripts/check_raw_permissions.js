require('dotenv').config();
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

async function checkRaw() {
    console.log('Checking RAW (PDF) resources...');
    try {
        const result = await cloudinary.api.resources({
            resource_type: 'raw',
            type: 'upload',
            prefix: 'monchoeur/',
            max_results: 50
        });

        if (result.resources.length === 0) {
            console.log('No raw resources found in monchoeur/');
        }

        for (const res of result.resources) {
            console.log(`- ${res.public_id}: Access Mode = ${res.access_mode}`);
            // If access_mode is not public, try to fix it right here
            if (res.access_mode !== 'public') {
                console.log(`  > Attempting to fix ${res.public_id}...`);
                try {
                    await cloudinary.api.update(res.public_id, {
                        resource_type: 'raw',
                        access_mode: 'public'
                    });
                    console.log(`  > FIXED.`);
                } catch (e) {
                    console.log(`  > FAILED: ${e.message}`);
                }
            }
        }
    } catch (error) {
        console.error('Error checking raw resources:', error.message);
    }
}

checkRaw();
