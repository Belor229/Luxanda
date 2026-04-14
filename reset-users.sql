-- reset-users.sql
-- Description: Ce script supprime tous les utilisateurs actuels et insère deux utilisateurs spécifiques.

-- 1. Supprimer tous les utilisateurs existants. (Cela supprimera en cascade les entrées dans public.users si des FK existent ou sinon le trigger supprimera tout).
DELETE FROM auth.users;
DELETE FROM public.users;

-- 2. Insérer l'Administrateur
INSERT INTO auth.users (
    id, 
    instance_id, 
    email, 
    encrypted_password, 
    email_confirmed_at, 
    raw_app_meta_data, 
    raw_user_meta_data, 
    created_at, 
    updated_at, 
    role, 
    confirmation_token, 
    recovery_token, 
    email_change_token_new, 
    email_change
) VALUES (
    uuid_generate_v4(),
    '00000000-0000-0000-0000-000000000000',
    'odirickd@gmail.com',
    crypt('Serena100925', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Admin Principal","role":"ADMIN"}',
    now(),
    now(),
    'authenticated',
    '', '', '', ''
);

-- 3. Insérer le Vendeur
INSERT INTO auth.users (
    id, 
    instance_id, 
    email, 
    encrypted_password, 
    email_confirmed_at, 
    raw_app_meta_data, 
    raw_user_meta_data, 
    created_at, 
    updated_at, 
    role, 
    confirmation_token, 
    recovery_token, 
    email_change_token_new, 
    email_change
) VALUES (
    uuid_generate_v4(),
    '00000000-0000-0000-0000-000000000000',
    'koladigitalentreprise@gmail.com',
    crypt('koladigitalentreprise', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Kola Digital Entreprise","role":"VENDOR"}',
    now(),
    now(),
    'authenticated',
    '', '', '', ''
);

-- Note: Le trigger "on_auth_user_created" s'occupe de répliquer les données vers public.users automatiquement.
