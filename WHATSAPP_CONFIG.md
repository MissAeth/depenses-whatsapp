# 📱 Configuration WhatsApp Business API

## Étape 1: Compte Meta for Developers

### 1. Créer un compte
- Allez sur https://developers.facebook.com/
- Créez un compte développeur Meta
- C'est **GRATUIT** pour les tests

### 2. Créer une App WhatsApp Business
1. **Nouvelle App** → WhatsApp Business Platform
2. **Nom** : "Gestion Dépenses"
3. **Email** : votre email

### 3. Configuration Sandbox (Gratuit)
Une fois l'app créée :
- **Phone Number ID** : Numéro de test fourni
- **Access Token** : Token temporaire pour tests
- **Webhook URL** : On configurera après déploiement

## Étape 2: Test avec Postman/Curl

### URL de votre webhook local
```
http://localhost:3000/api/whatsapp
```

### Test manuel avec curl
```bash
curl -X POST http://localhost:3000/api/whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "entry": [{
      "changes": [{
        "value": {
          "messages": [{
            "from": "33612345678",
            "text": {"body": "Restaurant Le Bistrot 23.50€"},
            "timestamp": "1640995200"
          }]
        }
      }]
    }]
  }'
```

### Simuler un message avec image
```bash
curl -X POST http://localhost:3000/api/whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "entry": [{
      "changes": [{
        "value": {
          "messages": [{
            "from": "33612345678",
            "type": "image",
            "image": {"id": "test_image_id"},
            "text": {"body": "Facture restaurant"},
            "timestamp": "1640995200"
          }]
        }
      }]
    }]
  }'
```

## Étape 3: Déploiement Simple

### Option A: GitHub Pages + Netlify Functions
1. Push votre code sur GitHub
2. Connectez à Netlify
3. Auto-deploy activé

### Option B: Railway (plus simple que Vercel)
1. Allez sur railway.app
2. "Deploy from GitHub"
3. Sélectionnez votre repo
4. Variables d'env automatiquement détectées

### Option C: Render.com
1. Compte gratuit sur render.com
2. "New Web Service"
3. Connectez GitHub
4. Build automatique

## Configuration Production

### Variables d'environnement nécessaires
```env
# Meta WhatsApp API
WHATSAPP_VERIFY_TOKEN=votre_token_verification_123
WHATSAPP_ACCESS_TOKEN=votre_access_token_meta
WHATSAPP_PHONE_NUMBER_ID=votre_phone_number_id

# App Settings
NEXT_PUBLIC_BASE_URL=https://votre-app-deployee.com
TREASURY_EMAIL=votre.comptable@email.com
```

### Webhook WhatsApp final
```
https://votre-app-deployee.com/api/whatsapp
```

## Test Final

### 1. Envoi message WhatsApp
```
"Taxi aéroport 45€" + [photo ticket]
```

### 2. Vérification Dashboard
```
https://votre-app-deployee.com/whatsapp
→ Dépense doit apparaître automatiquement
```

## Workflow Complet Production

```
Message WhatsApp → Meta API → Votre Webhook → IA Processing → Dashboard → Email
```

## Support
- **Meta for Developers** : https://developers.facebook.com/support/
- **WhatsApp Business Platform** : https://developers.facebook.com/docs/whatsapp/