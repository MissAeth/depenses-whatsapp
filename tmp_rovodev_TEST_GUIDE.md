# 🧪 Guide de Test Complet - Administration SGDF

## 📋 État actuel détecté

### ✅ Ce qui existe déjà
- ✅ Tables Supabase (users, admin_sessions, admin_logs)
- ✅ Authentification admin avec sessions sécurisées (8h)
- ✅ Dashboard admin complet (CRUD utilisateurs)
- ✅ Login admin (/admin/login)
- ✅ API endpoints sécurisés (/api/admin/*)
- ✅ Protection middleware sur /admin/*
- ✅ Logs d'audit complets
- ✅ Détection de doublons
- ✅ Export CSV des dépenses WhatsApp

### ⚠️ Points à améliorer détectés
- ⚠️ **Notifications basiques** : Utilise `alert()` au lieu de toasts élégants
- ⚠️ **Mots de passe en clair** : Préfixe `plain:` au lieu de bcrypt (dev only)
- ⚠️ **Pas d'export Excel** : Seulement CSV pour l'instant
- ⚠️ **Viewer d'images basique** : Pas de zoom/rotation

---

## 🎯 Plan de Test - Checklist Complète

### Phase 1 : Vérification Base de Données (5 min)

#### Test 1.1 : Tables créées ✓
```bash
# Dans Supabase SQL Editor
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('users', 'admin_sessions', 'admin_logs');
```

**Résultat attendu** : 3 tables trouvées

#### Test 1.2 : Compte admin existe ✓
```sql
SELECT id, phone, name, role, is_active 
FROM users 
WHERE role = 'admin';
```

**Résultat attendu** : 
- Téléphone : `+33615722037`
- Nom : `Administrateur SGDF`
- Rôle : `admin`
- Actif : `true`

---

### Phase 2 : Login Admin (10 min)

#### Test 2.1 : Accès à la page de login
1. Aller sur : https://sgdf-notes-de-frais-lovat.vercel.app/admin/login
2. Vérifier l'affichage :
   - ✓ Icône shield
   - ✓ Titre "Administration SGDF"
   - ✓ Champs téléphone + mot de passe
   - ✓ Bouton "Se connecter"
   - ✓ Info dev avec identifiants par défaut

**✅ Succès** : Page s'affiche correctement
**❌ Échec** : Redirection ou erreur 404

#### Test 2.2 : Login avec identifiants valides
1. Entrer :
   - Téléphone : `+33615722037`
   - Mot de passe : `admin123`
2. Cliquer "Se connecter"

**✅ Succès** : 
- Redirection vers `/admin/dashboard`
- Cookie `admin_session` créé
- Dashboard s'affiche

**❌ Échec** : Message d'erreur "Identifiants invalides"

#### Test 2.3 : Login avec identifiants invalides
1. Entrer un faux mot de passe
2. Cliquer "Se connecter"

**✅ Succès** : Message d'erreur rouge affiché
**❌ Échec** : Pas de retour d'erreur

#### Test 2.4 : Formats de téléphone acceptés
Tester ces formats (doivent tous fonctionner) :
- `+33615722037`
- `06 15 72 20 37`
- `0615722037`
- `33615722037`

---

### Phase 3 : Dashboard Admin (15 min)

#### Test 3.1 : Affichage du dashboard
Vérifier la présence de :
- ✓ Titre "Gestion des Utilisateurs"
- ✓ Statistiques (Total, Actifs, Admins)
- ✓ Bouton "Créer un utilisateur"
- ✓ Liste des utilisateurs existants
- ✓ Bouton "Déconnexion"

#### Test 3.2 : Création d'utilisateur
1. Cliquer "Créer un utilisateur"
2. Modal s'ouvre
3. Remplir :
   - Téléphone : `+33612345678`
   - Nom : `Jean Dupont`
   - Email : `jean@test.fr` (optionnel)
   - Rôle : `Utilisateur`
4. Cliquer "Créer"

**✅ Succès** : 
- Alert "✅ Utilisateur créé avec succès !"
- Utilisateur apparaît dans la liste
- Modal se ferme

**❌ Échec** : 
- Message d'erreur
- Utilisateur non créé

#### Test 3.3 : Détection de doublon
1. Recréer le même utilisateur (`+33612345678`)

**✅ Succès** : Erreur "Numéro déjà utilisé"
**❌ Échec** : Doublon créé

#### Test 3.4 : Modification d'utilisateur
1. Cliquer "Modifier" sur un utilisateur
2. Modal s'ouvre avec les données pré-remplies
3. Changer le nom : `Jean Dupont 2`
4. Cliquer "Enregistrer"

**✅ Succès** : 
- Alert "✅ Utilisateur mis à jour !"
- Nom changé dans la liste

#### Test 3.5 : Désactivation d'utilisateur
1. Cliquer "Désactiver" sur un utilisateur actif
2. Confirmer

**✅ Succès** : 
- Alert "✅ Utilisateur désactivé !"
- Badge "Inactif" apparaît
- Utilisateur ne peut plus se connecter

#### Test 3.6 : Statistiques correctes
Vérifier que les chiffres correspondent :
- Total utilisateurs = nombre dans la liste
- Utilisateurs actifs = ceux sans badge "Inactif"
- Admins = ceux avec badge "Admin"

---

### Phase 4 : Login Utilisateur (10 min)

#### Test 4.1 : Login sans mot de passe
1. Aller sur : https://sgdf-notes-de-frais-lovat.vercel.app/login
2. Entrer : `+33612345678` (utilisateur créé)
3. Cliquer "Se connecter"

**✅ Succès** : Redirection vers dashboard utilisateur
**❌ Échec** : Erreur ou pas de redirection

#### Test 4.2 : Utilisateur désactivé ne peut pas se connecter
1. Désactiver un utilisateur dans l'admin
2. Tenter de se connecter avec ce compte

**✅ Succès** : Erreur "Compte désactivé"
**❌ Échec** : Connexion réussie

---

### Phase 5 : Sécurité & Sessions (15 min)

#### Test 5.1 : Protection des routes admin
1. Se déconnecter de l'admin
2. Tenter d'accéder directement à `/admin/dashboard`

**✅ Succès** : Redirection vers `/admin/login`
**❌ Échec** : Accès autorisé sans login

#### Test 5.2 : Expiration de session
1. Se connecter en admin
2. Modifier manuellement le cookie `admin_session` (valeur aléatoire)
3. Rafraîchir `/admin/dashboard`

**✅ Succès** : Redirection vers login
**❌ Échec** : Dashboard accessible

#### Test 5.3 : Logs d'audit
Dans Supabase SQL Editor :
```sql
SELECT 
  admin_id,
  action,
  target_user_id,
  details,
  ip_address,
  created_at
FROM admin_logs
ORDER BY created_at DESC
LIMIT 10;
```

**✅ Succès** : Actions enregistrées (create_user, update_user, etc.)
**❌ Échec** : Table vide

---

### Phase 6 : Détection de Doublons (10 min)

#### Test 6.1 : Détection automatique
1. Se connecter en utilisateur
2. Créer une dépense :
   - Montant : 25€
   - Marchand : Carrefour
   - Date : Aujourd'hui
3. Créer une deuxième dépense similaire :
   - Montant : 25.50€
   - Marchand : Carrefour
   - Date : Aujourd'hui

**✅ Succès** : Modal de doublon s'affiche avec la liste
**❌ Échec** : Pas de détection

#### Test 6.2 : Badge doublon dans la liste
1. Aller dans l'onglet "Dépenses"
2. Vérifier les doublons créés

**✅ Succès** : Badge "⚠️ Doublon possible" visible
**❌ Échec** : Pas de badge

---

### Phase 7 : Export CSV (5 min)

#### Test 7.1 : Export des dépenses WhatsApp
1. Aller sur `/whatsapp`
2. Onglet "Dépenses WhatsApp"
3. Cliquer "Exporter CSV"

**✅ Succès** : Fichier CSV téléchargé avec les colonnes correctes
**❌ Échec** : Erreur ou fichier vide

---

## 📊 Grille de Résultats

| Phase | Test | Statut | Notes |
|-------|------|--------|-------|
| 1.1 | Tables créées | ⬜ À tester | |
| 1.2 | Compte admin | ⬜ À tester | |
| 2.1 | Page login | ⬜ À tester | |
| 2.2 | Login valide | ⬜ À tester | |
| 2.3 | Login invalide | ⬜ À tester | |
| 2.4 | Formats téléphone | ⬜ À tester | |
| 3.1 | Dashboard affiché | ⬜ À tester | |
| 3.2 | Créer utilisateur | ⬜ À tester | |
| 3.3 | Doublon utilisateur | ⬜ À tester | |
| 3.4 | Modifier utilisateur | ⬜ À tester | |
| 3.5 | Désactiver utilisateur | ⬜ À tester | |
| 3.6 | Statistiques | ⬜ À tester | |
| 4.1 | Login utilisateur | ⬜ À tester | |
| 4.2 | Compte désactivé | ⬜ À tester | |
| 5.1 | Protection routes | ⬜ À tester | |
| 5.2 | Expiration session | ⬜ À tester | |
| 5.3 | Logs audit | ⬜ À tester | |
| 6.1 | Détection doublons | ⬜ À tester | |
| 6.2 | Badge doublons | ⬜ À tester | |
| 7.1 | Export CSV | ⬜ À tester | |

---

## 🐛 Bugs Connus & Limitations

### Bugs identifiés
1. **Notifications avec `alert()`** 
   - Effet : Popups système au lieu de toasts élégants
   - Impact : UX moyenne
   - Solution : Implémenter un système de toasts

2. **Mots de passe en clair**
   - Effet : Préfixe `plain:` en base de données
   - Impact : Sécurité dev only
   - Solution : Implémenter bcrypt

### Fonctionnalités manquantes
1. ❌ Export Excel/XLSX (seulement CSV)
2. ❌ Viewer d'images avancé (zoom, rotation)
3. ❌ Notifications push
4. ❌ Réinitialisation de mot de passe
5. ❌ Authentification 2FA

---

## 🎯 Résultats Attendus

### ✅ Scénario de succès complet
1. Tables créées dans Supabase
2. Login admin fonctionnel
3. CRUD utilisateurs opérationnel
4. Sessions sécurisées avec expiration
5. Logs d'audit enregistrés
6. Détection de doublons active
7. Export CSV fonctionnel

### 🚨 Bloqueurs potentiels
- ❌ Tables non créées → Exécuter les scripts SQL
- ❌ Variables d'environnement manquantes → Vérifier Vercel
- ❌ Compte admin inexistant → Exécuter `init_admin_account.sql`

---

## 📝 Rapport de Test

### Date : _________________
### Testeur : _________________

**Résumé** :
- Tests réussis : _____ / 20
- Tests échoués : _____ / 20
- Bugs trouvés : _____

**Priorités identifiées** :
1. ⬜ Implémenter toasts/notifications
2. ⬜ Ajouter export Excel
3. ⬜ Améliorer viewer d'images
4. ⬜ Implémenter bcrypt
5. ⬜ Autre : _________________

---

## 📞 Support

**Problèmes courants** :

### "Base de données non configurée"
→ Variables `SUPABASE_URL` et `SUPABASE_ANON_KEY` manquantes dans Vercel

### "Identifiants invalides"
→ Compte admin non créé ou mauvais format de téléphone

### "Session expirée"
→ Normal après 8h, se reconnecter

### 404 sur /admin/*
→ Middleware non déployé ou erreur de build

---

**✨ Guide créé automatiquement par Rovo Dev**
