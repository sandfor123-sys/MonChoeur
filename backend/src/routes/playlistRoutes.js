const express = require('express');
const router = express.Router();
const {
    getPlaylists,
    getPlaylistById,
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
    addChantToPlaylist,
    removeChantFromPlaylist
} = require('../controllers/playlistController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All playlist routes are protected

router.get('/', getPlaylists);
router.get('/:id', getPlaylistById);
router.post('/', createPlaylist);
router.put('/:id', updatePlaylist);
router.delete('/:id', deletePlaylist);

router.post('/:id/chants', addChantToPlaylist);
router.delete('/:id/chants/:chantId', removeChantFromPlaylist);

module.exports = router;
