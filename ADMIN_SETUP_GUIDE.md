# 🔐 Guide de configuration du système d'administration

## 📋 Vue d'ensemble

Le système d'administration permet de :
- ✅ Gérer les utilisateurs (créer, modifier, désactiver)
- ✅ Contrôler l'accès à l'application
- ✅ Assigner des rôles (admin/user)
- ✅ Voir les logs d'administration
- ✅ Sécuriser l'accès avec mot de passe

---

## 🗄️ Étape 1 : Créer les tables dans Supabase

### 1. Se connecter à Supabase

https://supabase.com/dashboard/project/djqrupuytjqpajoquejl

### 2. Aller dans SQL Editor

Cliquez sur "SQL Editor" dans le menu de gauche.

### 3. Exécuter le script de création des tables

Copiez et exécutez le contenu du fichier `database_users_schema.sql` :

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

-- ... (voir le fichier complet)
```

### 4. Créer le compte administrateur initial

Exécutez le script `init_admin_account.sql` :

```sql
-- Créer le compte admin principal
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
```

**⚠️ IMPORTANT** : Changez le téléphone et le mot de passe selon vos besoins !

---

## 🚀 Étape 2 : Déployer l'application

### Build et déploiement

```bash
# Build local
npm run build

# Déployer sur Vercel
vercel --prod
```

### Mettre à jour l'alias

```bash
vercel alias set <URL_DEPLOYMENT> sgdf-notes-de-frais-lovat.vercel.app
```

---

## 🔑 Étape 3 : Se connecter à l'administration

### Accéder à la page de login admin

https://sgdf-notes-de-frais-lovat.vercel.app/admin/login

### Identifiants par défaut

- **Téléphone** : `+33615722037` (ou le numéro que vous avez configuré)
- **Mot de passe** : `admin123` (ou le mot de passe que vous avez défini)

### ⚠️ Sécurité

Pour le moment, le système utilise des mots de passe en clair avec le préfixe `plain:` (pour le développement).

**En production, vous devriez** :
1. Installer bcrypt : `npm install bcrypt @types/bcrypt`
2. Hasher les mots de passe
3. Mettre à jour la fonction `verifyPassword()` dans `/api/admin/login/route.ts`

---

## 👥 Étape 4 : Gérer les utilisateurs

### Dashboard admin

Une fois connecté, vous accédez au dashboard admin :
- https://sgdf-notes-de-frais-lovat.vercel.app/admin/dashboard

### Fonctionnalités disponibles

#### 1️⃣ Créer un utilisateur

1. Cliquez sur "Créer un utilisateur"
2. Remplissez le formulaire :
   - **Téléphone** (requis) : Format international (+33...)
   - **Nom** (optionnel)
   - **Email** (optionnel)
   - **Rôle** : User ou Admin
3. Cliquez sur "Créer"

**Le numéro de téléphone est l'identifiant unique** pour chaque utilisateur.

#### 2️⃣ Modifier un utilisateur

1. Cliquez sur l'icône ✏️ (crayon) à côté de l'utilisateur
2. Modifiez les champs souhaités
3. Les changements sont sauvegardés automatiquement

#### 3️⃣ Désactiver un utilisateur

1. Cliquez sur l'icône 🗑️ (poubelle)
2. Confirmez la désactivation

**Note** : La désactivation est un "soft delete". Les données restent en base mais l'utilisateur ne peut plus se connecter.

---

## 🔒 Fonctionnement du système de sécurité

### Authentification

1. **Login admin** : `/admin/login`
   - Vérification téléphone + mot de passe
   - Création d'une session sécurisée (8h)
   - Cookie HTTPOnly `admin_session`

2. **Protection des routes** : `middleware.ts`
   - Toutes les routes `/admin/*` (sauf `/admin/login`) sont protégées
   - Redirection automatique si non authentifié

3. **Vérification API** :
   - Chaque API `/api/admin/*` vérifie la session
   - Retourne 401 si non authentifié

### Isolation des données

- Chaque utilisateur voit **uniquement ses propres dépenses**
- Le middleware injecte `x-user-phone` dans les headers
- Les APIs filtrent automatiquement par `whatsapp_from`

### Sessions

- **Durée** : 8 heures
- **Stockage** : Table `admin_sessions` dans Supabase
- **Expiration** : Automatique après 8h
- **Révocation** : Suppression lors du logout

### Logs d'audit

Toutes les actions admin sont loggées dans `admin_logs` :
- Création/modification/suppression d'utilisateurs
- Connexions (réussies et échouées)
- Adresse IP et User-Agent

---

## 📊 Architecture des tables

### Table `users`

```
id (UUID) - Identifiant unique
phone (TEXT) - Numéro de téléphone (unique)
email (TEXT) - Email (optionnel)
name (TEXT) - Nom complet
role (TEXT) - 'user' ou 'admin'
password_hash (TEXT) - Hash du mot de passe (requis pour admin)
is_active (BOOLEAN) - Compte actif/inactif
created_at (TIMESTAMP) - Date de création
updated_at (TIMESTAMP) - Dernière modification
last_login (TIMESTAMP) - Dernière connexion
created_by (UUID) - Qui a créé ce compte
```

### Table `admin_sessions`

```
id (UUID) - Identifiant de session
user_id (UUID) - Référence vers users
session_token (TEXT) - Token unique
expires_at (TIMESTAMP) - Date d'expiration
created_at (TIMESTAMP) - Date de création
ip_address (TEXT) - IP de connexion
user_agent (TEXT) - Navigateur
```

### Table `admin_logs`

```
id (UUID) - Identifiant du log
admin_id (UUID) - Admin qui a effectué l'action
action (TEXT) - Type d'action
target_user_id (UUID) - Utilisateur concerné
details (JSONB) - Détails de l'action
ip_address (TEXT) - IP de l'admin
created_at (TIMESTAMP) - Date de l'action
```

---

## 🔧 Configuration avancée

### Changer le mot de passe admin

#### Méthode 1 : Via SQL

```sql
UPDATE users
SET password_hash = 'plain:nouveau_mot_de_passe'
WHERE phone = '+33615722037';
```

#### Méthode 2 : Via l'interface (à venir)

Une page de changement de mot de passe sera ajoutée prochainement.

### Créer plusieurs admins

```sql
INSERT INTO users (phone, name, email, role, password_hash, is_active)
VALUES 
  ('+33612345678', 'Admin 2', 'admin2@sgdf.fr', 'admin', 'plain:password2', true),
  ('+33698765432', 'Admin 3', 'admin3@sgdf.fr', 'admin', 'plain:password3', true);
```

### Révoquer toutes les sessions

```sql
DELETE FROM admin_sessions WHERE expires_at < NOW();
```

### Voir les logs récents

```sql
SELECT 
  al.action,
  al.created_at,
  u.name as admin_name,
  al.details
FROM admin_logs al
LEFT JOIN users u ON al.admin_id = u.id
ORDER BY al.created_at DESC
LIMIT 50;
```

---

## 🚨 Dépannage

### Problème : "Session invalide ou expirée"

**Solution** :
1. Déconnectez-vous complètement
2. Videz les cookies du navigateur
3. Reconnectez-vous

### Problème : "Identifiants invalides"

**Solutions** :
1. Vérifiez le format du téléphone (avec +33)
2. Vérifiez que le compte existe et est actif :
   ```sql
   SELECT * FROM users WHERE phone = '+33615722037';
   ```
3. Vérifiez le mot de passe dans la base

### Problème : "Base de données non configurée"

**Solutions** :
1. Vérifiez que les variables d'environnement Supabase sont définies sur Vercel
2. Vérifiez que les tables existent dans Supabase

---

## 📱 Accès utilisateur (sans admin)

### Login utilisateur simple

Les utilisateurs réguliers peuvent toujours se connecter via :
- https://sgdf-notes-de-frais-lovat.vercel.app/login

**Différence** :
- **Login utilisateur** : Uniquement le téléphone (pas de mot de passe)
- **Login admin** : Téléphone + mot de passe

### Création automatique de compte utilisateur

Deux options :
1. **Via admin** : Créer le compte dans le dashboard admin
2. **Via WhatsApp** : Le premier message crée automatiquement le compte (à implémenter)

---

## 🔄 Migration des utilisateurs existants

Si vous avez déjà des utilisateurs qui utilisent l'application :

```sql
-- Créer un compte pour chaque numéro de téléphone unique
INSERT INTO users (phone, role, is_active)
SELECT DISTINCT whatsapp_from, 'user', true
FROM whatsapp_expenses
WHERE whatsapp_from IS NOT NULL
ON CONFLICT (phone) DO NOTHING;
```

---

## 📈 Prochaines améliorations

### À court terme
- [ ] Interface de changement de mot de passe
- [ ] Récupération de mot de passe par email
- [ ] Vue des logs d'administration
- [ ] Statistiques par utilisateur

### À moyen terme
- [ ] Rôles personnalisés (au-delà d'admin/user)
- [ ] Permissions granulaires
- [ ] API pour l'authentification externe
- [ ] Double authentification (2FA)

### À long terme
- [ ] SSO (Single Sign-On)
- [ ] Gestion des équipes
- [ ] Workflow d'approbation
- [ ] Audit trail complet

---

## 📞 Support

En cas de problème :
1. Vérifiez les logs dans Vercel : https://vercel.com/vanessas-projects-78fa410e/sgdf-notes-de-frais/logs
2. Vérifiez les logs dans Supabase : https://supabase.com/dashboard/project/djqrupuytjqpajoquejl/logs
3. Consultez la documentation Next.js : https://nextjs.org/docs

---

**Dernière mise à jour** : Décembre 2024  
**Version** : 1.0 (MVP Admin)
