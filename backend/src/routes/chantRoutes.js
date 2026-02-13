const express = require('express');
const router = express.Router();
const { getChants, getChantById, createChant, updateChant, deleteChant } = require('../controllers/chantController');
const { protect, admin } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/upload');

router.get('/', getChants);
router.get('/:id', getChantById);

// Admin only routes
router.post('/', protect, admin, upload.fields([
    { name: 'audio_complet', maxCount: 1 },
    { name: 'audio_soprano', maxCount: 1 },
    { name: 'audio_alto', maxCount: 1 },
    { name: 'audio_tenor', maxCount: 1 },
    { name: 'audio_basse', maxCount: 1 },
    { name: 'partition', maxCount: 5 }
]), createChant);

router.put('/:id', protect, admin, upload.fields([
    { name: 'audio_complet', maxCount: 1 },
    { name: 'audio_soprano', maxCount: 1 },
    { name: 'audio_alto', maxCount: 1 },
    { name: 'audio_tenor', maxCount: 1 },
    { name: 'audio_basse', maxCount: 1 },
    { name: 'partition', maxCount: 5 }
]), updateChant);
router.delete('/:id', protect, admin, deleteChant);
router.delete('/:id/audio/:audioId', protect, admin, require('../controllers/chantController').deleteAudio);
router.delete('/:id/partition/:partitionId', protect, admin, require('../controllers/chantController').deletePartition);

module.exports = router;
