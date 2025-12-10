# 🔄 Mettre à Jour le Token WhatsApp sur Vercel

## ✅ Informations reçues

- **Token d'accès** : `EAAqwi435ZAxABQBg3Obf1oSvgL1b6WDaox0gfnnrPrkcuC50Auz3tVaXzbhqkMlYZB4oRml32ceM9710ZAqtVnK11ZCJwrJ0UZCTBYtvlxfTSOKVVISTEcRVh5htLxXg9rAm5yycv1YIFL1M9HfLwZBjek2nglHrfpGOpNk4q7OgoSUKHAOxJyfhHiEKBNmOdOuGSIZALU5mit3kl6wwFd8RNf5KEa3iffpLRmYABELaxeGcbOvHZAdcBepbkmkyYmAZAj4TUUn9z6JiIcYSQElXHBUwZD`
- **ID WhatsApp Business** : `2253133005182328`
- **ID du numéro** : `927016477160571`
- **Webhooks** : ✅ Activés

## 📋 Étape 1: Mettre à jour les variables sur Vercel

### 1.1 Accéder aux variables d'environnement

1. Allez sur **https://vercel.com/dashboard**
2. Cliquez sur votre projet
3. **Settings** → **Environment Variables**

### 1.2 Mettre à jour WHATSAPP_ACCESS_TOKEN

1. **Trouvez** la variable `WHATSAPP_ACCESS_TOKEN` dans la liste
2. **Cliquez dessus** pour l'éditer
3. **Remplacez la valeur** par :
   ```
   EAAqwi435ZAxABQBg3Obf1oSvgL1b6WDaox0gfnnrPrkcuC50Auz3tVaXzbhqkMlYZB4oRml32ceM9710ZAqtVnK11ZCJwrJ0UZCTBYtvlxfTSOKVVISTEcRVh5htLxXg9rAm5yycv1YIFL1M9HfLwZBjek2nglHrfpGOpNk4q7OgoSUKHAOxJyfhHiEKBNmOdOuGSIZALU5mit3kl6wwFd8RNf5KEa3iffpLRmYABELaxeGcbOvHZAdcBepbkmkyYmAZAj4TUUn9z6JiIcYSQElXHBUwZD
   ```
4. **Cliquez sur "Save"**

### 1.3 Vérifier les autres variables

Assurez-vous que ces variables existent et ont les bonnes valeurs :

| Variable | Valeur |
|----------|--------|
| `WHATSAPP_ACCESS_TOKEN` | `EAAqwi435ZAxABQBg3Obf1oSvgL1b6WDaox0gfnnrPrkcuC50Auz3tVaXzbhqkMlYZB4oRml32ceM9710ZAqtVnK11ZCJwrJ0UZCTBYtvlxfTSOKVVISTEcRVh5htLxXg9rAm5yycv1YIFL1M9HfLwZBjek2nglHrfpGOpNk4q7OgoSUKHAOxJyfhHiEKBNmOdOuGSIZALU5mit3kl6wwFd8RNf5KEa3iffpLRmYABELaxeGcbOvHZAdcBepbkmkyYmAZAj4TUUn9z6JiIcYSQElXHBUwZD` |
| `WHATSAPP_PHONE_NUMBER_ID` | `927016477160571` |
| `WHATSAPP_VERIFY_TOKEN` | `sgdf_whatsapp_2024_secret` |

> ⚠️ **Si une variable n'existe pas**, créez-la en cliquant sur **"Add New"**

### 1.4 Redéployer (IMPORTANT)

⚠️ **Les modifications de variables ne sont prises en compte qu'après un redéploiement !**

1. Allez dans **"Deployments"** (en haut)
2. Cliquez sur les **3 points** (⋯) du dernier déploiement
3. Cliquez sur **"Redeploy"**
4. Confirmez
5. Attendez 1-2 minutes

## 🔗 Étape 2: Vérifier la configuration du Webhook dans Meta

Puisque les webhooks sont activés, vérifiez qu'ils sont bien configurés :

1. **Allez dans Meta Dashboard** → Votre app → **WhatsApp** → **Configuration** → **Webhooks**
2. **Vérifiez** :
   - **Callback URL** : `https://votre-app.vercel.app/api/whatsapp`
   - **Verify token** : `sgdf_whatsapp_2024_secret`
   - **Statut** : ✅ Activé
3. **Dans "Manage"**, vérifiez que **"messages"** est coché

## 🧪 Étape 3: Tester

### Test 1: Vérifier l'endpoint

Ouvrez dans votre navigateur :
```
https://votre-app.vercel.app/api/whatsapp
```

Vous devriez voir :
```json
{
  "success": true,
  "expenses": [],
  "total": 0
}
```

### Test 2: Envoyer un message WhatsApp

1. **Envoyez un message** (texte ou photo) au numéro WhatsApp Business
2. **Attendez quelques secondes**
3. **Allez sur** : `https://votre-app.vercel.app/whatsapp`
4. **Vérifiez** que le message apparaît dans la liste

### Test 3: Vérifier les logs Vercel

1. Vercel Dashboard → **Deployments** → Votre déploiement
2. **Functions** → **View Function Logs**
3. Cherchez les logs avec `[WhatsApp]` ou `[API]`
4. Vérifiez qu'il n'y a pas d'erreurs

## ✅ Checklist finale

- [ ] Token `WHATSAPP_ACCESS_TOKEN` mis à jour sur Vercel
- [ ] Variable `WHATSAPP_PHONE_NUMBER_ID` = `927016477160571`
- [ ] Variable `WHATSAPP_VERIFY_TOKEN` = `sgdf_whatsapp_2024_secret`
- [ ] Application redéployée sur Vercel
- [ ] Webhook configuré dans Meta Dashboard
- [ ] Événements "messages" abonnés
- [ ] Test d'envoi de message réussi

## 🎉 C'est prêt !

Une fois toutes ces étapes complétées, votre application WhatsApp devrait fonctionner !

