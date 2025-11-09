# 🔧 Guide de Résolution des Problèmes - LUXANDA

## ❌ Erreurs TypeScript Courantes

### 1. Erreurs de modules manquants
```bash
# Solution: Installer les dépendances
npm install
cd backend && npm install && cd ..
```

### 2. Erreurs JSX
```bash
# Solution: Vérifier la configuration TypeScript
# Le fichier tsconfig.json doit inclure React
```

### 3. Erreurs de types Express
```bash
# Solution: Installer les types manquants
cd backend
npm install --save-dev @types/express @types/node
```

## 🚀 Démarrage de l'Application

### Méthode 1: Script automatique (Recommandé)
```bash
# Windows
start-dev.bat

# Linux/Mac
chmod +x start.sh && ./start.sh
```

### Méthode 2: Manuel
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
npm run dev
```

## 🗄️ Configuration Base de Données

### 1. Créer la base de données
```sql
CREATE DATABASE luxanda_db;
```

### 2. Vérifier la connexion
```bash
# Tester la connexion MySQL
mysql -u root -p -e "SHOW DATABASES;"
```

### 3. Variables d'environnement
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_NAME=luxanda_db
```

## 🔐 Problèmes d'Authentification

### 1. Token JWT invalide
- Vérifier que le token est présent dans localStorage
- Vérifier que le JWT_SECRET est configuré
- Redémarrer le backend après modification du secret

### 2. Erreur 401/403
- Vérifier les headers Authorization
- Vérifier que l'utilisateur est connecté
- Vérifier les permissions de l'utilisateur

## 💳 Problèmes de Paiement

### 1. Kkiapay ne fonctionne pas
- Vérifier que la clé publique est correcte
- Vérifier la configuration du callback
- Tester en mode sandbox d'abord

### 2. MTN Money
- Vérifier le numéro de téléphone
- Vérifier que le nom correspond

## 🌐 Problèmes de Réseau

### 1. CORS
- Vérifier la configuration CORS dans le backend
- Vérifier que FRONTEND_URL est correct

### 2. API non accessible
- Vérifier que le backend est démarré
- Vérifier l'URL de l'API
- Vérifier les routes API

## 📱 Problèmes de Performance

### 1. Application lente
- Vérifier la taille des images
- Optimiser les requêtes de base de données
- Utiliser le lazy loading

### 2. Erreurs de mémoire
- Augmenter la limite de mémoire Node.js
- Optimiser les requêtes

## 🐛 Erreurs Courantes

### 1. "Cannot find module"
```bash
# Solution
rm -rf node_modules package-lock.json
npm install
```

### 2. "Port already in use"
```bash
# Solution: Changer le port
# Dans .env
PORT=5001
```

### 3. "Database connection failed"
- Vérifier que MySQL est démarré
- Vérifier les credentials
- Vérifier que la base existe

## 🔍 Debug

### 1. Logs du Backend
```bash
cd backend
npm run dev
# Les logs s'affichent dans la console
```

### 2. Logs du Frontend
```bash
npm run dev
# Ouvrir les DevTools du navigateur
```

### 3. Vérifier les requêtes
- Ouvrir les DevTools
- Onglet Network
- Vérifier les requêtes API

## 📞 Support

Si les problèmes persistent :

1. **Vérifier les logs** dans la console
2. **Redémarrer** l'application
3. **Vérifier** la configuration
4. **Contacter** le support :
   - Email: luxanda@yahoo.com
   - WhatsApp: +229 01 93 38 95 64

## ✅ Checklist de Vérification

- [ ] Node.js 18+ installé
- [ ] MySQL/MariaDB installé et démarré
- [ ] Base de données `luxanda_db` créée
- [ ] Fichier `.env` configuré
- [ ] Dépendances installées (`npm install`)
- [ ] Backend démarré sur le port 5000
- [ ] Frontend démarré sur le port 3000
- [ ] Pas d'erreurs dans la console

---

**Luxanda** - Le marché en ligne qui inspire confiance 🚀
