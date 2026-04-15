-- ============================================================
-- LUXANDA AUTH SYSTEM MIGRATION (FIXED)
-- ============================================================

-- IMPORTANT: RUN THIS SCRIPT IN TWO SEPARATE STEPS
-- POSTGRES REQUIRE QUE LES NOUVELLES VALEURS D'ENUM SOIENT VALIDÉES 
-- AVANT D'ÊTRE UTILISÉES DANS UN UPDATE DANS LA MÊME TRANSACTION.

-- ============================================================
-- PARTIE 1 : MISE À JOUR DU SCHÉMA
-- ============================================================

-- 1. Ajouter les valeurs aux Enums (Si elles n'existent pas)
ALTER TYPE "VendorStatus" ADD VALUE IF NOT EXISTS 'INCOMPLETE';
ALTER TYPE "ProductStatus" ADD VALUE IF NOT EXISTS 'PENDING';
ALTER TYPE "ProductStatus" ADD VALUE IF NOT EXISTS 'APPROVED';
ALTER TYPE "ProductStatus" ADD VALUE IF NOT EXISTS 'REJECTED';

-- 2. Ajouter les colonnes manquantes
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'logo_url') THEN
    ALTER TABLE vendors ADD COLUMN logo_url TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'admin_notes') THEN
    ALTER TABLE products ADD COLUMN admin_notes TEXT;
  END IF;
END $$;

-- ============================================================
-- ARRÊT : EXÉCUTEZ LA PARTIE CI-DESSUS D'ABORD, PUIS CELLE CI-DESSOUS
-- ============================================================

-- ============================================================
-- PARTIE 2 : MIGRATION DES DONNÉES
-- ============================================================

-- 3. Migration des vendeurs (avec cast text pour sécurité)
UPDATE vendors 
SET status = 'PENDING'::"VendorStatus" 
WHERE status::text IN ('APPROVED_REGISTRATION', 'PENDING_ACTIVATION');

UPDATE vendors 
SET status = 'SUSPENDED'::"VendorStatus" 
WHERE status::text = 'SUSPENDED_AUTO';

-- 4. Migration des produits
UPDATE products 
SET status = 'APPROVED'::"ProductStatus" 
WHERE status::text = 'ACTIVE';

UPDATE products 
SET status = 'PENDING'::"ProductStatus" 
WHERE status::text = 'DRAFT';

-- ============================================================
-- FIN : Migration terminée
-- ============================================================
