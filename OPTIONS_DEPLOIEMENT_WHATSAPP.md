# 🌐 Options de Déploiement pour WhatsApp Webhooks

## ❓ Pourquoi une URL publique ?

Meta doit pouvoir envoyer des webhooks à votre application depuis Internet. Votre serveur local (`localhost:3000`) n'est **pas accessible** depuis Internet, donc Meta ne peut pas l'atteindre.

**Solution** : Rendre votre application accessible publiquement via une URL HTTPS.

## 🎯 Toutes les options disponibles

### Option 1: ngrok (Pour tester en local - GRATUIT)

**Avantages** :
- ✅ Gratuit
- ✅ Rapide à configurer (2 minutes)
- ✅ Parfait pour les tests
- ✅ Pas besoin de déployer

**Inconvénients** :
- ❌ URL change à chaque redémarrage
- ❌ Limité en temps (gratuit)
- ❌ Pas pour la production

**Comment faire** :
1. Téléchargez ngrok : https://ngrok.com/download
2. Démarrez votre serveur : `npm run dev`
3. Dans un autre terminal : `ngrok http 3000`
4. Copiez l'URL HTTPS : `https://xxxx-xx-xx-xx-xx.ngrok-free.app`
5. Utilisez cette URL dans Meta Dashboard

**URL du webhook** : `https://xxxx-xx-xx-xx-xx.ngrok-free.app/api/whatsapp`

---

### Option 2: Vercel (Recommandé pour production - GRATUIT)

**Avantages** :
- ✅ Gratuit (plan gratuit généreux)
- ✅ Très simple à utiliser
- ✅ URL permanente
- ✅ Déploiement automatique depuis GitHub
- ✅ Excellent pour Next.js

**Inconvénients** :
- ⚠️ Nécessite un compte GitHub (gratuit)

**Comment faire** :
1. Allez sur [vercel.com](https://vercel.com)
2. Connectez votre compte GitHub
3. Importez votre repository
4. Vercel détecte automatiquement Next.js
5. Ajoutez les variables d'environnement
6. Cliquez "Deploy"

**URL du webhook** : `https://votre-app.vercel.app/api/whatsapp`

---

### Option 3: Railway (Alternative gratuite)

**Avantages** :
- ✅ Gratuit (plan gratuit)
- ✅ Simple
- ✅ URL permanente
- ✅ Déploiement depuis GitHub

**Inconvénients** :
- ⚠️ Peut être plus lent que Vercel

**Comment faire** :
1. Allez sur [railway.app](https://railway.app)
2. Connectez GitHub
3. "Deploy from GitHub"
4. Sélectionnez votre repo
5. Ajoutez les variables d'environnement

**URL du webhook** : `https://votre-app.up.railway.app/api/whatsapp`

---

### Option 4: Render.com (Gratuit)

**Avantages** :
- ✅ Gratuit
- ✅ Simple
- ✅ URL permanente

**Inconvénients** :
- ⚠️ Peut être lent au démarrage (cold start)

**Comment faire** :
1. Allez sur [render.com](https://render.com)
2. "New Web Service"
3. Connectez GitHub
4. Sélectionnez votre repo
5. Build command : `npm run build`
6. Start command : `npm start`

**URL du webhook** : `https://votre-app.onrender.com/api/whatsapp`

---

### Option 5: Netlify (Gratuit)

**Avantages** :
- ✅ Gratuit
- ✅ Simple
- ✅ Bon pour les sites statiques

**Inconvénients** :
- ⚠️ Moins adapté pour les API routes Next.js

**Comment faire** :
1. Allez sur [netlify.com](https://netlify.com)
2. Connectez GitHub
3. Importez votre repo
4. Build command : `npm run build`
5. Publish directory : `.next`

**URL du webhook** : `https://votre-app.netlify.app/api/whatsapp`

---

### Option 6: Votre propre serveur (Si vous en avez un)

**Avantages** :
- ✅ Contrôle total
- ✅ URL personnalisée

**Inconvénients** :
- ❌ Nécessite un serveur
- ❌ Configuration plus complexe
- ❌ Maintenance

**Comment faire** :
1. Déployez votre application sur votre serveur
2. Configurez un domaine (ex: `whatsapp.votre-domaine.com`)
3. Configurez HTTPS (Let's Encrypt)
4. Utilisez cette URL dans Meta Dashboard

**URL du webhook** : `https://votre-domaine.com/api/whatsapp`

---

## 🎯 Quelle option choisir ?

### Pour tester rapidement (maintenant)
→ **ngrok** (Option 1)
- Le plus rapide
- Parfait pour vérifier que tout fonctionne
- 2 minutes de configuration

### Pour la production (long terme)
→ **Vercel** (Option 2) ou **Railway** (Option 3)
- Gratuit
- URL permanente
- Déploiement automatique
- Fiable

## 📝 Configuration dans Meta Dashboard

Peu importe l'option choisie, dans Meta Dashboard :

1. Allez dans **WhatsApp** → **Configuration** → **Webhooks**
2. **Callback URL** : Votre URL + `/api/whatsapp`
   - ngrok : `https://xxxx-xx-xx-xx-xx.ngrok-free.app/api/whatsapp`
   - Vercel : `https://votre-app.vercel.app/api/whatsapp`
   - Railway : `https://votre-app.up.railway.app/api/whatsapp`
   - Render : `https://votre-app.onrender.com/api/whatsapp`
3. **Verify token** : `sgdf_whatsapp_2024_secret` (le même que dans `.env.local`)
4. Cliquez **"Verify and Save"**

## ✅ Résumé

**Vous n'êtes PAS obligé d'utiliser Vercel !**

- **Pour tester maintenant** : Utilisez **ngrok** (le plus rapide)
- **Pour la production** : Choisissez **Vercel**, **Railway**, ou **Render** (tous gratuits)

L'important est d'avoir une **URL HTTPS accessible depuis Internet** pour que Meta puisse envoyer les webhooks.

