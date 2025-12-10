# 🔧 Créer les Variables d'Environnement sur Vercel

## 📋 Étape par Étape

### Étape 1: Accéder à votre projet Vercel

1. Allez sur **https://vercel.com/dashboard**
2. Connectez-vous si nécessaire
3. **Cliquez sur votre projet** (celui qui contient votre application Billz)

### Étape 2: Ouvrir les Settings

1. En haut de la page, cliquez sur l'onglet **"Settings"**
2. Dans le menu de gauche, cliquez sur **"Environment Variables"**

### Étape 3: Ajouter la première variable (WHATSAPP_ACCESS_TOKEN)

1. Cliquez sur le bouton **"Add New"** (ou **"Add"**)
2. Remplissez le formulaire :
   - **Key** (nom de la variable) : `WHATSAPP_ACCESS_TOKEN`
   - **Value** (valeur) : `EAAqwi435ZAxABQCWZAdAyrBJMpxVYfAZBXvMSXxvWdEN5VFpZAyXafLjhgrI87PllELJSruO53TqSSdksp7hAGtJ8fviOCNQGQ5UX3tpDM3tYZAi29sZBNDes4c8wUOexMZBkBjAPAp2wSYkNxzNZA4ZB7LJ5c7F3CZAdUZB1WxH5WZAjk1X2trZCktTZCXgoZBczZATxsnXBpFTrtunr1RJDCkRWI3eDA4EXUymIsepSwv4D2WMuka5oXg3nA3X3CdgjblFSZBZCcamUSdrzyVwJq1SKSLGGN1wZDZD`
   - **Environments** : Cochez les 3 cases :
     - ✅ **Production**
     - ✅ **Preview**
     - ✅ **Development**
3. Cliquez sur **"Save"**

### Étape 4: Ajouter la deuxième variable (WHATSAPP_PHONE_NUMBER_ID)

1. Cliquez à nouveau sur **"Add New"**
2. Remplissez :
   - **Key** : `WHATSAPP_PHONE_NUMBER_ID`
   - **Value** : `927016477160571`
   - **Environments** : Cochez les 3 cases (Production, Preview, Development)
3. Cliquez sur **"Save"**

### Étape 5: Ajouter la troisième variable (WHATSAPP_VERIFY_TOKEN)

1. Cliquez à nouveau sur **"Add New"**
2. Remplissez :
   - **Key** : `WHATSAPP_VERIFY_TOKEN`
   - **Value** : `sgdf_whatsapp_2024_secret`
   - **Environments** : Cochez les 3 cases (Production, Preview, Development)
3. Cliquez sur **"Save"**

### Étape 6: Vérifier que les 3 variables sont bien créées

Vous devriez maintenant voir dans la liste :

| Key | Environments |
|-----|--------------|
| `WHATSAPP_ACCESS_TOKEN` | Production, Preview, Development |
| `WHATSAPP_PHONE_NUMBER_ID` | Production, Preview, Development |
| `WHATSAPP_VERIFY_TOKEN` | Production, Preview, Development |

### Étape 7: Redéployer l'application (IMPORTANT)

⚠️ **Les variables d'environnement ne sont prises en compte qu'après un redéploiement !**

1. Allez dans l'onglet **"Deployments"** (en haut)
2. Trouvez le dernier déploiement (celui avec ✅)
3. Cliquez sur les **3 points** (⋯) à droite
4. Cliquez sur **"Redeploy"**
5. Confirmez en cliquant sur **"Redeploy"** dans la popup
6. Attendez 1-2 minutes que le déploiement se termine

## ✅ Vérification

Une fois le redéploiement terminé :

1. Cliquez sur le déploiement (celui qui vient de se terminer)
2. Cliquez sur **"Visit"** pour ouvrir votre application
3. Testez l'endpoint : `https://votre-app.vercel.app/api/whatsapp`
   - Si ça répond, c'est bon ! ✅
   - Si ça donne une erreur, vérifiez les logs dans Vercel

## 🎯 Résumé Rapide

1. **Vercel Dashboard** → Votre projet → **Settings** → **Environment Variables**
2. **Add New** → Ajouter les 3 variables une par une
3. **Redéployer** l'application (Deployments → 3 points → Redeploy)

## ❓ Problèmes courants

### "Je ne vois pas le bouton Add New"
- Assurez-vous d'être dans **Settings** → **Environment Variables**
- Vérifiez que vous avez les droits d'administration sur le projet

### "Les variables n'apparaissent pas après le redéploiement"
- Vérifiez que vous avez bien coché les 3 environnements (Production, Preview, Development)
- Attendez que le redéploiement soit complètement terminé (status: Ready)
- Videz le cache de votre navigateur

### "Comment modifier une variable existante ?"
- Cliquez sur la variable dans la liste
- Modifiez la valeur
- Cliquez sur **"Save"**
- **Redéployez** l'application

