# 📱 Configuration WhatsApp Business API (Meta)

Ce guide vous explique comment configurer l'intégration avec l'API Meta WhatsApp Business Platform.

## 🎯 Vue d'ensemble

L'application utilise maintenant l'**API Meta officielle** pour recevoir les messages WhatsApp. Cette solution est :
- ✅ **Professionnelle** : API officielle Meta
- ✅ **Fiable** : Infrastructure Meta
- ✅ **Gratuite en sandbox** : Parfait pour les tests
- ✅ **Production-ready** : Prête pour la mise en production

## 📋 Étape 1: Créer un compte Meta for Developers

### 1.1 Créer un compte développeur

1. Allez sur [https://developers.facebook.com/](https://developers.facebook.com/)
2. Cliquez sur **"Get Started"** ou **"Log In"**
3. Créez un compte développeur Meta (gratuit)

### 1.2 Créer une App WhatsApp Business

1. Dans le dashboard Meta, cliquez sur **"My Apps"** → **"Create App"**
2. Sélectionnez **"Business"** comme type d'application
3. Remplissez les informations :
   - **App Name** : "Gestion Dépenses" (ou votre nom)
   - **App Contact Email** : votre email
   - **Business Account** : Créez-en un si nécessaire
4. Cliquez sur **"Create App"**

### 1.3 Ajouter WhatsApp au projet

1. Dans votre app, allez dans **"Add Product"**
2. Cherchez **"WhatsApp"** et cliquez sur **"Set Up"**
3. Vous serez redirigé vers la configuration WhatsApp

## 🔑 Étape 2: Obtenir les credentials

### 2.1 Phone Number ID

1. Dans la section WhatsApp de votre app
2. Allez dans **"API Setup"** ou **"Getting Started"**
3. Vous verrez **"Phone number ID"** (format : `123456789012345`)
4. **Copiez cette valeur** → Ce sera `WHATSAPP_PHONE_NUMBER_ID`

### 2.2 Access Token

1. Toujours dans **"API Setup"**
2. Vous verrez **"Temporary access token"** (pour les tests)
   - ⚠️ Ce token expire après 24h
   - Pour la production, vous devrez créer un token permanent
3. **Copiez cette valeur** → Ce sera `WHATSAPP_ACCESS_TOKEN`

### 2.3 Verify Token (à créer)

1. Créez un token de vérification personnalisé (ex: `mon_token_secret_123`)
2. **Notez cette valeur** → Ce sera `WHATSAPP_VERIFY_TOKEN`
3. Ce token sera utilisé pour vérifier que les webhooks viennent bien de Meta

## 🌐 Étape 3: Configurer le Webhook

### 3.1 Déployer l'application

Avant de configurer le webhook, vous devez déployer votre application :

1. **Déployez sur Vercel/Railway/Render** (voir `SETUP.md`)
2. **Notez l'URL de votre application** : `https://votre-app.vercel.app`

### 3.2 Configurer le webhook dans Meta

1. Dans votre app Meta, section WhatsApp
2. Allez dans **"Configuration"** → **"Webhooks"**
3. Cliquez sur **"Edit"** ou **"Configure"**
4. Remplissez :
   - **Callback URL** : `https://votre-app.vercel.app/api/whatsapp`
   - **Verify token** : Le même que `WHATSAPP_VERIFY_TOKEN` (ex: `mon_token_secret_123`)
5. Cliquez sur **"Verify and Save"**

### 3.3 S'abonner aux événements

1. Dans la section Webhooks, cliquez sur **"Manage"**
2. Cochez les événements suivants :
   - ✅ **messages** (pour recevoir les messages)
   - ✅ **message_status** (optionnel, pour le statut des messages)
3. Cliquez sur **"Save"**

## 🔧 Étape 4: Variables d'environnement

### 4.1 Variables requises

Ajoutez ces variables dans votre fichier `.env.local` (local) ou dans les paramètres de votre plateforme de déploiement :

```env
# Meta WhatsApp API (REQUIS)
WHATSAPP_VERIFY_TOKEN=mon_token_secret_123
WHATSAPP_ACCESS_TOKEN=votre_access_token_meta
WHATSAPP_PHONE_NUMBER_ID=votre_phone_number_id

# App Settings (optionnel mais recommandé)
NEXT_PUBLIC_BASE_URL=https://votre-app.vercel.app
TREASURY_EMAIL=votre.comptable@email.com
```

### 4.2 Où trouver chaque variable

| Variable | Où la trouver |
|----------|---------------|
| `WHATSAPP_VERIFY_TOKEN` | Vous le créez vous-même (ex: `mon_token_secret_123`) |
| `WHATSAPP_ACCESS_TOKEN` | Meta Dashboard → WhatsApp → API Setup → Temporary access token |
| `WHATSAPP_PHONE_NUMBER_ID` | Meta Dashboard → WhatsApp → API Setup → Phone number ID |

## 🧪 Étape 5: Tester l'intégration

### 5.1 Test de vérification du webhook

Meta enverra automatiquement une requête GET pour vérifier votre webhook. Si tout est bien configuré, vous verrez dans les logs :

```
✅ Webhook Meta vérifié avec succès
```

### 5.2 Test avec un message réel

1. **Ajoutez votre numéro de test** :
   - Dans Meta Dashboard → WhatsApp → Getting Started
   - Ajoutez votre numéro de téléphone pour recevoir des messages de test

2. **Envoyez un message WhatsApp** :
   - Envoyez un message texte : `"Restaurant Le Bistrot 23.50€"`
   - Ou envoyez une photo de ticket avec une légende

3. **Vérifiez les logs** :
   - Dans votre console Vercel/Railway
   - Vous devriez voir : `📱 Webhook WhatsApp reçu`

4. **Vérifiez le dashboard** :
   - Allez sur `https://votre-app.vercel.app/whatsapp`
   - La dépense devrait apparaître automatiquement

### 5.3 Test manuel avec curl (format Meta)

Pour tester localement avec le format Meta :

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
            "phone_number_id": "123456789012345"
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

### 5.4 Test avec image (format Meta)

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
            "phone_number_id": "123456789012345"
          },
          "messages": [{
            "from": "33612345678",
            "id": "wamid.test123",
            "timestamp": "1640995200",
            "type": "image",
            "image": {
              "id": "1234567890123456",
              "mime_type": "image/jpeg",
              "caption": "Ticket restaurant"
            }
          }]
        },
        "field": "messages"
      }]
    }]
  }'
```

> ⚠️ **Note** : Pour les tests avec images, vous devez avoir configuré `WHATSAPP_ACCESS_TOKEN` car l'application récupère l'image depuis l'API Meta.

## 🚀 Étape 6: Production

### 6.1 Token d'accès permanent

En sandbox, le token expire après 24h. Pour la production :

1. Allez dans **"System Users"** dans votre app Meta
2. Créez un utilisateur système avec les permissions WhatsApp
3. Générez un token permanent pour cet utilisateur
4. Remplacez `WHATSAPP_ACCESS_TOKEN` par ce token permanent

### 6.2 Numéro de téléphone vérifié

1. Pour utiliser un numéro réel (pas le sandbox) :
   - Vous devez vérifier votre Business Account
   - Demander l'accès à un numéro WhatsApp Business
   - Cela peut prendre quelques jours

### 6.3 Monitoring

Surveillez les logs pour détecter les erreurs :
- ✅ Messages reçus : `📱 Webhook WhatsApp reçu`
- ✅ Médias récupérés : `✅ Média récupéré depuis Meta`
- ❌ Erreurs : `❌ Erreur récupération média Meta`

## 🔄 Compatibilité

L'endpoint supporte **deux formats** :

1. **Format Meta** (production) : Format officiel avec `entry[]`, `changes[]`, etc.
2. **Format simulateur** (tests locaux) : Format simplifié pour les tests

Les deux formats sont automatiquement détectés et traités.

## 📚 Ressources

- **Documentation Meta** : [https://developers.facebook.com/docs/whatsapp](https://developers.facebook.com/docs/whatsapp)
- **API Reference** : [https://developers.facebook.com/docs/whatsapp/cloud-api](https://developers.facebook.com/docs/whatsapp/cloud-api)
- **Support Meta** : [https://developers.facebook.com/support/](https://developers.facebook.com/support/)

## 🆘 Dépannage

### Le webhook n'est pas vérifié

- Vérifiez que `WHATSAPP_VERIFY_TOKEN` correspond exactement au token dans Meta
- Vérifiez que l'URL du webhook est accessible publiquement
- Vérifiez les logs pour voir l'erreur exacte

### Les messages ne sont pas reçus

- Vérifiez que vous êtes abonné aux événements "messages" dans Meta
- Vérifiez que votre numéro est ajouté dans la liste des numéros de test
- Vérifiez les logs de votre application

### Les images ne sont pas récupérées

- Vérifiez que `WHATSAPP_ACCESS_TOKEN` est valide et non expiré
- Vérifiez que `WHATSAPP_PHONE_NUMBER_ID` est correct
- Vérifiez les logs pour voir l'erreur exacte de l'API Meta

### Erreur 403 lors de la récupération des médias

- Le token d'accès a probablement expiré (tokens temporaires expirent après 24h)
- Générez un nouveau token dans Meta Dashboard
- Ou créez un token permanent (recommandé pour la production)
