const { supabase, handleResponse } = require('../config/database');

class Chant {
    static async findAll(filters = {}) {
        // Include audio_files (aliased as audio) and partitions relations
        let query = supabase.from('chants').select('*, audio:audio_files(*), partitions(*)');

        if (filters.categorie) {
            query = query.eq('categorie', filters.categorie);
        }

        if (filters.temps_liturgique) {
            query = query.eq('temps_liturgique', filters.temps_liturgique);
        }

        if (filters.difficulte) {
            query = query.eq('difficulte', filters.difficulte);
        }

        if (filters.search) {
            query = query.ilike('titre', `%${filters.search}%`);
        }

        query = query.order('created_at', { ascending: false });

        const { data, error } = await query;
        if (error) throw error;
        return data;
    }

    static async findById(id) {
        const { data: chant, error: chantError } = await supabase
            .from('chants')
            .select('*')
            .eq('id', id)
            .single();

        if (chantError && chantError.code !== 'PGRST116') throw chantError;

        if (chant) {
            // Fetch associated audio files
            const { data: audio, error: audioError } = await supabase
                .from('audio_files')
                .select('*')
                .eq('chant_id', id);

            if (audioError) throw audioError;
            chant.audio = audio;

            // Fetch associated partitions
            const { data: partitions, error: partitionsError } = await supabase
                .from('partitions')
                .select('*')
                .eq('chant_id', id);

            if (partitionsError) throw partitionsError;
            chant.partitions = partitions;
        }

        return chant;
    }

    static async create(data) {
        const { data: rows, error } = await supabase
            .from('chants')
            .insert([{
                titre: data.titre,
                compositeur: data.compositeur,
                parolier: data.parolier,
                categorie: data.categorie,
                temps_liturgique: data.temps_liturgique,
                difficulte: data.difficulte,
                paroles: data.paroles,
                description: data.description
            }])
            .select();

        if (error) throw error;
        return rows[0].id;
    }

    static async update(id, data) {
        const { error } = await supabase
            .from('chants')
            .update({
                titre: data.titre,
                compositeur: data.compositeur,
                parolier: data.parolier,
                categorie: data.categorie,
                temps_liturgique: data.temps_liturgique,
                difficulte: data.difficulte,
                paroles: data.paroles,
                description: data.description
            })
            .eq('id', id);

        if (error) throw error;
        return true;
    }

    static async delete(id) {
        const { error } = await supabase
            .from('chants')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    }

    static async addAudio(chant_id, data) {
        const { error } = await supabase
            .from('audio_files')
            .insert([{
                chant_id,
                type: data.type || 'complet',
                voix: data.voix || 'aucune',
                fichier_url: data.url,
                fichier_nom: data.nom || 'audio'
            }]);

        if (error) throw error;
        return true;
    }

    static async addPartition(chant_id, data) {
        const { error } = await supabase
            .from('partitions')
            .insert([{
                chant_id,
                voix: data.voix || 'complete',
                fichier_url: data.url,
                fichier_nom: data.nom || 'partition'
            }]);

        if (error) throw error;
        return true;
    }

    static async deleteAudio(id) {
        const { error } = await supabase.from('audio_files').delete().eq('id', id);
        if (error) throw error;
        return true;
    }

    static async deletePartition(id) {
        const { error } = await supabase.from('partitions').delete().eq('id', id);
        if (error) throw error;
        return true;
    }

    static async deleteAllAudio(chant_id) {
        const { error } = await supabase.from('audio_files').delete().eq('chant_id', chant_id);
        if (error) throw error;
        return true;
    }

    static async deleteAllPartitions(chant_id) {
        const { error } = await supabase.from('partitions').delete().eq('chant_id', chant_id);
        if (error) throw error;
        return true;
    }
}

module.exports = Chant;
