# ⚡ Configuration Meta WhatsApp - Version Rapide

## 🎯 URL à utiliser dans Meta Business

**Webhook URL** (copiez-collez dans Meta) :
```
https://sgdf-notes-de-frais-lovat.vercel.app/api/whatsapp
```

**Verify Token** (copiez-collez dans Meta) :
```
sgdf_webhook_verify_2024
```

## 📱 Étapes Meta Business (5 minutes)

1. **developers.facebook.com** → Connexion
2. **Créer App** → "Entreprise" → "SmartExpense"
3. **Ajouter WhatsApp** → Configuration
4. **Webhook** → Coller URL et Token ci-dessus
5. **Numéro** → Ajouter votre numéro + vérification SMS

## 🔑 Récupération Tokens

Une fois configuré, récupérez :
```
Phone Number ID: 1234567890123 (dans l'interface Meta)
Access Token: EAAxxxxxxx (bouton "Générer" dans Meta)
```

## ⚙️ Configuration Vercel

**Ajoutez dans Vercel Dashboard** :
```
WHATSAPP_PHONE_NUMBER_ID = votre_phone_id_meta
WHATSAPP_ACCESS_TOKEN = votre_token_meta  
```

## ✅ Test Final

**Envoyez depuis votre WhatsApp** :
```
"Test restaurant 30€"
```

**Vérifiez** :
```
https://sgdf-notes-de-frais-lovat.vercel.app/whatsapp
```

---
**Total : 5-10 minutes maximum ! 🚀**