# 🔗 URL Webhook Exacte pour Meta

## 📋 URL à Copier-Coller

### Étape 1: Trouver votre URL Vercel

1. Allez sur **https://vercel.com/dashboard**
2. Cliquez sur votre projet
3. Dans **Deployments**, cliquez sur le dernier déploiement (celui avec ✅)
4. **Copiez l'URL** qui s'affiche en haut (ex: `https://depenses-whatsapp-xxxxx.vercel.app`)

### Étape 2: Construire l'URL du Webhook

L'URL du webhook est :
```
https://VOTRE-URL-VERCEL/api/whatsapp
```

**Exemple** (remplacez par votre vraie URL) :
```
https://depenses-whatsapp-xxxxx.vercel.app/api/whatsapp
```

### Étape 3: Copier-Coller dans Meta Dashboard

1. Allez sur **https://developers.facebook.com/**
2. Sélectionnez votre app **Billz App**
3. **WhatsApp** → **Configuration** → **Webhooks**
4. Cliquez sur **"Edit"** ou **"Configure"**
5. Dans le champ **"Callback URL"**, collez :
   ```
   https://VOTRE-URL-VERCEL/api/whatsapp
   ```
   ⚠️ **Remplacez `VOTRE-URL-VERCEL` par votre vraie URL Vercel**

6. Dans le champ **"Verify token"**, collez :
   ```
   sgdf_whatsapp_2024_secret
   ```

7. Cliquez sur **"Verify and Save"**

## ✅ Format Exact

```
https://[votre-url-vercel]/api/whatsapp
```

**Où `[votre-url-vercel]` est votre URL Vercel** (sans les crochets)

## 🔍 Comment Trouver Votre URL Vercel Exacte

### Méthode 1: Depuis Vercel Dashboard
1. Vercel Dashboard → Votre projet
2. En haut de la page, vous verrez : `https://votre-projet.vercel.app`
3. **Copiez cette URL**

### Méthode 2: Depuis un Déploiement
1. Vercel Dashboard → Deployments
2. Cliquez sur un déploiement
3. Cliquez sur **"Visit"** ou regardez l'URL en haut
4. **Copiez l'URL** (sans le `/whatsapp` à la fin)

### Méthode 3: Depuis les Settings
1. Vercel Dashboard → Votre projet → **Settings**
2. Section **"Domains"**
3. Vous verrez votre URL Vercel

## 📝 Exemple Complet

Si votre URL Vercel est : `https://billz-whatsapp-abc123.vercel.app`

Alors l'URL du webhook est :
```
https://billz-whatsapp-abc123.vercel.app/api/whatsapp
```

**À copier-coller dans Meta Dashboard → Callback URL**

## ⚠️ Important

- L'URL doit commencer par `https://` (pas `http://`)
- L'URL doit se terminer par `/api/whatsapp` (exactement)
- Pas d'espace avant ou après
- Pas de `/` à la fin après `whatsapp`

## 🧪 Vérification

Avant de configurer le webhook, testez que l'URL fonctionne :

1. Ouvrez l'URL dans votre navigateur :
   ```
   https://VOTRE-URL-VERCEL/api/whatsapp
   ```

2. Vous devriez voir :
   ```json
   {
     "success": true,
     "expenses": [],
     "total": 0
   }
   ```

3. Si ça fonctionne, l'URL est correcte ! ✅


