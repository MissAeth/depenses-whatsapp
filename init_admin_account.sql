-- Script d'initialisation du premier compte administrateur
-- À exécuter une seule fois dans Supabase SQL Editor

-- Supprimer le compte s'il existe déjà (pour tests)
DELETE FROM users WHERE phone = '+33615722037';

-- Créer le compte admin principal
-- Mot de passe: "admin123" (stocké en clair avec préfixe "plain:" pour le dev)
-- IMPORTANT: En production, utiliser bcrypt pour hasher les mots de passe !
INSERT INTO users (
  phone,
  email,
  name,
  role,
  password_hash,
  is_active
) VALUES (
  '+33615722037',
  'admin@sgdf.fr',
  'Administrateur SGDF',
  'admin',
  'plain:admin123',
  true
);

-- Vérifier que le compte a été créé
SELECT 
  id,
  phone,
  name,
  role,
  is_active,
  created_at
FROM users
WHERE phone = '+33615722037';

-- Créer quelques utilisateurs de test (optionnel)
INSERT INTO users (phone, name, email, role, is_active) VALUES
  ('+33612345678', 'Jean Dupont', 'jean@example.com', 'user', true),
  ('+33698765432', 'Marie Martin', 'marie@example.com', 'user', true),
  ('+33687654321', 'Pierre Durand', 'pierre@example.com', 'user', false)
ON CONFLICT (phone) DO NOTHING;

-- Afficher tous les utilisateurs créés
SELECT 
  phone,
  name,
  role,
  is_active,
  created_at
FROM users
ORDER BY created_at DESC;
