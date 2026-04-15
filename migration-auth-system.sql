-- ============================================================
-- LUXANDA AUTH SYSTEM MIGRATION (ULTIMATE ROBUST VERSION)
-- ============================================================

-- Ce script recrée les types Enum pour éviter TOUTES les erreurs de transaction
-- et gère les politiques RLS qui bloquent les changements de type.

DO $$
BEGIN
    -- 1. DROP POLICIES THAT BLOCK TYPE ALTERATION
    -- On supprime les politiques connues qui utilisent les colonnes "status"
    DROP POLICY IF EXISTS "Public can view active vendors" ON vendors;
    DROP POLICY IF EXISTS "Vendors can view their own products" ON products;
    DROP POLICY IF EXISTS "Public can view active products" ON products;
    -- Note: Si d'autres politiques bloquent, elles devront être supprimées manuellement ou via ce pattern
END $$;

-- 2. CONVERTIR LES COLONNES EN TEXT (INTERMÉDIAIRE)
-- On retire aussi les valeurs par défaut pour éviter les conflits
ALTER TABLE vendors ALTER COLUMN status DROP DEFAULT;
ALTER TABLE vendors ALTER COLUMN status TYPE TEXT;

ALTER TABLE products ALTER COLUMN status DROP DEFAULT;
ALTER TABLE products ALTER COLUMN status TYPE TEXT;

-- 3. RENOMMER LES ANCIENS TYPES POUR NE PAS LES SUPPRIMER TOUT DE SUITE
ALTER TYPE "VendorStatus" RENAME TO "VendorStatus_old";
ALTER TYPE "ProductStatus" RENAME TO "ProductStatus_old";

-- 4. CRÉER LES NOUVEAUX TYPES ENTIÈREMENT
CREATE TYPE "VendorStatus" AS ENUM ('INCOMPLETE', 'PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');
CREATE TYPE "ProductStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- 5. MIGRATION DES DONNÉES (DANS LES COLONNES TEXT)
UPDATE vendors SET status = 'APPROVED' WHERE status IN ('APPROVED_REGISTRATION', 'APPROVED_ACTIVATION');
UPDATE vendors SET status = 'PENDING' WHERE status IN ('PENDING_REGISTRATION', 'PENDING_ACTIVATION', 'PENDING');
UPDATE vendors SET status = 'SUSPENDED' WHERE status = 'SUSPENDED_AUTO';
UPDATE vendors SET status = 'INCOMPLETE' WHERE status IS NULL OR status = '';

UPDATE products SET status = 'APPROVED' WHERE status = 'ACTIVE';
UPDATE products SET status = 'PENDING' WHERE status = 'DRAFT' OR status IS NULL OR status = '';

-- 6. CONVERTIR LES COLONNES VERS LES NOUVEAUX TYPES
ALTER TABLE vendors ALTER COLUMN status TYPE "VendorStatus" USING status::"VendorStatus";
ALTER TABLE products ALTER COLUMN status TYPE "ProductStatus" USING status::"ProductStatus";

-- 7. RESTAURER LES VALEURS PAR DÉFAUT
ALTER TABLE vendors ALTER COLUMN status SET DEFAULT 'INCOMPLETE';
ALTER TABLE products ALTER COLUMN status SET DEFAULT 'PENDING';

-- 8. AJOUTER LES COLONNES ADDITIONNELLES
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'logo_url') THEN
    ALTER TABLE vendors ADD COLUMN logo_url TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'admin_notes') THEN
    ALTER TABLE products ADD COLUMN admin_notes TEXT;
  END IF;
END $$;

-- 9. RÉTABLIR LES POLITIQUES RLS (À ADAPTER SELON VOS BESOINS)
-- Nous recréons la politique bloquante mentionnée
CREATE POLICY "Public can view active vendors" ON vendors 
FOR SELECT USING (status = 'APPROVED');

-- 10. NETTOYAGE (Optionnel : On peut supprimer les anciens types)
DROP TYPE "VendorStatus_old";
DROP TYPE "ProductStatus_old";

-- ============================================================
-- FIN : Migration terminée avec succès en une seule fois.
-- ============================================================
