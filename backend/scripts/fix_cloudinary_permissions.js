require('dotenv').config(); // Adjust path if needed, usually run from backend root so .env is in root
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const folders = ['monchoeur/audio', 'monchoeur/partitions'];
const resourceTypes = ['video', 'raw']; // audio is 'video' in Cloudinary

async function fixPermissions() {
    console.log('Starting Cloudinary permission fix...');

    for (const type of resourceTypes) {
        console.log(`Checking resources of type: ${type}`);
        try {
            // Get resources in the specific folders
            // Note: expression search is more flexible if available, but basic list works
            // api.resources is for listing.

            let nextCursor = null;
            do {
                const options = {
                    resource_type: type,
                    type: 'upload', // Look for 'upload' type (standard), maybe they are 'authenticated'? 
                    // If they are 'authenticated', we need to look for that type.
                    // Let's try to list everything.
                    max_results: 100,
                    prefix: 'monchoeur/',
                    next_cursor: nextCursor
                };

                // We might need to check 'authenticated' type too if that's where they are.
                // But let's start with 'upload' and see if we can update access_mode.

                const result = await cloudinary.api.resources(options);

                for (const resource of result.resources) {
                    console.log(`Processing ${resource.public_id} (${resource.access_mode})...`);

                    // Update access_mode to public
                    // Note: 'access_mode' update might require 'update_resources_access_mode' method specific to mass update
                    // or individual 'update'.

                    try {
                        const updateResult = await cloudinary.api.update(resource.public_id, {
                            resource_type: type,
                            access_mode: 'public',
                            type: 'upload'
                        });
                        console.log(`  > Updated: ${updateResult.public_id} -> ${updateResult.access_mode}`);
                    } catch (err) {
                        console.error(`  > Failed to update ${resource.public_id}:`, err.message);
                    }
                }
                nextCursor = result.next_cursor;
            } while (nextCursor);

        } catch (error) {
            console.error(`Error listing ${type} resources:`, error.message);
            // If fetching 'upload' type found nothing or failed, maybe they are private/authenticated?
        }
    }

    console.log('Finished.');
}

// Function to handle "authenticated" or "private" typed resources if the above missed them
async function fixHiddenPermissions() {
    console.log('Checking for private/authenticated resources...');
    const hiddenTypes = ['private', 'authenticated'];

    for (const resType of resourceTypes) {
        for (const storageType of hiddenTypes) {
            try {
                let nextCursor = null;
                do {
                    const result = await cloudinary.api.resources({
                        resource_type: resType,
                        type: storageType,
                        prefix: 'monchoeur/',
                        max_results: 100,
                        next_cursor: nextCursor
                    });

                    for (const resource of result.resources) {
                        console.log(`Found hidden resource: ${resource.public_id} [${storageType}]`);
                        console.log(`  > Attempting to convert to public...`);

                        try {
                            // To move from private/authenticated to upload (public), we might need to rename or update type
                            // Updating 'type' in 'update' method:
                            const updateResult = await cloudinary.api.update(resource.public_id, {
                                resource_type: resType,
                                type: 'upload',
                                access_mode: 'public'
                            });
                            console.log(`  > Fixed: ${updateResult.public_id}`);
                        } catch (err) {
                            console.error(`  > Failed to fix ${resource.public_id}:`, err.message);
                        }
                    }
                    nextCursor = result.next_cursor;
                } while (nextCursor);
            } catch (e) {
                // Ignore if none found
            }
        }
    }
}

async function run() {
    await fixPermissions();
    await fixHiddenPermissions();
}

run();
