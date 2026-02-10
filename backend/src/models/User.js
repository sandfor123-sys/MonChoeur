const { supabase, handleResponse } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
    static async findByEmail(email) {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        // Supabase returns 406 or error if not found with .single()
        if (error && error.code !== 'PGRST116') throw error;
        return data;
    }

    static async findById(id) {
        const { data, error } = await supabase
            .from('users')
            .select('id, username, email, role, created_at')
            .eq('id', id)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
    }

    static async create({ username, email, password, role = 'user' }) {
        const passwordHash = await bcrypt.hash(password, 10);
        const { data, error } = await supabase
            .from('users')
            .insert([{ username, email, password_hash: passwordHash, role }])
            .select();

        if (error) throw error;
        return data[0].id;
    }

    static async exists(email, username) {
        const { data, error } = await supabase
            .from('users')
            .select('id')
            .or(`email.eq.${email},username.eq.${username}`);

        if (error) throw error;
        return data.length > 0;
    }
}

module.exports = User;
