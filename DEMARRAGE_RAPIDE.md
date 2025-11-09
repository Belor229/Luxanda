# 🚀 Démarrage Rapide - LUXANDA

## ✅ **Erreurs Corrigées**

### **TypeScript Errors**
- ✅ **Page produits** : Structure JSX corrigée
- ✅ **Dashboard vendeur** : Interface Product mise à jour avec `stockQuantity`
- ✅ **Tous les fichiers** : Erreurs de syntaxe corrigées

## 🎯 **Démarrage en 3 Étapes**

### **Étape 1 : Installer les Dépendances**
```bash
# Frontend
npm install

# Backend
cd backend
npm install
cd ..
```

### **Étape 2 : Démarrer les Serveurs**
```bash
# Option 1 : Script automatique (Windows)
start-dev.bat

# Option 2 : Manuel
# Terminal 1
cd backend && npm run dev

# Terminal 2
npm run dev
```

### **Étape 3 : Accéder au Site**
- **Frontend** : http://localhost:3000
- **Backend** : http://localhost:5000

## 🔧 **Configuration Requise**

### **Variables d'Environnement**
Créer `.env.local` dans le dossier racine :
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
BACKEND_URL=http://localhost:5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=luxanda
JWT_SECRET=LuxandaSecretKey2025
KKIAPAY_PUBLIC_KEY=03203870a86211f0a1b38145be59aef5
SERVICE_PHONE=0193389564
SERVICE_EMAIL=luxanda@yahoo.com
```

### **Base de Données**
```sql
CREATE DATABASE luxanda;
```

## 📱 **Pages Disponibles**

### **Pages Publiques**
- ✅ **Page d'accueil** : http://localhost:3000
- ✅ **Produits** : http://localhost:3000/products
- ✅ **Contact** : http://localhost:3000/contact
- ✅ **Affiliation** : http://localhost:3000/affiliation

### **Pages d'Authentification**
- ✅ **Connexion** : http://localhost:3000/login
- ✅ **Inscription** : http://localhost:3000/register

### **Pages Authentifiées**
- ✅ **Dashboard vendeur** : http://localhost:3000/vendor/dashboard
- ✅ **Panneau admin** : http://localhost:3000/admin
- ✅ **Abonnements** : http://localhost:3000/subscriptions

## 🧪 **Tests Rapides**

### **Test 1 : Page d'accueil**
- Aller sur http://localhost:3000
- Vérifier que la page se charge sans erreur

### **Test 2 : Connexion**
- Aller sur http://localhost:3000/login
- Tester la connexion avec un compte

### **Test 3 : Dashboard vendeur**
- Se connecter comme vendeur
- Vérifier l'accès au dashboard
- Tester l'ajout de produits

### **Test 4 : Système d'affiliation**
- Aller sur http://localhost:3000/affiliation
- Vérifier l'affichage des statistiques

## 🔍 **Vérifications**

### **Console du Navigateur**
- Ouvrir F12
- Vérifier qu'il n'y a pas d'erreurs JavaScript

### **Terminal**
- Vérifier qu'il n'y a pas d'erreurs TypeScript
- Vérifier que les serveurs démarrent correctement

## ⚠️ **Problèmes Courants**

### **Erreur : "Cannot find module"**
```bash
npm install
```

### **Erreur : "Port already in use"**
```bash
# Tuer le processus sur le port 3000 ou 5000
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### **Erreur : "Database connection failed"**
- Vérifier que MySQL est démarré
- Vérifier les identifiants de connexion

## 🎉 **Validation Finale**

Le site fonctionne correctement si :
- ✅ Page d'accueil se charge sur http://localhost:3000
- ✅ Navigation fonctionne entre les pages
- ✅ Connexion/inscription fonctionne
- ✅ Dashboard vendeur accessible
- ✅ Ajout de produits fonctionne
- ✅ Système d'affiliation opérationnel
- ✅ Aucune erreur dans la console

## 📞 **Support**

Si vous rencontrez des problèmes :
1. Consulter `DEPANNAGE.md`
2. Vérifier les logs d'erreur
3. Redémarrer les serveurs
4. Vérifier la configuration

**Le site LUXANDA est maintenant entièrement fonctionnel !** 🚀
