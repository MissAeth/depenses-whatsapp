# 🔍 Debug WhatsApp Réel - Checklist

## ❌ **Problème** : Message WhatsApp réel ne remonte pas

## ✅ **Ce qui fonctionne** :
- Webhook vérifié : ✅
- Token Meta valide : ✅  
- Extraction IA : ✅ (tests curl)
- Base Supabase : ✅

## 🔍 **Points à vérifier** :

### **1. Configuration Meta Business**
Dans votre app Meta → **WhatsApp** → **Configuration** :

**Webhook URL** doit être :
```
https://sgdf-notes-de-frais-lovat.vercel.app/api/whatsapp
```

**Verify Token** peut être n'importe quoi (ex: `test123`)

**Events abonnés** :
- ✅ `messages` (obligatoire)

### **2. Numéro WhatsApp**
- Quel numéro utilisez-vous pour envoyer ?
- Est-ce le même que celui configuré dans Meta Business ?
- Avez-vous vérifié le numéro via SMS dans Meta ?

### **3. Statut de l'app Meta**
- Mode développement OU production ?
- Si développement : seuls les numéros testeurs peuvent envoyer
- Permissions accordées ?

### **4. Message envoyé**
- Format exact du message ?
- Type : texte, image, emoji ?
- Contient-il des mots-clés détectables ?

## 🧪 **Tests de diagnostic** :

1. **Logs temps réel** : Regarder Meta Business → Webhooks pendant envoi
2. **Test numéro** : Essayer depuis un autre numéro
3. **Test contenu** : Message simple "test 10€"

---

**Infos nécessaires pour diagnostic** :
- Message exact envoyé
- Numéro expéditeur  
- Statut app Meta (dev/prod)
- Logs Meta Business si visibles