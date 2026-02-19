# Luxanda - Marketplace Bénin

Plateforme de marketplace connectant vendeurs et acheteurs au Bénin.

## 🚀 Stack Technique

- **Frontend**: Next.js 14 (App Router)
- **Backend**: Next.js API Routes + Express (backend/)
- **Base de données**: PostgreSQL (via Prisma)
- **Authentification**: Supabase Auth
- **Stockage**: Supabase Storage
- **Paiement**: Kkiapay (CinetPay à venir)
- **Déploiement**: Vercel
- **Domaine**: luxanda.bj (Hodi.host)

## 📋 Prérequis

- Node.js 18+
- PostgreSQL
- Compte Supabase
- Compte Kkiapay

## 🛠️ Installation

### 1. Cloner le projet

```bash
git clone <repository-url>
cd Luxanda
```

### 2. Installer les dépendances

```bash
npm install
cd backend && npm install && cd ..
```

### 3. Configuration de l'environnement

Copiez `env.example` vers `.env.local` et remplissez les variables :

```bash
cp env.example .env.local
```

Variables essentielles :
- `DATABASE_URL` : URL de connexion PostgreSQL
- `NEXT_PUBLIC_SUPABASE_URL` : URL de votre projet Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` : Clé anonyme Supabase
- `KKIAPAY_PUBLIC_KEY` : Clé publique Kkiapay
- `KKIAPAY_PRIVATE_KEY` : Clé privée Kkiapay

### 4. Configuration de la base de données

```bash
# Générer le client Prisma
npx prisma generate

# Appliquer les migrations (si migrations existantes)
npx prisma migrate dev

# Ou créer la base depuis le schéma
npx prisma db push
```

### 5. Créer le compte admin initial

Le mot de passe admin par défaut est : `Momadmin@`

Pour créer le compte admin :
1. Inscrivez-vous via `/register` avec un email admin
2. Modifiez manuellement le rôle en `ADMIN` dans la base de données :
```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'votre-email@admin.com';
```

Ou utilisez Prisma Studio :
```bash
npx prisma studio
```

### 6. Lancer le projet

```bash
# Développement
npm run dev

# Backend séparé (optionnel)
npm run backend
```

Le site sera accessible sur `http://localhost:3000`

## 📁 Structure du Projet

```
Luxanda/
├── src/
│   ├── app/              # Pages Next.js (App Router)
│   │   ├── admin/        # Panel administrateur
│   │   ├── vendor/       # Espace vendeur
│   │   ├── api/          # API Routes
│   │   └── ...
│   ├── components/       # Composants React réutilisables
│   ├── lib/              # Utilitaires (Prisma, Supabase)
│   └── store/           # State management (Zustand)
├── backend/              # API Express (optionnel)
├── prisma/
│   └── schema.prisma    # Schéma de base de données
└── public/              # Fichiers statiques
```

## 🔐 Rôles Utilisateurs

- **USER** : Acheteur standard
- **VENDOR** : Vendeur (nécessite abonnement)
- **ADMIN** : Administrateur

## 🎯 Fonctionnalités MVP

### Visiteur
- ✅ Explorer les produits et boutiques
- ✅ Accéder aux pages institutionnelles
- ✅ Contacter les vendeurs via WhatsApp

### Acheteur (USER)
- ✅ Inscription / Connexion
- ✅ Voir et gérer le panier
- ✅ Gérer son profil (`/profile`)
- ✅ Redirection vers `/cart` après connexion

### Vendeur (VENDOR)
- ✅ Inscription / Connexion
- ✅ Dashboard vendeur (`/vendor/dashboard`)
- ✅ Créer et gérer sa boutique
- ✅ CRUD produits avec upload d'images
- ✅ Voir statut d'abonnement (2 mois gratuits au lancement)

### Admin
- ✅ Panel admin sécurisé (`/admin`)
- ✅ Gérer vendeurs (approuver/suspendre/supprimer)
- ✅ Gérer produits (modérer/supprimer)
- ✅ Voir statistiques

## 💳 Abonnements Vendeurs

### Plans disponibles
- **Starter** : 5 000 FCFA/mois
- **Pro** : 15 000 FCFA/mois
- **Premium** : 30 000 FCFA/mois

### Période d'essai
- **2 mois gratuits** pour tous les nouveaux vendeurs
- Création automatique lors de la création de la boutique
- Affichage du statut dans le dashboard vendeur

## 📄 Pages Institutionnelles

Toutes accessibles via le footer :
- `/terms` - CGU
- `/privacy` - Politique de confidentialité
- `/legal` - Mentions légales
- `/charte-vendeur` - Charte vendeur
- `/politique-anti-fraude` - Politique anti-fraude
- `/faq` - FAQ
- `/contact` - Contact

## 🔒 Sécurité Supabase (RLS)

⚠️ **Important** : Activer Row Level Security (RLS) sur toutes les tables sensibles dans Supabase.

Tables à sécuriser :
- `users`
- `vendors`
- `products`
- `subscriptions`
- `orders`

Exemple de politique RLS pour les vendeurs :
```sql
-- Les vendeurs ne voient que leurs propres données
CREATE POLICY "Vendors can view own data"
ON vendors FOR SELECT
USING (auth.uid() = user_id);
```

## 🚢 Déploiement Vercel

### Variables d'environnement Vercel

Ajoutez toutes les variables de `.env.local` dans les paramètres Vercel :
- `DATABASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `KKIAPAY_PUBLIC_KEY`
- `KKIAPAY_PRIVATE_KEY`
- etc.

### Build

```bash
npm run build
```

## 📝 Commandes Utiles

```bash
# Développement
npm run dev

# Build production
npm run build

# Lancer production
npm start

# Prisma
npx prisma studio          # Interface graphique DB
npx prisma generate        # Générer client Prisma
npx prisma migrate dev     # Créer migration
npx prisma db push         # Pousser schéma vers DB

# Backend Express (optionnel)
npm run backend
```

## 🐛 Dépannage

### Erreur 404 sur `/profile`
✅ Corrigé : La route `/profile` redirige vers `/users/profile`

### Redirection après login
✅ Corrigé : Redirection automatique selon le rôle :
- Admin → `/admin`
- Vendeur → `/vendor/dashboard`
- Acheteur → `/cart`

### Erreurs Supabase
- Vérifier que les variables d'environnement sont correctes
- Vérifier que RLS est configuré correctement
- Vérifier les permissions du bucket Storage

## 📞 Support

- Email : luxanda@yahoo.com
- Téléphone : +229 01 41 75 75 59
- Site : https://luxanda.vercel.app

## 📄 Licence

Propriétaire - Tous droits réservés © 2025 Luxanda.bj

---

**Note** : Ce projet est en phase MVP. Certaines fonctionnalités avancées (gestion de commandes, livraison intégrée, messagerie interne) sont prévues pour les versions futures.

