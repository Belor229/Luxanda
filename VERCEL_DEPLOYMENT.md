# Guide de Déploiement sur Vercel

Ce guide vous explique comment déployer votre application Luxanda sur Vercel de manière optimale.

## 📋 Prérequis

1. Un compte Vercel (gratuit)
2. Un compte Supabase (pour la base de données)
3. Un compte GitHub/GitLab/Bitbucket (pour le repository)

## 🚀 Étapes de Déploiement

### 1. Préparation du Repository

Assurez-vous que votre code est poussé sur GitHub/GitLab/Bitbucket :

```bash
git add .
git commit -m "Préparation pour déploiement Vercel"
git push origin main
```

### 2. Configuration sur Vercel

#### A. Importer le Projet

1. Allez sur [vercel.com](https://vercel.com)
2. Cliquez sur **"Add New Project"**
3. Importez votre repository GitHub/GitLab/Bitbucket
4. Vercel détectera automatiquement Next.js

#### B. Configuration du Build

Vercel utilisera automatiquement :
- **Framework Preset**: Next.js
- **Build Command**: `prisma generate && next build` (défini dans `package.json`)
- **Output Directory**: `.next` (par défaut)
- **Install Command**: `npm install`

### 3. Variables d'Environnement

Configurez les variables d'environnement suivantes dans **Settings → Environment Variables** :

#### Variables Supabase (OBLIGATOIRES)
```
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-clé-anon
```

#### Variables Base de Données (si vous utilisez Prisma directement)
```
DATABASE_URL=postgresql://user:password@host:5432/dbname?schema=public
```

#### Variables Optionnelles
```
NODE_ENV=production
FRONTEND_URL=https://votre-domaine.vercel.app
BACKEND_URL=https://votre-backend.vercel.app (si séparé)
```

#### Variables Email (SMTP)
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASS=votre-mot-de-passe-app
```

#### Variables Payment (Kkiapay)
```
KKIAPAY_PUBLIC_KEY=votre-clé-publique
KKIAPAY_PRIVATE_KEY=votre-clé-privée
KKIAPAY_SANDBOX=false
```

### 4. Configuration Prisma

Le fichier `vercel.json` est déjà configuré pour générer le client Prisma avant le build.

**Important** : Assurez-vous que :
- Le schéma Prisma est dans `prisma/schema.prisma` à la racine
- Le script `postinstall` dans `package.json` génère le client Prisma

### 5. Configuration Supabase

#### A. Créer les Tables dans Supabase

Exécutez ces commandes SQL dans l'éditeur SQL de Supabase :

```sql
-- Table users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  password TEXT,
  role TEXT DEFAULT 'USER',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table user_profiles
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  avatar TEXT,
  date_of_birth DATE,
  gender TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Table contact_messages
CREATE TABLE IF NOT EXISTS contact_messages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'NEW',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at);
```

#### B. Configurer les RLS (Row Level Security)

Dans Supabase Dashboard → Authentication → Policies :

1. **Table `users`** : Permettre la lecture pour les utilisateurs authentifiés
2. **Table `user_profiles`** : Permettre la lecture/écriture pour le propriétaire
3. **Table `contact_messages`** : Permettre l'insertion pour tous, la lecture pour les admins

### 6. Déploiement

1. Cliquez sur **"Deploy"** dans Vercel
2. Attendez la fin du build (environ 2-5 minutes)
3. Votre site sera disponible sur `https://votre-projet.vercel.app`

### 7. Vérification Post-Déploiement

#### A. Tester l'Authentification
- Visitez `/login` et testez la connexion
- Visitez `/register` et testez l'inscription

#### B. Tester les Routes API
- `/api/test-supabase` - Test de connexion Supabase
- `/api/test-db` - Test de connexion base de données

#### C. Vérifier les Logs
- Allez dans **Vercel Dashboard → Deployments → [Votre déploiement] → Functions**
- Vérifiez les logs pour détecter d'éventuelles erreurs

## 🔧 Configuration Avancée

### Domaine Personnalisé

1. Allez dans **Settings → Domains**
2. Ajoutez votre domaine
3. Suivez les instructions DNS

### Variables d'Environnement par Environnement

Vous pouvez définir des variables différentes pour :
- **Production** : Variables pour la production
- **Preview** : Variables pour les branches de développement
- **Development** : Variables pour le développement local

### Optimisation des Performances

Le fichier `next.config.js` est déjà configuré avec :
- Optimisation des images
- Configuration des domaines distants

## 🐛 Résolution de Problèmes

### Erreur : "Prisma Client not generated"
**Solution** : Vérifiez que `postinstall` est dans `package.json` et que `prisma generate` s'exécute

### Erreur : "Database connection failed"
**Solution** : 
- Vérifiez que `DATABASE_URL` est correctement configurée
- Vérifiez que la base de données accepte les connexions depuis Vercel

### Erreur : "Supabase authentication failed"
**Solution** :
- Vérifiez `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Vérifiez que les tables existent dans Supabase

### Build échoue
**Solution** :
- Vérifiez les logs de build dans Vercel
- Assurez-vous que toutes les dépendances sont dans `package.json`
- Vérifiez que TypeScript compile sans erreurs

## 📝 Checklist de Déploiement

- [ ] Code poussé sur GitHub/GitLab/Bitbucket
- [ ] Projet importé dans Vercel
- [ ] Variables d'environnement configurées
- [ ] Tables Supabase créées
- [ ] RLS configuré dans Supabase
- [ ] Build réussi sur Vercel
- [ ] Authentification testée
- [ ] Routes API testées
- [ ] Domaine personnalisé configuré (optionnel)

## 🔄 Déploiements Automatiques

Vercel déploie automatiquement :
- **Production** : À chaque push sur `main`
- **Preview** : À chaque push sur les autres branches
- **Pull Requests** : Un déploiement de prévisualisation pour chaque PR

## 📚 Ressources

- [Documentation Vercel](https://vercel.com/docs)
- [Documentation Next.js](https://nextjs.org/docs)
- [Documentation Supabase](https://supabase.com/docs)
- [Documentation Prisma](https://www.prisma.io/docs)

---

**Note** : Ce guide est spécifique à votre projet Luxanda. Adaptez-le selon vos besoins.

