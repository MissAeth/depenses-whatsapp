# 📋 Guide Étape par Étape - Activation Administration

## 🔍 Étape 1 : Vérification (EN COURS)

Vous êtes en train d'exécuter cette requête dans Supabase SQL Editor :

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('users', 'admin_sessions', 'admin_logs');
```

---

## 📊 Résultat A : Les tables EXISTENT (3 lignes)

Si vous voyez 3 lignes comme ceci :
```
table_name
users
admin_sessions
admin_logs
```

### ✅ Étape suivante : Vérifier le compte admin

1. Dans le même SQL Editor, **effacez** l'ancienne requête
2. Copiez-collez cette nouvelle requête :

```sql
SELECT id, phone, name, role, is_active, password_hash
FROM users
WHERE phone = '+33615722037';
```

3. Cliquez "Run" (▶️)

**Résultat attendu** :
- Si vous voyez 1 ligne → Le compte admin existe ! Passez à l'Étape 4 (Test Login)
- Si vous voyez 0 ligne → Le compte n'existe pas. Passez à l'Étape 2B

---

## 📊 Résultat B : Les tables N'EXISTENT PAS (0 ligne)

### 🔨 Étape 2 : Créer les tables

#### Script 1 : Créer les tables (database_users_schema.sql)

1. Dans le SQL Editor, **effacez** l'ancienne requête
2. **Copiez TOUT le contenu ci-dessous** (97 lignes) :

```sql
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

-- Commentaires pour documentation
COMMENT ON TABLE users IS 'Table des utilisateurs avec authentification et rôles';
COMMENT ON TABLE admin_sessions IS 'Sessions d''administration sécurisées avec expiration';
COMMENT ON TABLE admin_logs IS 'Logs d''audit pour toutes les actions administratives';
```

3. Cliquez "Run" (▶️)
4. Attendez 2-3 secondes
5. Vous devriez voir "Success" en vert

#### Script 2 : Créer le compte admin (init_admin_account.sql)

1. **Effacez** le script précédent
2. **Copiez TOUT le contenu ci-dessous** (52 lignes) :

```sql
-- Script d'initialisation du premier compte administrateur
-- Supprimer le compte s'il existe déjà (pour tests)
DELETE FROM users WHERE phone = '+33615722037';

-- Créer le compte admin principal
-- Mot de passe: "admin123" (stocké en clair avec préfixe "plain:" pour le dev)
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
```

3. Cliquez "Run" (▶️)
4. Vous devriez voir une table avec 4 utilisateurs créés

### ✅ Passez à l'Étape 4 (Test Login)

---

## 📊 Résultat 2B : Tables existent MAIS compte admin n'existe PAS

Si vous aviez des tables mais pas de compte admin :

1. **Copiez uniquement le Script 2** ci-dessus (init_admin_account.sql)
2. Cliquez "Run" (▶️)
3. Passez à l'Étape 4

---

## 🧪 Étape 4 : Tester le Login Admin

### Test en production

1. Ouvrez un **nouvel onglet** de votre navigateur
2. Allez sur : https://sgdf-notes-de-frais-lovat.vercel.app/admin/login
3. Entrez :
   - **Téléphone** : `+33615722037`
   - **Mot de passe** : `admin123`
4. Cliquez "Se connecter"

### ✅ Succès attendu

Vous devriez être redirigé vers `/admin/dashboard` et voir :
- Titre "Gestion des Utilisateurs"
- Statistiques (Total : 4, Actifs : 3, Admins : 1)
- Liste des 4 utilisateurs
- Bouton "Créer un utilisateur"

### ❌ Si le login échoue

Message "Identifiants invalides" ?

**Vérification** : Retournez dans Supabase SQL Editor et exécutez :

```sql
SELECT phone, password_hash, role, is_active
FROM users
WHERE phone = '+33615722037';
```

**Résultat attendu** :
- phone : `+33615722037`
- password_hash : `plain:admin123`
- role : `admin`
- is_active : `true`

Si un de ces champs est différent, dites-le moi !

---

## 🎉 Étape 5 : Tester les Fonctionnalités

Si le login fonctionne, testez rapidement :

### Test 1 : Créer un utilisateur
1. Cliquez "Créer un utilisateur"
2. Remplissez :
   - Téléphone : `+33601020304`
   - Nom : `Test Utilisateur`
   - Rôle : Utilisateur
3. Cliquez "Créer"
4. ✅ Alert "Utilisateur créé avec succès !"

### Test 2 : Modifier un utilisateur
1. Cliquez "Modifier" sur un utilisateur
2. Changez le nom
3. Cliquez "Enregistrer"
4. ✅ Alert "Utilisateur mis à jour !"

### Test 3 : Login utilisateur
1. Ouvrez un onglet privé/incognito
2. Allez sur : https://sgdf-notes-de-frais-lovat.vercel.app/login
3. Entrez : `+33612345678` (Jean Dupont)
4. Cliquez "Se connecter"
5. ✅ Redirection vers le dashboard utilisateur

---

## 🎊 C'est terminé !

Si tous les tests passent, l'administration est **100% fonctionnelle** ! 🎉

**Prochaines étapes suggérées** :
1. 🔔 Remplacer les alert() par des toasts élégants
2. 📊 Ajouter l'export Excel
3. 🔒 Implémenter bcrypt pour les mots de passe

Revenez me dire où vous en êtes !
