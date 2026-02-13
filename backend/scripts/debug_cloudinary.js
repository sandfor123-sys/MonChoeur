const fs = require('fs');
require('dotenv').config();
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

async function run() {
    let logs = [];
    const log = (msg) => {
        console.log(msg);
        logs.push(msg);
    };

    log('Cloud Name: ' + (process.env.CLOUDINARY_CLOUD_NAME ? 'OK' : 'MISSING'));

    try {
        log('Listing video resources...');
        const videos = await cloudinary.api.resources({ resource_type: 'video', max_results: 1 });
        log('Video check: ' + (videos.resources.length > 0 ? 'Found ' + videos.resources.length : 'None found'));
        if (videos.resources.length > 0) log('First video mode: ' + videos.resources[0].access_mode + ', type: ' + videos.resources[0].type);
    } catch (e) {
        log('Error checking videos: ' + e.message);
    }

    try {
        log('Listing raw resources...');
        const raws = await cloudinary.api.resources({ resource_type: 'raw', max_results: 1 });
        log('Raw check: ' + (raws.resources.length > 0 ? 'Found ' + raws.resources.length : 'None found'));
        if (raws.resources.length > 0) log('First raw mode: ' + raws.resources[0].access_mode + ', type: ' + raws.resources[0].type);
    } catch (e) {
        log('Error checking raw: ' + e.message);
    }

    fs.writeFileSync('debug.txt', logs.join('\n'));
}

run();
