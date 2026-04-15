-- ============================================================
-- LUXANDA AUTH SYSTEM MIGRATION (CONSOLIDATED & ATOMIC)
-- ============================================================

-- Ce script utilise RENAME VALUE pour une migration atomique. 
-- Cela évite les erreurs de RLS et les restrictions de transaction.

DO $$
BEGIN
    -- 1. Mise à jour de VendorStatus
    -- On renomme les anciens statuts vers les nouveaux (si ils existent)
    
    IF EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'APPROVED_REGISTRATION' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'VendorStatus')) THEN
        ALTER TYPE "VendorStatus" RENAME VALUE 'APPROVED_REGISTRATION' TO 'APPROVED';
    END IF;

    IF EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'SUSPENDED_AUTO' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'VendorStatus')) THEN
        ALTER TYPE "VendorStatus" RENAME VALUE 'SUSPENDED_AUTO' TO 'SUSPENDED';
    END IF;

    -- Ajouter INCOMPLETE si il manque
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'INCOMPLETE' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'VendorStatus')) THEN
        ALTER TYPE "VendorStatus" ADD VALUE 'INCOMPLETE' BEFORE 'PENDING';
    END IF;

    -- 2. Mise à jour de ProductStatus
    
    IF EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'ACTIVE' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'ProductStatus')) THEN
        ALTER TYPE "ProductStatus" RENAME VALUE 'ACTIVE' TO 'APPROVED';
    END IF;

    IF EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'DRAFT' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'ProductStatus')) THEN
        ALTER TYPE "ProductStatus" RENAME VALUE 'DRAFT' TO 'PENDING';
    END IF;

    -- Ajouter REJECTED si il manque
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'REJECTED' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'ProductStatus')) THEN
        ALTER TYPE "ProductStatus" ADD VALUE 'REJECTED';
    END IF;

END $$;

-- 3. Gérer les cas restants via UPDATE (Maintenant safe car les types sont déjà à jour)
-- Les vendeurs qui étaient en PENDING_ACTIVATION ou autres sont ramenés vers PENDING
UPDATE vendors 
SET status = 'PENDING'::"VendorStatus" 
WHERE status::text IN ('PENDING_REGISTRATION', 'PENDING_ACTIVATION', 'APPROVED_ACTIVATION');

-- 4. Ajouter les colonnes manquantes
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'logo_url') THEN
    ALTER TABLE vendors ADD COLUMN logo_url TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'admin_notes') THEN
    ALTER TABLE products ADD COLUMN admin_notes TEXT;
  END IF;
END $$;

-- 5. S'assurer que les valeurs par défaut sont correctes
ALTER TABLE vendors ALTER COLUMN status SET DEFAULT 'INCOMPLETE';
ALTER TABLE products ALTER COLUMN status SET DEFAULT 'PENDING';

-- ============================================================
-- FIN : Migration terminée
-- ============================================================
