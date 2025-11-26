-- ============================================
-- Script de Configuration Supabase pour Luxanda
-- ============================================
-- Exécutez ce script dans l'éditeur SQL de Supabase
-- Dashboard → SQL Editor → New Query

-- ============================================
-- 1. Table Users
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  password TEXT,
  role TEXT DEFAULT 'USER' CHECK (role IN ('USER', 'VENDOR', 'ADMIN')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. Table User Profiles
-- ============================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  avatar TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('MALE', 'FEMALE', 'OTHER')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. Table Contact Messages
-- ============================================
CREATE TABLE IF NOT EXISTS contact_messages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'NEW' CHECK (status IN ('NEW', 'READ', 'REPLIED')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 4. Index pour améliorer les performances
-- ============================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_email ON contact_messages(email);

-- ============================================
-- 5. Fonction pour mettre à jour updated_at automatiquement
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 6. Row Level Security (RLS) Policies
-- ============================================

-- Activer RLS sur toutes les tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users peuvent lire leur propre profil
CREATE POLICY "Users can read own profile"
    ON users FOR SELECT
    USING (auth.uid() = id);

-- Policy: Users peuvent mettre à jour leur propre profil
CREATE POLICY "Users can update own profile"
    ON users FOR UPDATE
    USING (auth.uid() = id);

-- Policy: User profiles - lecture pour le propriétaire
CREATE POLICY "Users can read own user_profile"
    ON user_profiles FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: User profiles - mise à jour pour le propriétaire
CREATE POLICY "Users can update own user_profile"
    ON user_profiles FOR UPDATE
    USING (auth.uid() = user_id);

-- Policy: User profiles - insertion pour le propriétaire
CREATE POLICY "Users can insert own user_profile"
    ON user_profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Contact messages - insertion pour tous (authentifiés ou non)
CREATE POLICY "Anyone can insert contact messages"
    ON contact_messages FOR INSERT
    WITH CHECK (true);

-- Policy: Contact messages - lecture pour les admins uniquement
CREATE POLICY "Admins can read all contact messages"
    ON contact_messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'ADMIN'
        )
    );

-- Policy: Contact messages - mise à jour pour les admins uniquement
CREATE POLICY "Admins can update contact messages"
    ON contact_messages FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'ADMIN'
        )
    );

-- ============================================
-- 7. Fonction pour créer un utilisateur avec profil
-- ============================================
CREATE OR REPLACE FUNCTION create_user_with_profile(
    p_email TEXT,
    p_name TEXT,
    p_password TEXT,
    p_role TEXT DEFAULT 'USER',
    p_first_name TEXT DEFAULT NULL,
    p_last_name TEXT DEFAULT NULL,
    p_phone TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Créer l'utilisateur
    INSERT INTO users (email, name, password, role)
    VALUES (p_email, p_name, p_password, p_role)
    RETURNING id INTO v_user_id;

    -- Créer le profil si les informations sont fournies
    IF p_first_name IS NOT NULL OR p_last_name IS NOT NULL OR p_phone IS NOT NULL THEN
        INSERT INTO user_profiles (user_id, first_name, last_name, phone)
        VALUES (v_user_id, p_first_name, p_last_name, p_phone);
    END IF;

    RETURN v_user_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 8. Vues utiles (optionnel)
-- ============================================

-- Vue pour les utilisateurs avec leurs profils
CREATE OR REPLACE VIEW users_with_profiles AS
SELECT 
    u.id,
    u.email,
    u.name,
    u.role,
    u.created_at,
    u.updated_at,
    up.first_name,
    up.last_name,
    up.phone,
    up.avatar,
    up.date_of_birth,
    up.gender
FROM users u
LEFT JOIN user_profiles up ON u.id = up.user_id;

-- ============================================
-- 9. Données de test (optionnel - à supprimer en production)
-- ============================================

-- Uncomment pour créer un utilisateur admin de test
-- INSERT INTO users (email, name, password, role)
-- VALUES ('admin@luxanda.com', 'Admin', 'hashed_password_here', 'ADMIN')
-- ON CONFLICT (email) DO NOTHING;

-- ============================================
-- FIN DU SCRIPT
-- ============================================
-- Après avoir exécuté ce script :
-- 1. Vérifiez que les tables sont créées dans Supabase Dashboard → Table Editor
-- 2. Vérifiez que les policies RLS sont actives dans Authentication → Policies
-- 3. Testez la connexion avec votre application

