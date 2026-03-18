-- ==============================================================================
-- LUXANDA - SCRIPT DE SÉCURITÉ RLS (Row Level Security)
-- À exécuter dans la section SQL Editor de votre tableau de bord Supabase
-- ==============================================================================

-- 1. Activation de la RLS sur toutes les tables sensibles
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- POLITIQUES POUR LA TABLE 'users'
-- ==========================================
-- Lecture : Chaque utilisateur peut lire son propre profil, les admins peuvent lire tous les profils
CREATE POLICY "Users can read own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can read all users" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Mise à jour : Chaque utilisateur peut modifier son propre profil
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- ==========================================
-- POLITIQUES POUR LA TABLE 'vendors'
-- ==========================================
-- Lecture : Tout le monde peut voir les vendeurs validés
CREATE POLICY "Public can view approved vendors" ON public.vendors
  FOR SELECT USING (status = 'APPROVED');

-- Lecture (proprio) : Un vendeur peut toujours voir son propre profil vendeur
CREATE POLICY "Vendors can view own profile" ON public.vendors
  FOR SELECT USING (user_id::uuid = auth.uid());

-- Mise à jour : Un vendeur peut mettre à jour ses infos
CREATE POLICY "Vendors can update own profile" ON public.vendors
  FOR UPDATE USING (user_id::uuid = auth.uid());

-- ==========================================
-- POLITIQUES POUR LA TABLE 'subscriptions'
-- ==========================================
-- Lecture : Un vendeur peut voir son propre abonnement
CREATE POLICY "Vendors can view own subscriptions" ON public.subscriptions
  FOR SELECT USING (
    vendor_id::uuid IN (SELECT id::uuid FROM public.vendors WHERE user_id::uuid = auth.uid())
  );

-- Admin peut tout voir
CREATE POLICY "Admins can read all subscriptions" ON public.subscriptions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Insert/Update par le système seulement (via Service Role dans les API)
-- Aucune politique pour Insert/Update par un utilisateur authentifié simple,
-- sauf s'il est admin.
CREATE POLICY "Admins can manage subscriptions" ON public.subscriptions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- ==========================================
-- POLITIQUES POUR LA TABLE 'products'
-- ==========================================
-- Lecture : Tout le monde peut lire les produits 'ACTIVE'
CREATE POLICY "Public can view active products" ON public.products
  FOR SELECT USING (status = 'ACTIVE');

-- Lecture (proprio) : Un vendeur peut voir tous ses produits (même DRAFT)
CREATE POLICY "Vendors can view own products" ON public.products
  FOR SELECT USING (
    vendor_id::uuid IN (SELECT id::uuid FROM public.vendors WHERE user_id::uuid = auth.uid())
  );

-- Création / Mise à jour / Suppression : Le vendeur propriétaire
CREATE POLICY "Vendors can insert products" ON public.products
  FOR INSERT WITH CHECK (
    vendor_id::uuid IN (SELECT id::uuid FROM public.vendors WHERE user_id::uuid = auth.uid())
  );

CREATE POLICY "Vendors can update own products" ON public.products
  FOR UPDATE USING (
    vendor_id::uuid IN (SELECT id::uuid FROM public.vendors WHERE user_id::uuid = auth.uid())
  );

CREATE POLICY "Vendors can delete own products" ON public.products
  FOR DELETE USING (
    vendor_id::uuid IN (SELECT id::uuid FROM public.vendors WHERE user_id::uuid = auth.uid())
  );

-- ==========================================
-- POLITIQUES POUR LA TABLE 'orders'
-- ==========================================
-- Lecture (Client) : Le client peut voir ses propres commandes
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (user_id::uuid = auth.uid());

-- Lecture (Vendeur) : Le vendeur peut voir les commandes pour ses produits
CREATE POLICY "Vendors can view orders for their products" ON public.orders
  FOR SELECT USING (
    vendor_id::uuid IN (SELECT id::uuid FROM public.vendors WHERE user_id::uuid = auth.uid())
  );

-- Création : Tout utilisateur connecté peut créer une commande
CREATE POLICY "Users can create orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id::uuid);

-- Mise à jour : Le vendeur peut mettre à jour le statut de la commande
CREATE POLICY "Vendors can update own orders" ON public.orders
  FOR UPDATE USING (
    vendor_id::uuid IN (SELECT id::uuid FROM public.vendors WHERE user_id::uuid = auth.uid())
  );
