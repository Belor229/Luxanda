-- Luxanda - Fix RLS for Legal Acceptance Logs
-- run this in Supabase SQL Editor

-- 1. Activer RLS sur la table
ALTER TABLE public.legal_acceptance_logs ENABLE ROW LEVEL SECURITY;

-- 2. Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Utilisateurs peuvent insérer leurs propres logs" ON public.legal_acceptance_logs;
DROP POLICY IF EXISTS "Utilisateurs peuvent voir leurs propres logs" ON public.legal_acceptance_logs;

-- 3. Créer les nouvelles politiques
CREATE POLICY "Utilisateurs peuvent insérer leurs propres logs" 
ON public.legal_acceptance_logs FOR INSERT 
WITH CHECK (auth.uid() = "userId");

CREATE POLICY "Utilisateurs peuvent voir leurs propres logs" 
ON public.legal_acceptance_logs FOR SELECT 
USING (auth.uid() = "userId");

-- 4. Pour les admins (Optionnel mais recommandé)
CREATE POLICY "Admins peuvent tout voir sur les logs" 
ON public.legal_acceptance_logs FOR ALL 
USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN'));
