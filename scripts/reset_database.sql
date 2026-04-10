-- NB: Ce script doit être exécuté dans l'éditeur SQL de Supabase.

-- 1. Nettoyage massif des comptes existants (Propriétaire / Supprime les cascades)
-- Cette action nettoie auth.users et par extension public.users via les triggers existants
DELETE FROM auth.users WHERE email != 'odirick@gmail.com';

-- 2. Création de l'Administrateur Unique si absent
-- Mot de passe : Serena100925@
DO $$
BEGIN
   IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'odirick@gmail.com') THEN
      INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, 
        email_confirmed_at, raw_app_meta_data, raw_user_meta_data, 
        created_at, updated_at
      ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        'odirick@gmail.com',
        '$2b$10$hoLoFeqQ1MduDzeh4LSH0OIiA4R/VQKqqCuuQynElk6TZxlmIPPry',
        now(),
        '{"provider":"email","providers":["email"]}',
        '{"full_name":"Admin Luxanda"}',
        now(),
        now()
      );
   END IF;
END
$$;

-- 3. S'assurer que le rôle ADMIN est bien attribué dans la table public.users
-- On attend que le trigger Supabase crée l'entrée dans public.users
-- Puis on force le rôle ADMIN pour cet email
UPDATE public.users 
SET role = 'ADMIN' 
WHERE email = 'odirickd@gmail.com';

-- 4. Nettoyage des données orphelines éventuelles
DELETE FROM public.products WHERE vendor_id NOT IN (SELECT id FROM public.vendors);
DELETE FROM public.vendors WHERE user_id NOT IN (SELECT id FROM public.users);

-- 5. Création des nouvelles tables si elles n'existent pas (Préparation Schéma)
CREATE TABLE IF NOT EXISTS public.admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES public.users(id),
  action TEXT NOT NULL,
  target_id TEXT,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Finance Transactions (if not already created by master script)
CREATE TABLE IF NOT EXISTS public.finance_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id),
    amount DOUBLE PRECISION NOT NULL,
    status TEXT NOT NULL,
    provider TEXT DEFAULT 'genius_pay' NOT NULL,
    reference TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Activation RLS sur logs
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- Note : Les règles RLS spécifiques seront appliquées dans un script dédié (rls_policies.sql)
