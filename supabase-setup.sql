-- ============================================
-- LUXANDA - CONFIGURATION SUPABASE FINALE (V4)
-- Date : 2026-02-20
-- ============================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS (Aligned with Prisma)
DO $$ BEGIN
    CREATE TYPE "Role" AS ENUM ('USER', 'VENDOR', 'ADMIN');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "SubscriptionPlan" AS ENUM ('STARTER', 'PRO', 'PREMIUM');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "SubscriptionStatus" AS ENUM ('PENDING', 'ACTIVE', 'EXPIRED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "VendorStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "ProductStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'REVIEWED', 'VALIDATED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. TABLES (Aligned with Prisma @map names)

-- Profiles (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role "Role" DEFAULT 'USER' NOT NULL,
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Vendors (mapped from Vendor)
CREATE TABLE IF NOT EXISTS public.vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    store_name TEXT NOT NULL,
    description TEXT,
    whatsapp TEXT,
    city TEXT,
    category TEXT,
    id_card_url TEXT,
    selfie_url TEXT,
    trial_start_date TIMESTAMP WITH TIME ZONE,
    trial_end_date TIMESTAMP WITH TIME ZONE,
    status "VendorStatus" DEFAULT 'PENDING' NOT NULL,
    verified BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Categories
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Products
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "vendorId" UUID REFERENCES public.vendors(id) ON DELETE CASCADE NOT NULL,
    "categoryId" UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    price DOUBLE PRECISION NOT NULL,
    quantity INTEGER DEFAULT 0 NOT NULL,
    images TEXT[] DEFAULT '{}'::TEXT[] NOT NULL,
    status "ProductStatus" DEFAULT 'DRAFT' NOT NULL,
    featured BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Subscriptions
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    plan "SubscriptionPlan" NOT NULL,
    amount DOUBLE PRECISION NOT NULL,
    status "SubscriptionStatus" DEFAULT 'PENDING' NOT NULL,
    payment_ref TEXT,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    trial_end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Legal Acceptance Logs
CREATE TABLE IF NOT EXISTS public.legal_acceptance_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    ip TEXT,
    document_version TEXT NOT NULL,
    user_agent TEXT
);

-- Reports
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    motif TEXT NOT NULL,
    description TEXT,
    status "ReportStatus" DEFAULT 'PENDING' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Rate Limits Table
CREATE TABLE IF NOT EXISTS public.rate_limits (
    key TEXT PRIMARY KEY,
    hits INTEGER DEFAULT 1,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- 4. ROW LEVEL SECURITY (RLS)

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_acceptance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Policies for Profiles
CREATE POLICY "Profiles - Self Read" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Profiles - Self Update" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Profiles - Admin All" ON public.profiles FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN'));

-- Policies for Vendors
CREATE POLICY "Vendors - Public Read" ON public.vendors FOR SELECT USING (status = 'APPROVED');
CREATE POLICY "Vendors - Owner Update" ON public.vendors FOR UPDATE USING (auth.uid() = "userId");
CREATE POLICY "Vendors - Owner Insert" ON public.vendors FOR INSERT WITH CHECK (auth.uid() = "userId");
CREATE POLICY "Vendors - Admin All" ON public.vendors FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN'));

-- Policies for Categories
CREATE POLICY "Categories - Public Read" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Categories - Admin All" ON public.categories FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN'));

-- Policies for Products
CREATE POLICY "Products - Public Read Active" ON public.products FOR SELECT USING (
    status = 'ACTIVE' AND EXISTS (
        SELECT 1 FROM public.vendors 
        WHERE id = "vendorId" 
        AND status = 'APPROVED' 
        AND trial_end_date > now()
    )
);
CREATE POLICY "Products - Seller Management" ON public.products FOR ALL USING (EXISTS (SELECT 1 FROM public.vendors WHERE id = "vendorId" AND "userId" = auth.uid()));
CREATE POLICY "Products - Admin All" ON public.products FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN'));

-- Policies for Subscriptions
CREATE POLICY "Subscriptions - Owner Read" ON public.subscriptions FOR SELECT USING (auth.uid() = "userId");
CREATE POLICY "Subscriptions - Owner Update" ON public.subscriptions FOR UPDATE USING (auth.uid() = "userId");
CREATE POLICY "Subscriptions - Admin All" ON public.subscriptions FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN'));

-- Policies for Legal Acceptance Logs
CREATE POLICY "Legal Logs - Self Read" ON public.legal_acceptance_logs FOR SELECT USING (auth.uid() = "userId");
CREATE POLICY "Legal Logs - Self Insert" ON public.legal_acceptance_logs FOR INSERT WITH CHECK (auth.uid() = "userId");
CREATE POLICY "Legal Logs - Admin All" ON public.legal_acceptance_logs FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN'));

-- Policies for Reports
CREATE POLICY "Reports - Self Read" ON public.reports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Reports - Anyone Insert" ON public.reports FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Reports - Admin All" ON public.reports FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN'));

-- 5. FUNCTIONS & TRIGGERS

-- Fix: Trigger to handle user creation on Auth Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'first_name' || ' ' || NEW.raw_user_meta_data->>'last_name'),
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE((NEW.raw_user_meta_data->>'role')::"Role", 'USER'::"Role"),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for automatic subscription row (PENDING, trial starts after Admin Approval)
CREATE OR REPLACE FUNCTION public.handle_new_vendor_subscription()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.subscriptions ("userId", plan, amount, status)
    VALUES (NEW."userId", 'PREMIUM', 0, 'PENDING');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-attach Triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS on_vendor_created_subscription ON public.vendors;
CREATE TRIGGER on_vendor_created_subscription AFTER INSERT ON public.vendors FOR EACH ROW EXECUTE FUNCTION public.handle_new_vendor_subscription();

-- updated_at automation
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER tr_vendors_updated BEFORE UPDATE ON public.vendors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER tr_products_updated BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER tr_subscriptions_updated BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 6. STORAGE POLICIES
-- ============================================

-- Policies for identity-documents bucket
-- Note: Requires the bucket 'identity-documents' to exist.
-- Only Admins can see the documents.

CREATE POLICY "Admins can see identity documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'identity-documents' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'ADMIN'
  )
);

CREATE POLICY "Service Role can do everything"
ON storage.objects FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
