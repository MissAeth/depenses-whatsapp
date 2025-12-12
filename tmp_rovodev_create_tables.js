#!/usr/bin/env node

/**
 * Script de création automatique des tables Supabase
 * Exécute les requêtes SQL via l'API REST de Supabase
 */

const https = require('https');
const fs = require('fs');

// Configuration depuis les variables d'environnement
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://djqrupuytjqpajoquejl.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

// SQL Script complet
const SQL_SCRIPT = `
-- Fonction pour mettre à jour le timestamp updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Table des utilisateurs avec rôles et authentification
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT UNIQUE NOT NULL,
  email TEXT,
  name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  password_hash TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Table des sessions admin
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

-- Table des logs d'administration
CREATE TABLE IF NOT EXISTS admin_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  target_user_id UUID REFERENCES users(id),
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_action ON admin_logs(action);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_logs(created_at);

-- Modifier la table whatsapp_expenses pour ajouter une référence utilisateur
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='whatsapp_expenses' AND column_name='user_id') THEN
    ALTER TABLE whatsapp_expenses ADD COLUMN user_id UUID REFERENCES users(id);
    CREATE INDEX idx_whatsapp_expenses_user_id ON whatsapp_expenses(user_id);
  END IF;
END $$;

-- Commentaires pour documentation
COMMENT ON TABLE users IS 'Table des utilisateurs avec authentification et rôles';
COMMENT ON TABLE admin_sessions IS 'Sessions d''administration sécurisées avec expiration';
COMMENT ON TABLE admin_logs IS 'Logs d''audit pour toutes les actions administratives';
`;

// SQL Script pour créer le compte admin
const SQL_ADMIN_ACCOUNT = `
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
`;

console.log('🚀 Création automatique des tables Supabase');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');

if (!SUPABASE_ANON_KEY) {
  console.error('❌ ERREUR : Variable SUPABASE_ANON_KEY non trouvée');
  console.log('');
  console.log('Solution : Chargez les variables d\'environnement :');
  console.log('  export $(cat .env.production | xargs)');
  console.log('  node tmp_rovodev_create_tables.js');
  process.exit(1);
}

console.log('✅ Configuration trouvée');
console.log(`   URL: ${SUPABASE_URL}`);
console.log(`   Key: ${SUPABASE_ANON_KEY.substring(0, 20)}...`);
console.log('');

// Fonction pour exécuter du SQL via l'API Supabase
function executeSQL(sql, description) {
  return new Promise((resolve, reject) => {
    console.log(`⏳ ${description}...`);
    
    const url = new URL('/rest/v1/rpc/exec_sql', SUPABASE_URL);
    
    const postData = JSON.stringify({ query: sql });
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(url, options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`✅ ${description} - OK`);
          resolve(data);
        } else {
          console.log(`⚠️  ${description} - Status ${res.statusCode}`);
          console.log(`   Réponse: ${data}`);
          resolve(data); // On continue même en cas d'erreur
        }
      });
    });

    req.on('error', (error) => {
      console.error(`❌ ${description} - Erreur:`, error.message);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Méthode alternative : Utiliser le client Supabase
async function createTablesDirectly() {
  console.log('📝 Étape 1/2 : Création des tables (users, admin_sessions, admin_logs)');
  console.log('');
  
  // Note : L'API REST de Supabase ne permet pas d'exécuter du SQL arbitraire
  // pour des raisons de sécurité. On va utiliser une approche différente.
  
  console.log('⚠️  L\'API REST de Supabase ne permet pas d\'exécuter du SQL directement.');
  console.log('');
  console.log('📋 Solution : Je vais créer un fichier SQL que vous pourrez');
  console.log('             copier-coller DIRECTEMENT dans Supabase SQL Editor');
  console.log('');
  
  // Créer le fichier SQL
  fs.writeFileSync('tmp_rovodev_TABLES.sql', SQL_SCRIPT);
  fs.writeFileSync('tmp_rovodev_ADMIN.sql', SQL_ADMIN_ACCOUNT);
  
  console.log('✅ Fichiers créés :');
  console.log('   • tmp_rovodev_TABLES.sql (création des tables)');
  console.log('   • tmp_rovodev_ADMIN.sql (compte admin)');
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('📝 À FAIRE MAINTENANT :');
  console.log('');
  console.log('1️⃣  Ouvrez ce fichier dans un éditeur de texte :');
  console.log('   tmp_rovodev_TABLES.sql');
  console.log('');
  console.log('2️⃣  Copiez TOUT le contenu (Ctrl+A puis Ctrl+C)');
  console.log('');
  console.log('3️⃣  Allez sur Supabase SQL Editor :');
  console.log('   https://supabase.com/dashboard/project/djqrupuytjqpajoquejl/editor');
  console.log('');
  console.log('4️⃣  Collez et cliquez RUN');
  console.log('');
  console.log('5️⃣  Répétez avec tmp_rovodev_ADMIN.sql');
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

// Lancer la création
createTablesDirectly().catch(console.error);
