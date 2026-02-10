const db = require('../config/database');

class Playlist {
    static async findAllByUser(userId) {
        const sql = `
      SELECT p.*, COUNT(pc.chant_id) as chants_count 
      FROM playlists p 
      LEFT JOIN playlist_chants pc ON p.id = pc.playlist_id 
      WHERE p.user_id = ? 
      GROUP BY p.id 
      ORDER BY p.created_at DESC
    `;
        return await db.query(sql, [userId]);
    }

    static async findById(id) {
        const rows = await db.query('SELECT * FROM playlists WHERE id = ?', [id]);
        const playlist = rows[0];

        if (playlist) {
            // Fetch chants in the playlist
            const sql = `
        SELECT c.*, pc.ordre, pc.added_at 
        FROM chants c 
        JOIN playlist_chants pc ON c.id = pc.chant_id 
        WHERE pc.playlist_id = ? 
        ORDER BY pc.ordre ASC
      `;
            playlist.chants = await db.query(sql, [id]);
        }

        return playlist;
    }

    static async create(data) {
        const result = await db.query(
            'INSERT INTO playlists (user_id, nom, description, is_public) VALUES (?, ?, ?, ?)',
            [data.user_id, data.nom, data.description, data.is_public || false]
        );
        return result.insertId;
    }

    static async update(id, data) {
        return await db.query(
            'UPDATE playlists SET nom = ?, description = ?, is_public = ? WHERE id = ?',
            [data.nom, data.description, data.is_public, id]
        );
    }

    static async delete(id) {
        return await db.query('DELETE FROM playlists WHERE id = ?', [id]);
    }

    static async addChant(playlistId, chantId) {
        // Get last order
        const rows = await db.query('SELECT MAX(ordre) as max_ordre FROM playlist_chants WHERE playlist_id = ?', [playlistId]);
        const nextOrder = (rows[0].max_ordre || 0) + 1;

        return await db.query(
            'INSERT INTO playlist_chants (playlist_id, chant_id, ordre) VALUES (?, ?, ?)',
            [playlistId, chantId, nextOrder]
        );
    }

    static async removeChant(playlistId, chantId) {
        return await db.query('DELETE FROM playlist_chants WHERE playlist_id = ? AND chant_id = ?', [playlistId, chantId]);
    }
}

module.exports = Playlist;
