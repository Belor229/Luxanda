# Guide d'Administration de la Plateforme Luxanda

Ce document est un guide complet et détaillé pour les administrateurs de la marketplace Luxanda. Il explique comment obtenir les droits d'administration, comment accéder au tableau de bord, et détaille toutes les fonctionnalités disponibles pour gérer la plateforme.

---

## 1. Obtenir les Droits Administrateur

Par défaut, tout compte créé sur la plateforme est un compte de type `USER` (client). Pour devenir administrateur (`ADMIN`), vous devez modifier ce rôle manuellement dans la base de données (sur Supabase).

### Étapes :
1. **Créer un compte** sur la plateforme (ex: `admin@luxanda.bj`) avec le mot de passe de votre choix.
2. Connectez-vous à votre tableau de bord **Supabase**.
3. Allez dans la section **SQL Editor**.
4. Exécutez la requête SQL suivante en prenant soin de remplacer l'email par celui utilisé lors de l'inscription :
   ```sql
   UPDATE users SET role = 'ADMIN' WHERE email = 'admin@luxanda.bj';
   ```
5. Une fois la requête exécutée avec succès, le compte bénéficiera de tous les privilèges d'administration.

---

## 2. Accéder au Tableau de Bord Administrateur

Une fois que votre compte possède le rôle `ADMIN` :
1. Connectez-vous sur la plateforme Luxanda.
2. Dans la barre d'adresse de votre navigateur, allez directement à l'URL suivante :
   👉 **`https://votre-site.com/admin`** (ou `http://localhost:3000/admin` si vous êtes en environnement de développement local).

---

## 3. Gestion des Utilisateurs (`/admin/users`)

Dans cette section, l'administrateur peut visualiser et gérer toutes les personnes inscrites sur la plateforme (clients, vendeurs, autres administrateurs).

* **Liste des utilisateurs** : Consultez la liste détaillée des utilisateurs avec leur nom, adresse e-mail, date d'inscription et leur rôle actuel (`USER`, `VENDOR`, `ADMIN`).
* **Rechercher / Filtrer** : Vous pouvez filtrer les utilisateurs pour en trouver un spécifiquement en cas de litige ou de problème.
* **Actions possibles** :
  * Modifier le statut d'un compte (ex: bloquer un utilisateur problématique).
  * Consulter les informations de leur profil.

---

## 4. Gestion des Vendeurs (`/admin/vendors`)

La gestion des vendeurs est le cœur de l'administration d'une marketplace. C'est ici que vous décidez qui a le droit de vendre sur Luxanda.

* **Validation des Inscriptions** : Lorsqu'un utilisateur demande à devenir vendeur, son statut passe par défaut en `PENDING` (En attente). Vous devrez examiner la demande (nom de la boutique, description, logo) et décider d'approuver ou de rejeter celle-ci.
* **Suspension de Boutique** : Si un vendeur ne respecte pas les règles de la plateforme, l'administrateur a le pouvoir de changer son statut en `SUSPENDED` (Suspendu).
* **Liste des Vendeurs Actifs** : Permet de superviser l'ensemble des boutiques validées (`APPROVED`) et leurs statistiques.

---

## 5. Gestion des Produits (`/admin/products`)

L'administrateur a une vue d'ensemble sur l'intégralité des produits créés par tous les vendeurs sur la plateforme.

* **Supervision du Catalogue** : Visualisez l'ensemble des produits, leurs prix, leurs stocks (`quantity`) et à quel vendeur ils appartiennent.
* **Modération** : Identifiez les produits non conformes aux conditions d'utilisation de Luxanda.
* **Statut des Produits** : Un produit peut être en `DRAFT` (brouillon), `ACTIVE` (en ligne et visible), ou `ARCHIVED` (retiré). L'administrateur peut intervenir pour changer de statut si nécessaire (par exemple modérer un produit non conforme).

---

## 6. Remarques Importantes pour l'Administrateur

* ✅ **Sécurité** : Gardez vos accès (email et mot de passe) extrêmement sécurisés. N'attribuez le rôle `ADMIN` qu'aux personnes de stricte confiance.
* ✅ **Impact** : Toute action réalisée depuis l'espace `admin` a un impact direct sur la base de données et donc sur les revenus des vendeurs et la navigation des clients.
* ✅ **Synchronisation** : Toutes les données affichées dans l'espace administrateur proviennent directement de votre base de données Supabase.
