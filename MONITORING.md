# Monitoring Production - Luxanda

Pour garantir la stabilité et la performance de la plateforme Luxanda en production, voici les recommandations de monitoring.

## 1. UptimeRobot (Uptime & Performance)

### A. Disponibilité du Frontend
- **URL** : `https://luxanda.bj`
- **Type** : HTTP(s)
- **Intervalle** : 5 minutes
- **Alerte** : Immédiate en cas de code HTTP != 200.

### B. Disponibilité de l'API (Backend)
- **URL** : `https://api.luxanda.bj/api/health`
- **Type** : HTTP(s) - Keyword
- **Mot-clé à vérifier** : `"status":"OK"`
- **Intervalle** : 1 minute

## 2. Plausible Analytics

- **Script intégré** dans `src/app/layout.tsx`.
- **Domaine configuré** : `luxanda.bj`.

## 3. Logs & Sécurité

- **Vercel Logs** : Surveiller les erreurs 500 et les timeouts.
- **Supabase Dashboard** : Vérifier les politiques RLS et l'utilisation de la DB.
- **Kkiapay Webhook** : Vérifier les signatures et les statuts de transaction.
