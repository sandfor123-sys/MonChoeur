const Chant = require('../models/Chant');
const { cloudinary } = require('../config/cloudinary');
const { supabase } = require('../config/supabase');
const streamifier = require('streamifier');

// Helper to upload buffer to Cloudinary (for audio)
const uploadToCloudinary = (buffer, folder, resourceType) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: folder,
                resource_type: resourceType,
                type: 'upload',
                access_mode: 'public'
            },
            (error, result) => {
                if (result) resolve(result);
                else reject(error);
            }
        );
        streamifier.createReadStream(buffer).pipe(stream);
    });
};

// Helper to upload to Supabase (for PDFs)
const uploadToSupabase = async (file, bucket) => {
    const fileExt = file.originalname.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file.buffer, {
            contentType: file.mimetype,
            cacheControl: '3600',
            upsert: false
        });

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

    return publicUrl;
};

// Helper to extract public_id from Cloudinary URL
const getPublicIdFromUrl = (url) => {
    if (!url) return null;
    // URL format: https://res.cloudinary.com/[cloud_name]/[resource_type]/upload/v[version]/[folder]/[public_id].[ext]
    const parts = url.split('/');
    const lastPart = parts[parts.length - 1];
    const publicIdWithExt = lastPart.split('.')[0];

    // We also need the folder(s) if any
    // Looking at cloudinary.js: folder is 'monchoeur/audio' or 'monchoeur/partitions'
    const uploadIndex = parts.indexOf('upload');
    if (uploadIndex !== -1) {
        // Everything between 'v[version]' and the last part is the folder
        const folderParts = parts.slice(uploadIndex + 2, parts.length - 1);
        return [...folderParts, publicIdWithExt].join('/');
    }
    return publicIdWithExt;
};

// Helper to delete from Cloudinary
const deleteFilesFromCloudinary = async (files, resourceType = 'auto') => {
    for (const file of files) {
        const publicId = getPublicIdFromUrl(file.fichier_url);
        if (publicId) {
            try {
                await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
            } catch (error) {
                console.error(`Error deleting ${publicId} from Cloudinary:`, error);
            }
        }
    }
};

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

        // Handle uploaded files (buffers in memory)
        if (req.files) {
            const voiceFields = ['audio_complet', 'audio_soprano', 'audio_alto', 'audio_tenor', 'audio_basse'];

            // 1. Process Audio Files -> Cloudinary
            for (const field of voiceFields) {
                if (req.files[field] && req.files[field][0]) {
                    const voice = field === 'audio_complet' ? 'toutes' : field.split('_')[1];
                    const type = field === 'audio_complet' ? 'complet' : 'voix_separee';
                    const file = req.files[field][0];

                    const result = await uploadToCloudinary(file.buffer, 'monchoeur/audio', 'video');

                    await Chant.addAudio(chantId, {
                        url: result.secure_url,
                        nom: file.originalname,
                        type: type,
                        voix: voice
                    });
                }
            }

            // 2. Process Partitions -> Supabase
            if (req.files.partition) {
                for (const partitionFile of req.files.partition) {
                    const publicUrl = await uploadToSupabase(partitionFile, 'partitions');
                    await Chant.addPartition(chantId, {
                        url: publicUrl,
                        nom: partitionFile.originalname,
                        voix: 'complete'
                    });
                }
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
            const currentChant = await Chant.findById(chantId);
            const voiceFields = ['audio_complet', 'audio_soprano', 'audio_alto', 'audio_tenor', 'audio_basse'];

            // 1. Handle Audio Updates -> Cloudinary
            for (const field of voiceFields) {
                if (req.files[field] && req.files[field][0]) {
                    const voice = field === 'audio_complet' ? 'toutes' : field.split('_')[1];
                    const type = field === 'audio_complet' ? 'complet' : 'voix_separee';
                    const file = req.files[field][0];

                    // Find existing audio for this specific voice/type
                    const existingAudio = (currentChant.audio || []).find(a =>
                        a.type === type && a.voix === voice
                    );

                    // If exists, delete old file from Cloudinary
                    if (existingAudio) {
                        try {
                            const publicId = getPublicIdFromUrl(existingAudio.fichier_url);
                            if (publicId && existingAudio.fichier_url.includes('cloudinary.com')) {
                                await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
                            }
                            await Chant.deleteAudio(existingAudio.id);
                        } catch (err) {
                            console.error(`Failed to delete old audio for ${field}:`, err);
                        }
                    }

                    // Upload new file to Cloudinary
                    const result = await uploadToCloudinary(file.buffer, 'monchoeur/audio', 'video');

                    // Add new file record
                    await Chant.addAudio(chantId, {
                        url: result.secure_url,
                        nom: file.originalname,
                        type: type,
                        voix: voice
                    });
                }
            }

            // 2. Handle Partition Updates -> Supabase
            if (req.files.partition) {
                for (const partitionFile of req.files.partition) {
                    const publicUrl = await uploadToSupabase(partitionFile, 'partitions');
                    await Chant.addPartition(chantId, {
                        url: publicUrl,
                        nom: partitionFile.originalname,
                        voix: 'complete'
                    });
                }
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

        // 1. Delete audio files from Cloudinary
        if (chant.audio && chant.audio.length > 0) {
            for (const audio of chant.audio) {
                const publicId = getPublicIdFromUrl(audio.fichier_url);
                if (publicId && audio.fichier_url.includes('cloudinary.com')) {
                    await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
                }
            }
        }

        // 2. Delete partitions from Supabase
        if (chant.partitions && chant.partitions.length > 0) {
            for (const partition of chant.partitions) {
                if (partition.fichier_url.includes('supabase.co')) {
                    const urlParts = partition.fichier_url.split('/');
                    const fileName = urlParts[urlParts.length - 1];
                    await supabase.storage.from('partitions').remove([fileName]);
                } else {
                    // Legacy Cloudinary delete
                    const publicId = getPublicIdFromUrl(partition.fichier_url);
                    if (publicId) await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
                }
            }
        }

        await Chant.delete(req.params.id);

        res.json({ message: 'Chant et fichiers associés supprimés avec succès' });
    } catch (error) {
        console.error('Delete chant error:', error);
        res.status(500).json({ error: 'Erreur lors de la suppression du chant' });
    }
};

exports.deleteAudio = async (req, res) => {
    try {
        const { id, audioId } = req.params;
        const chant = await Chant.findById(id);
        if (!chant) return res.status(404).json({ error: 'Chant non trouvé' });

        const audioFile = (chant.audio || []).find(a => a.id == audioId);
        if (!audioFile) return res.status(404).json({ error: 'Fichier audio non trouvé' });

        const publicId = getPublicIdFromUrl(audioFile.fichier_url);
        if (publicId && audioFile.fichier_url.includes('cloudinary.com')) {
            await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
        }

        await Chant.deleteAudio(audioId);
        res.json({ message: 'Fichier audio supprimé' });
    } catch (error) {
        console.error('Delete audio error:', error);
        res.status(500).json({ error: 'Erreur lors de la suppression de l\'audio' });
    }
};

exports.deletePartition = async (req, res) => {
    try {
        const { id, partitionId } = req.params;
        const chant = await Chant.findById(id);
        if (!chant) return res.status(404).json({ error: 'Chant non trouvé' });

        const partitionFile = (chant.partitions || []).find(p => p.id == partitionId);
        if (!partitionFile) return res.status(404).json({ error: 'Partition non trouvée' });

        if (partitionFile.fichier_url.includes('supabase.co')) {
            const urlParts = partitionFile.fichier_url.split('/');
            const fileName = urlParts[urlParts.length - 1];
            await supabase.storage.from('partitions').remove([fileName]);
        } else {
            // Legacy Cloudinary delete
            const publicId = getPublicIdFromUrl(partitionFile.fichier_url);
            if (publicId) {
                await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
            }
        }

        await Chant.deletePartition(partitionId);
        res.json({ message: 'Partition supprimée' });
    } catch (error) {
        console.error('Delete partition error:', error);
        res.status(500).json({ error: 'Erreur lors de la suppression de la partition' });
    }
};
