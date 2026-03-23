-- LUXANDA - CORE DATABASE REPAIR & STANDARDIZATION (FINAL)
-- run this in Supabase SQL Editor to resolve all registration and naming issues

-- 1. STANDARDIZATION DES NOMS DE COLONNES (LOWERCASE SNAKE_CASE)
-- S'assure que toutes les colonnes multi-mots utilisent snake_case pour Supabase
DO $$ 
BEGIN
    -- Table: users
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'createdAt') THEN
        ALTER TABLE public.users RENAME COLUMN "createdAt" TO created_at;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'updatedAt') THEN
        ALTER TABLE public.users RENAME COLUMN "updatedAt" TO updated_at;
    END IF;

    -- Table: vendors
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'storeName') THEN
        ALTER TABLE public.vendors RENAME COLUMN "storeName" TO store_name;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'userId') THEN
        ALTER TABLE public.vendors RENAME COLUMN "userId" TO user_id;
    END IF;
    
    -- Table: user_profiles
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'userId') THEN
        ALTER TABLE public.user_profiles RENAME COLUMN "userId" TO user_id;
    END IF;

    -- Table: legal_acceptance_logs
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'legal_acceptance_logs' AND column_name = 'userId') THEN
        ALTER TABLE public.legal_acceptance_logs RENAME COLUMN "userId" TO user_id;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'legal_acceptance_logs' AND column_name = 'documentVersion') THEN
        ALTER TABLE public.legal_acceptance_logs RENAME COLUMN "documentVersion" TO document_version;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'legal_acceptance_logs' AND column_name = 'userAgent') THEN
        ALTER TABLE public.legal_acceptance_logs RENAME COLUMN "userAgent" TO user_agent;
    END IF;
END $$;

-- 2. AJOUT DES COLONNES MANQUANTES (SI BESOIN)
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS ifu_url TEXT;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS rccm_url TEXT;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS registration_confirmed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS activation_requested_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS activation_confirmed_at TIMESTAMP WITH TIME ZONE;

-- 3. SÉCURISATION DU TRIGGER AUTH (HANDLE NEW USER)
-- Utilise ON CONFLICT pour éviter l'erreur "Database error saving new user"
-- si le profil ou l'user existe déjà dans public lors de la création Auth.
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, password, name, role)
    VALUES (
        NEW.id,
        NEW.email,
        'PROTECTED_BY_SUPABASE_AUTH',
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        COALESCE((NEW.raw_user_meta_data->>'role')::public."Role", 'USER')
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        name = EXCLUDED.name,
        role = EXCLUDED.role;

    INSERT INTO public.user_profiles (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- S'assurer que le trigger est ré-appliqué
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- 4. FIX RÉCURSION RLS (CHECK ADMIN)
-- On sécurise encore une fois la fonction check_is_admin() pour éviter les récursions
CREATE OR REPLACE FUNCTION public.check_is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  v_role public."Role";
BEGIN
  SELECT role INTO v_role FROM public.users WHERE id = auth.uid();
  RETURN v_role = 'ADMIN';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- S'assurer que le bouton "Accepter" des CGU ne boucle pas
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own record" ON public.users;
CREATE POLICY "Users can view own record" ON public.users FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins have full access to users" ON public.users;
CREATE POLICY "Admins have full access to users" ON public.users FOR ALL USING (public.check_is_admin());

-- FIN --
