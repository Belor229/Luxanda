-- ========================================
-- LUXANDA COMPLETE DATABASE RESET & SETUP
-- ========================================
-- Ce script supprime et recrée toute la base de données
-- Exécuter avec précaution - DÉTRUIT TOUTES LES DONNÉES EXISTANTES

-- ========================================
-- 1. SUPPRESSION DES TABLES EXISTANTES (si elles existent)
-- ========================================

-- Suppression des triggers (ordre inverse de création)
DROP TRIGGER IF EXISTS tr_subscriptions_updated ON public.subscriptions;
DROP TRIGGER IF EXISTS tr_products_updated ON public.products;
DROP TRIGGER IF EXISTS tr_vendors_updated ON public.vendors;
DROP TRIGGER IF EXISTS tr_profiles_updated ON public.profiles;
DROP TRIGGER IF EXISTS on_vendor_created_subscription ON public.vendors;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Suppression des fonctions
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_vendor_subscription() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Suppression des tables (ordre inverse des dépendances)
DROP TABLE IF EXISTS public.payment_logs CASCADE;
DROP TABLE IF EXISTS public.legal_acceptance CASCADE;
DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.vendors CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- ========================================
-- 2. CRÉATION DES OPÉRATEURS PERSONNALISÉS
-- ========================================

-- Opérateurs UUID pour les comparaisons
CREATE OPERATOR === (
    LEFTARG = uuid,
    RIGHTARG = uuid,
    PROCEDURE = uuid_eq,
    COMMUTATOR = ===,
    NEGATOR = !==,
    RESTRICT = eqsel,
    JOIN = eqjoinsel,
    HASHES
);

CREATE OPERATOR !== (
    LEFTARG = uuid,
    RIGHTARG = uuid,
    PROCEDURE = uuid_ne,
    COMMUTATOR = !==,
    NEGATOR = ===,
    RESTRICT = neqsel,
    JOIN = neqjoinsel,
    HASHES
);

-- ========================================
-- 3. CRÉATION DES TABLES
-- ========================================

-- Table des profils utilisateurs
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    email text,
    full_name text,
    avatar_url text,
    phone text,
    address text,
    city text,
    country text DEFAULT 'Bénin',
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table des vendeurs
CREATE TABLE IF NOT EXISTS public.vendors (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    business_name text NOT NULL,
    business_description text,
    business_email text,
    business_phone text,
    business_address text,
    business_city text,
    business_country text DEFAULT 'Bénin',
    category text,
    status text DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED')),
    verification_documents jsonb,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table des produits
CREATE TABLE IF NOT EXISTS public.products (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    vendor_id uuid REFERENCES public.vendors(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    description text,
    price numeric(10,2) NOT NULL CHECK (price >= 0),
    category text,
    images jsonb DEFAULT '[]'::jsonb,
    specifications jsonb DEFAULT '{}'::jsonb,
    stock_quantity integer DEFAULT 0 CHECK (stock_quantity >= 0),
    status text DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'ARCHIVED', 'SOLD')),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table des abonnements
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    vendor_id uuid REFERENCES public.vendors(id) ON DELETE CASCADE NOT NULL UNIQUE,
    plan text NOT NULL CHECK (plan IN ('BASIC', 'PREMIUM', 'ENTERPRISE')),
    status text DEFAULT 'TRIAL' CHECK (status IN ('TRIAL', 'ACTIVE', 'EXPIRED', 'CANCELLED')),
    trial_ends_at timestamp with time zone,
    subscription_ends_at timestamp with time zone,
    kkiapay_transaction_id text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table des logs de paiements
CREATE TABLE IF NOT EXISTS public.payment_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    transaction_id text NOT NULL,
    status text NOT NULL,
    amount numeric(10,2),
    plan text,
    client_phone text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    metadata jsonb DEFAULT '{}'::jsonb
);

-- Table d'acceptation légale
CREATE TABLE IF NOT EXISTS public.legal_acceptance (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    cgu_version text NOT NULL DEFAULT '1.0',
    accepted_at timestamp with time zone NOT NULL DEFAULT now(),
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- ========================================
-- 4. INDEX POUR PERFORMANCE
-- ========================================

-- Index profiles
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Index vendors
CREATE INDEX IF NOT EXISTS idx_vendors_user_id ON public.vendors(user_id);
CREATE INDEX IF NOT EXISTS idx_vendors_status ON public.vendors(status);
CREATE INDEX IF NOT EXISTS idx_vendors_category ON public.vendors(category);

-- Index products
CREATE INDEX IF NOT EXISTS idx_products_vendor_id ON public.products(vendor_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products(price);

-- Index subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_vendor_id ON public.subscriptions(vendor_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan ON public.subscriptions(plan);

-- Index payment_logs
CREATE INDEX IF NOT EXISTS idx_payment_logs_user_id ON public.payment_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_logs_transaction_id ON public.payment_logs(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payment_logs_status ON public.payment_logs(status);

-- Index legal_acceptance
CREATE INDEX IF NOT EXISTS idx_legal_acceptance_user_id ON public.legal_acceptance(user_id);
CREATE INDEX IF NOT EXISTS idx_legal_acceptance_version ON public.legal_acceptance(cgu_version);

-- ========================================
-- 5. ACTIVATION RLS ET POLITIQUES
-- ========================================

-- Activer RLS sur toutes les tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_acceptance ENABLE ROW LEVEL SECURITY;

-- Politiques profiles
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() === user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() === user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() === user_id);

-- Politiques vendors
CREATE POLICY "Vendors can view own vendor data" ON public.vendors
    FOR SELECT USING (auth.uid() === user_id);

CREATE POLICY "Vendors can insert own vendor data" ON public.vendors
    FOR INSERT WITH CHECK (auth.uid() === user_id);

CREATE POLICY "Vendors can update own vendor data" ON public.vendors
    FOR UPDATE USING (auth.uid() === user_id);

-- Politiques products (public pour ACTIVE, privé pour le reste)
CREATE POLICY "Anyone can view active products" ON public.products
    FOR SELECT USING (status = 'ACTIVE');

CREATE POLICY "Vendors can manage own products" ON public.products
    FOR ALL USING (vendor_id IN (
        SELECT id FROM public.vendors WHERE user_id === auth.uid()
    ));

-- Politiques subscriptions
CREATE POLICY "Vendors can view own subscription" ON public.subscriptions
    FOR SELECT USING (vendor_id IN (
        SELECT id FROM public.vendors WHERE user_id === auth.uid()
    ));

CREATE POLICY "System can manage subscriptions" ON public.subscriptions
    FOR ALL USING (true);

-- Politiques payment_logs
CREATE POLICY "Users can view own payment logs" ON public.payment_logs
    FOR SELECT USING (user_id === auth.uid());

CREATE POLICY "System can insert payment logs" ON public.payment_logs
    FOR INSERT WITH CHECK (true);

-- Politiques legal_acceptance
CREATE POLICY "Users can view own legal acceptance" ON public.legal_acceptance
    FOR SELECT USING (auth.uid() === user_id);

CREATE POLICY "Users can insert own legal acceptance" ON public.legal_acceptance
    FOR INSERT WITH CHECK (auth.uid() === user_id);

CREATE POLICY "Users can update own legal acceptance" ON public.legal_acceptance
    FOR UPDATE USING (auth.uid() === user_id);

-- ========================================
-- 6. FONCTIONS ET TRIGGERS
-- ========================================

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour créer un profil utilisateur
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour créer un abonnement vendeur
CREATE OR REPLACE FUNCTION public.handle_new_vendor_subscription()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.subscriptions (vendor_id, plan, status, trial_ends_at)
    VALUES (
        NEW.id,
        'PREMIUM',
        'TRIAL',
        now() + interval '60 days'
    );
    
    UPDATE public.vendors SET status = 'APPROVED' WHERE id = NEW.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 7. CRÉATION DES TRIGGERS
-- ========================================

-- Trigger pour créer le profil utilisateur
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Trigger pour créer l'abonnement vendeur
CREATE TRIGGER on_vendor_created_subscription
    AFTER INSERT ON public.vendors
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_vendor_subscription();

-- Triggers pour updated_at
CREATE TRIGGER tr_profiles_updated
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_vendors_updated
    BEFORE UPDATE ON public.vendors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_products_updated
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_subscriptions_updated
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 8. COMMENTAIRES ET DOCUMENTATION
-- ========================================

COMMENT ON TABLE public.profiles IS 'Profils des utilisateurs Luxanda';
COMMENT ON TABLE public.vendors IS 'Informations des vendeurs sur la plateforme';
COMMENT ON TABLE public.products IS 'Produits disponibles sur la place de marché';
COMMENT ON TABLE public.subscriptions IS 'Abonnements des vendeurs (plans, essais, etc.)';
COMMENT ON TABLE public.payment_logs IS 'Journal des transactions de paiement Kkiapay';
COMMENT ON TABLE public.legal_acceptance IS 'Suivi de l''acceptation des CGU par les utilisateurs';

COMMENT ON COLUMN public.vendors.status IS 'Statut du vendeur: PENDING, APPROVED, REJECTED, SUSPENDED';
COMMENT ON COLUMN public.products.status IS 'Statut du produit: ACTIVE, INACTIVE, ARCHIVED, SOLD';
COMMENT ON COLUMN public.subscriptions.status IS 'Statut de l''abonnement: TRIAL, ACTIVE, EXPIRED, CANCELLED';
COMMENT ON COLUMN public.subscriptions.plan IS 'Type d''abonnement: BASIC, PREMIUM, ENTERPRISE';

-- ========================================
-- 9. VÉRIFICATION FINALE
-- ========================================

-- Vérification que tout est correctement configuré
DO $$
DECLARE
    table_name text;
    rls_enabled boolean;
BEGIN
    FOR table_name IN 
        SELECT tablename FROM pg_tables WHERE schemaname = 'public' 
        AND tablename IN ('profiles', 'vendors', 'products', 'subscriptions', 'payment_logs', 'legal_acceptance')
    LOOP
        SELECT relrowsecurity INTO rls_enabled 
        FROM pg_class WHERE relname = table_name;
        
        IF rls_enabled THEN
            RAISE NOTICE '✅ Table %: RLS activé', table_name;
        ELSE
            RAISE NOTICE '❌ Table %: RLS non activé', table_name;
        END IF;
    END LOOP;
    
    RAISE NOTICE '🎉 Configuration de la base de données Luxanda terminée !';
END $$;
