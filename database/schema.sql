-- MonChoeur Database Schema
-- Base de données pour la plateforme de chants choraux

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des chants
CREATE TABLE IF NOT EXISTS chants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titre VARCHAR(200) NOT NULL,
    compositeur VARCHAR(100),
    parolier VARCHAR(100),
    categorie ENUM('entree', 'kyrie', 'gloria', 'alleluia', 'offertoire', 'sanctus', 'agnus', 'communion', 'envoi', 'autre') NOT NULL,
    temps_liturgique ENUM('avent', 'noel', 'careme', 'paques', 'pentecote', 'ordinaire', 'tous') DEFAULT 'tous',
    difficulte ENUM('facile', 'moyen', 'difficile') DEFAULT 'moyen',
    duree INT COMMENT 'Durée en secondes',
    paroles TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_categorie (categorie),
    INDEX idx_temps_liturgique (temps_liturgique),
    INDEX idx_difficulte (difficulte),
    FULLTEXT idx_titre (titre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des partitions
CREATE TABLE IF NOT EXISTS partitions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    chant_id INT NOT NULL,
    voix ENUM('soprano', 'alto', 'tenor', 'basse', 'complete', 'piano', 'orgue') NOT NULL,
    fichier_url VARCHAR(500) NOT NULL,
    fichier_nom VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chant_id) REFERENCES chants(id) ON DELETE CASCADE,
    INDEX idx_chant_id (chant_id),
    INDEX idx_voix (voix)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des fichiers audio
CREATE TABLE IF NOT EXISTS audio_files (
    id INT AUTO_INCREMENT PRIMARY KEY,
    chant_id INT NOT NULL,
    type ENUM('complet', 'voix_separee', 'instrumental', 'accompagnement') NOT NULL,
    voix ENUM('soprano', 'alto', 'tenor', 'basse', 'toutes', 'aucune') DEFAULT 'aucune',
    fichier_url VARCHAR(500) NOT NULL,
    fichier_nom VARCHAR(255) NOT NULL,
    duree INT COMMENT 'Durée en secondes',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chant_id) REFERENCES chants(id) ON DELETE CASCADE,
    INDEX idx_chant_id (chant_id),
    INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des playlists
CREATE TABLE IF NOT EXISTS playlists (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    nom VARCHAR(100) NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_public (is_public)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table d'association playlists-chants
CREATE TABLE IF NOT EXISTS playlist_chants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    playlist_id INT NOT NULL,
    chant_id INT NOT NULL,
    ordre INT NOT NULL DEFAULT 0,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE,
    FOREIGN KEY (chant_id) REFERENCES chants(id) ON DELETE CASCADE,
    UNIQUE KEY unique_playlist_chant (playlist_id, chant_id),
    INDEX idx_playlist_id (playlist_id),
    INDEX idx_chant_id (chant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table de progression (optionnel - pour fonctionnalités avancées)
CREATE TABLE IF NOT EXISTS user_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    chant_id INT NOT NULL,
    status ENUM('non_commence', 'en_cours', 'maitrise') DEFAULT 'non_commence',
    derniere_pratique TIMESTAMP NULL,
    nombre_ecoutes INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (chant_id) REFERENCES chants(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_chant (user_id, chant_id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des commentaires (optionnel - pour fonctionnalités communautaires)
CREATE TABLE IF NOT EXISTS commentaires (
    id INT AUTO_INCREMENT PRIMARY KEY,
    chant_id INT NOT NULL,
    user_id INT NOT NULL,
    contenu TEXT NOT NULL,
    note INT CHECK (note >= 1 AND note <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (chant_id) REFERENCES chants(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_chant_id (chant_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
