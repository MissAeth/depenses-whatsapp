# ⚡ Déploiement Vercel - Guide Rapide

## ✅ État actuel

- ✅ Git initialisé
- ✅ Repository GitHub : `https://github.com/MissAeth/depenses-whatsapp.git`
- ✅ Fichier `.env.local` créé avec les variables WhatsApp

## 🚀 Déploiement en 5 minutes

### Étape 1: Commiter et pousser vos changements

```bash
git add .
git commit -m "Configuration WhatsApp Meta API"
git push
```

### Étape 2: Créer un compte Vercel

1. Allez sur [vercel.com](https://vercel.com)
2. Cliquez **"Sign Up"**
3. Choisissez **"Continue with GitHub"**
4. Autorisez Vercel à accéder à votre compte GitHub

### Étape 3: Importer votre projet

1. Dans Vercel Dashboard, cliquez **"Add New..."** → **"Project"**
2. Trouvez **"depenses-whatsapp"** dans la liste
3. Cliquez **"Import"**

### Étape 4: Ajouter les variables d'environnement

**AVANT de cliquer "Deploy"**, ajoutez ces 3 variables :

#### Variable 1
- **Key** : `WHATSAPP_ACCESS_TOKEN`
- **Value** : `EAAqwi435ZAxABQCWZAdAyrBJMpxVYfAZBXvMSXxvWdEN5VFpZAyXafLjhgrI87PllELJSruO53TqSSdksp7hAGtJ8fviOCNQGQ5UX3tpDM3tYZAi29sZBNDes4c8wUOexMZBkBjAPAp2wSYkNxzNZA4ZB7LJ5c7F3CZAdUZB1WxH5WZAjk1X2trZCktTZCXgoZBczZATxsnXBpFTrtunr1RJDCkRWI3eDA4EXUymIsepSwv4D2WMuka5oXg3nA3X3CdgjblFSZBZCcamUSdrzyVwJq1SKSLGGN1wZDZD`
- **Environments** : ✅ Production, ✅ Preview, ✅ Development

#### Variable 2
- **Key** : `WHATSAPP_PHONE_NUMBER_ID`
- **Value** : `927016477160571`
- **Environments** : ✅ Production, ✅ Preview, ✅ Development

#### Variable 3
- **Key** : `WHATSAPP_VERIFY_TOKEN`
- **Value** : `sgdf_whatsapp_2024_secret`
- **Environments** : ✅ Production, ✅ Preview, ✅ Development

> 💡 **Astuce** : Si vous avez d'autres variables (Clerk, SMTP, etc.), ajoutez-les aussi maintenant.

### Étape 5: Déployer !

1. Vérifiez que toutes les variables sont ajoutées
2. Cliquez **"Deploy"**
3. Attendez 2-3 minutes

### Étape 6: Récupérer votre URL

Une fois terminé, Vercel vous donnera une URL :
- `https://depenses-whatsapp.vercel.app` (ou similaire)
- **Notez cette URL** 📝

## 🔗 Étape 7: Configurer Meta Dashboard

1. Allez sur [developers.facebook.com](https://developers.facebook.com/)
2. Ouvrez votre app WhatsApp Business
3. **WhatsApp** → **Configuration** → **Webhooks**
4. Cliquez **"Edit"** ou **"Configure"**
5. Remplissez :
   - **Callback URL** : `https://votre-url-vercel.vercel.app/api/whatsapp`
     > ⚠️ Remplacez par votre vraie URL Vercel
   - **Verify token** : `sgdf_whatsapp_2024_secret`
6. Cliquez **"Verify and Save"**
7. **Activez l'écoute** : Cliquez sur "Désactivé" → "Activé"
8. **Abonnez-vous** : Cochez "messages"

## 🧪 Étape 8: Tester

1. Envoyez un message WhatsApp au numéro de test Meta
2. Message : `"Restaurant Le Bistrot 23.50€"`
3. Vérifiez sur : `https://votre-url-vercel.vercel.app/whatsapp`

## ✅ C'est fait !

Votre application est maintenant en ligne et les messages WhatsApp seront automatiquement traités ! 🎉

---

## 📚 Guide complet

Pour plus de détails, consultez `GUIDE_DEPLOIEMENT_VERCEL.md`

