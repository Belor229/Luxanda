-- ============================================================
-- LUXANDA AUTH SYSTEM MIGRATION (DEFINITIVE FIX)
-- ============================================================

-- Ce script permet de mettre à jour les énumérations et les données
-- en une seule fois en contournant la restriction "unsafe use of new value".

-- 1. Désactiver temporairement les contraintes de typeEnum
ALTER TABLE vendors ALTER COLUMN status TYPE text;
ALTER TABLE products ALTER COLUMN status TYPE text;

-- 2. Mettre à jour les Enums avec les nouvelles valeurs
ALTER TYPE "VendorStatus" ADD VALUE IF NOT EXISTS 'INCOMPLETE';
ALTER TYPE "ProductStatus" ADD VALUE IF NOT EXISTS 'PENDING';
ALTER TYPE "ProductStatus" ADD VALUE IF NOT EXISTS 'APPROVED';
ALTER TYPE "ProductStatus" ADD VALUE IF NOT EXISTS 'REJECTED';

-- 3. Migration des données des VENDEURS
UPDATE vendors 
SET status = 'PENDING' 
WHERE status IN ('APPROVED_REGISTRATION', 'PENDING_ACTIVATION', 'PENDING'); -- PENDING au cas où c'est déjà bon

UPDATE vendors 
SET status = 'SUSPENDED' 
WHERE status = 'SUSPENDED_AUTO';

-- 4. Migration des données des PRODUITS
UPDATE products 
SET status = 'APPROVED' 
WHERE status = 'ACTIVE';

UPDATE products 
SET status = 'PENDING' 
WHERE status = 'DRAFT';

-- 5. S'assurer que les colonnes additionnelles existent
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'logo_url') THEN
    ALTER TABLE vendors ADD COLUMN logo_url TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'admin_notes') THEN
    ALTER TABLE products ADD COLUMN admin_notes TEXT;
  END IF;
END $$;

-- 6. Restaurer les types Enum et les valeurs par défaut
ALTER TABLE vendors ALTER COLUMN status TYPE "VendorStatus" USING status::"VendorStatus";
ALTER TABLE vendors ALTER COLUMN status SET DEFAULT 'INCOMPLETE';

ALTER TABLE products ALTER COLUMN status TYPE "ProductStatus" USING status::"ProductStatus";
ALTER TABLE products ALTER COLUMN status SET DEFAULT 'PENDING';

-- ============================================================
-- FIN : Migration terminée
-- ============================================================
