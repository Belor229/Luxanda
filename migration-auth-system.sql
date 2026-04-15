-- ============================================================
-- LUXANDA AUTH SYSTEM MIGRATION
-- Vendor status simplification + Product approval workflow
-- ============================================================

-- 1. Add INCOMPLETE to VendorStatus enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'INCOMPLETE' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'VendorStatus')) THEN
    ALTER TYPE "VendorStatus" ADD VALUE 'INCOMPLETE' BEFORE 'PENDING';
  END IF;
END $$;

-- 2. Migrate intermediary vendor statuses to simpler ones
UPDATE vendors SET status = 'PENDING' WHERE status::text IN ('APPROVED_REGISTRATION', 'PENDING_ACTIVATION');
UPDATE vendors SET status = 'SUSPENDED' WHERE status::text = 'SUSPENDED_AUTO';

-- 3. Add logo_url to vendors if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'logo_url') THEN
    ALTER TABLE vendors ADD COLUMN logo_url TEXT;
  END IF;
END $$;

-- 4. Add admin_notes to products if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'admin_notes') THEN
    ALTER TABLE products ADD COLUMN admin_notes TEXT;
  END IF;
END $$;

-- 5. Update ProductStatus enum
-- Add new values first
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'PENDING' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'ProductStatus')) THEN
    ALTER TYPE "ProductStatus" ADD VALUE 'PENDING';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'APPROVED' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'ProductStatus')) THEN
    ALTER TYPE "ProductStatus" ADD VALUE 'APPROVED';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'REJECTED' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'ProductStatus')) THEN
    ALTER TYPE "ProductStatus" ADD VALUE 'REJECTED';
  END IF;
END $$;

-- 6. Migrate existing product data
-- ACTIVE -> APPROVED, DRAFT -> PENDING
UPDATE products SET status = 'APPROVED' WHERE status = 'ACTIVE';
UPDATE products SET status = 'PENDING' WHERE status = 'DRAFT';

-- Products marked as ARCHIVED stay as-is for now (we keep the enum value but won't use it)
-- If you want to migrate archived products: UPDATE products SET status = 'REJECTED' WHERE status = 'ARCHIVED';

-- ============================================================
-- DONE: Run this in Supabase SQL Editor
-- After running, do `npx prisma db pull` to sync schema
-- ============================================================
