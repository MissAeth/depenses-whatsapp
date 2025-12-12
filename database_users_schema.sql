-- Table des utilisateurs avec rôles et authentification
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT UNIQUE NOT NULL,
  email TEXT,
  name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  password_hash TEXT, -- Hash bcrypt du mot de passe (optionnel pour users simples)
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES users(id) -- Qui a créé ce compte
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- Table des sessions admin (pour sécurité renforcée)
CREATE TABLE IF NOT EXISTS admin_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_user_id ON admin_sessions(user_id);

-- Table des logs d'administration (audit trail)
CREATE TABLE IF NOT EXISTS admin_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES users(id),
  action TEXT NOT NULL, -- 'create_user', 'update_user', 'delete_user', 'login', etc.
  target_user_id UUID REFERENCES users(id),
  details JSONB, -- Détails de l'action
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_action ON admin_logs(action);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_logs(created_at);

-- Modifier la table whatsapp_expenses pour ajouter une référence utilisateur
-- (Si la colonne n'existe pas déjà)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='whatsapp_expenses' AND column_name='user_id') THEN
    ALTER TABLE whatsapp_expenses ADD COLUMN user_id UUID REFERENCES users(id);
    CREATE INDEX idx_whatsapp_expenses_user_id ON whatsapp_expenses(user_id);
  END IF;
END $$;

-- Fonction pour mettre à jour le timestamp updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour mettre à jour automatiquement updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Créer le premier compte admin (à modifier avec vos infos)
-- Mot de passe: "AdminSGDF2024!" (hash bcrypt)
-- IMPORTANT: Changez ce mot de passe après la première connexion !
INSERT INTO users (phone, email, name, role, password_hash, is_active)
VALUES (
  '+33615722037', -- Votre numéro de téléphone
  'admin@sgdf.fr', -- Votre email
  'Administrateur SGDF',
  'admin',
  '$2b$10$rK8Zq3xQJZvH.fJ5YGZzHOqFKvZ4xJYn4mGHZ7XKGZqYZ8xQJZvH.', -- Hash de "AdminSGDF2024!"
  true
)
ON CONFLICT (phone) DO NOTHING;

-- Commentaires pour documentation
COMMENT ON TABLE users IS 'Table des utilisateurs avec authentification et rôles';
COMMENT ON TABLE admin_sessions IS 'Sessions d''administration sécurisées avec expiration';
COMMENT ON TABLE admin_logs IS 'Logs d''audit pour toutes les actions administratives';
COMMENT ON COLUMN users.role IS 'Rôle: admin (gestion complète) ou user (accès basique)';
COMMENT ON COLUMN users.password_hash IS 'Hash bcrypt du mot de passe (requis pour admin, optionnel pour user)';
COMMENT ON COLUMN users.is_active IS 'Permet de désactiver un compte sans le supprimer';
