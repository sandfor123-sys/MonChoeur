require('dotenv').config();
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

async function deepScan() {
    console.log('--- CLOUDINARY DEEP SCAN ---');
    const resourceTypes = ['image', 'video', 'raw'];
    const storageTypes = ['upload', 'private', 'authenticated'];

    for (const rType of resourceTypes) {
        for (const sType of storageTypes) {
            console.log(`Scanning [${rType}] in [${sType}] storage...`);
            try {
                const result = await cloudinary.api.resources({
                    resource_type: rType,
                    type: sType,
                    max_results: 50
                });

                if (result.resources.length > 0) {
                    console.log(`Found ${result.resources.length} resources:`);
                    for (const res of result.resources) {
                        console.log(`  - ID: ${res.public_id} | Mode: ${res.access_mode} | URL: ${res.secure_url}`);

                        // AUTO-FIX if not public
                        if (res.access_mode !== 'public' || sType !== 'upload') {
                            console.log(`    > FIXING: Setting to public upload...`);
                            try {
                                await cloudinary.api.update(res.public_id, {
                                    resource_type: rType,
                                    type: sType, // We have to use the original type to find it for update
                                    access_mode: 'public'
                                });
                                // Note: Converting type from private to upload often requires a rename or re-upload, 
                                // but let's see if access_mode update alone solves it for the same URL.
                            } catch (err) {
                                console.log(`    > FIX FAILED: ${err.message}`);
                            }
                        }
                    }
                } else {
                    console.log('  No resources found.');
                }
            } catch (error) {
                console.log(`  Error: ${error.message}`);
            }
        }
    }
}

deepScan();
