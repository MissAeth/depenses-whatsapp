
DELETE FROM users WHERE phone = '+33615722037';

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

INSERT INTO users (phone, name, email, role, is_active) VALUES
  ('+33612345678', 'Jean Dupont', 'jean@example.com', 'user', true),
  ('+33698765432', 'Marie Martin', 'marie@example.com', 'user', true),
  ('+33687654321', 'Pierre Durand', 'pierre@example.com', 'user', false)
ON CONFLICT (phone) DO NOTHING;

SELECT phone, name, role, is_active FROM users ORDER BY created_at DESC;
