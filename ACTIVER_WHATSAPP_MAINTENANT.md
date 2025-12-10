# 🚀 Activer WhatsApp - Guide Complet

## ✅ Étape 1: Vérifier les variables d'environnement sur Vercel

Votre application est déjà déployée sur Vercel. Vérifiez que ces variables sont bien configurées :

1. **Allez dans votre Dashboard Vercel** : https://vercel.com/dashboard
2. **Sélectionnez votre projet**
3. **Settings** → **Environment Variables**
4. **Vérifiez que ces 3 variables existent** :

| Variable | Valeur |
|----------|--------|
| `WHATSAPP_ACCESS_TOKEN` | `EAAqwi435ZAxABQCWZAdAyrBJMpxVYfAZBXvMSXxvWdEN5VFpZAyXafLjhgrI87PllELJSruO53TqSSdksp7hAGtJ8fviOCNQGQ5UX3tpDM3tYZAi29sZBNDes4c8wUOexMZBkBjAPAp2wSYkNxzNZA4ZB7LJ5c7F3CZAdUZB1WxH5WZAjk1X2trZCktTZCXgoZBczZATxsnXBpFTrtunr1RJDCkRWI3eDA4EXUymIsepSwv4D2WMuka5oXg3nA3X3CdgjblFSZBZCcamUSdrzyVwJq1SKSLGGN1wZDZD` |
| `WHATSAPP_PHONE_NUMBER_ID` | `927016477160571` |
| `WHATSAPP_VERIFY_TOKEN` | `sgdf_whatsapp_2024_secret` |

> ⚠️ **Si elles n'existent pas**, ajoutez-les maintenant :
> - Cliquez sur **"Add"**
> - Entrez le nom de la variable
> - Entrez la valeur
> - Cochez **Production**, **Preview**, et **Development**
> - Cliquez **"Save"**
> - **Redéployez** votre application (Deployments → 3 points → Redeploy)

## 🌐 Étape 2: Récupérer l'URL de votre application Vercel

1. Dans Vercel Dashboard → **Deployments**
2. Cliquez sur le dernier déploiement (celui avec ✅)
3. **Copiez l'URL** : `https://votre-app.vercel.app`
4. **Notez cette URL**, vous en aurez besoin pour Meta

## 🔗 Étape 3: Configurer le Webhook dans Meta Dashboard

### 3.1 Aller dans Meta Dashboard

1. Allez sur [developers.facebook.com](https://developers.facebook.com/)
2. Connectez-vous avec votre compte Meta
3. **Sélectionnez votre app WhatsApp Business**
4. Dans le menu de gauche, cliquez sur **"WhatsApp"**

### 3.2 Configurer le Webhook

1. Cliquez sur **"Configuration"** (ou **"Setup"**)
2. Dans la section **"Webhooks"**, cliquez sur **"Edit"** ou **"Configure"**
3. Remplissez le formulaire :
   - **Callback URL** : `https://votre-app.vercel.app/api/whatsapp`
     - ⚠️ Remplacez `votre-app.vercel.app` par votre vraie URL Vercel
   - **Verify token** : `sgdf_whatsapp_2024_secret`
     - ⚠️ Doit être **exactement** la même valeur que `WHATSAPP_VERIFY_TOKEN` sur Vercel
4. Cliquez sur **"Verify and Save"**
   - ✅ Si ça fonctionne, vous verrez un message de succès
   - ❌ Si ça échoue, vérifiez :
     - Que votre app Vercel est bien déployée et accessible
     - Que l'URL est correcte (avec `/api/whatsapp` à la fin)
     - Que le verify token est identique

### 3.3 S'abonner aux événements

1. Dans la section **"Webhooks"**, cliquez sur **"Manage"** (à côté de votre webhook)
2. Cochez les événements suivants :
   - ✅ **messages** (obligatoire - pour recevoir les messages)
   - ✅ **message_status** (optionnel - pour le statut des messages)
3. Cliquez sur **"Save"**

## 🧪 Étape 4: Tester que ça fonctionne

### Test 1: Vérifier que l'endpoint répond

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

1. **Envoyez un message** (texte ou photo) au numéro WhatsApp Business configuré
2. **Attendez quelques secondes**
3. **Allez sur votre application** : `https://votre-app.vercel.app/whatsapp`
4. **Vérifiez** que le message apparaît dans la liste

### Test 3: Vérifier les logs Vercel

1. Dans Vercel Dashboard → **Deployments**
2. Cliquez sur votre déploiement
3. **Functions** → **View Function Logs**
4. Cherchez les logs avec `[WhatsApp]` ou `[API]`
5. Vérifiez qu'il n'y a pas d'erreurs

## ❌ Problèmes courants

### Le webhook ne se vérifie pas

**Causes possibles :**
- L'URL n'est pas accessible (vérifiez que votre app Vercel est déployée)
- Le verify token ne correspond pas (vérifiez sur Vercel et Meta)
- L'endpoint `/api/whatsapp` ne répond pas (testez dans le navigateur)

**Solution :**
1. Vérifiez que `https://votre-app.vercel.app/api/whatsapp` répond
2. Vérifiez que `WHATSAPP_VERIFY_TOKEN` sur Vercel = verify token sur Meta
3. Redéployez votre application Vercel

### Les messages n'arrivent pas

**Causes possibles :**
- Les événements ne sont pas abonnés (vérifiez dans Meta Dashboard)
- Le webhook n'est pas activé (vérifiez dans Meta Dashboard)
- Les variables d'environnement ne sont pas correctes

**Solution :**
1. Vérifiez dans Meta Dashboard → Webhooks → Manage que **messages** est coché
2. Vérifiez que le webhook est **activé** (pas désactivé)
3. Vérifiez les logs Vercel pour voir les erreurs

### Erreur "WHATSAPP_ACCESS_TOKEN non configuré"

**Solution :**
1. Allez dans Vercel → Settings → Environment Variables
2. Vérifiez que `WHATSAPP_ACCESS_TOKEN` existe
3. Si elle n'existe pas, ajoutez-la
4. **Redéployez** votre application

## ✅ Checklist finale

- [ ] Variables d'environnement configurées sur Vercel (3 variables)
- [ ] Application Vercel déployée et accessible
- [ ] Webhook configuré dans Meta Dashboard
- [ ] Verify token identique sur Vercel et Meta
- [ ] Événements "messages" abonnés dans Meta
- [ ] Endpoint `/api/whatsapp` répond correctement
- [ ] Test d'envoi de message réussi

## 🎉 C'est prêt !

Une fois toutes ces étapes complétées, votre application WhatsApp est opérationnelle !

**Pour tester :**
1. Envoyez un message (texte ou photo) au numéro WhatsApp Business
2. Le message devrait apparaître automatiquement sur `https://votre-app.vercel.app/whatsapp`

