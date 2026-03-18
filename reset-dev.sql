-- ==============================================================================
-- LUXANDA - SCRIPT DE RÉINITIALISATION COMPLÈTE (DEV ONLY)
-- ATTENTION : Ce script supprime TOUTES les données existantes.
-- À utiliser uniquement en environnement de développement ou de test.
-- ==============================================================================

-- 1. Nettoyage complet
DO $$ DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
END $$;

-- 2. Création des tables (Structure simplifiée basée sur Prisma)
-- Note: Les types UUID sont utilisés pour la cohérence avec Supabase Auth

CREATE TABLE public.users (
    id uuid PRIMARY KEY,
    email text UNIQUE NOT NULL,
    role text DEFAULT 'USER',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.user_profiles (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
    first_name text,
    last_name text,
    phone text,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.vendors (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
    store_name text NOT NULL,
    description text,
    whatsapp text,
    city text,
    category text,
    id_card_url text,
    selfie_url text,
    rejection_reason text,
    status text DEFAULT 'PENDING',
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.subscriptions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    vendor_id uuid REFERENCES public.vendors(id) ON DELETE CASCADE,
    status text DEFAULT 'PENDING',
    plan_type text NOT NULL,
    start_date timestamp with time zone,
    end_date timestamp with time zone,
    payment_id text,
    amount integer,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.products (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    vendor_id uuid REFERENCES public.vendors(id) ON DELETE CASCADE,
    name text NOT NULL,
    description text,
    price decimal NOT NULL,
    image_url text,
    category text,
    status text DEFAULT 'DRAFT',
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.orders (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.users(id),
    vendor_id uuid REFERENCES public.vendors(id),
    total_amount decimal NOT NULL,
    status text DEFAULT 'PENDING',
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.audit_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id uuid REFERENCES public.users(id),
    target_id uuid,
    action text NOT NULL,
    reason text,
    payload jsonb,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.webhook_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type text NOT NULL,
    transaction_id text,
    status text NOT NULL,
    payload jsonb,
    processed_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now()
);

-- 3. Données de configuration de base
INSERT INTO public.users (id, email, role) VALUES ('00000000-0000-0000-0000-000000000000', 'admin@luxanda.vercel.app', 'ADMIN') ON CONFLICT DO NOTHING;

-- 4. Indexes pour performance
CREATE INDEX idx_vendors_user_id ON public.vendors(user_id);
CREATE INDEX idx_subscriptions_vendor_id ON public.subscriptions(vendor_id);
CREATE INDEX idx_products_vendor_id ON public.products(vendor_id);
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_webhook_logs_transaction ON public.webhook_logs(transaction_id);

-- 5. Activation de la RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

-- 6. Politiques RLS (Idempotentes)
DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
    CREATE POLICY "Users can read own profile" ON public.users FOR SELECT USING (auth.uid() = id);
    
    DROP POLICY IF EXISTS "Public can view approved vendors" ON public.vendors;
    CREATE POLICY "Public can view approved vendors" ON public.vendors FOR SELECT USING (status = 'APPROVED');
    
    DROP POLICY IF EXISTS "Vendors can view own profile" ON public.vendors;
    CREATE POLICY "Vendors can view own profile" ON public.vendors FOR SELECT USING (user_id::uuid = auth.uid());

    DROP POLICY IF EXISTS "Public can view active products" ON public.products;
    CREATE POLICY "Public can view active products" ON public.products FOR SELECT USING (status = 'ACTIVE');
    
    DROP POLICY IF EXISTS "Admins can view everything" ON public.vendors;
    CREATE POLICY "Admins can view everything" ON public.vendors FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN'));
END $$;
