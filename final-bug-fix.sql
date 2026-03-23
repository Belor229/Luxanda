-- Luxanda - FIX FINAL RÉCURSION RLS & SÉCURITÉ
-- run this in Supabase SQL Editor to resolve "infinite recursion" error

-- 1. CRÉATION D'UNE FONCTION DE VÉRIFICATION DE RÔLE (SECURITY DEFINER)
-- Cette fonction contourne la récursion en s'exécutant avec les droits du créateur (Supabase)
CREATE OR REPLACE FUNCTION public.check_is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. MISE À JOUR DES POLITIQUES SUR LA TABLE "USERS"
-- On supprime les anciennes politiques pour tout remettre au propre
DROP POLICY IF EXISTS "Utilisateurs peuvent voir leur propre profil" ON public.users;
DROP POLICY IF EXISTS "Admins peuvent tout voir sur Users" ON public.users;

-- Nouvelles politiques sans récursion
CREATE POLICY "Users can view own record" ON public.users 
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins have full access to users" ON public.users 
  FOR ALL USING (public.check_is_admin());

-- 3. MISE À JOUR DE LA TABLE "LEGAL_ACCEPTANCE_LOGS"
ALTER TABLE public.legal_acceptance_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Utilisateurs peuvent insérer leurs propres logs" ON public.legal_acceptance_logs;
DROP POLICY IF EXISTS "Utilisateurs peuvent voir leurs propres logs" ON public.legal_acceptance_logs;
DROP POLICY IF EXISTS "Admins peuvent tout voir sur les logs" ON public.legal_acceptance_logs;

CREATE POLICY "Users can insert own logs" ON public.legal_acceptance_logs 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own logs" ON public.legal_acceptance_logs 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all logs" ON public.legal_acceptance_logs 
  FOR ALL USING (public.check_is_admin());

-- 4. AUTRES TABLES (Verification)
-- Appliquer la même logique aux autres tables si nécessaire
DROP POLICY IF EXISTS "Admins peuvent tout voir sur Vendors" ON public.vendors;
CREATE POLICY "Admins can manage vendors" ON public.vendors 
  FOR ALL USING (public.check_is_admin());
