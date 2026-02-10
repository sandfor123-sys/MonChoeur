const db = require('../config/database');

class Chant {
    static async findAll(filters = {}) {
        let sql = 'SELECT * FROM chants WHERE 1=1';
        const params = [];

        if (filters.categorie) {
            sql += ' AND categorie = ?';
            params.push(filters.categorie);
        }

        if (filters.temps_liturgique) {
            sql += ' AND temps_liturgique = ?';
            params.push(filters.temps_liturgique);
        }

        if (filters.difficulte) {
            sql += ' AND difficulte = ?';
            params.push(filters.difficulte);
        }

        if (filters.search) {
            sql += ' AND titre LIKE ?';
            params.push(`%${filters.search}%`);
        }

        sql += ' ORDER BY created_at DESC';

        return await db.query(sql, params);
    }

    static async findById(id) {
        const rows = await db.query('SELECT * FROM chants WHERE id = ?', [id]);
        const chant = rows[0];

        if (chant) {
            // Fetch associated audio files
            chant.audio = await db.query('SELECT * FROM audio_files WHERE chant_id = ?', [id]);
            // Fetch associated partitions
            chant.partitions = await db.query('SELECT * FROM partitions WHERE chant_id = ?', [id]);
        }

        return chant;
    }

    static async create(data) {
        const result = await db.query(
            'INSERT INTO chants (titre, compositeur, parolier, categorie, temps_liturgique, difficulte, paroles, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [data.titre, data.compositeur, data.parolier, data.categorie, data.temps_liturgique, data.difficulte, data.paroles, data.description]
        );
        return result.insertId;
    }

    static async update(id, data) {
        return await db.query(
            'UPDATE chants SET titre=?, compositeur=?, parolier=?, categorie=?, temps_liturgique=?, difficulte=?, paroles=?, description=? WHERE id=?',
            [data.titre, data.compositeur, data.parolier, data.categorie, data.temps_liturgique, data.difficulte, data.paroles, data.description, id]
        );
    }

    static async delete(id) {
        return await db.query('DELETE FROM chants WHERE id = ?', [id]);
    }

    static async addAudio(chantId, data) {
        return await db.query(
            'INSERT INTO audio_files (chant_id, type, voix, fichier_url, fichier_nom) VALUES (?, ?, ?, ?, ?)',
            [chantId, data.type || 'complet', data.voix || 'aucune', data.url, data.nom || 'audio']
        );
    }

    static async addPartition(chantId, data) {
        return await db.query(
            'INSERT INTO partitions (chant_id, voix, fichier_url, fichier_nom) VALUES (?, ?, ?, ?)',
            [chantId, data.voix || 'complete', data.url, data.nom || 'partition']
        );
    }
}

module.exports = Chant;
