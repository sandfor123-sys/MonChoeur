const { supabase, handleResponse } = require('../config/database');

class Playlist {
    static async findAllByUser(user_id) {
        // We might need to handle the count in a separate query or use a view if complex
        const { data, error } = await supabase
            .from('playlists')
            .select(`
                *,
                playlist_chants(count)
            `)
            .eq('user_id', user_id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Map to match previous structure
        return data.map(p => ({
            ...p,
            chants_count: p.playlist_chants[0]?.count || 0
        }));
    }

    static async findById(id) {
        const { data: playlist, error: pError } = await supabase
            .from('playlists')
            .select('*')
            .eq('id', id)
            .single();

        if (pError && pError.code !== 'PGRST116') throw pError;

        if (playlist) {
            const { data: chants, error: cError } = await supabase
                .from('playlist_chants')
                .select(`
                    ordre,
                    added_at,
                    chants (*)
                `)
                .eq('playlist_id', id)
                .order('ordre', { ascending: true });

            if (cError) throw cError;

            // Format to match expected structure (flattening the chant object)
            playlist.chants = chants.map(item => ({
                ...item.chants,
                ordre: item.ordre,
                added_at: item.added_at
            }));
        }

        return playlist;
    }

    static async create(data) {
        const { data: rows, error } = await supabase
            .from('playlists')
            .insert([{
                user_id: data.user_id,
                nom: data.nom,
                description: data.description,
                is_public: data.is_public || false
            }])
            .select();

        if (error) throw error;
        return rows[0].id;
    }

    static async update(id, data) {
        const { error } = await supabase
            .from('playlists')
            .update({
                nom: data.nom,
                description: data.description,
                is_public: data.is_public
            })
            .eq('id', id);

        if (error) throw error;
        return true;
    }

    static async delete(id) {
        const { error } = await supabase
            .from('playlists')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    }

    static async addChant(playlist_id, chant_id) {
        // Get last order
        const { data, error: countError } = await supabase
            .from('playlist_chants')
            .select('ordre')
            .eq('playlist_id', playlist_id)
            .order('ordre', { ascending: false })
            .limit(1);

        if (countError) throw countError;
        const nextOrder = (data[0]?.ordre || 0) + 1;

        const { error } = await supabase
            .from('playlist_chants')
            .insert([{ playlist_id, chant_id, ordre: nextOrder }]);

        if (error) throw error;
        return true;
    }

    static async removeChant(playlist_id, chant_id) {
        const { error } = await supabase
            .from('playlist_chants')
            .delete()
            .eq('playlist_id', playlist_id)
            .eq('chant_id', chant_id);

        if (error) throw error;
        return true;
    }
}

module.exports = Playlist;
