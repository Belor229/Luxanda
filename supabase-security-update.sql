-- ========================================
-- LUXANDA SECURITY UPDATE - VENDOR VERIFICATION & SUBSCRIPTION
-- ========================================
-- Mise à jour pour système d'abonnement 14 jours + validation admin

-- ========================================
-- 1. MISE À JOUR TABLE VENDORS
-- ========================================

-- Ajouter des champs pour la vérification et le trial
ALTER TABLE public.vendors 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'PENDING_VALIDATION' CHECK (status IN ('PENDING_VALIDATION', 'APPROVED', 'REJECTED', 'SUSPENDED', 'SUSPENDED_AUTO')),
ADD COLUMN IF NOT EXISTS verification_documents jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS identity_document_url text,
ADD COLUMN IF NOT EXISTS selfie_document_url text,
ADD COLUMN IF NOT EXISTS phone_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS email_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS admin_notes text,
ADD COLUMN IF NOT EXISTS trial_start_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS trial_end_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS rejection_reason text;

-- ========================================
-- 2. MISE À JOUR TABLE SUBSCRIPTIONS
-- ========================================

-- Modifier la table subscriptions pour le nouveau système
ALTER TABLE public.subscriptions 
DROP COLUMN IF EXISTS trial_ends_at,
ADD COLUMN IF NOT EXISTS trial_start_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS trial_end_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS auto_suspend_date timestamp with time zone;

-- ========================================
-- 3. CRÉATION TABLE REPORTS
-- ========================================

CREATE TABLE IF NOT EXISTS public.reports (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    reporter_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
    vendor_id uuid REFERENCES public.vendors(id) ON DELETE CASCADE,
    report_type text NOT NULL CHECK (report_type IN ('PRODUCT', 'VENDOR', 'FRAUD', 'INAPPROPRIATE')),
    reason text NOT NULL,
    description text NOT NULL,
    status text DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'REVIEWED', 'RESOLVED', 'DISMISSED')),
    admin_notes text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- ========================================
-- 4. CRÉATION TABLE LEGAL_ACCEPTANCE_LOG
-- ========================================

CREATE TABLE IF NOT EXISTS public.legal_acceptance_log (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    document_type text NOT NULL,
    document_version text NOT NULL DEFAULT '1.0',
    ip_address inet,
    user_agent text,
    accepted_at timestamp with time zone NOT NULL DEFAULT now(),
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- ========================================
-- 5. INDEX POUR PERFORMANCE
-- ========================================

-- Index vendors
CREATE INDEX IF NOT EXISTS idx_vendors_trial_dates ON public.vendors(trial_start_date, trial_end_date);
CREATE INDEX IF NOT EXISTS idx_vendors_verification ON public.vendors(status, email_verified, phone_verified);

-- Index reports
CREATE INDEX IF NOT EXISTS idx_reports_product ON public.reports(product_id);
CREATE INDEX IF NOT EXISTS idx_reports_vendor ON public.reports(vendor_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_type ON public.reports(report_type);

-- Index legal_acceptance_log
CREATE INDEX IF NOT EXISTS idx_legal_log_user ON public.legal_acceptance_log(user_id);
CREATE INDEX IF NOT EXISTS idx_legal_log_document ON public.legal_acceptance_log(document_type, document_version);

-- ========================================
-- 6. POLITIQUES RLS NOUVELLES TABLES
-- ========================================

-- Politiques reports
CREATE POLICY "Users can view own reports" ON public.reports
    FOR SELECT USING (auth.uid() === reporter_id);

CREATE POLICY "Users can create reports" ON public.reports
    FOR INSERT WITH CHECK (auth.uid() === reporter_id);

CREATE POLICY "Admins can manage all reports" ON public.reports
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.vendors 
            WHERE user_id === auth.uid() AND status === 'APPROVED'
        )
    );

-- Politiques legal_acceptance_log
CREATE POLICY "Users can view own legal logs" ON public.legal_acceptance_log
    FOR SELECT USING (auth.uid() === user_id);

CREATE POLICY "Users can insert own legal logs" ON public.legal_acceptance_log
    FOR INSERT WITH CHECK (auth.uid() === user_id);

-- ========================================
-- 7. FONCTIONS POUR GESTION TRIAL
-- ========================================

-- Fonction pour démarrer le trial après validation admin
CREATE OR REPLACE FUNCTION public.start_vendor_trial(vendor_uuid uuid)
RETURNS void AS $$
BEGIN
    UPDATE public.vendors 
    SET 
        status = 'APPROVED',
        trial_start_date = now(),
        trial_end_date = now() + interval '14 days',
        updated_at = now()
    WHERE id = vendor_uuid;
    
    UPDATE public.subscriptions
    SET 
        status = 'TRIAL',
        trial_start_date = now(),
        trial_end_date = now() + interval '14 days',
        auto_suspend_date = now() + interval '14 days',
        updated_at = now()
    WHERE vendor_id = vendor_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour suspendre automatiquement les vendeurs
CREATE OR REPLACE FUNCTION public.auto_suspend_expired_trials()
RETURNS void AS $$
BEGIN
    UPDATE public.vendors 
    SET 
        status = 'SUSPENDED_AUTO',
        updated_at = now()
    WHERE 
        status = 'APPROVED' 
        AND trial_end_date IS NOT NULL 
        AND trial_end_date < now();
    
    UPDATE public.subscriptions
    SET 
        status = 'EXPIRED',
        updated_at = now()
    WHERE 
        status = 'TRIAL'
        AND trial_end_date IS NOT NULL 
        AND trial_end_date < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 8. TRIGGER POUR SUSPENSION AUTOMATIQUE
-- ========================================

-- Trigger pour vérifier l'expiration des trials quotidiennement
CREATE OR REPLACE FUNCTION public.check_trial_expiration()
RETURNS trigger AS $$
BEGIN
    PERFORM public.auto_suspend_expired_trials();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Note: Ce trigger doit être appelé par un job cron quotidien
-- CREATE TRIGGER daily_trial_check 
--     AFTER INSERT ON public.subscriptions 
--     FOR EACH STATEMENT 
--     EXECUTE FUNCTION public.check_trial_expiration();

-- ========================================
-- 9. MISE À JOUR POLITIQUES EXISTANTES
-- ========================================

-- Mettre à jour la politique products pour bloquer les vendeurs non validés
DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;

CREATE POLICY "Anyone can view active products from approved vendors" ON public.products
    FOR SELECT USING (
        status = 'ACTIVE' AND 
        vendor_id IN (
            SELECT id FROM public.vendors 
            WHERE status = 'APPROVED' 
            AND (trial_end_date IS NULL OR trial_end_date > now())
        )
    );

CREATE POLICY "Vendors can manage own products" ON public.products
    FOR ALL USING (
        vendor_id IN (
            SELECT id FROM public.vendors 
            WHERE user_id === auth.uid() AND status = 'APPROVED'
        )
    );

-- ========================================
-- 10. VÉRIFICATION FINALE
-- ========================================

DO $$
DECLARE
    table_name text;
    rls_enabled boolean;
BEGIN
    RAISE NOTICE '🔒 VÉRIFICATION SÉCURITÉ LUXANDA';
    
    FOR table_name IN 
        SELECT tablename FROM pg_tables WHERE schemaname = 'public' 
        AND tablename IN ('profiles', 'vendors', 'products', 'subscriptions', 'payment_logs', 'legal_acceptance', 'reports', 'legal_acceptance_log')
    LOOP
        SELECT relrowsecurity INTO rls_enabled 
        FROM pg_class WHERE relname = table_name;
        
        IF rls_enabled THEN
            RAISE NOTICE '✅ Table %: RLS activé', table_name;
        ELSE
            RAISE NOTICE '❌ Table %: RLS non activé', table_name;
        END IF;
    END LOOP;
    
    RAISE NOTICE '🎉 Mise à jour sécurité terminée !';
    RAISE NOTICE '📋 Fonctions disponibles:';
    RAISE NOTICE '   - start_vendor_trial(vendor_uuid)';
    RAISE NOTICE '   - auto_suspend_expired_trials()';
END $$;
