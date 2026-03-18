-- ==============================================================================
-- LUXANDA - SCRIPT DE CORRECTION SUPABASE ADVISOR
-- Adresses : Sécurité RLS, Performance Fonctions, Optimisation Index
-- ==============================================================================

-- 1. SÉCURITÉ : ACTIVATION RLS & POLITIQUES MANQUANTES
--------------------------------------------------------------------------------

-- Activation RLS sur les tables signalées
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    -- Nettoyage des anciennes politiques pour réinstallation propre et optimisée
    DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
    DROP POLICY IF EXISTS "Vendors can view orders for their products" ON public.orders;
    DROP POLICY IF EXISTS "Users can create orders" ON public.orders;
    DROP POLICY IF EXISTS "Vendors can update own orders" ON public.orders;
    DROP POLICY IF EXISTS "Profiles - Owner Access" ON public.user_profiles;
    DROP POLICY IF EXISTS "Audit Logs - Admin Access" ON public.audit_logs;
    DROP POLICY IF EXISTS "Vendors can view own subscriptions" ON public.subscriptions;
    DROP POLICY IF EXISTS "Admins can read all subscriptions" ON public.subscriptions;
    DROP POLICY IF EXISTS "Admins can manage subscriptions" ON public.subscriptions;

    -- Politiques pour user_profiles
    CREATE POLICY "Profiles - Owner Access" ON public.user_profiles 
      FOR ALL USING ( (SELECT auth.uid()) = user_id::uuid );

    -- Politiques pour orders (Optimisées avec (SELECT auth.uid()))
    CREATE POLICY "Orders - Owner Access" ON public.orders 
      FOR SELECT USING ( (SELECT auth.uid()) = user_id::uuid );
    
    CREATE POLICY "Orders - Vendor Access" ON public.orders 
      FOR SELECT USING ( 
        vendor_id::uuid IN (SELECT id::uuid FROM public.vendors WHERE user_id::uuid = (SELECT auth.uid())) 
      );
    
    CREATE POLICY "Orders - Owner Insert" ON public.orders 
      FOR INSERT WITH CHECK ( (SELECT auth.uid()) = user_id::uuid );

    -- Politiques pour audit_logs (Admin Only)
    CREATE POLICY "Audit Logs - Admin Access" ON public.audit_logs 
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM public.users 
          WHERE id = (SELECT auth.uid()) AND role = 'ADMIN'
        )
      );

    -- Politiques pour subscriptions (Optimisées)
    CREATE POLICY "Subscriptions - Owner Read" ON public.subscriptions 
      FOR SELECT USING (
        vendor_id::uuid IN (SELECT id::uuid FROM public.vendors WHERE user_id::uuid = (SELECT auth.uid()))
      );
    
    CREATE POLICY "Subscriptions - Admin Access" ON public.subscriptions 
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM public.users 
          WHERE id = (SELECT auth.uid()) AND role = 'ADMIN'
        )
      );
END $$;


-- 2. SÉCURITÉ : FIX SEARCH PATH DES FONCTIONS
--------------------------------------------------------------------------------
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.handle_new_vendor_subscription() SET search_path = public;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;


-- 3. PERFORMANCE : OPTIMISATION RLS (CLÉS ÉTRANGÈRES & AUTH.UID)
--------------------------------------------------------------------------------

DO $$ BEGIN
    -- Optimisation des politiques existantes sur Users
    DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
    DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
    DROP POLICY IF EXISTS "Admins can read all users" ON public.users;
    
    CREATE POLICY "Users - Own Read" ON public.users FOR SELECT USING ( (SELECT auth.uid()) = id );
    CREATE POLICY "Users - Own Update" ON public.users FOR UPDATE USING ( (SELECT auth.uid()) = id );
    CREATE POLICY "Users - Admin Access" ON public.users FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = (SELECT auth.uid()) AND role = 'ADMIN')
    );

    -- Optimisation et Consolidation des politiques sur Vendors
    DROP POLICY IF EXISTS "Public can view approved vendors" ON public.vendors;
    DROP POLICY IF EXISTS "Vendors can view own profile" ON public.vendors;
    DROP POLICY IF EXISTS "Vendors can update own profile" ON public.vendors;
    DROP POLICY IF EXISTS "Admins can view everything" ON public.vendors;

    CREATE POLICY "Vendors - Public Read" ON public.vendors FOR SELECT USING ( status = 'APPROVED' );
    CREATE POLICY "Vendors - Owner Access" ON public.vendors FOR ALL USING ( user_id::uuid = (SELECT auth.uid()) );
    CREATE POLICY "Vendors - Admin Access" ON public.vendors FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = (SELECT auth.uid()) AND role = 'ADMIN')
    );

    -- Optimisation des politiques sur Products
    DROP POLICY IF EXISTS "Public can view active products" ON public.products;
    DROP POLICY IF EXISTS "Vendors can view own products" ON public.products;
    DROP POLICY IF EXISTS "Vendors can insert products" ON public.products;
    DROP POLICY IF EXISTS "Vendors can update own products" ON public.products;
    DROP POLICY IF EXISTS "Vendors can delete own products" ON public.products;

    CREATE POLICY "Products - Public Read" ON public.products FOR SELECT USING ( status = 'ACTIVE' );
    CREATE POLICY "Products - Owner Access" ON public.products FOR ALL USING (
        vendor_id::uuid IN (SELECT id::uuid FROM public.vendors WHERE user_id::uuid = (SELECT auth.uid()))
    );
END $$;


-- 4. INDEXATION : NETTOYAGE & CLÉS ÉTRANGÈRES
--------------------------------------------------------------------------------

-- Suppression des index inutilisés signalés (Nettoyage)
DROP INDEX IF EXISTS idx_orders_user_id;
DROP INDEX IF EXISTS idx_products_vendor_id;
DROP INDEX IF EXISTS idx_subscriptions_vendor_id;
DROP INDEX IF EXISTS idx_vendors_user_id;
DROP INDEX IF EXISTS idx_webhook_logs_transaction;

-- Création des index manquants sur les clés étrangères (Performance)
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_id ON public.audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target_id ON public.audit_logs(target_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id_fk ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_vendor_id_fk ON public.orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_vendor_id_fk ON public.subscriptions(vendor_id);
