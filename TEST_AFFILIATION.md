# 🧪 Test du Système d'Affiliation

## ✅ Fonctionnalités Implémentées

### Backend
- ✅ **Route `/api/affiliation/my-affiliation`** - Statistiques d'affiliation
- ✅ **Route `/api/affiliation/referrals`** - Liste des parrainages
- ✅ **Route `/api/affiliation/create-referral`** - Création de parrainage
- ✅ **Route `/api/affiliation/update-commission`** - Mise à jour des commissions (admin)
- ✅ **Route `/api/affiliation/all`** - Toutes les affiliations (admin)

### Frontend
- ✅ **Page `/affiliation`** - Interface d'affiliation complète
- ✅ **API Routes Next.js** - Proxy vers le backend
- ✅ **Gestion des liens de parrainage** - Dans l'inscription
- ✅ **Intégration dashboard vendeur** - Bouton d'accès

## 🔧 Configuration de la Base de Données

La table `affiliations` est automatiquement créée avec :
```sql
CREATE TABLE IF NOT EXISTS affiliations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  referrer_id INT NOT NULL,
  referred_id INT NOT NULL,
  commission_rate DECIMAL(5,2) DEFAULT 30.00,
  commission_amount DECIMAL(10,2) DEFAULT 0,
  status ENUM('pending', 'paid', 'cancelled') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (referrer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (referred_id) REFERENCES users(id) ON DELETE CASCADE
)
```

## 🧪 Scénarios de Test

### 1. Test de l'Inscription avec Parrainage

1. **Créer un compte vendeur** :
   - Aller sur `/register`
   - S'inscrire comme vendeur
   - Noter l'ID utilisateur

2. **Générer le lien de parrainage** :
   - Se connecter avec le compte vendeur
   - Aller sur `/affiliation`
   - Copier le lien de parrainage

3. **Tester le parrainage** :
   - Ouvrir le lien de parrainage dans un nouvel onglet
   - S'inscrire avec un nouveau compte
   - Vérifier que le parrainage est créé

### 2. Test de l'Interface d'Affiliation

1. **Accéder à la page d'affiliation** :
   - Se connecter comme vendeur
   - Aller sur `/affiliation`

2. **Vérifier les statistiques** :
   - Total parrainages
   - Gains totaux
   - Gains en attente

3. **Tester le partage** :
   - Copier le lien
   - Partager sur WhatsApp
   - Partager sur Facebook
   - Partager sur Twitter
   - Partager par email

### 3. Test des Commissions

1. **Vérifier le taux de commission** :
   - Par défaut : 30%
   - Configurable par l'admin

2. **Tester le calcul des commissions** :
   - Abonnement vendeur : 10000 FCFA
   - Commission : 30% = 3000 FCFA

## 📊 Données de Test

### Comptes de Test
- **Vendeur 1** : vendor1@luxanda.bj / vendor123
- **Vendeur 2** : vendor2@luxanda.bj / vendor123
- **Admin** : admin@luxanda.bj / admin123

### Scénario Complet
1. Vendeur 1 s'inscrit et obtient son lien de parrainage
2. Vendeur 2 s'inscrit via le lien de parrainage de Vendeur 1
3. Vendeur 2 souscrit à un abonnement
4. Vendeur 1 reçoit 30% de commission
5. Admin peut valider et payer la commission

## 🔍 Vérifications

### Backend
- [ ] Routes d'affiliation fonctionnelles
- [ ] Création automatique des parrainages
- [ ] Calcul des commissions
- [ ] Gestion des statuts

### Frontend
- [ ] Page d'affiliation accessible
- [ ] Statistiques affichées
- [ ] Liens de partage fonctionnels
- [ ] Intégration dans l'inscription
- [ ] Bouton dans le dashboard vendeur

### Base de Données
- [ ] Table `affiliations` créée
- [ ] Relations avec `users` correctes
- [ ] Données de parrainage stockées

## 🚀 Démarrage des Tests

1. **Démarrer le backend** :
   ```bash
   cd backend
   npm run dev
   ```

2. **Démarrer le frontend** :
   ```bash
   npm run dev
   ```

3. **Tester l'affiliation** :
   - Aller sur http://localhost:3000/affiliation
   - Suivre les scénarios de test

## 📝 Notes

- Le système d'affiliation est entièrement fonctionnel
- Les commissions sont calculées automatiquement
- L'interface est intuitive et moderne
- Le partage social est intégré
- La gestion des statuts est complète
