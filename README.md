# Luxanda MVP — Plateforme Multi-vendeurs

Luxanda est une plateforme moderne permettant aux vendeurs de créer leur boutique en ligne, de gérer leurs produits et de recevoir des commandes, tout en offrant aux acheteurs une interface fluide et sécurisée pour découvrir des produits locaux et premium au Bénin et en Afrique.

## 🚀 Stack Technique
- **Frontend** : Next.js 14+ (App Router), Tailwind CSS, Lucide Icons.
- **Backend / Auth** : Supabase (Auth, Storage, Database).
- **ORM** : Prisma.
- **Paiements** : Kkiapay (Mobile Money, Carte Bancaire).
- **Notifications** : Twilio (WhatsApp & SMS).
- **Analytiques** : Plausible.io.
- **Monitoring** : UptimeRobot.

## 🛠️ Installation Locale

1. **Clonage du dépôt** :
   ```bash
   git clone https://github.com/votre-user/luxanda-mvp.git
   cd luxanda-mvp
   ```

2. **Installation des dépendances** :
   ```bash
   npm install
   ```

3. **Configuration de l'environnement** :
   Créez un fichier `.env` à la racine (ne pas commiter sur GitHub) avec les variables suivantes :
   ```env
   DATABASE_URL="votre_db_url_prisma"
   NEXT_PUBLIC_SUPABASE_URL="votre_url_supabase"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="votre_cle_anon"
   SUPABASE_SERVICE_ROLE_KEY="votre_cle_service_role"
   KKIAPAY_PUBLIC_KEY="votre_cle_kkiapay"
   TWILIO_ACCOUNT_SID="votre_sid"
   TWILIO_AUTH_TOKEN="votre_token"
   TWILIO_WHATSAPP_FROM="whatsapp:+14155238886"
   CRON_SECRET="votre_secret_pour_les_taches_cron"
   ```

4. **Base de données** :
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Lancement du serveur de développement** :
   ```bash
   npm run dev
   ```

## 📂 Structure du Projet
- `/src/app` : Routes et pages Next.js.
- `/src/components` : Composants UI réutilisables.
- `/src/lib` : Services et utilitaires (Prisma, Notifications, Supabase).
- `/prisma` : Schéma de la base de données.
- `/supabase-rls.sql` : Scripts de sécurité à exécuter sur Supabase.

## 📄 Licence
Propriété exclusive de Luxanda. Tous droits réservés.
