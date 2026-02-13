const multer = require('multer');

// Use memory storage to handle buffers manually in the controller
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
    }
});

module.exports = { upload };
