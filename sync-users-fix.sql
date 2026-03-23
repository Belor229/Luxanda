-- Luxanda - Sync Existing Users (Auth to Public)
-- run this in Supabase SQL Editor to link existing auth users to the public.users table

INSERT INTO public.users (id, email, password, name, role)
SELECT 
    id, 
    email, 
    'PROTECTED_BY_SUPABASE_AUTH', 
    COALESCE(raw_user_meta_data->>'full_name', email),
    COALESCE((raw_user_meta_data->>'role')::public."Role", 'USER')
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- Also sync profiles
INSERT INTO public.user_profiles ("userId")
SELECT id FROM auth.users
ON CONFLICT ("userId") DO NOTHING;

-- Assign ADMIN role to the main user if not already done
UPDATE public.users SET role = 'ADMIN' WHERE email = 'odirickd@gmail.com';
