-- Backfill legacy vendor accounts into admin queue
-- Goal: make old non-confirmed vendor users visible in /admin/vendors.
-- Run in Supabase SQL editor.

BEGIN;

-- 1) Normalize unknown legacy statuses so admin filter can see them.
UPDATE public.vendors
SET
  status = 'PENDING',
  admin_notes = COALESCE(admin_notes, '') || ' | Statut legacy normalise vers PENDING',
  updated_at = now()
WHERE status NOT IN (
  'PENDING',
  'APPROVED_REGISTRATION',
  'PENDING_ACTIVATION',
  'APPROVED',
  'REJECTED',
  'SUSPENDED',
  'SUSPENDED_AUTO'
);

-- 2) Create missing vendor rows for users already marked VENDOR.
INSERT INTO public.vendors (
  user_id,
  store_name,
  description,
  whatsapp,
  city,
  category,
  status,
  admin_notes,
  created_at,
  updated_at
)
SELECT
  u.id AS user_id,
  COALESCE(NULLIF(TRIM(u.full_name), ''), SPLIT_PART(u.email, '@', 1), 'Boutique sans nom') AS store_name,
  'Dossier vendeur migre depuis un ancien compte non confirme.' AS description,
  up.phone AS whatsapp,
  'Non renseignee' AS city,
  'Autre' AS category,
  'PENDING'::public."VendorStatus" AS status,
  'Backfill auto: ancien utilisateur vendeur non confirme.' AS admin_notes,
  now(),
  now()
FROM public.users u
LEFT JOIN public.user_profiles up ON up.user_id = u.id
LEFT JOIN public.vendors v ON v.user_id = u.id
WHERE UPPER(COALESCE(u.role::text, 'USER')) = 'VENDOR'
  AND v.id IS NULL;

-- 3) Ensure there is a pending subscription linked to each pending vendor.
INSERT INTO public.subscriptions (
  user_id,
  vendor_id,
  plan,
  amount,
  status,
  created_at,
  updated_at
)
SELECT
  v.user_id,
  v.id,
  'PREMIUM'::public."SubscriptionPlan",
  0,
  'PENDING'::public."SubscriptionStatus",
  now(),
  now()
FROM public.vendors v
LEFT JOIN public.subscriptions s
  ON s.vendor_id = v.id
 AND s.status = 'PENDING'
WHERE v.status IN ('PENDING', 'APPROVED_REGISTRATION', 'PENDING_ACTIVATION')
  AND s.id IS NULL;

COMMIT;
