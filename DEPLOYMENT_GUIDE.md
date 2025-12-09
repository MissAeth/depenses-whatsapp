# 🚀 Guide de Déploiement WhatsApp Webhook

## Option A: Vercel (Recommandé)

### 1. Connexion Vercel
```bash
cd sgdf-notes-de-frais
npx vercel login
# Suivez les instructions pour vous connecter
```

### 2. Déploiement
```bash
npx vercel --prod
```

### 3. Configuration des variables d'environnement
Une fois déployé, allez sur votre dashboard Vercel et ajoutez :

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_dev
CLERK_SECRET_KEY=sk_test_dev
TREASURY_EMAIL=votre.email@gmail.com
NEXT_PUBLIC_BASE_URL=https://votre-app.vercel.app
```

## Option B: Railway (Alternative gratuite)

### 1. Compte Railway
- Allez sur railway.app
- Connectez votre GitHub
- Importez ce repository

### 2. Variables d'environnement
Ajoutez les mêmes variables que pour Vercel

## Option C: Netlify

### 1. Compte Netlify
- Allez sur netlify.com
- Drag & drop le dossier `.next` après build
- Ou connectez GitHub

## Configuration WhatsApp Business API

### 1. Créez un compte Meta Business
- Allez sur developers.facebook.com
- Créez une app WhatsApp Business

### 2. Configuration Webhook
- URL Webhook : `https://votre-app.vercel.app/api/whatsapp`
- Token de vérification : `votre_token_secret_123`
- Événements : messages, media

### 3. Test du Webhook
```bash
# Test depuis votre app déployée
curl -X POST https://votre-app.vercel.app/api/whatsapp \
  -H "Content-Type: application/json" \
  -d '{"from": "test", "text": "restaurant 25€"}'
```

## URLs après déploiement

- **Interface principale** : https://votre-app.vercel.app
- **Webhook WhatsApp** : https://votre-app.vercel.app/api/whatsapp
- **Dashboard dépenses** : https://votre-app.vercel.app/whatsapp

## Test de production

1. Envoyez un message WhatsApp avec un ticket
2. Vérifiez sur le dashboard : https://votre-app.vercel.app/whatsapp
3. La dépense doit apparaître automatiquement