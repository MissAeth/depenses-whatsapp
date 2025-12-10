# 🔧 Activer les Webhooks WhatsApp Meta

## ⚠️ Problème identifié

D'après votre capture d'écran Meta Dashboard, les **webhooks sont désactivés**. Il faut les activer pour recevoir les messages WhatsApp.

## 📋 Étape 1: Vérifier votre configuration locale

### 1.1 Créer le fichier `.env.local`

À la racine du projet, créez/modifiez `.env.local` :

```env
# Meta WhatsApp API
WHATSAPP_ACCESS_TOKEN=EAAqwi435ZAxABQCWZAdAyrBJMpxVYfAZBXvMSXxvWdEN5VFpZAyXafLjhgrI87PllELJSruO53TqSSdksp7hAGtJ8fviOCNQGQ5UX3tpDM3tYZAi29sZBNDes4c8wUOexMZBkBjAPAp2wSYkNxzNZA4ZB7LJ5c7F3CZAdUZB1WxH5WZAjk1X2trZCktTZCXgoZBczZATxsnXBpFTrtunr1RJDCkRWI3eDA4EXUymIsepSwv4D2WMuka5oXg3nA3X3CdgjblFSZBZCcamUSdrzyVwJq1SKSLGGN1wZDZD
WHATSAPP_PHONE_NUMBER_ID=927016477160571
WHATSAPP_VERIFY_TOKEN=sgdf_whatsapp_2024_secret
```

> ⚠️ **Important** : Choisissez un `WHATSAPP_VERIFY_TOKEN` sécurisé (ex: `sgdf_whatsapp_2024_secret`). Vous devrez utiliser le **même token** lors de la configuration du webhook dans Meta.

### 1.2 Redémarrer le serveur

```bash
npm run dev
```

## 🌐 Étape 2: Rendre votre application accessible publiquement

Pour que Meta puisse envoyer des webhooks, votre application doit être accessible depuis Internet.

### Option A: Déployer sur Vercel (Recommandé - Gratuit)

1. **Installez Vercel CLI** :
   ```bash
   npm i -g vercel
   ```

2. **Déployez** :
   ```bash
   vercel --prod
   ```

3. **Notez l'URL** : `https://votre-app.vercel.app`

4. **Ajoutez les variables d'environnement dans Vercel** :
   - Allez dans votre projet Vercel → Settings → Environment Variables
   - Ajoutez les 3 variables WhatsApp (mêmes valeurs que `.env.local`)

### Option B: Utiliser ngrok pour tester en local (Temporaire)

Si vous voulez tester en local sans déployer :

1. **Installez ngrok** : https://ngrok.com/download

2. **Démarrez votre serveur local** :
   ```bash
   npm run dev
   ```

3. **Dans un autre terminal, lancez ngrok** :
   ```bash
   ngrok http 3000
   ```

4. **Copiez l'URL HTTPS** : `https://xxxx-xx-xx-xx-xx.ngrok-free.app`

> ⚠️ **Note** : L'URL ngrok change à chaque redémarrage. Utilisez cette méthode uniquement pour les tests.

## 🔗 Étape 3: Configurer le Webhook dans Meta Dashboard

### 3.1 Aller dans la configuration des webhooks

1. Allez sur [Meta for Developers](https://developers.facebook.com/)
2. Ouvrez votre app WhatsApp Business
3. Allez dans **WhatsApp** → **Configuration** → **Webhooks**
4. Cliquez sur **"Edit"** ou **"Configure"**

### 3.2 Configurer le webhook

Remplissez les champs :

- **Callback URL** : 
  - Si déployé sur Vercel : `https://votre-app.vercel.app/api/whatsapp`
  - Si avec ngrok : `https://xxxx-xx-xx-xx-xx.ngrok-free.app/api/whatsapp`

- **Verify token** : 
  - Le même que `WHATSAPP_VERIFY_TOKEN` dans `.env.local`
  - Exemple : `sgdf_whatsapp_2024_secret`

### 3.3 Vérifier le webhook

1. Cliquez sur **"Verify and Save"**
2. Meta enverra une requête GET à votre endpoint
3. Si tout est correct, vous verrez :
   - ✅ **Webhook vérifié** dans Meta Dashboard
   - ✅ Dans les logs de votre serveur : `✅ Webhook Meta vérifié avec succès`

### 3.4 Activer l'écoute des webhooks

1. Dans la section Webhooks, cliquez sur **"Manage"** ou **"Écouter"**
2. **Activez l'écoute** (bouton "Désactivé" → "Activé")
3. Cochez les événements :
   - ✅ **messages** (obligatoire - pour recevoir les messages)
   - ✅ **message_status** (optionnel - pour le statut des messages)

### 3.5 S'abonner aux événements

1. Dans la section Webhooks, cherchez **"Abonnements"** ou **"Subscriptions"**
2. Cochez :
   - ✅ **messages** (pour recevoir les messages entrants)
   - ✅ **message_status** (optionnel)
3. Cliquez sur **"Save"**

## 📱 Étape 4: Ajouter votre numéro de test

Pour recevoir des messages de test :

1. Dans Meta Dashboard → **WhatsApp** → **Getting Started** (ou **Test de l'API**)
2. Section **"Add a recipient phone number"**
3. Ajoutez votre numéro : `+33 6 75 27 49 09` (ou votre numéro)
4. Vous recevrez un code de vérification par SMS
5. Entrez le code pour vérifier

## 🧪 Étape 5: Tester

### Test 1: Vérifier que le webhook est actif

Dans Meta Dashboard, vous devriez voir :
- ✅ **Webhook vérifié** (statut vert)
- ✅ **Écoute activée** (au lieu de "Désactivé")

### Test 2: Envoyer un message depuis WhatsApp

1. **Ouvrez WhatsApp** sur votre téléphone
2. **Envoyez un message** au numéro de test Meta (celui affiché dans Meta Dashboard)
3. **Message texte** : `"Restaurant Le Bistrot 23.50€"`
4. **Ou photo de ticket** avec légende : `"dépense restaurant"`

### Test 3: Vérifier les logs

Dans les logs de votre serveur, vous devriez voir :

```
📱 Webhook WhatsApp reçu
📦 Format Meta détecté
📨 Traitement message: { from: '33675274909', hasText: true, hasMedia: false }
💰 Message de dépense détecté, traitement...
📝 Traitement message texte uniquement...
✅ Données extraites du texte: { amount: 23.5, merchant: 'Le Bistrot', ... }
💾 Dépense à sauvegarder: { id: '...', amount: 23.5, ... }
✅ Dépense sauvegardée: ...
```

### Test 4: Vérifier le dashboard

1. Allez sur `http://localhost:3000/whatsapp` (ou votre URL déployée)
2. La dépense devrait apparaître dans la liste
3. Cliquez sur **"Importer dans le formulaire"** pour la traiter

## 🆘 Dépannage

### Le webhook n'est pas vérifié

**Problème** : Meta ne peut pas vérifier votre webhook

**Solutions** :
1. Vérifiez que `WHATSAPP_VERIFY_TOKEN` correspond exactement au token dans Meta
2. Vérifiez que l'URL est accessible publiquement (testez avec `curl https://votre-url.com/api/whatsapp`)
3. Vérifiez les logs de votre serveur pour voir l'erreur exacte
4. Si vous utilisez ngrok, assurez-vous que l'URL est à jour

### Les messages ne sont pas reçus

**Problème** : Vous envoyez un message mais rien n'arrive

**Solutions** :
1. Vérifiez que l'écoute des webhooks est **activée** dans Meta Dashboard
2. Vérifiez que vous êtes abonné aux événements **"messages"**
3. Vérifiez que votre numéro est ajouté dans la liste de test
4. Vérifiez les logs de votre serveur
5. Vérifiez que l'URL du webhook est correcte dans Meta Dashboard

### Erreur 403 lors de la vérification

**Problème** : Token de vérification invalide

**Solutions** :
1. Vérifiez que `WHATSAPP_VERIFY_TOKEN` dans `.env.local` correspond exactement au token dans Meta
2. Redémarrez votre serveur après avoir modifié `.env.local`
3. Vérifiez qu'il n'y a pas d'espaces avant/après le token

### Les images ne sont pas récupérées

**Problème** : Les messages avec images ne fonctionnent pas

**Solutions** :
1. Vérifiez que `WHATSAPP_ACCESS_TOKEN` est valide (non expiré)
2. Vérifiez que `WHATSAPP_PHONE_NUMBER_ID` est correct
3. Vérifiez les logs pour voir l'erreur exacte de l'API Meta

## ✅ Checklist finale

Avant de tester avec un vrai message :

- [ ] `.env.local` créé avec les 3 variables WhatsApp
- [ ] Serveur redémarré (`npm run dev`)
- [ ] Application déployée ou accessible via ngrok
- [ ] Webhook configuré dans Meta Dashboard avec la bonne URL
- [ ] Verify token correspond entre `.env.local` et Meta Dashboard
- [ ] Webhook vérifié (statut vert dans Meta Dashboard)
- [ ] Écoute des webhooks activée
- [ ] Abonné aux événements "messages"
- [ ] Numéro de test ajouté dans Meta Dashboard
- [ ] Numéro vérifié (code SMS entré)

Une fois tout cela fait, vous pouvez envoyer un message WhatsApp et il sera automatiquement traité ! 🎉

