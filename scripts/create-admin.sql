-- Script pour créer le compte admin initial
-- Mot de passe : Momadmin@
-- IMPORTANT: Ce script doit être exécuté après avoir créé l'utilisateur dans Supabase Auth

-- 1. Créer d'abord l'utilisateur dans Supabase Auth avec l'email admin@luxanda.bj
-- 2. Récupérer l'ID de l'utilisateur depuis Supabase Auth
-- 3. Exécuter cette requête en remplaçant 'USER_ID_FROM_SUPABASE' par l'ID réel

-- Option 1: Si l'utilisateur existe déjà dans Supabase Auth
-- UPDATE users SET role = 'ADMIN' WHERE email = 'admin@luxanda.bj';

-- Option 2: Créer un utilisateur admin (nécessite l'ID Supabase)
-- INSERT INTO users (id, email, name, password, role)
-- VALUES (
--   'USER_ID_FROM_SUPABASE',  -- Remplacer par l'ID Supabase
--   'admin@luxanda.bj',
--   'Administrateur',
--   'SUPABASE_AUTH',
--   'ADMIN'
-- )
-- ON CONFLICT (email) DO UPDATE SET role = 'ADMIN';

-- Note: Le mot de passe est géré par Supabase Auth
-- Pour changer le mot de passe admin, utilisez Supabase Dashboard > Authentication > Users

