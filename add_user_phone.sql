-- Script pour ajouter le numéro de téléphone 0675274909
-- À exécuter dans Supabase SQL Editor

-- Normaliser le numéro : 0675274909 devient +33675274909
-- Supprimer l'utilisateur s'il existe déjà (pour éviter les doublons)
DELETE FROM users WHERE phone = '+33675274909' OR phone = '33675274909';

-- Créer l'utilisateur avec le numéro normalisé
INSERT INTO users (
  phone,
  name,
  email,
  role,
  is_active,
  created_at
) VALUES (
  '+33675274909',
  'Utilisateur',
  'user@example.com',
  'user',
  true,
  NOW()
)
ON CONFLICT (phone) DO UPDATE
SET 
  is_active = true,
  updated_at = NOW();

-- Vérifier que l'utilisateur a été créé
SELECT 
  id,
  phone,
  name,
  email,
  role,
  is_active,
  created_at
FROM users
WHERE phone = '+33675274909' OR phone = '33675274909';

