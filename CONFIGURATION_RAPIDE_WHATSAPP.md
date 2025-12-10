# ⚡ Configuration Rapide WhatsApp Meta

## 🔑 Clé API reçue

Vous avez reçu votre Access Token Meta. Voici comment le configurer rapidement.

## 📝 Étape 1: Ajouter la clé dans les variables d'environnement

### En local (`.env.local`)

Créez ou modifiez le fichier `.env.local` à la racine du projet :

```env
# Meta WhatsApp API
WHATSAPP_ACCESS_TOKEN=EAAqwi435ZAxABQJU6iJkFzZA8lixZA8ZAqgqoeMCdHxEZCH4GYEvrmmWwzEjfBTcZCX13aFaFDnxPKvDBQ3o4Uj8iOcBPLmB9ZCRBxVrkte3XiRhDuTdoFlaJTGU1VByCV0VRWPATHN5kzXkKcS4mZANYRTNOY7dxAtVFLGHO9wKSWHfZCrOjVqVmrZAxeudMFJyopenZAQ1LJpZAR0CI3C3KFEEWEBzA1A4CROWgdZCPYuJyMVh8s9jmPUasBjZAcbwXOZCjQBp7BzkiyZCgJuNw7TE5Ae83wZDZD

# ⚠️ IMPORTANT : Vous devez aussi ajouter ces deux variables :
WHATSAPP_PHONE_NUMBER_ID=votre_phone_number_id
WHATSAPP_VERIFY_TOKEN=mon_token_secret_123
```

### En production (Vercel/Railway/etc.)

1. Allez dans les **Settings** de votre projet
2. Section **Environment Variables**
3. Ajoutez les trois variables :
   - `WHATSAPP_ACCESS_TOKEN` = votre clé (celle que vous avez reçue)
   - `WHATSAPP_PHONE_NUMBER_ID` = (voir étape 2)
   - `WHATSAPP_VERIFY_TOKEN` = (voir étape 3)

## 📱 Étape 2: Obtenir le Phone Number ID

1. Allez sur [Meta for Developers](https://developers.facebook.com/)
2. Ouvrez votre app WhatsApp Business
3. Allez dans **WhatsApp** → **API Setup** (ou **Getting Started**)
4. Cherchez **"Phone number ID"** (format : `123456789012345`)
5. **Copiez cette valeur** et ajoutez-la comme `WHATSAPP_PHONE_NUMBER_ID`

## 🔐 Étape 3: Créer le Verify Token

Le Verify Token est un secret que vous créez vous-même pour sécuriser votre webhook.

1. **Choisissez un mot de passe secret** (ex: `mon_token_secret_123`)
2. **Ajoutez-le** comme variable `WHATSAPP_VERIFY_TOKEN`
3. **Notez-le bien** : vous en aurez besoin pour configurer le webhook dans Meta

## 🌐 Étape 4: Configurer le Webhook dans Meta

Une fois votre application déployée :

1. Dans Meta Dashboard → **WhatsApp** → **Configuration** → **Webhooks**
2. Cliquez sur **"Edit"** ou **"Configure"**
3. Remplissez :
   - **Callback URL** : `https://votre-app.vercel.app/api/whatsapp`
   - **Verify token** : Le même que `WHATSAPP_VERIFY_TOKEN` (ex: `mon_token_secret_123`)
4. Cliquez sur **"Verify and Save"**

Meta enverra une requête GET pour vérifier votre webhook. Si tout est correct, vous verrez :
```
✅ Webhook Meta vérifié avec succès
```

## 🧪 Étape 5: Tester

### Test local

1. Démarrez l'application :
   ```bash
   npm run dev
   ```

2. Testez avec curl (format Meta) :
   ```bash
   curl -X POST http://localhost:3000/api/whatsapp \
     -H "Content-Type: application/json" \
     -d '{
       "entry": [{
         "id": "test_entry_id",
         "changes": [{
           "value": {
             "messaging_product": "whatsapp",
             "metadata": {
               "display_phone_number": "33612345678",
               "phone_number_id": "123456789012345"
             },
             "messages": [{
               "from": "33612345678",
               "id": "wamid.test123",
               "timestamp": "1640995200",
               "type": "text",
               "text": {
                 "body": "Restaurant Le Bistrot 23.50€"
               }
             }]
           },
           "field": "messages"
         }]
       }]
     }'
   ```

3. Vérifiez le dashboard : `http://localhost:3000/whatsapp`

### Test avec un vrai message WhatsApp

1. **Ajoutez votre numéro de test** dans Meta Dashboard :
   - WhatsApp → Getting Started
   - Ajoutez votre numéro de téléphone

2. **Envoyez un message** depuis WhatsApp :
   - Message texte : `"Restaurant Le Bistrot 23.50€"`
   - Ou photo de ticket avec légende

3. **Vérifiez les logs** de votre application

4. **Vérifiez le dashboard** : La dépense devrait apparaître automatiquement

## ⚠️ Sécurité IMPORTANTE

- ❌ **NE partagez JAMAIS** votre Access Token publiquement
- ❌ **NE commitez JAMAIS** `.env.local` dans Git (déjà dans `.gitignore`)
- ✅ **Régénérez le token** si vous pensez qu'il a été compromis
- ✅ **Utilisez un token permanent** pour la production (pas le token temporaire)

## 🔄 Token temporaire vs permanent

- **Token temporaire** (celui que vous avez) : Expire après 24h, parfait pour les tests
- **Token permanent** : Pour la production, créez un System User dans Meta Dashboard

## 📚 Documentation complète

Pour plus de détails, consultez `WHATSAPP_CONFIG.md`

## 🆘 Dépannage

### Erreur "WHATSAPP_ACCESS_TOKEN non configuré"
→ Vérifiez que la variable est bien dans `.env.local` et redémarrez le serveur

### Erreur "WHATSAPP_PHONE_NUMBER_ID non configuré"
→ Ajoutez le Phone Number ID depuis Meta Dashboard

### Erreur 403 lors de la récupération des médias
→ Le token a peut-être expiré (tokens temporaires expirent après 24h)
→ Générez un nouveau token dans Meta Dashboard

### Le webhook n'est pas vérifié
→ Vérifiez que `WHATSAPP_VERIFY_TOKEN` correspond exactement au token dans Meta Dashboard

