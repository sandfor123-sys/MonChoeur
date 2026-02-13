const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        // Determine folder based on file type or field name
        let folder = 'monchoeur/others';
        let resource_type = 'auto';

        // Check if fieldname starts with 'audio' (e.g. audio_complet, audio_soprano)
        if (file.fieldname.startsWith('audio')) {
            folder = 'monchoeur/audio';
            resource_type = 'video'; // Cloudinary uses 'video' for audio files
        } else if (file.fieldname === 'partition') {
            folder = 'monchoeur/partitions';
            resource_type = 'raw'; // PDF/Raw files
        }

        const fileExt = file.originalname.split('.').pop();
        const fileName = file.originalname.split('.')[0].replace(/[^a-zA-Z0-9]/g, '_'); // Sanitize filename

        const params = {
            folder: folder,
            resource_type: resource_type,
            public_id: `${Date.now()}-${fileName}`
        };

        // Only specify format for non-raw files
        if (resource_type !== 'raw') {
            params.format = fileExt;
            params.allowed_formats = ['mp3', 'wav', 'ogg', 'm4a', 'aac']; // Audio formats
        } else {
            // For raw files, keep extension in public_id
            params.public_id += `.${fileExt}`;
            // We can't strictly enforce 'allowed_formats' here for raw, but we can check extension logic above if needed.
            // But multer validation is better. For now, this is okay as requested.
        }

        return params;
    },
});

const upload = multer({ storage: storage });

module.exports = { cloudinary, upload };
