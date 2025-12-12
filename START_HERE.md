# 🚀 DÉMARRAGE RAPIDE - Administration SGDF

## ⚡ 3 étapes pour activer l'administration

### Étape 1️⃣ : Créer les tables Supabase (5 min)

1. Aller sur : https://supabase.com/dashboard/project/djqrupuytjqpajoquejl/editor
2. Cliquer sur "SQL Editor"
3. Copier/coller le contenu de `database_users_schema.sql`
4. Cliquer "Run" (▶️)
5. Copier/coller le contenu de `init_admin_account.sql`
6. Cliquer "Run" (▶️)

**✅ Terminé !** Les tables sont créées.

---

### Étape 2️⃣ : Se connecter (1 min)

1. Aller sur : https://sgdf-notes-de-frais-lovat.vercel.app/admin/login

2. Se connecter avec :
   ```
   Téléphone : +33615722037
   Mot de passe : admin123
   ```

**✅ Vous êtes sur le dashboard admin !**

---

### Étape 3️⃣ : Créer un utilisateur (2 min)

1. Cliquer sur "Créer un utilisateur"
2. Remplir :
   - **Téléphone** : +33612345678 (exemple)
   - **Nom** : Jean Dupont
   - **Rôle** : Utilisateur
3. Cliquer "Créer"

**✅ L'utilisateur peut maintenant se connecter sur `/login` !**

---

## 📱 Comment les utilisateurs se connectent ?

### Login utilisateur (sans mot de passe)
URL : https://sgdf-notes-de-frais-lovat.vercel.app/login

Il suffit d'entrer son numéro de téléphone :
- `06 12 34 56 78`
- `+33 6 12 34 56 78`
- Tous les formats sont acceptés !

---

## 🔑 Identifiants par défaut

**⚠️ À CHANGER EN PRODUCTION**

```
Téléphone : +33615722037
Mot de passe : admin123
```

### Pour changer le mot de passe :

1. Aller sur Supabase SQL Editor
2. Exécuter :
   ```sql
   UPDATE users
   SET password_hash = 'plain:VOTRE_NOUVEAU_MOT_DE_PASSE'
   WHERE phone = '+33615722037';
   ```

---

## ✨ Fonctionnalités disponibles

### Dashboard Admin
- ✅ Voir tous les utilisateurs
- ✅ Créer des comptes
- ✅ Modifier les utilisateurs (nom, email, rôle)
- ✅ Désactiver des comptes
- ✅ Voir les statistiques

### Dashboard Utilisateur
- ✅ Voir ses propres dépenses
- ✅ Créer une dépense avec photo + IA
- ✅ Modifier/supprimer ses dépenses
- ✅ Voir les statistiques personnelles
- ✅ Export CSV

### Détection de doublons
- ✅ Alerte automatique avant enregistrement
- ✅ Badge "⚠️ Doublon possible" dans la liste
- ✅ Critères intelligents (même jour + montant + marchand)

---

## 📚 Documentation complète

- **Guide complet** : `ADMIN_SETUP_GUIDE.md`
- **Démarrage rapide** : `ADMIN_QUICK_START.md`
- **Checklist déploiement** : `TODO_ADMIN_DEPLOYMENT.md`
- **Statut déploiement** : `DEPLOYMENT_SUCCESS_ADMIN.md`

---

## 🆘 Problèmes ?

### "Base de données non configurée"
→ Vous n'avez pas exécuté les scripts SQL (Étape 1)

### "Identifiants invalides"
→ Vérifiez le format du téléphone : `+33615722037`

### "Session expirée"
→ Reconnectez-vous (session de 8h)

---

## 🎯 URLs importantes

| Page | URL |
|------|-----|
| **Admin Login** | https://sgdf-notes-de-frais-lovat.vercel.app/admin/login |
| **Admin Dashboard** | https://sgdf-notes-de-frais-lovat.vercel.app/admin/dashboard |
| **User Login** | https://sgdf-notes-de-frais-lovat.vercel.app/login |
| **User Dashboard** | https://sgdf-notes-de-frais-lovat.vercel.app/ |
| **Supabase** | https://supabase.com/dashboard/project/djqrupuytjqpajoquejl |
| **Vercel** | https://vercel.com/vanessas-projects-78fa410e/sgdf-notes-de-frais |

---

## ✅ Checklist rapide

- [ ] Exécuter `database_users_schema.sql` dans Supabase
- [ ] Exécuter `init_admin_account.sql` dans Supabase
- [ ] Se connecter sur `/admin/login`
- [ ] Créer un utilisateur de test
- [ ] Tester le login utilisateur
- [ ] Changer le mot de passe admin
- [ ] ✨ C'est prêt !

---

**🎊 Félicitations ! Votre système d'administration est opérationnel !**

Pour plus de détails, consultez `ADMIN_SETUP_GUIDE.md`
