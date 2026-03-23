-- LUXANDA - CORE DATABASE REPAIR & STANDARDIZATION (FINAL)
-- run this in Supabase SQL Editor to resolve all registration and naming issues

-- 1. STANDARDIZATION DES NOMS DE COLONNES (SNAKE_CASE)
DO $$ 
BEGIN
    -- users
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'createdAt') THEN
        ALTER TABLE public.users RENAME COLUMN "createdAt" TO created_at;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'updatedAt') THEN
        ALTER TABLE public.users RENAME COLUMN "updatedAt" TO updated_at;
    END IF;

    -- vendors
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'storeName') THEN
        ALTER TABLE public.vendors RENAME COLUMN "storeName" TO store_name;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'userId') THEN
        ALTER TABLE public.vendors RENAME COLUMN "userId" TO user_id;
    END IF;
    
    -- user_profiles
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'userId') THEN
        ALTER TABLE public.user_profiles RENAME COLUMN "userId" TO user_id;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'firstName') THEN
        ALTER TABLE public.user_profiles RENAME COLUMN "firstName" TO first_name;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'lastName') THEN
        ALTER TABLE public.user_profiles RENAME COLUMN "lastName" TO last_name;
    END IF;

    -- legal_acceptance_logs
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'legal_acceptance_logs' AND column_name = 'userId') THEN
        ALTER TABLE public.legal_acceptance_logs RENAME COLUMN "userId" TO user_id;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'legal_acceptance_logs' AND column_name = 'documentVersion') THEN
        ALTER TABLE public.legal_acceptance_logs RENAME COLUMN "documentVersion" TO document_version;
    END IF;
END $$;

-- 2. AJOUT DES COLONNES MANQUANTES
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS ifu_url TEXT;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS rccm_url TEXT;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS registration_confirmed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS activation_requested_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS activation_confirmed_at TIMESTAMP WITH TIME ZONE;

-- 3. SÉCURISATION DU TRIGGER AUTH
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- 4. FIX RÉCURSION ADMIN (NON-RECURSIVE)
CREATE OR REPLACE FUNCTION public.check_is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own record" ON public.users;
CREATE POLICY "Users can view own record" ON public.users FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins have full access to users" ON public.users;
CREATE POLICY "Admins have full access to users" ON public.users FOR ALL USING (public.check_is_admin());

DROP POLICY IF EXISTS "Admins have full access to vendors" ON public.vendors;
CREATE POLICY "Admins have full access to vendors" ON public.vendors FOR ALL USING (public.check_is_admin());
