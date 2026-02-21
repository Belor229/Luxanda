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

-- Legal Acceptance [CORRECTED]
CREATE TABLE IF NOT EXISTS public.legal_acceptance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    version TEXT NOT NULL,
    accepted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. ROW LEVEL SECURITY (RLS)

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_acceptance ENABLE ROW LEVEL SECURITY;

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
CREATE POLICY "Products - Public Read Active" ON public.products FOR SELECT USING (status = 'ACTIVE' AND EXISTS (SELECT 1 FROM public.vendors WHERE id = "vendorId" AND status = 'APPROVED'));
CREATE POLICY "Products - Seller Management" ON public.products FOR ALL USING (EXISTS (SELECT 1 FROM public.vendors WHERE id = "vendorId" AND "userId" = auth.uid()));
CREATE POLICY "Products - Admin All" ON public.products FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN'));

-- Policies for Subscriptions
CREATE POLICY "Subscriptions - Owner Read" ON public.subscriptions FOR SELECT USING (auth.uid() = "userId");
CREATE POLICY "Subscriptions - Owner Update" ON public.subscriptions FOR UPDATE USING (auth.uid() = "userId");
CREATE POLICY "Subscriptions - Admin All" ON public.subscriptions FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN'));

-- Policies for Legal Acceptance
CREATE POLICY "Legal Acceptance - Self Read" ON public.legal_acceptance FOR SELECT USING (auth.uid() = "userId");
CREATE POLICY "Legal Acceptance - Self Insert" ON public.legal_acceptance FOR INSERT WITH CHECK (auth.uid() = "userId");
CREATE POLICY "Legal Acceptance - Admin All" ON public.legal_acceptance FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN'));

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

-- Fix: Trigger for automatic 60-day trial for new vendors
CREATE OR REPLACE FUNCTION public.handle_new_vendor_subscription()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.subscriptions ("userId", plan, amount, status, start_date, end_date, trial_end_date)
    VALUES (NEW."userId", 'PREMIUM', 0, 'ACTIVE', now(), now() + interval '60 days', now() + interval '60 days');
    
    -- Update vendor status to reflect they are now active and verified for the trial
    UPDATE public.vendors SET status = 'APPROVED' WHERE id = NEW.id;
    
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
