const Playlist = require('../models/Playlist');

exports.getPlaylists = async (req, res) => {
    try {
        const playlists = await Playlist.findAllByUser(req.user.id);
        res.json(playlists);
    } catch (error) {
        console.error('Get playlists error:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des playlists' });
    }
};

exports.getPlaylistById = async (req, res) => {
    try {
        const playlist = await Playlist.findById(req.params.id);

        if (!playlist) {
            return res.status(404).json({ error: 'Playlist non trouvée' });
        }

        // Check ownership
        if (playlist.user_id !== req.user.id && !playlist.is_public) {
            return res.status(403).json({ error: 'Accès non autorisé' });
        }

        res.json(playlist);
    } catch (error) {
        console.error('Get playlist error:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

exports.createPlaylist = async (req, res) => {
    try {
        const playlistId = await Playlist.create({
            ...req.body,
            user_id: req.user.id
        });
        const newPlaylist = await Playlist.findById(playlistId);
        res.status(201).json(newPlaylist);
    } catch (error) {
        console.error('Create playlist error:', error);
        res.status(500).json({ error: 'Erreur lors de la création de la playlist' });
    }
};

exports.updatePlaylist = async (req, res) => {
    try {
        const playlist = await Playlist.findById(req.params.id);

        if (!playlist) {
            return res.status(404).json({ error: 'Playlist non trouvée' });
        }

        if (playlist.user_id !== req.user.id) {
            return res.status(403).json({ error: 'Accès non autorisé' });
        }

        await Playlist.update(req.params.id, req.body);
        const updatedPlaylist = await Playlist.findById(req.params.id);
        res.json(updatedPlaylist);
    } catch (error) {
        console.error('Update playlist error:', error);
        res.status(500).json({ error: 'Erreur lors de la modification de la playlist' });
    }
};

exports.deletePlaylist = async (req, res) => {
    try {
        const playlist = await Playlist.findById(req.params.id);

        if (!playlist) {
            return res.status(404).json({ error: 'Playlist non trouvée' });
        }

        if (playlist.user_id !== req.user.id) {
            return res.status(403).json({ error: 'Accès non autorisé' });
        }

        await Playlist.delete(req.params.id);
        res.json({ message: 'Playlist supprimée avec succès' });
    } catch (error) {
        console.error('Delete playlist error:', error);
        res.status(500).json({ error: 'Erreur lors de la suppression de la playlist' });
    }
};

exports.addChantToPlaylist = async (req, res) => {
    try {
        const { chantId } = req.body;
        const playlist = await Playlist.findById(req.params.id);

        if (!playlist) {
            return res.status(404).json({ error: 'Playlist non trouvée' });
        }

        if (playlist.user_id !== req.user.id) {
            return res.status(403).json({ error: 'Accès non autorisé' });
        }

        await Playlist.addChant(req.params.id, chantId);
        res.status(201).json({ message: 'Chant ajouté à la playlist' });
    } catch (error) {
        console.error('Add chant error:', error);
        res.status(500).json({ error: 'Erreur lors de l\'ajout du chant' });
    }
};

exports.removeChantFromPlaylist = async (req, res) => {
    try {
        const { chantId } = req.params;
        const playlist = await Playlist.findById(req.params.id);

        if (!playlist) {
            return res.status(404).json({ error: 'Playlist non trouvée' });
        }

        if (playlist.user_id !== req.user.id) {
            return res.status(403).json({ error: 'Accès non autorisé' });
        }

        await Playlist.removeChant(req.params.id, chantId);
        res.json({ message: 'Chant retiré de la playlist' });
    } catch (error) {
        console.error('Remove chant error:', error);
        res.status(500).json({ error: 'Erreur lors du retrait du chant' });
    }
};
