# ✅ Configuration WhatsApp Meta - Vos Credentials

## 🔑 Vos informations Meta

Voici vos credentials pour configurer WhatsApp Meta :

- **Access Token** : `EAAqwi435ZAxABQCWZAdAyrBJMpxVYfAZBXvMSXxvWdEN5VFpZAyXafLjhgrI87PllELJSruO53TqSSdksp7hAGtJ8fviOCNQGQ5UX3tpDM3tYZAi29sZBNDes4c8wUOexMZBkBjAPAp2wSYkNxzNZA4ZB7LJ5c7F3CZAdUZB1WxH5WZAjk1X2trZCktTZCXgoZBczZATxsnXBpFTrtunr1RJDCkRWI3eDA4EXUymIsepSwv4D2WMuka5oXg3nA3X3CdgjblFSZBZCcamUSdrzyVwJq1SKSLGGN1wZDZD`
- **Phone Number ID** : `927016477160571`
- **WhatsApp Business Account ID** : `2253133005182328`

## 📝 Configuration immédiate

### 1. Créer le fichier `.env.local`

À la racine du projet, créez/modifiez `.env.local` :

```env
# Meta WhatsApp API
WHATSAPP_ACCESS_TOKEN=EAAqwi435ZAxABQCWZAdAyrBJMpxVYfAZBXvMSXxvWdEN5VFpZAyXafLjhgrI87PllELJSruO53TqSSdksp7hAGtJ8fviOCNQGQ5UX3tpDM3tYZAi29sZBNDes4c8wUOexMZBkBjAPAp2wSYkNxzNZA4ZB7LJ5c7F3CZAdUZB1WxH5WZAjk1X2trZCktTZCXgoZBczZATxsnXBpFTrtunr1RJDCkRWI3eDA4EXUymIsepSwv4D2WMuka5oXg3nA3X3CdgjblFSZBZCcamUSdrzyVwJq1SKSLGGN1wZDZD
WHATSAPP_PHONE_NUMBER_ID=927016477160571
WHATSAPP_VERIFY_TOKEN=mon_token_secret_123
```

> ⚠️ **Important** : Remplacez `mon_token_secret_123` par un secret de votre choix (ex: `sgdf_whatsapp_2024_secret`). Vous devrez utiliser le même token lors de la configuration du webhook dans Meta.

### 2. Redémarrer le serveur

```bash
npm run dev
```

## 🧪 Test rapide

### Test 1: Vérifier la configuration

Testez que l'endpoint répond correctement :

```bash
curl http://localhost:3000/api/whatsapp
```

Vous devriez recevoir :
```json
{
  "success": true,
  "expenses": [],
  "total": 0
}
```

### Test 2: Simuler un message Meta

Testez avec un message au format Meta :

```bash
curl -X POST http://localhost:3000/api/whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "entry": [{
      "id": "test_entry_id",
      "changes": [{
        "value": {
          "messaging_product": "whatsapp",
          "metadata": {
            "display_phone_number": "33612345678",
            "phone_number_id": "927016477160571"
          },
          "messages": [{
            "from": "33612345678",
            "id": "wamid.test123",
            "timestamp": "1640995200",
            "type": "text",
            "text": {
              "body": "Restaurant Le Bistrot 23.50€"
            }
          }]
        },
        "field": "messages"
      }]
    }]
  }'
```

Si tout fonctionne, vous devriez voir dans les logs :
```
📱 Webhook WhatsApp reçu
📦 Format Meta détecté
📨 Traitement message: ...
💰 Message de dépense détecté, traitement...
✅ Données extraites du texte: ...
```

### Test 3: Vérifier le dashboard

1. Allez sur `http://localhost:3000/whatsapp`
2. La dépense devrait apparaître dans la liste

## 🌐 Configuration du Webhook dans Meta

Une fois votre application déployée (Vercel/Railway/etc.) :

### 1. Obtenir l'URL de votre webhook

Si déployé sur Vercel : `https://votre-app.vercel.app/api/whatsapp`

### 2. Configurer dans Meta Dashboard

1. Allez sur [Meta for Developers](https://developers.facebook.com/)
2. Ouvrez votre app WhatsApp Business
3. Allez dans **WhatsApp** → **Configuration** → **Webhooks**
4. Cliquez sur **"Edit"** ou **"Configure"**
5. Remplissez :
   - **Callback URL** : `https://votre-app.vercel.app/api/whatsapp`
   - **Verify token** : Le même que `WHATSAPP_VERIFY_TOKEN` dans `.env.local` (ex: `mon_token_secret_123`)
6. Cliquez sur **"Verify and Save"**

Meta enverra une requête GET pour vérifier votre webhook. Si tout est correct :
- ✅ Le webhook sera vérifié
- ✅ Vous verrez dans les logs : `✅ Webhook Meta vérifié avec succès`

### 3. S'abonner aux événements

1. Dans la section Webhooks, cliquez sur **"Manage"**
2. Cochez :
   - ✅ **messages** (pour recevoir les messages)
   - ✅ **message_status** (optionnel)
3. Cliquez sur **"Save"**

## 📱 Test avec un vrai message WhatsApp

### 1. Ajouter votre numéro de test

1. Dans Meta Dashboard → **WhatsApp** → **Getting Started**
2. Section **"To"** → **"Add phone number"**
3. Ajoutez votre numéro de téléphone (format international, ex: `33612345678`)
4. Vous recevrez un code de vérification par SMS
5. Entrez le code pour vérifier

### 2. Envoyer un message

Depuis WhatsApp, envoyez un message au numéro de test Meta :

- **Message texte** : `"Restaurant Le Bistrot 23.50€"`
- **Ou photo de ticket** avec légende : `"dépense restaurant"`

### 3. Vérifier

1. **Logs de l'application** : Vous devriez voir les messages de traitement
2. **Dashboard** : `https://votre-app.vercel.app/whatsapp` → La dépense devrait apparaître

## ⚠️ Notes importantes

### Token temporaire

- ⏰ Ce token expire après **24 heures**
- 🔄 Pour les tests, générez un nouveau token dans Meta Dashboard si nécessaire
- 🏭 Pour la production, créez un **token permanent** via System Users

### Sécurité

- ❌ **NE partagez JAMAIS** ces credentials publiquement
- ❌ **NE commitez JAMAIS** `.env.local` dans Git
- ✅ Le fichier `.env.local` est déjà dans `.gitignore`

### Régénérer le token

Si le token expire :

1. Allez dans Meta Dashboard → **WhatsApp** → **API Setup**
2. Cliquez sur **"Temporary access token"** → **"Generate new token"**
3. Copiez le nouveau token
4. Mettez à jour `WHATSAPP_ACCESS_TOKEN` dans `.env.local`
5. Redémarrez le serveur

## 🆘 Dépannage

### Erreur "WHATSAPP_ACCESS_TOKEN non configuré"
→ Vérifiez que la variable est dans `.env.local` et redémarrez le serveur

### Erreur 403 lors de la récupération des médias
→ Le token a probablement expiré (tokens temporaires expirent après 24h)
→ Générez un nouveau token dans Meta Dashboard

### Le webhook n'est pas vérifié
→ Vérifiez que `WHATSAPP_VERIFY_TOKEN` correspond exactement au token dans Meta Dashboard
→ Vérifiez que l'URL du webhook est accessible publiquement

### Les messages ne sont pas reçus
→ Vérifiez que vous êtes abonné aux événements "messages" dans Meta Dashboard
→ Vérifiez que votre numéro est ajouté dans la liste des numéros de test
→ Vérifiez les logs de votre application

## 📚 Ressources

- **Documentation Meta** : https://developers.facebook.com/docs/whatsapp
- **Guide complet** : Voir `WHATSAPP_CONFIG.md`
- **Configuration rapide** : Voir `CONFIGURATION_RAPIDE_WHATSAPP.md`

