const Chant = require('../models/Chant');

exports.getChants = async (req, res) => {
    try {
        const filters = req.query;
        const chants = await Chant.findAll(filters);
        res.json(chants);
    } catch (error) {
        console.error('Get chants error:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des chants' });
    }
};

exports.getChantById = async (req, res) => {
    try {
        const chant = await Chant.findById(req.params.id);
        if (chant) {
            res.json(chant);
        } else {
            res.status(404).json({ error: 'Chant non trouvé' });
        }
    } catch (error) {
        console.error('Get chant error:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

exports.createChant = async (req, res) => {
    try {
        const chantId = await Chant.create(req.body);

        // Handle uploaded files from Cloudinary
        if (req.files) {
            if (req.files.audio) {
                const audioFile = req.files.audio[0];
                await Chant.addAudio(chantId, {
                    url: audioFile.path,
                    nom: audioFile.originalname,
                    type: 'complet'
                });
            }
            if (req.files.partition) {
                const partitionFile = req.files.partition[0];
                await Chant.addPartition(chantId, {
                    url: partitionFile.path,
                    nom: partitionFile.originalname,
                    voix: 'complete'
                });
            }
        }

        const newChant = await Chant.findById(chantId);
        res.status(201).json(newChant);
    } catch (error) {
        console.error('Create chant error:', error);
        res.status(500).json({ error: 'Erreur lors de la création du chant' });
    }
};

exports.updateChant = async (req, res) => {
    try {
        await Chant.update(req.params.id, req.body);
        const chantId = req.params.id;

        // Handle new uploaded files
        if (req.files) {
            if (req.files.audio) {
                const audioFile = req.files.audio[0];
                await Chant.addAudio(chantId, {
                    url: audioFile.path,
                    nom: audioFile.originalname,
                    type: 'complet'
                });
            }
            if (req.files.partition) {
                const partitionFile = req.files.partition[0];
                await Chant.addPartition(chantId, {
                    url: partitionFile.path,
                    nom: partitionFile.originalname,
                    voix: 'complete'
                });
            }
        }

        const updatedChant = await Chant.findById(chantId);
        if (updatedChant) {
            res.json(updatedChant);
        } else {
            res.status(404).json({ error: 'Chant non trouvé' });
        }
    } catch (error) {
        console.error('Update chant error:', error);
        res.status(500).json({ error: 'Erreur lors de la modification du chant' });
    }
};

exports.deleteChant = async (req, res) => {
    try {
        const chant = await Chant.findById(req.params.id);
        if (!chant) {
            return res.status(404).json({ error: 'Chant non trouvé' });
        }
        await Chant.delete(req.params.id);
        res.json({ message: 'Chant supprimé avec succès' });
    } catch (error) {
        console.error('Delete chant error:', error);
        res.status(500).json({ error: 'Erreur lors de la suppression du chant' });
    }
};
