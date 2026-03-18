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

-- 4. Sécurité RLS (Mise à jour idempotente des politiques)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    -- Nettoyage des anciennes politiques pour réinstallation propre
    DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
    DROP POLICY IF EXISTS "Public can view approved vendors" ON public.vendors;
    DROP POLICY IF EXISTS "Vendors can view own profile" ON public.vendors;
    DROP POLICY IF EXISTS "Vendors can view own subscriptions" ON public.subscriptions;
    DROP POLICY IF EXISTS "Public can view active products" ON public.products;
    DROP POLICY IF EXISTS "Admins can view webhook logs" ON public.webhook_logs;

    -- Réinstallation avec les casts ::uuid corrects
    CREATE POLICY "Users can read own profile" ON public.users FOR SELECT USING (auth.uid() = id);
    CREATE POLICY "Public can view approved vendors" ON public.vendors FOR SELECT USING (status = 'APPROVED');
    CREATE POLICY "Vendors can view own profile" ON public.vendors FOR SELECT USING (user_id::uuid = auth.uid());
    CREATE POLICY "Public can view active products" ON public.products FOR SELECT USING (status = 'ACTIVE');
    
    CREATE POLICY "Admins can view webhook logs" ON public.webhook_logs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );
END $$;
