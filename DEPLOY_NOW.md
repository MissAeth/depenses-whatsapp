# 🚀 DÉPLOIEMENT IMMÉDIAT - 5 MINUTES

## Méthode Ultra-Rapide : Render.com

### 1. Allez sur render.com
- Créez un compte gratuit
- Cliquez "New Web Service"

### 2. Connectez GitHub
- Autorisez Render à accéder à vos repos
- Sélectionnez le repo "sgdf-notes-de-frais"

### 3. Configuration automatique
Render détectera automatiquement :
- **Framework** : Next.js
- **Build Command** : `npm run build`
- **Start Command** : `npm start`
- **Node Version** : 18+

### 4. Variables d'environnement (IMPORTANT)
Ajoutez ces variables dans Render :

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_dev
CLERK_SECRET_KEY=sk_test_dev
TREASURY_EMAIL=votre.email@gmail.com
NEXT_PUBLIC_BASE_URL=https://votre-app.onrender.com
```

### 5. Deploy !
- Cliquez "Create Web Service"
- Attendez 3-5 minutes
- Votre URL sera : `https://votre-nom-app.onrender.com`

## Alternative : Netlify (encore plus simple)

### 1. netlify.com
- Drag & drop le dossier du projet
- Ou connectez GitHub

### 2. Configuration
```
Build command: npm run build
Publish directory: .next
```

## URLs après déploiement

Votre webhook WhatsApp sera :
**https://votre-app.onrender.com/api/whatsapp**

## Test immédiat
```bash
curl -X POST https://votre-app.onrender.com/api/whatsapp \
  -H "Content-Type: application/json" \
  -d '{"from": "test", "text": "restaurant 25€"}'
```

## Configuration WhatsApp Business API

1. **Meta for Developers** : https://developers.facebook.com/
2. **Nouvelle App** → WhatsApp Business Platform
3. **Webhook URL** : https://votre-app.onrender.com/api/whatsapp
4. **Token de vérification** : `webhook_verify_token_123`

## VOUS ÊTES PRÊT ! 🎉