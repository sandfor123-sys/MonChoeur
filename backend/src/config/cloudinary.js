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

        if (file.fieldname === 'audio') {
            folder = 'monchoeur/audio';
            resource_type = 'video'; // Cloudinary uses 'video' for audio files
        } else if (file.fieldname === 'partition') {
            folder = 'monchoeur/partitions';
            resource_type = 'raw'; // PDF/Raw files
        }

        return {
            folder: folder,
            resource_type: resource_type,
            public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
            format: file.originalname.split('.').pop()
        };
    },
});

const upload = multer({ storage: storage });

module.exports = { cloudinary, upload };
