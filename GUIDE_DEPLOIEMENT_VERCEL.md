# 🚀 Guide Complet : Déploiement sur Vercel pour WhatsApp

## 📋 Prérequis

- ✅ Un compte GitHub (gratuit) - [Créer un compte](https://github.com/signup)
- ✅ Votre code prêt avec `.env.local` configuré
- ✅ 10 minutes de temps

## 🎯 Étape 1: Préparer votre code sur GitHub

### 1.1 Initialiser Git (si pas déjà fait)

```bash
git init
git add .
git commit -m "Initial commit - Application WhatsApp"
```

### 1.2 Créer un repository sur GitHub

1. Allez sur [github.com](https://github.com)
2. Cliquez sur **"+"** en haut à droite → **"New repository"**
3. Nom du repo : `sgdf-notes-de-frais` (ou autre nom)
4. Choisissez **Public** ou **Private**
5. **Ne cochez PAS** "Initialize with README" (vous avez déjà du code)
6. Cliquez **"Create repository"**

### 1.3 Pousser votre code sur GitHub

GitHub vous donnera des commandes. Exécutez :

```bash
git remote add origin https://github.com/VOTRE-USERNAME/sgdf-notes-de-frais.git
git branch -M main
git push -u origin main
```

> ⚠️ **Important** : Remplacez `VOTRE-USERNAME` par votre nom d'utilisateur GitHub.

## 🌐 Étape 2: Créer un compte Vercel

1. Allez sur [vercel.com](https://vercel.com)
2. Cliquez sur **"Sign Up"**
3. Choisissez **"Continue with GitHub"**
4. Autorisez Vercel à accéder à votre compte GitHub

## 📦 Étape 3: Déployer votre projet

### 3.1 Importer le projet

1. Dans Vercel Dashboard, cliquez sur **"Add New..."** → **"Project"**
2. Vous verrez la liste de vos repositories GitHub
3. Trouvez **"sgdf-notes-de-frais"** (ou le nom que vous avez choisi)
4. Cliquez sur **"Import"**

### 3.2 Configuration automatique

Vercel détecte automatiquement :
- ✅ **Framework Preset** : Next.js
- ✅ **Root Directory** : `./`
- ✅ **Build Command** : `npm run build` (automatique)
- ✅ **Output Directory** : `.next` (automatique)
- ✅ **Install Command** : `npm install` (automatique)

**Ne changez rien**, c'est déjà correct ! ✅

### 3.3 Variables d'environnement (IMPORTANT)

**AVANT de cliquer "Deploy"**, ajoutez les variables d'environnement :

1. Dans la section **"Environment Variables"**, cliquez sur **"Add"**
2. Ajoutez **une par une** ces variables :

#### Variable 1: WHATSAPP_ACCESS_TOKEN
- **Key** : `WHATSAPP_ACCESS_TOKEN`
- **Value** : `EAAqwi435ZAxABQCWZAdAyrBJMpxVYfAZBXvMSXxvWdEN5VFpZAyXafLjhgrI87PllELJSruO53TqSSdksp7hAGtJ8fviOCNQGQ5UX3tpDM3tYZAi29sZBNDes4c8wUOexMZBkBjAPAp2wSYkNxzNZA4ZB7LJ5c7F3CZAdUZB1WxH5WZAjk1X2trZCktTZCXgoZBczZATxsnXBpFTrtunr1RJDCkRWI3eDA4EXUymIsepSwv4D2WMuka5oXg3nA3X3CdgjblFSZBZCcamUSdrzyVwJq1SKSLGGN1wZDZD`
- **Environments** : Cochez tout (Production, Preview, Development)

#### Variable 2: WHATSAPP_PHONE_NUMBER_ID
- **Key** : `WHATSAPP_PHONE_NUMBER_ID`
- **Value** : `927016477160571`
- **Environments** : Cochez tout

#### Variable 3: WHATSAPP_VERIFY_TOKEN
- **Key** : `WHATSAPP_VERIFY_TOKEN`
- **Value** : `sgdf_whatsapp_2024_secret`
- **Environments** : Cochez tout

#### Variables supplémentaires (si vous les avez déjà)

Si vous avez déjà configuré Clerk, SMTP, etc., ajoutez-les aussi :
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, etc.
- `TREASURY_EMAIL`
- `GEMINI_API_KEY` (si vous utilisez Gemini)

### 3.4 Déployer !

1. Vérifiez que toutes les variables sont ajoutées
2. Cliquez sur **"Deploy"**
3. Attendez 2-3 minutes pendant le build

## ✅ Étape 4: Récupérer votre URL

Une fois le déploiement terminé :

1. Vercel vous donnera une URL : `https://votre-app.vercel.app`
2. **Notez cette URL**, vous en aurez besoin pour Meta Dashboard

> 💡 **Astuce** : Vous pouvez aussi la trouver dans votre Dashboard Vercel → Votre projet → **"Domains"**

## 🔗 Étape 5: Configurer le Webhook dans Meta Dashboard

### 5.1 Aller dans Meta Dashboard

1. Allez sur [developers.facebook.com](https://developers.facebook.com/)
2. Ouvrez votre app WhatsApp Business
3. Allez dans **WhatsApp** → **Configuration** → **Webhooks**

### 5.2 Configurer le webhook

1. Cliquez sur **"Edit"** ou **"Configure"**
2. Remplissez :
   - **Callback URL** : `https://votre-app.vercel.app/api/whatsapp`
     > ⚠️ Remplacez `votre-app.vercel.app` par votre vraie URL Vercel
   - **Verify token** : `sgdf_whatsapp_2024_secret`
     > ⚠️ Le même que `WHATSAPP_VERIFY_TOKEN` dans Vercel
3. Cliquez sur **"Verify and Save"**

### 5.3 Vérifier que ça fonctionne

Si tout est correct :
- ✅ Vous verrez **"Webhook vérifié"** en vert dans Meta Dashboard
- ✅ Dans les logs Vercel, vous verrez : `✅ Webhook Meta vérifié avec succès`

### 5.4 Activer l'écoute des webhooks

1. Dans la section **"Activez l'écoute de Webhooks"**
2. Cliquez sur **"Désactivé"** pour le passer à **"Activé"** ✅
3. Cochez les événements :
   - ✅ **messages** (obligatoire)
   - ✅ **message_status** (optionnel)

### 5.5 S'abonner aux événements

1. Dans la section Webhooks, cherchez **"Manage"** ou **"Abonnements"**
2. Cochez :
   - ✅ **messages** (pour recevoir les messages entrants)
3. Cliquez sur **"Save"**

## 🧪 Étape 6: Tester

### 6.1 Vérifier que l'application fonctionne

1. Allez sur `https://votre-app.vercel.app`
2. L'application devrait s'afficher

### 6.2 Vérifier le webhook

1. Allez sur `https://votre-app.vercel.app/api/whatsapp`
2. Vous devriez recevoir :
   ```json
   {
     "success": true,
     "expenses": [],
     "total": 0
   }
   ```

### 6.3 Tester avec un message WhatsApp

1. **Ouvrez WhatsApp** sur votre téléphone
2. **Envoyez un message** au numéro de test Meta
3. **Message texte** : `"Restaurant Le Bistrot 23.50€"`
4. **Ou photo de ticket** avec légende : `"dépense restaurant"`

### 6.4 Vérifier les logs

1. Dans Vercel Dashboard → Votre projet → **"Logs"**
2. Vous devriez voir :
   ```
   📱 Webhook WhatsApp reçu
   📦 Format Meta détecté
   📨 Traitement message: ...
   💰 Message de dépense détecté, traitement...
   ✅ Données extraites: ...
   💾 Dépense sauvegardée: ...
   ```

### 6.5 Vérifier le dashboard

1. Allez sur `https://votre-app.vercel.app/whatsapp`
2. La dépense devrait apparaître dans la liste ! 🎉

## 🔄 Étape 7: Déploiements automatiques (Bonus)

Vercel déploie automatiquement à chaque push sur GitHub :

1. Faites une modification dans votre code
2. Committez et poussez :
   ```bash
   git add .
   git commit -m "Ma modification"
   git push
   ```
3. Vercel déploie automatiquement la nouvelle version ! 🚀

## 🆘 Dépannage

### Le webhook n'est pas vérifié

**Vérifiez** :
1. Que l'URL est correcte : `https://votre-app.vercel.app/api/whatsapp`
2. Que `WHATSAPP_VERIFY_TOKEN` dans Vercel correspond au token dans Meta
3. Que le serveur Vercel est bien démarré (vérifiez les logs)

**Solution** :
- Vérifiez les logs Vercel : Dashboard → Votre projet → Logs
- Testez l'URL manuellement : `curl https://votre-app.vercel.app/api/whatsapp`

### Les messages ne sont pas reçus

**Vérifiez** :
1. Que l'écoute des webhooks est **activée** dans Meta Dashboard
2. Que vous êtes abonné aux événements **"messages"**
3. Que votre numéro est dans la liste de test Meta
4. Les logs Vercel pour voir les erreurs

**Solution** :
- Vérifiez les logs Vercel en temps réel
- Testez avec un message simple d'abord : `"restaurant 25€"`

### Erreur lors du build

**Vérifiez** :
1. Que toutes les variables d'environnement sont ajoutées
2. Que le code compile en local : `npm run build`
3. Les logs de build dans Vercel

**Solution** :
- Testez le build en local d'abord
- Vérifiez les erreurs dans les logs Vercel

### L'application ne démarre pas

**Vérifiez** :
1. Que toutes les variables d'environnement requises sont présentes
2. Les logs Vercel pour voir l'erreur exacte

**Solution** :
- Vérifiez que `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` et `CLERK_SECRET_KEY` sont configurés (si vous utilisez Clerk)
- Vérifiez les logs Vercel

## 📝 Checklist finale

Avant de tester avec un vrai message :

- [ ] Code poussé sur GitHub
- [ ] Projet importé dans Vercel
- [ ] Toutes les variables d'environnement ajoutées dans Vercel
- [ ] Déploiement réussi (statut "Ready")
- [ ] URL Vercel notée : `https://votre-app.vercel.app`
- [ ] Webhook configuré dans Meta Dashboard avec la bonne URL
- [ ] Verify token correspond entre Vercel et Meta
- [ ] Webhook vérifié (statut vert dans Meta)
- [ ] Écoute des webhooks activée
- [ ] Abonné aux événements "messages"
- [ ] Numéro de test ajouté dans Meta Dashboard

## 🎉 C'est prêt !

Une fois tout configuré, votre application est en ligne et les messages WhatsApp seront automatiquement traités !

**URLs importantes** :
- **Application** : `https://votre-app.vercel.app`
- **Webhook** : `https://votre-app.vercel.app/api/whatsapp`
- **Dashboard WhatsApp** : `https://votre-app.vercel.app/whatsapp`

