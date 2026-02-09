# 🎵 MonChoeur - Plateforme d'Apprentissage de Chant Choral

**MonChoeur** est une application web moderne destinée à faciliter l'apprentissage des chants liturgiques. Elle permet aux choristes et chefs de chœur de centraliser, écouter et pratiquer leur répertoire.

## 🌟 Fonctionnalités Clés
- **Catalogue Liturgique** : Recherchez des chants par catégorie, temps liturgique ou difficulté.
- **Apprentissage Audio** : Écoutez les différentes voix pour parfaire votre pratique.
- **Playlists Personnalisées** : Créez vos propres listes pour préparer vos répétition et messes.
- **Accès Sécurisé** : Espace personnel protégé pour chaque utilisateur.

## 🛠️ Stack Technique
- **Frontend** : JavaScript Vanilla (Architecture SPA), CSS3 (Design System dédié).
- **Backend** : Node.js / Express.js.
- **Base de Données** : MySQL (Prêt pour le Cloud).
- **Authentification** : JWT (Json Web Tokens) & Bcrypt.

## 🚀 Déploiement & Cloud

Le projet est conçu pour être déployé sur **Vercel** avec une base de données managée.

### 1. Backend (Serverless)
Configuré pour fonctionner comme des fonctions Cloud Vercel via `vercel.json`.

### 2. Base de Données
Compatible avec tout fournisseur MySQL Cloud (ex: **Aiven**, **PlanetScale**).
Le schéma est disponible dans `database/schema.sql`.

### 3. Stockage Média
L'intégration de **Cloudinary** est recommandée pour servir les partitions et fichiers audio de manière persistante.

## 📖 Guides
- [Plan d'Implémentation](.gemini/antigravity/brain/56780723-5849-45be-8d6d-509cedf64e21/implementation_plan.md)
- [Guide de Déploiement Vercel](.gemini/antigravity/brain/56780723-5849-45be-8d6d-509cedf64e21/deployment_guide.md)
- [Walkthrough de l'API](.gemini/antigravity/brain/56780723-5849-45be-8d6d-509cedf64e21/walkthrough.md)

## 💻 Installation Locale
1. Clonez le dépôt.
2. Configurez votre `.env` backend (voir `.env.example`).
3. Installez les dépendances : `npm install` dans frontend et backend.
4. Lancez le backend : `cd backend && npm run dev`
5. Lancez le frontend : `cd frontend && npm start`

---
© 2026 MonChoeur Project - En développement actif.
# MonChoeur
# MonChoeur
# MonChoeur
