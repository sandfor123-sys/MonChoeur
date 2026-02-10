-- MonChoeur Database Schema (PostgreSQL/Supabase)

-- Enums
CREATE TYPE user_role AS ENUM ('user', 'admin');
CREATE TYPE liturgical_category AS ENUM ('entree', 'kyrie', 'gloria', 'alleluia', 'psaume', 'priere_universelle', 'offertoire', 'sanctus', 'agnus', 'communion', 'envoi', 'autre');
CREATE TYPE liturgical_time AS ENUM ('avent', 'noel', 'careme', 'paques', 'pentecote', 'ordinaire', 'tous');
CREATE TYPE difficulty_level AS ENUM ('facile', 'moyen', 'difficile');
CREATE TYPE partition_voice AS ENUM ('soprano', 'alto', 'tenor', 'basse', 'complete', 'piano', 'orgue');
CREATE TYPE audio_type AS ENUM ('complet', 'voix_separee', 'instrumental', 'accompagnement');
CREATE TYPE audio_voice AS ENUM ('soprano', 'alto', 'tenor', 'basse', 'toutes', 'aucune');
CREATE TYPE progress_status AS ENUM ('non_commence', 'en_cours', 'maitrise');

-- Table des utilisateurs
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table des chants
CREATE TABLE chants (
    id SERIAL PRIMARY KEY,
    titre VARCHAR(200) NOT NULL,
    compositeur VARCHAR(100),
    parolier VARCHAR(100),
    categorie liturgical_category NOT NULL,
    temps_liturgique liturgical_time DEFAULT 'tous',
    difficulte difficulty_level DEFAULT 'moyen',
    duree INT, -- Durée en secondes
    paroles TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table des partitions
CREATE TABLE partitions (
    id SERIAL PRIMARY KEY,
    chant_id INT NOT NULL REFERENCES chants(id) ON DELETE CASCADE,
    voix partition_voice NOT NULL,
    fichier_url VARCHAR(500) NOT NULL,
    fichier_nom VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table des fichiers audio
CREATE TABLE audio_files (
    id SERIAL PRIMARY KEY,
    chant_id INT NOT NULL REFERENCES chants(id) ON DELETE CASCADE,
    type audio_type NOT NULL,
    voix audio_voice DEFAULT 'aucune',
    fichier_url VARCHAR(500) NOT NULL,
    fichier_nom VARCHAR(255) NOT NULL,
    duree INT, -- Durée en secondes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table des playlists
CREATE TABLE playlists (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    nom VARCHAR(100) NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table d'association playlists-chants
CREATE TABLE playlist_chants (
    id SERIAL PRIMARY KEY,
    playlist_id INT NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
    chant_id INT NOT NULL REFERENCES chants(id) ON DELETE CASCADE,
    ordre INT NOT NULL DEFAULT 0,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_playlist_chant UNIQUE (playlist_id, chant_id)
);

-- Indices
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_chants_categorie ON chants(categorie);
CREATE INDEX idx_chants_temps_liturgique ON chants(temps_liturgique);
CREATE INDEX idx_partitions_chant_id ON partitions(chant_id);
CREATE INDEX idx_audio_files_chant_id ON audio_files(chant_id);
CREATE INDEX idx_playlists_user_id ON playlists(user_id);

-- GIN Index for search on titre
CREATE INDEX idx_chants_titre_search ON chants USING gin(to_tsvector('french', titre));
