# Audit technique — Alignement CDC V4 & opérations à votre charge

**Document de référence :** `Luxanda_CDC_V4_Final (Réparé).pdf` (MVP marketplace visibilité + confiance, abonnement vendeur, Kkiapay, pas de transaction directe au MVP).

---

## 1. Correctifs réalisés dans le code (résumé)

| Zone | Problème | Correction |
|------|-----------|--------------|
| **Inscription vendeur** | Rôle `USER` en base alors que le compte est vendeur ; pas de ligne fiable `users` / `user_profiles` côté Prisma | `upsert` Prisma sur `User` + `UserProfile` juste après `signUp`, avec `Role.VENDOR` / `Role.USER` |
| **Panneau admin / liste vendeurs** | Accès admin par **Prisma seul** : si la ligne `users` n’était pas alignée, **403** silencieux côté front (liste vide) | `assertAdmin()` : vérifie **Supabase `public.users.role`** puis **Prisma** |
| **Layout `/admin`** | Même cause | Vérification admin **Supabase puis Prisma** |
| **Abonnements (actions admin)** | `updateMany` avec `status: undefined` | Mise à jour des abonnements **uniquement** si `subscriptionStatus` est défini |
| **Produits admin** | Page appelait `/api/products` (catalogue **ACTIVE** uniquement) | Liste via **`/api/admin/products`** (tous statuts) + recherche |
| **Mise en vedette (CDC)** | Pas d’action dédiée | **`PATCH /api/admin/products/[id]/featured`** + bouton dans `/admin/products` |
| **Profil `/api/users/me`** | Badge « USER » pour un vendeur | Si une ligne `Vendor` existe, exposition **`role: VENDOR`** (+ `vendor_status`) |
| **UI admin vendeurs** | Erreurs API invisibles ; glitch possible z-index filtre | `credentials: 'include'`, message d’erreur, `isolate` / `z-10` sur le filtre |

---

## 2. Ce que vous devez vérifier / faire (obligatoire en production)

### 2.1 Base de données unique (cause n°1 des listes vides)

- Sur **Vercel**, la variable **`DATABASE_URL`** (et **`DIRECT_URL`** si utilisée par Prisma) doit pointer vers **le même PostgreSQL que Supabase** (chaîne fournie dans Supabase : *Settings → Database*).
- Si `DATABASE_URL` est absente, incorrecte, ou pointe vers une autre instance, **Prisma ne verra pas les vendeurs** créés côté prod.

### 2.2 Variables d’environnement Vercel (checklist)

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `DATABASE_URL` = URL Postgres Supabase (pooler ou direct selon doc Prisma + Supabase)
- `DIRECT_URL` (recommandé pour migrations Prisma si pooler)
- Optionnel mais utile : `SUPABASE_SERVICE_ROLE_KEY` (opérations serveur sensibles — ne jamais exposer au client)

### 2.3 Anciens comptes vendeurs / rôles

- Exécuter dans l’éditeur SQL Supabase le script **`scripts/backfill-unconfirmed-vendors.sql`** (déjà fourni) pour :
  - normaliser les statuts ;
  - créer les lignes `vendors` / abonnements manquants pour d’anciens comptes.
- Pour les utilisateurs déjà inscrits **avant** la synchro `User` + `UserProfile`, lancer une requête SQL de correction du rôle si besoin, par exemple :

```sql
UPDATE public.users u
SET role = 'VENDOR'
FROM public.vendors v
WHERE v.user_id = u.id
  AND u.role IS DISTINCT FROM 'VENDOR'::public."Role";
```

*(Adapter le nom de schéma / enum si votre migration diffère.)*

### 2.4 Bucket & politiques storage (pièces d’identité)

- Le bucket **`identity-documents`** doit être **public** en lecture (ou URLs signées) pour que l’admin affiche les images dans le modal KYC.
- Politiques RLS cohérentes avec l’upload à l’inscription.

### 2.5 Email confirmation Supabase

- Si « Confirm email » est activé, un vendeur peut être créé dans Auth **sans session** immédiate : le front renvoie vers `/login?registered=1`. C’est attendu.

---

## 3. Cartographie CDC V4 ↔ implémentation actuelle

| Exigence CDC (extraits) | Statut |
|-------------------------|--------|
| Marketplace catalogue + recherche | Présent (`/products`, API) |
| Validation vendeurs + badge vérifié | Flux statuts + actions admin (`/admin/vendors`) |
| Abonnements Kkiapay | Routes subscriptions + webhooks (à valider en recette paiement) |
| Modération produits | Liste admin + statut + **vedette** |
| Pas de commande / livraison au MVP | À respecter côté produit (CDC) — le code peut encore contenir des écrans « commandes » historiques ; à traiter si vous voulez un MVP strict |

---

## 4. Tests recommandés avant « go live »

1. Inscription **vendeur** → vérifier dans Supabase : `users.role = VENDOR`, ligne `vendors` **PENDING**, fichiers en storage.
2. Connexion admin → `/admin/vendors` : la ligne apparaît (filtre « Nouvelles inscriptions »).
3. Valider inscription → vendeur voit **APPROVED_REGISTRATION** puis flux activation.
4. `/admin/products` : tous les statuts visibles ; bascule **vedette** OK.
5. Profil vendeur (mobile) : badge **VENDOR** après correction SQL + nouvelles inscriptions.

---

## 5. Fichiers clés modifiés / ajoutés (dernière passe)

- `src/app/api/auth/register/route.ts` — sync `User` / `UserProfile`
- `src/lib/admin-auth.ts` — contrôle admin unifié
- `src/app/api/admin/vendors/route.ts` — `assertAdmin`, fix abonnements
- `src/app/(admin)/admin/layout.tsx` — admin Supabase + Prisma
- `src/app/api/users/me/route.ts` — rôle vendeur exposé
- `src/app/api/admin/products/route.ts` — `assertAdmin`, recherche
- `src/app/api/admin/products/[id]/featured/route.ts` — vedette
- `src/app/(admin)/admin/vendors/page.tsx` — erreurs + cookies
- `src/app/(admin)/admin/products/page.tsx` — API admin + vedette
- `docs/AUDIT_LUXANDA_CDC_V4.md` — ce document

---

*Document généré pour traçabilité projet Luxanda — à compléter après chaque release.*
