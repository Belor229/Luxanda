# 🚀 Guide de Démarrage Rapide - LUXANDA

## ⚡ Démarrage Express (5 minutes)

### 1. Prérequis
- Node.js 18+ installé
- MySQL/MariaDB installé et démarré

### 2. Installation
```bash
# Installer les dépendances
npm install
cd backend && npm install && cd ..

# Copier la configuration
cp env.example .env
```

### 3. Configuration Base de Données
```sql
-- Créer la base de données
CREATE DATABASE luxanda_db;
```

### 4. Démarrer l'Application

#### Windows
```bash
# Double-cliquer sur start.bat
# OU
start.bat
```

#### Linux/Mac
```bash
# Rendre le script exécutable
chmod +x start.sh

# Démarrer
./start.sh
```

#### Manuel
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
npm run dev
```

### 5. Accès
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Admin**: http://localhost:3000/admin (mot de passe: Momadmin@)

## 🔧 Configuration Rapide

### Variables d'environnement (.env)
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_NAME=luxanda_db
JWT_SECRET=LuxandaSecretKey2025
ADMIN_PASSWORD=Momadmin@
PORT=5000
FRONTEND_URL=http://localhost:3000
```

## 📱 Comptes de Test

### Administrateur
- **Email**: admin@luxanda.bj
- **Mot de passe**: Momadmin@

### Vendeur
- **Email**: vendeur@luxanda.bj
- **Mot de passe**: vendeur123

### Acheteur
- **Email**: acheteur@luxanda.bj
- **Mot de passe**: acheteur123

## 🎯 Fonctionnalités Principales

### ✅ Implémentées
- Page d'accueil moderne
- Système d'authentification complet
- Catalogue des produits avec filtres
- Système d'abonnement vendeur
- Panneau d'administration
- Intégration WhatsApp
- Design responsive

### 🔄 En cours
- Espace vendeur complet
- Système d'affiliation
- Gestion des commandes

## 🐛 Résolution de Problèmes

### Erreur de connexion à la base de données
```bash
# Vérifier que MySQL est démarré
sudo service mysql start  # Linux
brew services start mysql  # Mac
net start mysql  # Windows
```

### Port déjà utilisé
```bash
# Changer le port dans .env
PORT=5001
```

### Erreur de dépendances
```bash
# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install
```

## 📞 Support

- **Email**: luxanda@yahoo.com
- **WhatsApp**: +229 01 93 38 95 64

---

**Luxanda** - Le marché en ligne qui inspire confiance 🚀
