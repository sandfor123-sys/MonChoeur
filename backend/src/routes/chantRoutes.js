const express = require('express');
const router = express.Router();
const { getChants, getChantById, createChant, updateChant, deleteChant } = require('../controllers/chantController');
const { protect, admin } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

router.get('/', getChants);
router.get('/:id', getChantById);

// Admin only routes
router.post('/', protect, admin, upload.fields([
    { name: 'audio', maxCount: 1 },
    { name: 'partition', maxCount: 1 }
]), createChant);

router.put('/:id', protect, admin, upload.fields([
    { name: 'audio', maxCount: 1 },
    { name: 'partition', maxCount: 1 }
]), updateChant);
router.delete('/:id', protect, admin, deleteChant);

module.exports = router;
