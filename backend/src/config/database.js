const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ SUPABASE_URL ou SUPABASE_ANON_KEY manquant dans le fichier .env');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Test connection (Supabase doesn't have a direct "ping", so we query a health table or just check if the client is init)
async function testConnection() {
    try {
        const { data, error } = await supabase.from('users').select('id').limit(1);
        if (error) throw error;
        console.log('✅ Connexion à Supabase via le SDK réussie');
        return true;
    } catch (error) {
        console.error('❌ Erreur de connexion à Supabase (SDK):', error.message);
        return false;
    }
}

// Helper to handle Supabase responses
const handleResponse = ({ data, error }) => {
    if (error) {
        console.error('Supabase Error:', error);
        throw error;
    }
    return data;
};

module.exports = {
    supabase,
    testConnection,
    handleResponse
};
