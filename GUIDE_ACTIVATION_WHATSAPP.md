# ✅ Guide d'Activation WhatsApp Meta - Étape par Étape

## 📊 État actuel (d'après votre capture d'écran)

✅ **ID du numéro de téléphone** : `927016477160571` (correct)  
✅ **ID du compte WhatsApp Business** : `2253133005182328` (correct)  
✅ **Numéro de destinataire** : `+33 6 75 27 49 09` (ajouté)  
❌ **Webhooks** : **Désactivé** ⚠️ (à activer)

## 🚀 Actions à faire IMMÉDIATEMENT

### Étape 1: Créer le fichier `.env.local`

À la racine du projet, créez un fichier `.env.local` :

```env
# Meta WhatsApp API
WHATSAPP_ACCESS_TOKEN=EAAqwi435ZAxABQCWZAdAyrBJMpxVYfAZBXvMSXxvWdEN5VFpZAyXafLjhgrI87PllELJSruO53TqSSdksp7hAGtJ8fviOCNQGQ5UX3tpDM3tYZAi29sZBNDes4c8wUOexMZBkBjAPAp2wSYkNxzNZA4ZB7LJ5c7F3CZAdUZB1WxH5WZAjk1X2trZCktTZCXgoZBczZATxsnXBpFTrtunr1RJDCkRWI3eDA4EXUymIsepSwv4D2WMuka5oXg3nA3X3CdgjblFSZBZCcamUSdrzyVwJq1SKSLGGN1wZDZD
WHATSAPP_PHONE_NUMBER_ID=927016477160571
WHATSAPP_VERIFY_TOKEN=sgdf_whatsapp_2024_secret
```

> ⚠️ **Important** : Remplacez `sgdf_whatsapp_2024_secret` par un secret de votre choix. Vous devrez utiliser le **même token** lors de la configuration du webhook dans Meta.

### Étape 2: Démarrer le serveur

```bash
npm run dev
```

Le serveur doit démarrer sur `http://localhost:3000`

### Étape 3: Rendre l'application accessible publiquement

**Option A: Déployer sur Vercel (Recommandé)**

1. Installez Vercel CLI :
   ```bash
   npm i -g vercel
   ```

2. Déployez :
   ```bash
   vercel --prod
   ```

3. Notez l'URL : `https://votre-app.vercel.app`

4. Ajoutez les variables d'environnement dans Vercel :
   - Projet → Settings → Environment Variables
   - Ajoutez les 3 variables WhatsApp

**Option B: Utiliser ngrok pour tester en local (Temporaire)**

1. Téléchargez ngrok : https://ngrok.com/download
2. Dans un terminal séparé :
   ```bash
   ngrok http 3000
   ```
3. Copiez l'URL HTTPS : `https://xxxx-xx-xx-xx-xx.ngrok-free.app`

### Étape 4: Activer les Webhooks dans Meta Dashboard

#### 4.1 Aller dans la configuration

1. Allez sur [Meta for Developers](https://developers.facebook.com/)
2. Ouvrez votre app WhatsApp Business
3. Allez dans **WhatsApp** → **Configuration** → **Webhooks**

#### 4.2 Configurer le webhook

1. Cliquez sur **"Edit"** ou **"Configure"**
2. Remplissez :
   - **Callback URL** : 
     - Si Vercel : `https://votre-app.vercel.app/api/whatsapp`
     - Si ngrok : `https://xxxx-xx-xx-xx-xx.ngrok-free.app/api/whatsapp`
   - **Verify token** : Le même que `WHATSAPP_VERIFY_TOKEN` (ex: `sgdf_whatsapp_2024_secret`)
3. Cliquez sur **"Verify and Save"**

✅ Si tout est correct, vous verrez "Webhook vérifié" en vert.

#### 4.3 Activer l'écoute des webhooks

Dans la section **"Activez l'écoute de Webhooks"** :

1. Cliquez sur le bouton **"Désactivé"** pour le passer à **"Activé"**
2. Vous devriez voir le statut passer à **"Activé"** ✅

#### 4.4 S'abonner aux événements

1. Dans la section Webhooks, cherchez **"Manage"** ou **"Abonnements"**
2. Cochez :
   - ✅ **messages** (obligatoire - pour recevoir les messages)
   - ✅ **message_status** (optionnel)
3. Cliquez sur **"Save"**

### Étape 5: Tester avec un message réel

1. **Ouvrez WhatsApp** sur votre téléphone (`+33 6 75 27 49 09`)
2. **Envoyez un message** au numéro de test Meta (celui affiché dans Meta Dashboard)
3. **Message texte** : `"Restaurant Le Bistrot 23.50€"`
4. **Ou photo de ticket** avec légende : `"dépense restaurant"`

### Étape 6: Vérifier que ça fonctionne

#### Dans les logs du serveur :

Vous devriez voir :
```
📱 Webhook WhatsApp reçu
📦 Format Meta détecté
📨 Traitement message: { from: '33675274909', hasText: true, hasMedia: false }
💰 Message de dépense détecté, traitement...
✅ Données extraites du texte: ...
💾 Dépense sauvegardée: ...
```

#### Dans le dashboard :

1. Allez sur `http://localhost:3000/whatsapp` (ou votre URL déployée)
2. La dépense devrait apparaître dans la liste
3. Cliquez sur **"Importer dans le formulaire"** pour la traiter

## 🆘 Si ça ne fonctionne pas

### Problème : Le webhook n'est pas vérifié

**Vérifiez** :
1. Que `WHATSAPP_VERIFY_TOKEN` dans `.env.local` correspond **exactement** au token dans Meta
2. Que l'URL est accessible publiquement (testez avec `curl https://votre-url.com/api/whatsapp`)
3. Que le serveur est démarré et écoute sur le bon port

### Problème : Les messages ne sont pas reçus

**Vérifiez** :
1. Que l'écoute des webhooks est **activée** (pas "Désactivé")
2. Que vous êtes abonné aux événements **"messages"**
3. Que votre numéro est bien dans la liste de test
4. Les logs du serveur pour voir les erreurs

### Problème : Erreur 403

**Vérifiez** :
1. Que le token de vérification correspond exactement
2. Qu'il n'y a pas d'espaces avant/après dans `.env.local`
3. Redémarrez le serveur après modification de `.env.local`

## ✅ Checklist finale

Avant d'envoyer un message :

- [ ] `.env.local` créé avec les 3 variables
- [ ] Serveur démarré (`npm run dev`)
- [ ] Application déployée ou accessible via ngrok
- [ ] Webhook configuré dans Meta Dashboard
- [ ] Verify token correspond entre `.env.local` et Meta
- [ ] Webhook vérifié (statut vert)
- [ ] Écoute des webhooks **activée** (pas "Désactivé")
- [ ] Abonné aux événements "messages"
- [ ] Numéro de test ajouté et vérifié

Une fois tout cela fait, envoyez un message WhatsApp et il sera automatiquement traité ! 🎉

