# Plan de Mise à Niveau Structurante - Luxanda

Ce plan détaille la refonte du dashboard admin pour centraliser toutes les actions critiques et la révision sécurisée du schéma de base de données.

## 🎯 Objectifs
- Centralisation totale des actions de modération (vendeurs, produits, abonnements) via le dashboard admin.
- Sécurisation via RLS (Row Level Security).
- Traçabilité complète des actions admin (Logs).
- Réorganisation du schéma SQL.

## 🛠️ Changements Proposés

### 1. Base de Données & Sécurité
- [ ] **Script SQL Initial** : Suppression des comptes existants et création de l'admin unique (`odirick@gmail.com`).
- [ ] **Révision du Schéma** :
    - Ajouter la table `admin_logs` (ou renommer `audit_logs`).
    - Ajouter la table `identity_docs` pour une gestion isolée des pièces d'identité.
    - Uniformiser les rôles : `USER`, `VENDOR`, `ADMIN`.
- [ ] **Politiques RLS** :
    - Restreindre l'accès aux logs et pièces d'identité aux administrateurs uniquement.
    - Sécuriser les données vendeurs et produits.

### 2. Backend (API Admin)
- [ ] **Module Vendeurs** : Routes pour approuver, suspendre, activer l'essai 14j.
- [ ] **Module Produits** : Routes pour modération (approuver/rejeter/suspect).
- [ ] **Module Signalements** : Routes pour traiter les fraudes.
- [ ] **Logs** : Injection automatique d'une entrée dans `admin_logs` pour chaque action backend sensible.

### 3. Frontend (Admin Dashboard)
- [ ] **Navigation** : Sidebar avec Dashboard, Vendeurs, Produits, Signalements, Abonnements, Logs.
- [ ] **Tableaux de Bord** : Vue d'ensemble avec KPIs.
- [ ] **Gestion des Vendeurs** : Vue détaillée avec visualisation des pièces d'identité et boutons d'action.
- [ ] **Flux de Modération** : Interfaces claires pour la validation des produits.

## 📝 Script SQL de Réinitialisation
Un script SQL sera généré pour :
1. Purger les tables `auth.users`, `public.users` et dépendances.
2. Créer l'admin avec le mot de passe hashé.
3. Configurer les RLS de base.

## 🧪 Plan de Vérification
- [ ] Connexion admin unique.
- [ ] Test d'approbation d'un vendeur factice.
- [ ] Test de suspension d'un produit.
- [ ] Vérification de la création des logs admin.
- [ ] Test des restrictions RLS (un utilisateur non-admin ne doit pas voir les logs).
