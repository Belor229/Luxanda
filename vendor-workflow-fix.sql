-- LUXANDA - MISE À JOUR FLUX VALIDATION VENDEUR (FINAL)
-- Flux : Inscription -> Confirmation Admin 1 -> Activation Vendeur -> Confirmation Admin 2

-- 1. MISE À JOUR DE L'ENUM
DO $$ BEGIN
    ALTER TYPE public."VendorStatus" ADD VALUE 'APPROVED_REGISTRATION';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TYPE public."VendorStatus" ADD VALUE 'PENDING_ACTIVATION';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. AJOUT DES COLONNES POUR LES DOCUMENTS ET LE SUIVI
-- Note: storeName reste inchangé pour éviter de casser le frontend
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS ifu_url TEXT;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS rccm_url TEXT;

-- Colonnes de suivi du flux en snake_case (standard pour les nouveaux ajouts)
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS registration_confirmed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS activation_requested_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS activation_confirmed_at TIMESTAMP WITH TIME ZONE;

-- 3. POLITIQUES RLS
-- Les politiques existantes basées sur auth.uid() = "userId" couvriront les nouveaux champs

-- 4. INDEX
CREATE INDEX IF NOT EXISTS idx_vendors_status_v3 ON public.vendors(status);
