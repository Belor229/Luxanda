-- ==============================================================================
-- LUXANDA - CONFIGURATION MASTER SUPABASE (FINAL)
-- Coordination: Prisma Schema / Next.js Admin Panel
-- Date: 2026-03-23
-- Admin: odirickd@gmail.com
-- ==============================================================================

-- 0. NETTOYAGE COMPLET
-- Attention: Supprime toutes les données existantes dans le schéma public
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Désactiver les triggers temporairement
    SET session_replication_role = 'replica';
    
    -- Supprimer toutes les tables
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
    
    -- Supprimer les enums
    FOR r IN (SELECT typname FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace WHERE n.nspname = 'public' AND t.typtype = 'e') LOOP
        EXECUTE 'DROP TYPE IF EXISTS public.' || quote_ident(r.typname) || ' CASCADE';
    END LOOP;

    -- Réactiver les triggers
    SET session_replication_role = 'origin';
END $$;

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS (Identiques à Prisma)
CREATE TYPE public."Role" AS ENUM ('USER', 'VENDOR', 'ADMIN');
CREATE TYPE public."VendorStatus" AS ENUM ('PENDING', 'PENDING_VALIDATION', 'APPROVED', 'REJECTED', 'SUSPENDED', 'SUSPENDED_AUTO');
CREATE TYPE public."ProductStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');
CREATE TYPE public."OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED');
CREATE TYPE public."PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');
CREATE TYPE public."SubscriptionPlan" AS ENUM ('STARTER', 'PRO', 'PREMIUM');
CREATE TYPE public."SubscriptionStatus" AS ENUM ('PENDING', 'ACTIVE', 'EXPIRED', 'CANCELLED');
CREATE TYPE public."Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');
CREATE TYPE public."AffiliateStatus" AS ENUM ('PENDING', 'ACTIVE', 'INACTIVE');
CREATE TYPE public."ReferralStatus" AS ENUM ('PENDING', 'PAID', 'CANCELLED');
CREATE TYPE public."AddressType" AS ENUM ('SHIPPING', 'BILLING');
CREATE TYPE public."ContactMessageStatus" AS ENUM ('NEW', 'READ', 'REPLIED');
CREATE TYPE public."ReportStatus" AS ENUM ('PENDING', 'REVIEWED', 'VALIDATED');

-- 3. TABLES (Coordination Prisma @map)

-- Users (Central)
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    password TEXT,
    role public."Role" DEFAULT 'USER' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- User Profiles
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    avatar TEXT,
    date_of_birth TIMESTAMP WITH TIME ZONE,
    gender public."Gender",
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Vendors
CREATE TABLE public.vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
    store_name TEXT NOT NULL,
    description TEXT,
    whatsapp TEXT,
    city TEXT,
    category TEXT,
    id_card_url TEXT,
    selfie_url TEXT,
    trial_start_date TIMESTAMP WITH TIME ZONE,
    trial_end_date TIMESTAMP WITH TIME ZONE,
    status public."VendorStatus" DEFAULT 'PENDING' NOT NULL,
    rejection_reason TEXT,
    admin_notes TEXT,
    ifu_url TEXT,
    rccm_url TEXT,
    registration_confirmed_at TIMESTAMP WITH TIME ZONE,
    activation_requested_at TIMESTAMP WITH TIME ZONE,
    activation_confirmed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Categories
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    image TEXT,
    parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Products
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.categories(id),
    name TEXT NOT NULL,
    description TEXT,
    price DOUBLE PRECISION NOT NULL,
    compare_price DOUBLE PRECISION,
    cost DOUBLE PRECISION,
    sku TEXT UNIQUE,
    barcode TEXT,
    quantity INTEGER DEFAULT 0 NOT NULL,
    weight DOUBLE PRECISION,
    status public."ProductStatus" DEFAULT 'DRAFT' NOT NULL,
    featured BOOLEAN DEFAULT false NOT NULL,
    tags TEXT[] DEFAULT '{}',
    images TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Subscriptions
CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL,
    plan public."SubscriptionPlan" NOT NULL,
    amount DOUBLE PRECISION NOT NULL,
    status public."SubscriptionStatus" DEFAULT 'PENDING' NOT NULL,
    payment_ref TEXT,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    trial_end_date TIMESTAMP WITH TIME ZONE,
    transaction_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Orders
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id),
    status public."OrderStatus" DEFAULT 'PENDING' NOT NULL,
    total DOUBLE PRECISION NOT NULL,
    subtotal DOUBLE PRECISION NOT NULL,
    tax DOUBLE PRECISION DEFAULT 0 NOT NULL,
    shipping DOUBLE PRECISION DEFAULT 0 NOT NULL,
    discount DOUBLE PRECISION DEFAULT 0 NOT NULL,
    payment_method TEXT,
    payment_status public."PaymentStatus" DEFAULT 'PENDING' NOT NULL,
    notes TEXT,
    address_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Addresses
CREATE TABLE public.addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type public."AddressType" DEFAULT 'SHIPPING' NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    company TEXT,
    address1 TEXT NOT NULL,
    address2 TEXT,
    city TEXT NOT NULL,
    province TEXT NOT NULL,
    country TEXT NOT NULL,
    zip TEXT NOT NULL,
    phone TEXT,
    is_default BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Link Order to Address
ALTER TABLE public.orders ADD CONSTRAINT orders_addressId_fkey FOREIGN KEY (address_id) REFERENCES public.addresses(id);

-- Order Items
CREATE TABLE public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id),
    quantity INTEGER NOT NULL,
    price DOUBLE PRECISION NOT NULL,
    total DOUBLE PRECISION NOT NULL
);

-- Finance Transactions
CREATE TABLE public.finance_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    amount DOUBLE PRECISION NOT NULL,
    status TEXT NOT NULL,
    provider TEXT DEFAULT 'genius_pay' NOT NULL,
    reference TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add missing relation to Subscriptions
ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_transaction_id_fkey FOREIGN KEY (transaction_id) REFERENCES public.finance_transactions(id);

-- Audit Logs
CREATE TABLE public.admin_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL REFERENCES public.users(id),
    action TEXT NOT NULL,
    target_id TEXT,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Contact Messages
CREATE TABLE public.contact_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    status public."ContactMessageStatus" DEFAULT 'NEW' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Reports
CREATE TABLE public.reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    motif TEXT NOT NULL,
    description TEXT,
    status public."ReportStatus" DEFAULT 'PENDING' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Identity Documents
CREATE TYPE public."DocStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TABLE public.identity_docs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'ID_CARD', 'SELFIE', 'IFU', 'RCCM'
    url TEXT NOT NULL,
    status public."DocStatus" DEFAULT 'PENDING' NOT NULL,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Legal Acceptance Logs
CREATE TABLE public.legal_acceptance_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    date TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    ip TEXT,
    document_version TEXT NOT NULL,
    user_agent TEXT
);

-- 4. FONCTIONS ET TRIGGERS

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Application du trigger sur les tables concernées
CREATE TRIGGER set_updated_at_users BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_profiles BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_vendors BEFORE UPDATE ON public.vendors FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_products BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_categories BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_finance_transactions BEFORE UPDATE ON public.finance_transactions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_identity_docs BEFORE UPDATE ON public.identity_docs FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Synchronisation Auth -> Public
-- Note: Cette fonction suppose que la table public.users stocke le même ID que auth.users
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, password, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        'PROTECTED_BY_SUPABASE_AUTH', -- Prisma demande un password, mais l'auth est gérée par Supabase
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        COALESCE((NEW.raw_user_meta_data->>'role')::public."Role", 'USER')
    );

    INSERT INTO public.user_profiles (user_id)
    VALUES (NEW.id);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Déclencheur sur auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- 5. SÉCURITÉ (RLS)

-- Activation RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_transactions ENABLE ROW LEVEL SECURITY;

-- Politiques Users / Profiles
CREATE POLICY "Utilisateurs peuvent voir leur propre profil" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins peuvent tout voir sur Users" ON public.users FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN'));

CREATE POLICY "Utilisateurs peuvent voir leur UserProfile" ON public.user_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Utilisateurs peuvent modifier leur UserProfile" ON public.user_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Politiques Vendors
CREATE POLICY "Tout le monde peut voir les vendeurs approuvés" ON public.vendors FOR SELECT USING (status = 'APPROVED');
CREATE POLICY "Vendeurs peuvent gérer leur profil" ON public.vendors FOR ALL USING (auth.uid() = user_id);

-- Politiques Products
CREATE POLICY "Tout le monde peut voir les produits actifs" ON public.products FOR SELECT USING (status = 'ACTIVE');
CREATE POLICY "Vendeurs peuvent gérer leurs produits" ON public.products FOR ALL USING (EXISTS (SELECT 1 FROM public.vendors WHERE id = vendor_id AND user_id = auth.uid()));

-- Politiques Orders
CREATE POLICY "Clients peuvent voir leurs commandes" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Vendeurs peuvent voir les commandes de leurs produits" ON public.orders FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.order_items oi 
    JOIN public.products p ON oi.product_id = p.id 
    JOIN public.vendors v ON p.vendor_id = v.id 
    WHERE oi.order_id = public.orders.id AND v.user_id = auth.uid()
));

-- 6. DONNÉES DE DÉPART (SEED)

-- Catégories master
INSERT INTO public.categories (name, description, updated_at)
VALUES 
  ('Mode & Vêtements', 'Femme, Homme, Enfant, Accessoires, Chaussures', now()),
  ('Électronique & Téléphones', 'Smartphones, Accessoires, Audio, Informatique', now()),
  ('Maison & Décoration', 'Meubles, Cuisine, Jardin, Literie, Luminaires', now()),
  ('Beauté & Cosmétiques', 'Soins visage, Cheveux, Parfums, Maquillage', now()),
  ('Alimentation & Boissons', 'Épicerie locale, Boissons, Produits artisanaux', now()),
  ('Services & Artisanat', 'Couture, Coiffure, Réparation, Artisanat local', now()),
  ('Bébé & Enfants', 'Vêtements bébé, Jouets, Puériculture, Scolaire', now()),
  ('Sport & Loisirs', 'Fitness, Football, Randonnée, Jeux', now())
ON CONFLICT (name) DO NOTHING;

-- 7. CONFIGURATION ADMIN
-- Assigner le rôle ADMIN à l'adresse spécifiée
-- Note: L'utilisateur doit d'abord être inscrit via Supabase Auth
UPDATE public.users SET role = 'ADMIN' WHERE email = 'odirickd@gmail.com';

-- Fin du script
