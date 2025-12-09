# 🚀 Déploiement WhatsApp Webhook

## Option A : Vercel (Recommandé - Gratuit)

### 1. Installation Vercel CLI
```bash
npm i -g vercel
```

### 2. Déploiement
```bash
cd sgdf-notes-de-frais
vercel --prod
```

### 3. Configuration domaine
Votre webhook sera : `https://votre-app.vercel.app/api/whatsapp`

## Option B : Railway (Alternative gratuite)

### 1. Installation Railway CLI
```bash
npm install -g @railway/cli
```

### 2. Login et déploiement
```bash
railway login
railway deploy
```

## Option C : Render.com

### 1. Connectez votre GitHub
- Allez sur render.com
- Connectez ce repo
- Service type : Web Service
- Build command : `npm run build`
- Start command : `npm start`

## Configuration Variables d'Environnement

Pour la production, ajoutez ces variables :

```env
# WhatsApp Business API
WHATSAPP_VERIFY_TOKEN=votre_token_secret_123
WHATSAPP_ACCESS_TOKEN=votre_access_token_whatsapp

# Email (pour notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre.email@gmail.com
SMTP_PASS=votre_mot_de_passe_app

# Base URL de votre app
NEXT_PUBLIC_BASE_URL=https://votre-app.vercel.app
```

## URLs importantes après déploiement

- **Interface web** : https://votre-app.vercel.app
- **Webhook WhatsApp** : https://votre-app.vercel.app/api/whatsapp
- **Dashboard** : https://votre-app.vercel.app/whatsapp