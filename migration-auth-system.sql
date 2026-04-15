-- ============================================================
-- LUXANDA AUTH SYSTEM MIGRATION (DYNAMIC POLICY VERSION)
-- ============================================================

-- Ce script est conçu pour être EXTRÊMEMENT robuste. 
-- Il supprime dynamiquement TOUTES les politiques RLS qui bloquent la migration.

DO $$
DECLARE
    pol RECORD;
BEGIN
    -- 1. SUPPRESSION DYNAMIQUE DE TOUTES LES POLITIQUES SUR VENDORS ET PRODUCTS
    FOR pol IN (
        SELECT polname, tablename 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename IN ('vendors', 'products')
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.polname, pol.tablename);
    END LOOP;
END $$;

-- 2. DÉSACTIVER RLS TEMPORAIREMENT
ALTER TABLE vendors DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- 3. CONVERTIR LES COLONNES EN TEXT ET RETIRER LES DEFAULTS
ALTER TABLE vendors ALTER COLUMN status DROP DEFAULT;
ALTER TABLE vendors ALTER COLUMN status TYPE TEXT;

ALTER TABLE products ALTER COLUMN status DROP DEFAULT;
ALTER TABLE products ALTER COLUMN status TYPE TEXT;

-- 4. RENOMMER LES ANCIENS TYPES
ALTER TYPE "VendorStatus" RENAME TO "VendorStatus_old";
ALTER TYPE "ProductStatus" RENAME TO "ProductStatus_old";

-- 5. CRÉER LES NOUVEAUX TYPES
CREATE TYPE "VendorStatus" AS ENUM ('INCOMPLETE', 'PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');
CREATE TYPE "ProductStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- 6. MIGRATION DES DONNÉES
UPDATE vendors SET status = 'APPROVED' WHERE status IN ('APPROVED_REGISTRATION', 'APPROVED_ACTIVATION', 'APPROVED');
UPDATE vendors SET status = 'PENDING' WHERE status IN ('PENDING_REGISTRATION', 'PENDING_ACTIVATION', 'PENDING');
UPDATE vendors SET status = 'SUSPENDED' WHERE status = 'SUSPENDED_AUTO' OR status = 'SUSPENDED';
UPDATE vendors SET status = 'INCOMPLETE' WHERE status IS NULL OR status = '' OR status = 'INCOMPLETE';

UPDATE products SET status = 'APPROVED' WHERE status = 'ACTIVE' OR status = 'APPROVED';
UPDATE products SET status = 'PENDING' WHERE status = 'DRAFT' OR status IS NULL OR status = '' OR status = 'PENDING';

-- 7. CONVERTIR VERS LES NOUVEAUX TYPES
ALTER TABLE vendors ALTER COLUMN status TYPE "VendorStatus" USING status::"VendorStatus";
ALTER TABLE products ALTER COLUMN status TYPE "ProductStatus" USING status::"ProductStatus";

-- 8. RESTAURER LES VALEURS PAR DÉFAUT
ALTER TABLE vendors ALTER COLUMN status SET DEFAULT 'INCOMPLETE';
ALTER TABLE products ALTER COLUMN status SET DEFAULT 'PENDING';

-- 9. AJOUTER LES COLONNES ADDITIONNELLES
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'logo_url') THEN
    ALTER TABLE vendors ADD COLUMN logo_url TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'admin_notes') THEN
    ALTER TABLE products ADD COLUMN admin_notes TEXT;
  END IF;
END $$;

-- 10. RÉACTIVER RLS ET RECRÉER LES POLITIQUES ESSENTIELLES
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- On recrée une politique de base pour la visibilité publique (A adapter si besoin)
CREATE POLICY "Public can view approved vendors" ON vendors FOR SELECT USING (status = 'APPROVED');
CREATE POLICY "Public can view approved products" ON products FOR SELECT USING (status = 'APPROVED');

-- 11. NETTOYAGE
DROP TYPE "VendorStatus_old";
DROP TYPE "ProductStatus_old";

-- ============================================================
-- FIN : Migration terminée avec succès.
-- ============================================================
