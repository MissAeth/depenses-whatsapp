# ✅ Checklist de déploiement - Système Admin

## 🎯 Objectif
Déployer le système d'administration sécurisé avec gestion des utilisateurs.

---

## 📋 Étapes de déploiement

### ☐ 1. Préparer Supabase

#### 1.1 Créer les tables
- [ ] Se connecter à https://supabase.com/dashboard/project/djqrupuytjqpajoquejl
- [ ] Aller dans SQL Editor
- [ ] Exécuter `database_users_schema.sql` (complet)
- [ ] Vérifier que les tables sont créées :
  ```sql
  SELECT table_name FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name IN ('users', 'admin_sessions', 'admin_logs');
  ```

#### 1.2 Créer le compte admin
- [ ] Exécuter `init_admin_account.sql`
- [ ] **IMPORTANT** : Modifier le téléphone et le mot de passe selon vos besoins
- [ ] Vérifier que le compte existe :
  ```sql
  SELECT phone, name, role, is_active FROM users WHERE role = 'admin';
  ```

#### 1.3 Migrer les utilisateurs existants (optionnel)
- [ ] Si vous avez déjà des dépenses, créer les comptes automatiquement :
  ```sql
  INSERT INTO users (phone, role, is_active)
  SELECT DISTINCT whatsapp_from, 'user', true
  FROM whatsapp_expenses
  WHERE whatsapp_from IS NOT NULL
  ON CONFLICT (phone) DO NOTHING;
  ```

---

### ☐ 2. Déployer l'application

#### 2.1 Build local
```bash
npm run build
```
- [ ] Vérifier qu'il n'y a pas d'erreurs TypeScript
- [ ] Vérifier que toutes les routes sont générées :
  - `/admin/login`
  - `/admin/dashboard`
  - `/api/admin/*`

#### 2.2 Déployer sur Vercel
```bash
vercel --prod
```
- [ ] Noter l'URL de déploiement
- [ ] Attendre que le build soit terminé (≈30-40s)

#### 2.3 Mettre à jour l'alias
```bash
vercel alias set <URL_DEPLOYMENT> sgdf-notes-de-frais-lovat.vercel.app
```
- [ ] Vérifier que l'alias pointe vers le nouveau déploiement

---

### ☐ 3. Tests de validation

#### 3.1 Test de l'authentification admin
- [ ] Aller sur https://sgdf-notes-de-frais-lovat.vercel.app/admin/login
- [ ] Se connecter avec le compte admin créé
- [ ] Vérifier la redirection vers `/admin/dashboard`
- [ ] Vérifier que les statistiques s'affichent

#### 3.2 Test de gestion des utilisateurs
- [ ] Créer un nouvel utilisateur :
  - Téléphone : `+33698765432`
  - Nom : `Test User`
  - Rôle : `user`
- [ ] Vérifier qu'il apparaît dans la liste
- [ ] Modifier le nom de l'utilisateur
- [ ] Vérifier que la modification est sauvegardée

#### 3.3 Test de l'accès utilisateur
- [ ] Se déconnecter de l'admin
- [ ] Aller sur `/login` (login utilisateur simple)
- [ ] Se connecter avec `+33698765432`
- [ ] Vérifier la redirection vers le dashboard utilisateur
- [ ] Vérifier que seules les dépenses de cet utilisateur sont visibles

#### 3.4 Test de sécurité
- [ ] Tenter d'accéder à `/admin/dashboard` sans être connecté
  - ✅ Doit rediriger vers `/admin/login`
- [ ] Tenter d'appeler `/api/admin/users` sans session
  - ✅ Doit retourner 401
- [ ] Se connecter en tant qu'utilisateur normal et tenter d'accéder à `/admin/dashboard`
  - ✅ Doit être bloqué

#### 3.5 Test d'isolation des données
- [ ] Créer une dépense avec l'utilisateur A
- [ ] Se connecter avec l'utilisateur B
- [ ] Vérifier que B ne voit PAS la dépense de A
- [ ] Se connecter en tant qu'admin
- [ ] Vérifier que l'admin ne voit que SES propres dépenses (pas celles de tous les users)

---

### ☐ 4. Sécurisation

#### 4.1 Changer le mot de passe admin par défaut
- [ ] Aller dans Supabase SQL Editor
- [ ] Exécuter :
  ```sql
  UPDATE users
  SET password_hash = 'plain:VOTRE_NOUVEAU_MOT_DE_PASSE_FORT'
  WHERE phone = '+33615722037';
  ```

#### 4.2 Configurer les logs
- [ ] Vérifier que les logs fonctionnent :
  ```sql
  SELECT * FROM admin_logs ORDER BY created_at DESC LIMIT 10;
  ```
- [ ] Vérifier que les actions sont enregistrées :
  - Login admin
  - Création d'utilisateur
  - Modification d'utilisateur

#### 4.3 Vérifier les sessions
- [ ] Vérifier qu'une session est créée après login :
  ```sql
  SELECT * FROM admin_sessions WHERE expires_at > NOW();
  ```

---

### ☐ 5. Documentation utilisateur

#### 5.1 Former les administrateurs
- [ ] Partager le guide `ADMIN_SETUP_GUIDE.md`
- [ ] Expliquer les rôles (admin vs user)
- [ ] Montrer comment créer des utilisateurs
- [ ] Expliquer le workflow de gestion

#### 5.2 Informer les utilisateurs
- [ ] Communiquer la nouvelle URL de login : `/login`
- [ ] Expliquer qu'ils doivent utiliser leur numéro WhatsApp
- [ ] Donner des exemples de formats de numéros acceptés

---

## 🔐 Sécurité - Points à améliorer

### Priorité HAUTE (à faire rapidement)
- [ ] Implémenter bcrypt pour les mots de passe
  ```bash
  npm install bcrypt @types/bcrypt
  ```
- [ ] Mettre à jour `/api/admin/login/route.ts`
- [ ] Forcer HTTPS en production
- [ ] Ajouter rate limiting sur le login

### Priorité MOYENNE
- [ ] Ajouter une page de changement de mot de passe
- [ ] Implémenter la récupération de mot de passe par email
- [ ] Ajouter des règles de mot de passe fort
- [ ] Configurer l'expiration automatique des sessions inactives

### Priorité BASSE
- [ ] Ajouter la double authentification (2FA)
- [ ] Implémenter le SSO (Single Sign-On)
- [ ] Ajouter des permissions granulaires

---

## 📊 Monitoring

### Vérifications quotidiennes
- [ ] Vérifier les logs d'erreur dans Vercel
- [ ] Vérifier les tentatives de connexion échouées
  ```sql
  SELECT * FROM admin_logs 
  WHERE action = 'failed_login' 
  AND created_at > NOW() - INTERVAL '1 day';
  ```

### Vérifications hebdomadaires
- [ ] Nettoyer les sessions expirées
  ```sql
  DELETE FROM admin_sessions WHERE expires_at < NOW();
  ```
- [ ] Vérifier les utilisateurs inactifs
  ```sql
  SELECT * FROM users 
  WHERE last_login IS NULL 
  OR last_login < NOW() - INTERVAL '30 days';
  ```

---

## 🆘 Plan de secours

### Si un admin perd l'accès
1. Aller dans Supabase SQL Editor
2. Réinitialiser le mot de passe :
   ```sql
   UPDATE users
   SET password_hash = 'plain:nouveau_mdp_temporaire'
   WHERE phone = '+33615722037';
   ```
3. Se connecter avec le nouveau mot de passe
4. Changer le mot de passe immédiatement

### Si les sessions ne fonctionnent pas
1. Supprimer toutes les sessions :
   ```sql
   DELETE FROM admin_sessions;
   ```
2. Se reconnecter
3. Vérifier les logs dans Vercel

### Si un utilisateur ne peut pas se connecter
1. Vérifier que le compte existe et est actif :
   ```sql
   SELECT * FROM users WHERE phone = '+33...';
   ```
2. Si besoin, réactiver le compte :
   ```sql
   UPDATE users SET is_active = true WHERE phone = '+33...';
   ```

---

## 📈 Métriques de succès

Après 1 semaine :
- [ ] Tous les admins se sont connectés avec succès
- [ ] Au moins 5 utilisateurs créés
- [ ] 0 erreur de sécurité
- [ ] Temps de réponse API < 500ms

Après 1 mois :
- [ ] 90% des utilisateurs actifs ont un compte
- [ ] Logs d'audit consultés régulièrement
- [ ] Mots de passe changés (bcrypt implémenté)
- [ ] Documentation à jour

---

## ✅ Validation finale

Avant de considérer le déploiement comme terminé :

- [ ] ✅ Tables créées dans Supabase
- [ ] ✅ Compte admin créé et testé
- [ ] ✅ Application déployée sur Vercel
- [ ] ✅ Alias configuré
- [ ] ✅ Tests de connexion réussis
- [ ] ✅ Isolation des données vérifiée
- [ ] ✅ Sécurité testée
- [ ] ✅ Documentation partagée
- [ ] ✅ Mot de passe admin changé
- [ ] ✅ Backup de la base effectué

---

## 📞 Support

En cas de problème durant le déploiement :

1. **Consulter les logs**
   - Vercel : https://vercel.com/vanessas-projects-78fa410e/sgdf-notes-de-frais/logs
   - Supabase : https://supabase.com/dashboard/project/djqrupuytjqpajoquejl/logs

2. **Vérifier les fichiers**
   - `ADMIN_SETUP_GUIDE.md` - Guide détaillé
   - `ADMIN_QUICK_START.md` - Démarrage rapide

3. **Tester localement**
   ```bash
   npm run dev
   # Puis tester sur http://localhost:3000/admin/login
   ```

---

**Date de création** : Décembre 2024  
**Version** : 1.0 MVP Admin  
**Statut** : ✅ Prêt pour déploiement
