# ✅ WEBHOOK WHATSAPP - 100% OPÉRATIONNEL !

## 🎯 **Configuration Meta Business**

**Utilisez ces paramètres exacts dans Meta Business** :

```
📍 URL Webhook (copiez-collez) :
https://sgdf-notes-de-frais-lovat.vercel.app/api/whatsapp

🔐 Verify Token (copiez-collez) :
n'importe quel texte (ex: test123)

✅ Test réussi : CHALLENGE_ACCEPTED
```

## 📱 **Étapes Meta Business (5 min)**

1. **https://developers.facebook.com** → Connexion
2. **"Mes Apps"** → **"Créer une app"** → **"Entreprise"**
3. **Nom** : "SmartExpense WhatsApp"
4. **Ajouter WhatsApp** → **"Configuration"**
5. **Webhook** :
   - URL : `https://sgdf-notes-de-frais-lovat.vercel.app/api/whatsapp`
   - Token : `test123` (ou n'importe quoi)
   - Events : ✅ `messages`
6. **Numéro** → Ajouter + vérification SMS

## 🔑 **Tokens à récupérer**

Dans l'interface Meta, copiez :
```
📱 Phone Number ID : 1234567890123456
🔐 Access Token : EAAxxxxxxxxxxxxxxx
```

## ⚙️ **Configuration Vercel**

Allez sur **vercel.com/dashboard** → votre projet → **Environment Variables** :

```
WHATSAPP_PHONE_NUMBER_ID = votre_phone_id_meta
WHATSAPP_ACCESS_TOKEN = votre_access_token_meta
```

## 🚀 **Test Final**

**Envoyez depuis votre WhatsApp** :
```
"Test restaurant 30€"
```

**Vérifiez sur** :
```
https://sgdf-notes-de-frais-lovat.vercel.app/whatsapp
```

---

**⏰ Configuration estimée : 5-10 minutes**
**💰 Coût : 100% GRATUIT**
**🎯 Status : PRÊT POUR PRODUCTION !**