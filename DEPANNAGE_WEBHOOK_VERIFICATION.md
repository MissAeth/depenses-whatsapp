# 🔧 Dépannage : Erreur de Vérification Webhook Meta

## ❌ Problème
Meta dit : "L'URL de rappel ou le jeton de validation est mauvais"

## 🔍 Causes Possibles

### 1. Variable WHATSAPP_VERIFY_TOKEN non configurée sur Vercel

**Vérification :**
1. Allez sur **Vercel Dashboard** → Votre projet → **Settings** → **Environment Variables**
2. Cherchez `WHATSAPP_VERIFY_TOKEN`
3. Si elle n'existe pas, **ajoutez-la** :
   - **Key** : `WHATSAPP_VERIFY_TOKEN`
   - **Value** : `sgdf_whatsapp_2024_secret`
   - **Environments** : ✅ Production, ✅ Preview, ✅ Development
4. **Redéployez** l'application (Deployments → 3 points → Redeploy)

### 2. Application non redéployée après ajout de la variable

⚠️ **IMPORTANT** : Les variables d'environnement ne sont prises en compte qu'après un redéploiement !

**Solution :**
1. Vercel Dashboard → **Deployments**
2. Cliquez sur les **3 points** (⋯) du dernier déploiement
3. **Redeploy**
4. Attendez 2-3 minutes

### 3. Token différent entre Vercel et Meta

**Vérification :**
- **Sur Vercel** : `WHATSAPP_VERIFY_TOKEN` = `sgdf_whatsapp_2024_secret`
- **Sur Meta** : Verify token = `sgdf_whatsapp_2024_secret`

Ils doivent être **exactement identiques** (même casse, mêmes espaces)

### 4. URL incorrecte

**Vérification :**
L'URL doit être exactement :
```
https://depenses-whatsapp-lsgqh30aa-albanes-projects-a805d410.vercel.app/api/whatsapp
```

**Test :**
Ouvrez cette URL dans votre navigateur :
```
https://depenses-whatsapp-lsgqh30aa-albanes-projects-a805d410.vercel.app/api/whatsapp?hub.mode=subscribe&hub.verify_token=sgdf_whatsapp_2024_secret&hub.challenge=test123
```

**Résultat attendu :**
- Si vous voyez `test123` → L'endpoint fonctionne ✅
- Si vous voyez une erreur → Il y a un problème ❌

## 🧪 Test Complet

### Test 1: Vérifier que l'endpoint répond

Ouvrez dans votre navigateur :
```
https://depenses-whatsapp-lsgqh30aa-albanes-projects-a805d410.vercel.app/api/whatsapp
```

Vous devriez voir :
```json
{
  "success": true,
  "expenses": [],
  "total": 0
}
```

### Test 2: Vérifier la vérification Meta

Ouvrez dans votre navigateur :
```
https://depenses-whatsapp-lsgqh30aa-albanes-projects-a805d410.vercel.app/api/whatsapp?hub.mode=subscribe&hub.verify_token=sgdf_whatsapp_2024_secret&hub.challenge=test123
```

**Résultat attendu :**
- Vous devriez voir : `test123` (sans guillemets, juste le texte)
- Si vous voyez une erreur ou autre chose → Le token n'est pas configuré correctement

### Test 3: Vérifier les logs Vercel

1. Vercel Dashboard → **Deployments** → Votre déploiement
2. **Functions** → **View Function Logs**
3. Cherchez les logs avec `[WhatsApp]` ou `[API]`
4. Regardez les erreurs :
   - `⚠️ WHATSAPP_VERIFY_TOKEN non configuré` → Variable manquante
   - `❌ Token de vérification invalide` → Token différent
   - `✅ Webhook Meta vérifié avec succès` → Ça fonctionne !

## ✅ Solution Étape par Étape

### Étape 1: Vérifier les variables sur Vercel

1. **Vercel Dashboard** → Votre projet → **Settings** → **Environment Variables**
2. **Vérifiez** que ces variables existent :
   - `WHATSAPP_ACCESS_TOKEN`
   - `WHATSAPP_PHONE_NUMBER_ID`
   - `WHATSAPP_VERIFY_TOKEN` = `sgdf_whatsapp_2024_secret`
3. **Si `WHATSAPP_VERIFY_TOKEN` n'existe pas**, ajoutez-la :
   - Cliquez sur **"Add New"**
   - **Key** : `WHATSAPP_VERIFY_TOKEN`
   - **Value** : `sgdf_whatsapp_2024_secret`
   - **Environments** : ✅ Production, ✅ Preview, ✅ Development
   - Cliquez sur **"Save"**

### Étape 2: Redéployer

1. **Deployments** → Cliquez sur les **3 points** (⋯)
2. **Redeploy**
3. **Attendez 2-3 minutes** que le déploiement se termine

### Étape 3: Tester l'endpoint

Ouvrez dans votre navigateur :
```
https://depenses-whatsapp-lsgqh30aa-albanes-projects-a805d410.vercel.app/api/whatsapp?hub.mode=subscribe&hub.verify_token=sgdf_whatsapp_2024_secret&hub.challenge=test123
```

**Si vous voyez `test123`** → Ça fonctionne ! ✅

### Étape 4: Réessayer dans Meta Dashboard

1. **Meta Dashboard** → WhatsApp → Configuration → Webhooks
2. Cliquez sur **"Edit"**
3. **Callback URL** : `https://depenses-whatsapp-lsgqh30aa-albanes-projects-a805d410.vercel.app/api/whatsapp`
4. **Verify token** : `sgdf_whatsapp_2024_secret`
5. Cliquez sur **"Verify and Save"**

## 🎯 Checklist

- [ ] Variable `WHATSAPP_VERIFY_TOKEN` existe sur Vercel
- [ ] Valeur = `sgdf_whatsapp_2024_secret` (exactement)
- [ ] Application redéployée après ajout/modification de la variable
- [ ] Test de l'endpoint dans le navigateur fonctionne (retourne `test123`)
- [ ] URL dans Meta = `https://depenses-whatsapp-lsgqh30aa-albanes-projects-a805d410.vercel.app/api/whatsapp`
- [ ] Verify token dans Meta = `sgdf_whatsapp_2024_secret` (exactement identique)

## ❓ Si ça ne fonctionne toujours pas

1. **Vérifiez les logs Vercel** pour voir l'erreur exacte
2. **Testez l'URL** dans le navigateur avec les paramètres Meta
3. **Vérifiez** qu'il n'y a pas d'espaces avant/après le token
4. **Vérifiez** que l'application est bien déployée et accessible


