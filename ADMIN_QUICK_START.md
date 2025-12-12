# 🚀 Démarrage rapide - Administration SGDF

## ✅ Ce qui a été implémenté

### 🔐 Système d'authentification sécurisé
- Login admin avec téléphone + mot de passe
- Sessions sécurisées (8h, cookie HTTPOnly)
- Protection middleware sur toutes les routes `/admin/*`

### 👥 Gestion des utilisateurs
- Créer des comptes utilisateurs (téléphone + nom + email)
- Modifier les utilisateurs (nom, email, rôle, statut)
- Désactiver des comptes (soft delete)
- Assigner des rôles (user/admin)

### 📊 Dashboard admin
- Vue d'ensemble avec statistiques
- Liste complète des utilisateurs
- Filtres et recherche
- Interface intuitive et responsive

### 🔒 Sécurité
- Isolation des données par utilisateur (`whatsapp_from`)
- Logs d'audit pour toutes les actions admin
- Protection contre l'auto-suppression d'admin
- Validation des permissions à chaque requête

---

## 📦 Installation en 3 étapes

### Étape 1 : Créer les tables Supabase

```bash
# 1. Aller sur Supabase SQL Editor
# https://supabase.com/dashboard/project/djqrupuytjqpajoquejl

# 2. Exécuter database_users_schema.sql
# (copier/coller le contenu complet)

# 3. Exécuter init_admin_account.sql
# (créer le premier compte admin)
```

### Étape 2 : Déployer sur Vercel

```bash
# Build
npm run build

# Déployer
vercel --prod

# Mettre à jour l'alias
vercel alias set <URL> sgdf-notes-de-frais-lovat.vercel.app
```

### Étape 3 : Se connecter

```
URL : https://sgdf-notes-de-frais-lovat.vercel.app/admin/login

Téléphone : +33615722037
Mot de passe : admin123
```

---

## 🎯 Utilisation

### Créer un utilisateur

1. Dashboard → "Créer un utilisateur"
2. Remplir : **Téléphone** (requis), Nom, Email, Rôle
3. Cliquer "Créer"

### L'utilisateur peut maintenant :

- Se connecter sur `/login` avec son téléphone
- Voir ses propres dépenses
- Envoyer des tickets via WhatsApp

---

## 📁 Fichiers créés

### Base de données
- `database_users_schema.sql` - Structure des tables
- `init_admin_account.sql` - Premier compte admin

### Backend (API)
- `/api/admin/login` - Login admin
- `/api/admin/logout` - Déconnexion
- `/api/admin/verify` - Vérifier session
- `/api/admin/users` - GET/POST utilisateurs
- `/api/admin/users/[id]` - PUT/DELETE utilisateur

### Frontend (Pages)
- `/admin/login` - Page de login admin
- `/admin/dashboard` - Dashboard de gestion

### Librairie
- `src/lib/auth-admin.ts` - Fonctions d'authentification

### Middleware
- `src/middleware.ts` - Protection des routes admin

### Documentation
- `ADMIN_SETUP_GUIDE.md` - Guide complet
- `ADMIN_QUICK_START.md` - Ce fichier

---

## 🔑 Credentials par défaut

**⚠️ À CHANGER EN PRODUCTION**

```
Téléphone : +33615722037
Mot de passe : admin123
```

Pour changer le mot de passe :

```sql
UPDATE users
SET password_hash = 'plain:nouveau_mot_de_passe'
WHERE phone = '+33615722037';
```

---

## 🧪 Test rapide

### Test 1 : Login admin
```
1. Aller sur /admin/login
2. Entrer téléphone + mot de passe
3. ✅ Redirection vers /admin/dashboard
```

### Test 2 : Créer un user
```
1. Dashboard → "Créer un utilisateur"
2. Téléphone: +33612345678, Nom: "Test User"
3. ✅ Utilisateur apparaît dans la liste
```

### Test 3 : Login user
```
1. Aller sur /login (page utilisateur normale)
2. Entrer: +33612345678
3. ✅ Redirection vers dashboard utilisateur
```

### Test 4 : Isolation des données
```
1. User 1 crée une dépense
2. Login avec User 2
3. ✅ User 2 ne voit PAS la dépense de User 1
```

---

## 📊 Architecture

```
┌─────────────────────────────────────────┐
│         Utilisateur / Admin             │
└─────────────────┬───────────────────────┘
                  │
      ┌───────────┴──────────┐
      │                      │
┌─────▼──────┐      ┌───────▼────────┐
│ /login     │      │ /admin/login   │
│ (simple)   │      │ (avec mdp)     │
└─────┬──────┘      └───────┬────────┘
      │                     │
      │ Cookie              │ Cookie admin_session
      │ user_phone          │ + user_phone
      │                     │
      ▼                     ▼
┌────────────┐      ┌──────────────────┐
│ Dashboard  │      │ Admin Dashboard  │
│ User       │      │ + User Manager   │
└────────────┘      └──────────────────┘
      │                     │
      │                     │
      ▼                     ▼
┌─────────────────────────────────────┐
│       Middleware (isolation)        │
│   x-user-phone → whatsapp_from      │
└──────────────┬──────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│         Supabase (PostgreSQL)        │
│  • users (comptes)                   │
│  • admin_sessions (sessions)         │
│  • admin_logs (audit)                │
│  • whatsapp_expenses (dépenses)      │
└──────────────────────────────────────┘
```

---

## 🛡️ Sécurité

### ✅ Protégé
- Routes `/admin/*` (sauf login)
- APIs `/api/admin/*`
- Sessions avec expiration
- Logs d'audit complets

### ⚠️ À améliorer en production
- [ ] Hasher les mots de passe avec bcrypt
- [ ] Rate limiting sur le login
- [ ] HTTPS obligatoire
- [ ] Double authentification (2FA)
- [ ] Politique de mots de passe forts

---

## 🆘 Problèmes courants

### "Session invalide"
→ Déconnectez-vous et reconnectez-vous

### "Identifiants invalides"
→ Vérifiez le téléphone (format +33...) et le mot de passe

### "Base de données non configurée"
→ Vérifiez SUPABASE_URL et SUPABASE_ANON_KEY sur Vercel

### Utilisateur ne peut pas se connecter
→ Vérifiez que `is_active = true` dans la table users

---

## 📈 Prochaines étapes

1. ✅ Tester l'administration en production
2. ⏳ Migrer les utilisateurs existants (si besoin)
3. ⏳ Changer le mot de passe admin par défaut
4. ⏳ Implémenter bcrypt pour les mots de passe
5. ⏳ Ajouter l'interface de changement de mot de passe

---

## 📞 Contact

Pour toute question ou problème, consultez :
- `ADMIN_SETUP_GUIDE.md` - Guide détaillé
- Logs Vercel : https://vercel.com/dashboard
- Logs Supabase : https://supabase.com/dashboard

---

**Statut** : ✅ Prêt pour le déploiement  
**Version** : 1.0 MVP  
**Build** : ✅ Réussi (33 pages générées)
