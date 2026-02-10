# 🎵 MonChoeur - Plateforme de Chants Choraux

MonChoeur est une Single Page Application (SPA) moderne permettant de gérer et d'apprendre des chants choraux pour la liturgie.

## 🚀 Fonctionnalités Termineés

- **Catalogue** : Recherche et filtrage des chants par catégorie et temps liturgique.
- **Détails** : Paroles complètes, affichage et téléchargement de partitions PDF.
- **Lecteur Audio** : Lecteur persistant permettant d'écouter les différentes voix (Cloudinary).
- **Playlists** : Création et gestion de listes de lecture personnalisées.
- **Administration** : Dashboard complet pour ajouter/modifier des chants avec upload de fichiers.
- **Notifications** : Système de toast notifications moderne.

## 🛠️ Installation

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env
# Remplissez vos accès MySQL et Cloudinary dans le .env
npm run dev
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```
Le projet sera accessible sur `http://localhost:3001`.

## 🚀 Déploiement sur Vercel

Le projet est configuré pour être déployé sur Vercel.

### 1. Importer les variables d'environnement (.env)

Pour importer vos clés rapidement :
```bash
# Installez la CLI
npm install -g vercel

# Reliez le projet
vercel link

# Ajoutez vos variables
vercel env add SUPABASE_URL < .env
vercel env add SUPABASE_ANON_KEY < .env
vercel env add CLOUDINARY_CLOUD_NAME < .env
vercel env add CLOUDINARY_API_KEY < .env
vercel env add CLOUDINARY_API_SECRET < .env
vercel env add JWT_SECRET < .env
```

### 2. Déployer
```bash
vercel --prod
```

## ☁️ Configuration Cloudinary

Pour que l'upload fonctionne, vous devez créer un compte gratuit sur [Cloudinary](https://cloudinary.com/) et configurer les variables suivantes dans le `.env` du backend :
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

- **Frontend** : Vanilla JS (SPA Router), CSS3.
- **Backend** : Node.js, Express.
- **Base de données** : Supabase (PostgreSQL SDK).
- **Stockage** : Cloudinary (Media).
