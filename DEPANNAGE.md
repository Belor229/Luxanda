# 🔧 Dépannage - LUXANDA

## ❌ **Problème : Impossible d'accéder au site**

### **Solutions à essayer :**

## 1. **Vérifier les Dépendances**

### **Frontend**
```bash
# Dans le dossier racine
npm install
```

### **Backend**
```bash
# Dans le dossier backend
cd backend
npm install
```

## 2. **Démarrer les Serveurs**

### **Option 1 : Script automatique**
```bash
# Double-cliquer sur start-dev.bat
```

### **Option 2 : Manuel**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
npm run dev
```

## 3. **Vérifier les Ports**

### **Ports utilisés :**
- **Frontend** : http://localhost:3000
- **Backend** : http://localhost:5000

### **Si les ports sont occupés :**
```bash
# Windows
netstat -ano | findstr :3000
netstat -ano | findstr :5000

# Tuer le processus
taskkill /PID <PID> /F
```

## 4. **Vérifier les Fichiers de Configuration**

### **next.config.js**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['localhost', 'res.cloudinary.com'],
  },
}

module.exports = nextConfig
```

### **tsconfig.json**
```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] },
    "types": ["react", "react-dom", "node"]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts", "src/types/**/*.d.ts"],
  "exclude": ["node_modules"]
}
```

## 5. **Vérifier les Variables d'Environnement**

### **Créer .env.local**
```env
# Frontend Environment Variables
NEXT_PUBLIC_API_URL=http://localhost:5000
BACKEND_URL=http://localhost:5000

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=luxanda

# JWT Configuration
JWT_SECRET=LuxandaSecretKey2025

# Payment Configuration (Kkiapay only)
KKIAPAY_PUBLIC_KEY=03203870a86211f0a1b38145be59aef5
KKIAPAY_PRIVATE_KEY=
KKIAPAY_SANDBOX=true

# Service Client
SERVICE_PHONE=0193389564
SERVICE_EMAIL=luxanda@yahoo.com

# App Configuration
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000
```

## 6. **Vérifier la Base de Données**

### **Créer la base de données**
```sql
CREATE DATABASE luxanda;
```

### **Vérifier la connexion**
```bash
cd backend
npm run dev
```

## 7. **Nettoyer et Redémarrer**

### **Nettoyer le cache**
```bash
# Frontend
rm -rf .next
npm run build

# Backend
rm -rf dist
npm run build
```

### **Redémarrer complètement**
```bash
# Arrêter tous les processus
# Redémarrer avec start-dev.bat
```

## 8. **Vérifier les Erreurs**

### **Console du navigateur**
- Ouvrir F12
- Vérifier les erreurs dans la console
- Vérifier les erreurs dans l'onglet Network

### **Terminal**
- Vérifier les erreurs dans les terminaux
- Vérifier les logs du backend

## 9. **Tests de Base**

### **Test 1 : Backend**
```bash
curl http://localhost:5000/api/health
```

### **Test 2 : Frontend**
- Aller sur http://localhost:3000
- Vérifier que la page se charge

### **Test 3 : API**
```bash
curl http://localhost:3000/api/products
```

## 10. **Solutions Spécifiques**

### **Erreur : "Cannot find module"**
```bash
npm install
```

### **Erreur : "Port already in use"**
```bash
# Changer le port dans package.json
"scripts": {
  "dev": "next dev -p 3001"
}
```

### **Erreur : "Database connection failed"**
- Vérifier que MySQL est démarré
- Vérifier les identifiants de connexion
- Vérifier que la base de données existe

### **Erreur : "TypeScript errors"**
```bash
npm install --save-dev @types/node @types/react @types/react-dom
```

## 🎯 **Ordre de Démarrage Recommandé**

1. **Vérifier les dépendances** (npm install)
2. **Démarrer le backend** (cd backend && npm run dev)
3. **Attendre 5 secondes**
4. **Démarrer le frontend** (npm run dev)
5. **Ouvrir http://localhost:3000**

## 📞 **Support**

Si le problème persiste :
- Vérifier les logs d'erreur
- Vérifier la configuration
- Redémarrer complètement
- Vérifier les ports et processus

## ✅ **Validation**

Le site fonctionne si :
- ✅ Backend accessible sur http://localhost:5000
- ✅ Frontend accessible sur http://localhost:3000
- ✅ Page d'accueil se charge
- ✅ Navigation fonctionne
- ✅ Pas d'erreurs dans la console
