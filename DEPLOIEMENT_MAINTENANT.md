# 🚀 Déploiement Vercel - Guide Rapide

## 📋 Étape 1: Connecter le projet GitHub à Vercel

1. **Allez sur [vercel.com](https://vercel.com)** et connectez-vous
2. Cliquez sur **"Add New Project"** ou **"Import Project"**
3. **Sélectionnez votre repository GitHub** : `depenses-whatsapp`
4. Vercel détectera automatiquement Next.js ✅

## ⚙️ Étape 2: Configuration du projet

### Paramètres automatiques (ne changez rien)
- **Framework Preset** : Next.js ✅
- **Root Directory** : `./` ✅
- **Build Command** : `npm run build` ✅
- **Output Directory** : `.next` ✅
- **Install Command** : `npm install` ✅ (déjà configuré dans `vercel.json`)

## 🔐 Étape 3: Variables d'environnement (CRITIQUE)

**AVANT de cliquer "Deploy"**, ajoutez ces variables dans la section **"Environment Variables"** :

### Variables WhatsApp (REQUISES)

1. **WHATSAPP_ACCESS_TOKEN**
   - Valeur : `EAAqwi435ZAxABQCWZAdAyrBJMpxVYfAZBXvMSXxvWdEN5VFpZAyXafLjhgrI87PllELJSruO53TqSSdksp7hAGtJ8fviOCNQGQ5UX3tpDM3tYZAi29sZBNDes4c8wUOexMZBkBjAPAp2wSYkNxzNZA4ZB7LJ5c7F3CZAdUZB1WxH5WZAjk1X2trZCktTZCXgoZBczZATxsnXBpFTrtunr1RJDCkRWI3eDA4EXUymIsepSwv4D2WMuka5oXg3nA3X3CdgjblFSZBZCcamUSdrzyVwJq1SKSLGGN1wZDZD`
   - Environnements : ✅ Production, ✅ Preview, ✅ Development

2. **WHATSAPP_PHONE_NUMBER_ID**
   - Valeur : `927016477160571`
   - Environnements : ✅ Production, ✅ Preview, ✅ Development

3. **WHATSAPP_VERIFY_TOKEN**
   - Valeur : `sgdf_whatsapp_2024_secret`
   - Environnements : ✅ Production, ✅ Preview, ✅ Development

### Variables optionnelles (si vous les avez)

Si vous avez configuré l'email, ajoutez :
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASSWORD`
- `SMTP_FROM`
- `TREASURY_EMAIL`

Si vous utilisez Gemini AI :
- `GEMINI_API_KEY`
- `GEMINI_MODEL` (optionnel, défaut: `gemini-1.5-flash`)

## 🚀 Étape 4: Déployer !

1. Vérifiez que toutes les variables WhatsApp sont ajoutées
2. Cliquez sur **"Deploy"**
3. Attendez 2-3 minutes pendant le build

## ✅ Étape 5: Récupérer l'URL

Une fois le déploiement terminé :

1. Vercel vous donnera une URL : `https://votre-app.vercel.app`
2. **Notez cette URL** - vous en aurez besoin pour Meta Dashboard

## 🔗 Étape 6: Configurer le Webhook Meta

1. Allez sur [developers.facebook.com](https://developers.facebook.com/)
2. Ouvrez votre app WhatsApp Business
3. **WhatsApp** → **Configuration** → **Webhooks**
4. Cliquez sur **"Edit"** ou **"Configure"**
5. Remplissez :
   - **Callback URL** : `https://votre-app.vercel.app/api/whatsapp`
   - **Verify token** : `sgdf_whatsapp_2024_secret` (même valeur que `WHATSAPP_VERIFY_TOKEN`)
6. Cliquez sur **"Verify and Save"**
7. Dans **"Manage"**, cochez :
   - ✅ **messages** (pour recevoir les messages)
   - ✅ **message_status** (optionnel)

## 🎉 C'est fait !

Votre application est maintenant déployée et prête à recevoir des messages WhatsApp !

**URL de l'application** : `https://votre-app.vercel.app/whatsapp`

