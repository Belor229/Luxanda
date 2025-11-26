# ✅ Checklist de Déploiement Vercel

Utilisez cette checklist pour vous assurer que tout est correctement configuré avant et après le déploiement.

## 📦 Pré-Déploiement

### Code & Repository
- [ ] Code poussé sur GitHub/GitLab/Bitbucket
- [ ] Toutes les erreurs TypeScript corrigées
- [ ] Tous les tests passent localement
- [ ] `.vercelignore` configuré (exclut `backend/`, `node_modules/`, etc.)
- [ ] `vercel.json` configuré correctement
- [ ] `package.json` contient le script `postinstall: prisma generate`

### Configuration Locale
- [ ] `next.config.js` optimisé pour Vercel
- [ ] `prisma/schema.prisma` à la racine du projet
- [ ] Tous les fichiers nécessaires sont commités

## 🔐 Variables d'Environnement

### Supabase (OBLIGATOIRE)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` configurée
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` configurée

### Base de Données
- [ ] `DATABASE_URL` configurée (si vous utilisez Prisma directement)

### Optionnelles
- [ ] `NODE_ENV=production`
- [ ] `FRONTEND_URL` (URL de votre site Vercel)
- [ ] Variables SMTP configurées (si nécessaire)
- [ ] Variables de paiement configurées (si nécessaire)

## 🗄️ Base de Données Supabase

### Tables
- [ ] Table `users` créée
- [ ] Table `user_profiles` créée
- [ ] Table `contact_messages` créée
- [ ] Toutes les colonnes nécessaires présentes
- [ ] Index créés pour les performances

### Sécurité (RLS)
- [ ] RLS activé sur toutes les tables
- [ ] Policies configurées pour `users`
- [ ] Policies configurées pour `user_profiles`
- [ ] Policies configurées pour `contact_messages`

### Triggers
- [ ] Trigger `update_updated_at_column` créé
- [ ] Triggers appliqués aux tables nécessaires

## 🚀 Déploiement Vercel

### Configuration Projet
- [ ] Projet importé dans Vercel
- [ ] Framework détecté : Next.js
- [ ] Build Command : `prisma generate && next build`
- [ ] Output Directory : `.next` (par défaut)
- [ ] Node.js Version : 18.x ou 20.x

### Build
- [ ] Build réussi sans erreurs
- [ ] Prisma Client généré correctement
- [ ] Aucune erreur TypeScript
- [ ] Tous les assets compilés

## ✅ Post-Déploiement

### Tests Fonctionnels
- [ ] Site accessible sur l'URL Vercel
- [ ] Page d'accueil charge correctement
- [ ] Navigation fonctionne
- [ ] Images se chargent correctement

### Authentification
- [ ] Page `/login` accessible
- [ ] Connexion fonctionne
- [ ] Page `/register` accessible
- [ ] Inscription fonctionne
- [ ] Redirection après connexion fonctionne selon le rôle

### Routes Protégées
- [ ] `/admin` redirige si non authentifié
- [ ] `/admin` accessible pour les admins
- [ ] `/vendor/dashboard` redirige si non authentifié
- [ ] `/vendor/dashboard` accessible pour les vendeurs

### API Routes
- [ ] `/api/test-supabase` retourne success
- [ ] `/api/test-db` retourne success (si applicable)
- [ ] `/api/auth/login` fonctionne
- [ ] `/api/auth/register` fonctionne
- [ ] `/api/contact` fonctionne

### Logs & Monitoring
- [ ] Logs Vercel accessibles
- [ ] Aucune erreur dans les logs
- [ ] Performance acceptable (< 3s pour le premier chargement)

## 🔧 Optimisations (Optionnel)

### Performance
- [ ] Images optimisées
- [ ] Code splitting activé
- [ ] Cache configuré correctement

### SEO
- [ ] Meta tags configurés
- [ ] Sitemap généré (si applicable)
- [ ] Robots.txt configuré (si applicable)

### Domaine
- [ ] Domaine personnalisé configuré (si nécessaire)
- [ ] SSL/HTTPS activé automatiquement
- [ ] Redirections configurées

## 🐛 Résolution de Problèmes

Si quelque chose ne fonctionne pas :

1. **Vérifiez les logs Vercel**
   - Dashboard → Deployments → [Votre déploiement] → Functions

2. **Vérifiez les variables d'environnement**
   - Settings → Environment Variables
   - Assurez-vous qu'elles sont définies pour "Production"

3. **Testez les routes API**
   - Utilisez Postman ou curl pour tester les endpoints

4. **Vérifiez Supabase**
   - Dashboard → Table Editor (vérifier les tables)
   - Dashboard → Authentication → Policies (vérifier RLS)
   - Dashboard → SQL Editor (tester les requêtes)

5. **Vérifiez Prisma**
   - Le client est généré dans `.next/server/chunks/`
   - Les types TypeScript sont corrects

## 📝 Notes

- Les déploiements automatiques sont activés par défaut
- Chaque push sur `main` déclenche un déploiement de production
- Les branches créent des déploiements de prévisualisation
- Les Pull Requests créent des déploiements de prévisualisation

## 🔄 Mises à Jour Futures

Pour mettre à jour le site :
1. Faites vos modifications localement
2. Testez en local
3. Committez et pushez sur GitHub
4. Vercel déploiera automatiquement

---

**Date de dernière mise à jour** : $(date)
**Version** : 1.0.0

