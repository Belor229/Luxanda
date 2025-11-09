# 🛒 LUXANDA - Marketplace Africaine

Luxanda est une marketplace moderne qui connecte vendeurs et acheteurs en toute confiance, spécialement conçue pour le marché africain.

## 🚀 Fonctionnalités

### Pour les Acheteurs
- ✅ Navigation intuitive des produits
- ✅ Recherche et filtres avancés
- ✅ Contact direct avec les vendeurs via WhatsApp
- ✅ Programme de récompenses et points de fidélité
- ✅ Interface responsive et moderne

### Pour les Vendeurs
- ✅ Espace vendeur personnalisé
- ✅ Gestion des produits et stocks
- ✅ Système d'abonnement flexible
- ✅ Analytics et statistiques de vente
- ✅ Programme d'affiliation

### Administration
- ✅ Panneau d'administration complet
- ✅ Gestion des utilisateurs et produits
- ✅ Suivi des abonnements et revenus
- ✅ Support client intégré

## 🛠️ Stack Technique

### Frontend
- **Next.js 14** - Framework React avec App Router
- **TypeScript** - Typage statique
- **Tailwind CSS** - Framework CSS utilitaire
- **Lucide React** - Icônes modernes

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **TypeScript** - Typage statique
- **MySQL/MariaDB** - Base de données relationnelle
- **JWT** - Authentification sécurisée
- **bcryptjs** - Hachage des mots de passe

### Paiements
- **MTN Money** - Paiement mobile (actuel)
- **Kkiapay** - Paiement en ligne (futur)

## 📦 Installation

### Prérequis
- Node.js 18+
- MySQL/MariaDB
- npm ou yarn

### 1. Cloner le projet
```bash
git clone https://github.com/votre-username/luxanda.git
cd luxanda
```

### 2. Installer les dépendances
```bash
# Frontend
npm install

# Backend
cd backend
npm install
cd ..
```

### 3. Configuration de la base de données
```bash
# Créer la base de données
mysql -u root -p
CREATE DATABASE luxanda_db;
```

### 4. Configuration des variables d'environnement
```bash
# Copier le fichier d'exemple
cp env.example .env

# Éditer le fichier .env avec vos paramètres
nano .env
```

### 5. Démarrer l'application
```bash
# Terminal 1 - Backend
npm run backend

# Terminal 2 - Frontend
npm run dev
```

L'application sera accessible sur :
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 🔧 Configuration

### Variables d'environnement (.env)
```env
# Base de données
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_NAME=luxanda_db

# JWT
JWT_SECRET=LuxandaSecretKey2025

# Admin
ADMIN_PASSWORD=Momadmin@

# Serveur
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Email (optionnel)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre@email.com
SMTP_PASS=votre_mot_de_passe

# Paiements
MTN_MONEY_NUMBER=0153932672
MTN_MONEY_NAME=DJAGBA Vioutou Odirick Belor
```

## 📱 Pages Principales

### Public
- `/` - Page d'accueil
- `/products` - Catalogue des produits
- `/login` - Connexion
- `/register` - Inscription
- `/subscriptions` - Plans d'abonnement
- `/contact` - Contact

### Vendeurs
- `/vendor/dashboard` - Tableau de bord vendeur
- `/vendor/products` - Gestion des produits
- `/vendor/subscriptions` - Gestion des abonnements

### Administration
- `/admin` - Panneau d'administration

## 🎨 Design System

### Couleurs
- **Bleu principal**: #004AAD
- **Orange principal**: #FF6B35
- **Gris clair**: #F9F9F9
- **Gris foncé**: #333333

### Typographie
- **Titres**: Poppins Semi-Bold
- **Texte**: Inter Regular

## 🔐 Sécurité

- Authentification JWT
- Hachage des mots de passe avec bcrypt
- Validation des données côté serveur
- Protection CSRF
- Rate limiting
- Headers de sécurité

## 📊 Fonctionnalités Avancées

### Système d'Abonnement
- **Starter**: 5 000 FCFA - 30 jours
- **Pro**: 15 000 FCFA - 30 jours
- **Premium**: 30 000 FCFA - 30 jours

### Programme d'Affiliation
- 30% sur le premier abonnement du filleul
- 10% sur les renouvellements suivants

### Programme de Récompenses
- 10 points = coupon de 5% de réduction
- Points attribués à chaque achat

## 🚀 Déploiement

### Vercel (Frontend)
```bash
npm run build
vercel --prod
```

### Hostinger (Production)
1. Configurer la base de données MariaDB
2. Uploader les fichiers via FTP
3. Configurer les variables d'environnement
4. Démarrer l'application

## 📈 Roadmap

### Phase 1 (Actuelle)
- ✅ Interface utilisateur moderne
- ✅ Système d'authentification
- ✅ Gestion des produits
- ✅ Abonnements vendeurs
- ✅ Panneau d'administration

### Phase 2 (À venir)
- 🔄 Intégration CinetPay
- 🔄 Chat en temps réel
- 🔄 Notifications push
- 🔄 Application mobile
- 🔄 API publique

### Phase 3 (Futur)
- 🔄 IA pour recommandations
- 🔄 Marketplace multi-pays
- 🔄 Système de livraison
- 🔄 Analytics avancés

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Support

- **Email**: luxanda@yahoo.com
- **Téléphone**: +229 01 93 38 95 64
- **WhatsApp**: +229 01 93 38 95 64

## 🙏 Remerciements

- Équipe de développement Luxanda
- Communauté open source
- Partenaires et bêta-testeurs

---

**Luxanda** - Le marché en ligne qui inspire confiance 🚀
