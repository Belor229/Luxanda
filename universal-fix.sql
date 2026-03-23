-- Luxanda - Universal Repair & Snake_case Migration Script
-- This script fixes trigger issues, secures admin checks, and standardizes naming conventions.

-- 1. FIX: Update handle_new_auth_user to be robust (Use ON CONFLICT)
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into users table
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'full_name', new.email), 'USER')
  ON CONFLICT (id) DO UPDATE SET 
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role;

  -- Insert into user_profiles table
  INSERT INTO public.user_profiles (id, user_id)
  VALUES (gen_random_uuid(), new.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. FIX: Secure check_is_admin and prevent recursion
CREATE OR REPLACE FUNCTION public.check_is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN (
    SELECT role = 'ADMIN'
    FROM public.users
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. MIGRATION: Standardize all tables to snake_case
-- Function for safe column rename
CREATE OR REPLACE FUNCTION rename_column_if_exists(t_name text, old_col text, new_col text) 
RETURNS void AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = t_name AND column_name = old_col) THEN
    EXECUTE format('ALTER TABLE public.%I RENAME COLUMN %I TO %I', t_name, old_col, new_col);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Perform Renames
-- Users
SELECT rename_column_if_exists('users', 'fullName', 'full_name');
SELECT rename_column_if_exists('users', 'name', 'full_name');
SELECT rename_column_if_exists('users', 'createdAt', 'created_at');
SELECT rename_column_if_exists('users', 'updatedAt', 'updated_at');

-- User Profiles
SELECT rename_column_if_exists('user_profiles', 'userId', 'user_id');
SELECT rename_column_if_exists('user_profiles', 'firstName', 'first_name');
SELECT rename_column_if_exists('user_profiles', 'lastName', 'last_name');
SELECT rename_column_if_exists('user_profiles', 'dateOfBirth', 'date_of_birth');
SELECT rename_column_if_exists('user_profiles', 'createdAt', 'created_at');
SELECT rename_column_if_exists('user_profiles', 'updatedAt', 'updated_at');

-- Vendors
SELECT rename_column_if_exists('vendors', 'userId', 'user_id');
SELECT rename_column_if_exists('vendors', 'storeName', 'store_name');
SELECT rename_column_if_exists('vendors', 'rejectionReason', 'rejection_reason');
SELECT rename_column_if_exists('vendors', 'adminNotes', 'admin_notes');
SELECT rename_column_if_exists('vendors', 'createdAt', 'created_at');
SELECT rename_column_if_exists('vendors', 'updatedAt', 'updated_at');
SELECT rename_column_if_exists('vendors', 'registrationConfirmedAt', 'registration_confirmed_at');
SELECT rename_column_if_exists('vendors', 'activationRequestedAt', 'activation_requested_at');
SELECT rename_column_if_exists('vendors', 'activationConfirmedAt', 'activation_confirmed_at');

-- Affiliates
SELECT rename_column_if_exists('affiliates', 'userId', 'user_id');
SELECT rename_column_if_exists('affiliates', 'createdAt', 'created_at');
SELECT rename_column_if_exists('affiliates', 'updatedAt', 'updated_at');

-- Products
SELECT rename_column_if_exists('products', 'vendorId', 'vendor_id');
SELECT rename_column_if_exists('products', 'comparePrice', 'compare_price');
SELECT rename_column_if_exists('products', 'categoryId', 'category_id');
SELECT rename_column_if_exists('products', 'createdAt', 'created_at');
SELECT rename_column_if_exists('products', 'updatedAt', 'updated_at');

-- Product Variants
SELECT rename_column_if_exists('product_variants', 'productId', 'product_id');

-- Categories
SELECT rename_column_if_exists('categories', 'parentId', 'parent_id');
SELECT rename_column_if_exists('categories', 'createdAt', 'created_at');
SELECT rename_column_if_exists('categories', 'updatedAt', 'updated_at');

-- Orders
SELECT rename_column_if_exists('orders', 'userId', 'user_id');
SELECT rename_column_if_exists('orders', 'paymentMethod', 'payment_method');
SELECT rename_column_if_exists('orders', 'paymentStatus', 'payment_status');
SELECT rename_column_if_exists('orders', 'addressId', 'address_id');
SELECT rename_column_if_exists('orders', 'createdAt', 'created_at');
SELECT rename_column_if_exists('orders', 'updatedAt', 'updated_at');

-- Order Items
SELECT rename_column_if_exists('order_items', 'orderId', 'order_id');
SELECT rename_column_if_exists('order_items', 'productId', 'product_id');

-- Carts
SELECT rename_column_if_exists('carts', 'userId', 'user_id');

-- Cart Items
SELECT rename_column_if_exists('cart_items', 'cartId', 'cart_id');
SELECT rename_column_if_exists('cart_items', 'productId', 'product_id');

-- Addresses
SELECT rename_column_if_exists('addresses', 'userId', 'user_id');
SELECT rename_column_if_exists('addresses', 'firstName', 'first_name');
SELECT rename_column_if_exists('addresses', 'lastName', 'last_name');
SELECT rename_column_if_exists('addresses', 'isDefault', 'is_default');
SELECT rename_column_if_exists('addresses', 'createdAt', 'created_at');
SELECT rename_column_if_exists('addresses', 'updatedAt', 'updated_at');

-- Reviews
SELECT rename_column_if_exists('reviews', 'userId', 'user_id');
SELECT rename_column_if_exists('reviews', 'productId', 'product_id');
SELECT rename_column_if_exists('reviews', 'createdAt', 'created_at');
SELECT rename_column_if_exists('reviews', 'updatedAt', 'updated_at');

-- Reports
SELECT rename_column_if_exists('reports', 'productId', 'product_id');
SELECT rename_column_if_exists('reports', 'vendorId', 'vendor_id');
SELECT rename_column_if_exists('reports', 'userId', 'user_id');
SELECT rename_column_if_exists('reports', 'createdAt', 'created_at');

-- Rewards
SELECT rename_column_if_exists('rewards', 'userId', 'user_id');
SELECT rename_column_if_exists('rewards', 'createdAt', 'created_at');
SELECT rename_column_if_exists('rewards', 'updatedAt', 'updated_at');

-- Referrals
SELECT rename_column_if_exists('referrals', 'referrerId', 'referrer_id');
SELECT rename_column_if_exists('referrals', 'referredId', 'referred_id');
SELECT rename_column_if_exists('referrals', 'createdAt', 'created_at');
SELECT rename_column_if_exists('referrals', 'updatedAt', 'updated_at');

-- Subscriptions
SELECT rename_column_if_exists('subscriptions', 'userId', 'user_id');
SELECT rename_column_if_exists('subscriptions', 'vendorId', 'vendor_id');
SELECT rename_column_if_exists('subscriptions', 'paymentRef', 'payment_ref');
SELECT rename_column_if_exists('subscriptions', 'startDate', 'start_date');
SELECT rename_column_if_exists('subscriptions', 'endDate', 'end_date');
SELECT rename_column_if_exists('subscriptions', 'trialEndDate', 'trial_end_date');
SELECT rename_column_if_exists('subscriptions', 'createdAt', 'created_at');
SELECT rename_column_if_exists('subscriptions', 'updatedAt', 'updated_at');

-- Legal Acceptance Logs
SELECT rename_column_if_exists('legal_acceptance_logs', 'userId', 'user_id');
SELECT rename_column_if_exists('legal_acceptance_logs', 'documentVersion', 'document_version');
SELECT rename_column_if_exists('legal_acceptance_logs', 'userAgent', 'user_agent');

-- 4. ADD NEW COLUMNS
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS ifu_url TEXT;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS rccm_url TEXT;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS whatsapp TEXT;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS category TEXT;

-- 4.5. FIX: Make password nullable in users
ALTER TABLE public.users ALTER COLUMN password DROP NOT NULL;

-- 5. POLICIES & SECURITY
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own record" ON public.users;
CREATE POLICY "Users can view own record" ON public.users FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins have full access to users" ON public.users;
CREATE POLICY "Admins have full access to users" ON public.users FOR ALL USING (public.check_is_admin());

DROP POLICY IF EXISTS "Admins have full access to vendors" ON public.vendors;
CREATE POLICY "Admins have full access to vendors" ON public.vendors FOR ALL USING (public.check_is_admin());

-- 6. LEGAL ACCEPTANCE LOGS RLS
ALTER TABLE public.legal_acceptance_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert own logs" ON public.legal_acceptance_logs;
CREATE POLICY "Users can insert own logs" ON public.legal_acceptance_logs 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own logs" ON public.legal_acceptance_logs;
CREATE POLICY "Users can view own logs" ON public.legal_acceptance_logs 
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all logs" ON public.legal_acceptance_logs;
CREATE POLICY "Admins can view all logs" ON public.legal_acceptance_logs 
  FOR ALL USING (public.check_is_admin());

-- 7. VENDORS RLS - Allow vendors to see their own row
DROP POLICY IF EXISTS "Vendors can view own record" ON public.vendors;
CREATE POLICY "Vendors can view own record" ON public.vendors 
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Vendors can insert own record" ON public.vendors;
CREATE POLICY "Vendors can insert own record" ON public.vendors 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- DONE!
