-- luxanda_categories_seed.sql
-- Exécution requise dans l'interface SQL Editor de Supabase pour initialiser les catégories
-- Assurez-vous que la table `categories` correspond au schéma de la base de données.

INSERT INTO public.categories (id, name, description, "updatedAt")
VALUES 
  (gen_random_uuid(), 'Mode & Vêtements', 'Femme, Homme, Enfant, Accessoires, Chaussures', now()),
  (gen_random_uuid(), 'Électronique & Téléphones', 'Smartphones, Accessoires, Audio, Informatique', now()),
  (gen_random_uuid(), 'Maison & Décoration', 'Meubles, Cuisine, Jardin, Literie, Luminaires', now()),
  (gen_random_uuid(), 'Beauté & Cosmétiques', 'Soins visage, Cheveux, Parfums, Maquillage', now()),
  (gen_random_uuid(), 'Alimentation & Boissons', 'Épicerie locale, Boissons, Produits artisanaux', now()),
  (gen_random_uuid(), 'Services & Artisanat', 'Couture, Coiffure, Réparation, Artisanat local', now()),
  (gen_random_uuid(), 'Bébé & Enfants', 'Vêtements bébé, Jouets, Puériculture, Scolaire', now()),
  (gen_random_uuid(), 'Sport & Loisirs', 'Fitness, Football, Randonnée, Jeux', now())
ON CONFLICT (name) DO NOTHING;
