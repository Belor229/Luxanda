-- ==============================================================================
-- LUXANDA - SCRIPT DE MIGRATION (PROD SAFE)
-- Ce script met à jour la structure sans supprimer de données.
-- ==============================================================================

-- 1. Tables (Création si inexistantes)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id uuid REFERENCES public.users(id),
    target_id uuid,
    action text NOT NULL,
    reason text,
    payload jsonb,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.webhook_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type text NOT NULL,
    transaction_id text,
    status text NOT NULL,
    payload jsonb,
    processed_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now()
);

-- 2. Colonnes manquantes (Migrations douces)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='vendors' AND column_name='rejection_reason') THEN
        ALTER TABLE public.vendors ADD COLUMN rejection_reason text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='subscriptions' AND column_name='end_date') THEN
        ALTER TABLE public.subscriptions ADD COLUMN start_date timestamp with time zone;
        ALTER TABLE public.subscriptions ADD COLUMN end_date timestamp with time zone;
        ALTER TABLE public.subscriptions ADD COLUMN payment_id text;
        ALTER TABLE public.subscriptions ADD COLUMN amount integer;
    END IF;
END $$;

-- 3. Indexes (Création si inexistants)
CREATE INDEX IF NOT EXISTS idx_webhook_logs_transaction ON public.webhook_logs(transaction_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_vendor_id ON public.subscriptions(vendor_id);

-- 4. SÉCURITÉ : RLS & POLITIQUES (Optimisées)
--------------------------------------------------------------------------------
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    -- Nettoyage global pour réinstallation propre
    DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
    DROP POLICY IF EXISTS "Public can view approved vendors" ON public.vendors;
    DROP POLICY IF EXISTS "Vendors can view own profile" ON public.vendors;
    DROP POLICY IF EXISTS "Vendors can view own subscriptions" ON public.subscriptions;
    DROP POLICY IF EXISTS "Public can view active products" ON public.products;
    DROP POLICY IF EXISTS "Admins can view webhook logs" ON public.webhook_logs;
    DROP POLICY IF EXISTS "Orders - Owner Access" ON public.orders;
    DROP POLICY IF EXISTS "Orders - Vendor Access" ON public.orders;
    DROP POLICY IF EXISTS "Profiles - Owner Access" ON public.user_profiles;

    -- Réinstallation optimisée avec (SELECT auth.uid())
    CREATE POLICY "Users - Own Access" ON public.users FOR ALL USING ( (SELECT auth.uid()) = id );
    
    CREATE POLICY "Profiles - Own Access" ON public.user_profiles FOR ALL USING ( (SELECT auth.uid()) = user_id::uuid );

    CREATE POLICY "Vendors - Public Read" ON public.vendors FOR SELECT USING ( status = 'APPROVED' );
    CREATE POLICY "Vendors - Owner Access" ON public.vendors FOR ALL USING ( user_id::uuid = (SELECT auth.uid()) );
    
    CREATE POLICY "Products - Public Read" ON public.products FOR SELECT USING ( status = 'ACTIVE' );
    CREATE POLICY "Products - Owner Access" ON public.products FOR ALL USING (
        vendor_id::uuid IN (SELECT id::uuid FROM public.vendors WHERE user_id::uuid = (SELECT auth.uid()))
    );

    CREATE POLICY "Orders - Owner Access" ON public.orders FOR SELECT USING ( (SELECT auth.uid()) = user_id::uuid );
    CREATE POLICY "Orders - Vendor Access" ON public.orders FOR SELECT USING (
        vendor_id::uuid IN (SELECT id::uuid FROM public.vendors WHERE user_id::uuid = (SELECT auth.uid()))
    );

    CREATE POLICY "Subscriptions - Owner Read" ON public.subscriptions FOR SELECT USING (
        vendor_id::uuid IN (SELECT id::uuid FROM public.vendors WHERE user_id::uuid = (SELECT auth.uid()))
    );

    CREATE POLICY "Admins - Global Access" ON public.webhook_logs FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = (SELECT auth.uid()) AND role = 'ADMIN')
    );
END $$;

-- 5. FONCTIONS : SÉCURITÉ SEARCH PATH
--------------------------------------------------------------------------------
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.handle_new_vendor_subscription() SET search_path = public;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;

-- 6. INDEXATION : CLÉS ÉTRANGÈRES
--------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_id ON public.audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id_fk ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_vendor_id_fk ON public.orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
