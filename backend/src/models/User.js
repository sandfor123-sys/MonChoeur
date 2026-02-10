const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
    static async findByEmail(email) {
        const rows = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];
    }

    static async findById(id) {
        const rows = await db.query('SELECT id, username, email, role, created_at FROM users WHERE id = ?', [id]);
        return rows[0];
    }

    static async create({ username, email, password, role = 'user' }) {
        const passwordHash = await bcrypt.hash(password, 10);
        const result = await db.query(
            'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
            [username, email, passwordHash, role]
        );
        return result.insertId;
    }

    static async exists(email, username) {
        const rows = await db.query(
            'SELECT id FROM users WHERE email = ? OR username = ?',
            [email, username]
        );
        return rows.length > 0;
    }
}

module.exports = User;
