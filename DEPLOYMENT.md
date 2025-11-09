# 🚀 Guide de Déploiement - LUXANDA

## 📋 Prérequis

### 1. Comptes requis
- **Vercel** (frontend) - [vercel.com](https://vercel.com)
- **Hostinger** (backend + base de données) - [hostinger.com](https://hostinger.com)
- **GitHub** (code source) - [github.com](https://github.com)

### 2. Outils requis
- Node.js 18+
- Git
- Vercel CLI (`npm i -g vercel`)

## 🌐 Déploiement Frontend (Vercel)

### 1. Préparation
```bash
# Cloner le projet
git clone https://github.com/votre-username/luxanda.git
cd luxanda

# Installer les dépendances
npm install

# Construire l'application
npm run build
```

### 2. Configuration Vercel
```bash
# Se connecter à Vercel
vercel login

# Initialiser le projet
vercel

# Configurer les variables d'environnement
vercel env add BACKEND_URL
vercel env add KKIAPAY_PUBLIC_KEY
vercel env add NEXT_PUBLIC_APP_URL
```

### 3. Variables d'environnement Vercel
```env
BACKEND_URL=https://api.luxanda.bj
KKIAPAY_PUBLIC_KEY=03203870a86211f0a1b38145be59aef5
NEXT_PUBLIC_APP_URL=https://luxanda.bj
NODE_ENV=production
```

### 4. Déploiement
```bash
# Déploiement automatique
vercel --prod

# Ou via GitHub (recommandé)
# 1. Pousser le code sur GitHub
# 2. Connecter le repo à Vercel
# 3. Déploiement automatique à chaque push
```

## 🖥️ Déploiement Backend (Hostinger)

### 1. Préparation du serveur
```bash
# Se connecter au serveur Hostinger
ssh user@your-server.com

# Installer Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Installer PM2 pour la gestion des processus
sudo npm install -g pm2
```

### 2. Configuration de la base de données
```sql
-- Créer la base de données
CREATE DATABASE luxanda_db;

-- Créer un utilisateur
CREATE USER 'luxanda_user'@'localhost' IDENTIFIED BY 'mot_de_passe_securise';
GRANT ALL PRIVILEGES ON luxanda_db.* TO 'luxanda_user'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Upload du code
```bash
# Cloner le projet sur le serveur
git clone https://github.com/votre-username/luxanda.git
cd luxanda/backend

# Installer les dépendances
npm install --production

# Configurer les variables d'environnement
cp env.example .env
nano .env
```

### 4. Configuration .env (Production)
```env
NODE_ENV=production
PORT=5000
DB_HOST=localhost
DB_USER=luxanda_user
DB_PASSWORD=mot_de_passe_securise
DB_NAME=luxanda_db
JWT_SECRET=LuxandaSecretKey2025Production
ADMIN_PASSWORD=Momadmin@
FRONTEND_URL=https://luxanda.bj
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=luxanda@yahoo.com
SMTP_PASS=votre_mot_de_passe_email
MTN_MONEY_NUMBER=0153932672
MTN_MONEY_NAME=DJAGBA Vioutou Odirick Belor
KKIAPAY_PUBLIC_KEY=03203870a86211f0a1b38145be59aef5
KKIAPAY_PRIVATE_KEY=votre_cle_privee_kkiapay
KKIAPAY_SANDBOX=false
```

### 5. Démarrage avec PM2
```bash
# Créer un fichier de configuration PM2
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'luxanda-backend',
    script: 'dist/index.js',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
}
EOF

# Démarrer l'application
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 6. Configuration Nginx
```nginx
server {
    listen 80;
    server_name api.luxanda.bj;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔧 Configuration SSL (HTTPS)

### 1. Certificat SSL avec Let's Encrypt
```bash
# Installer Certbot
sudo apt install certbot python3-certbot-nginx

# Obtenir le certificat
sudo certbot --nginx -d luxanda.bj -d api.luxanda.bj

# Renouvellement automatique
sudo crontab -e
# Ajouter: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 📊 Monitoring et Maintenance

### 1. Monitoring avec PM2
```bash
# Voir les logs
pm2 logs luxanda-backend

# Redémarrer l'application
pm2 restart luxanda-backend

# Voir les statistiques
pm2 monit
```

### 2. Sauvegarde de la base de données
```bash
# Script de sauvegarde quotidienne
cat > backup.sh << EOF
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u luxanda_user -p luxanda_db > /backups/luxanda_$DATE.sql
find /backups -name "luxanda_*.sql" -mtime +7 -delete
EOF

chmod +x backup.sh
crontab -e
# Ajouter: 0 2 * * * /path/to/backup.sh
```

## 🚀 Déploiement Automatique

### 1. GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to server
        uses: appleboy/ssh-action@v0.1.5
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /path/to/luxanda/backend
            git pull origin main
            npm install --production
            pm2 restart luxanda-backend
```

## 🔍 Vérification du Déploiement

### 1. Tests de santé
```bash
# Frontend
curl https://luxanda.bj

# Backend
curl https://api.luxanda.bj/api/health

# Base de données
mysql -u luxanda_user -p luxanda_db -e "SELECT COUNT(*) FROM users;"
```

### 2. Tests fonctionnels
- [ ] Page d'accueil accessible
- [ ] Inscription/Connexion fonctionne
- [ ] Abonnements fonctionnent
- [ ] Paiements Kkiapay fonctionnent
- [ ] Panneau admin accessible
- [ ] API backend répond

## 📞 Support et Maintenance

### 1. Logs et Debug
```bash
# Logs frontend (Vercel)
vercel logs

# Logs backend
pm2 logs luxanda-backend

# Logs Nginx
sudo tail -f /var/log/nginx/error.log
```

### 2. Mise à jour
```bash
# Mise à jour du code
git pull origin main
npm install
npm run build
pm2 restart luxanda-backend
```

## 🎯 URLs de Production

- **Frontend**: https://luxanda.bj
- **Backend API**: https://api.luxanda.bj
- **Admin**: https://luxanda.bj/admin
- **Vendeur**: https://luxanda.bj/vendor/dashboard

## 🔐 Sécurité

### 1. Firewall
```bash
# Configurer UFW
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### 2. Mise à jour système
```bash
# Mise à jour régulière
sudo apt update && sudo apt upgrade -y
```

---

**Luxanda** - Le marché en ligne qui inspire confiance 🚀

