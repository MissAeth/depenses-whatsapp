# 🔍 Diagnostic WhatsApp - Messages ne remontent pas

## ✅ **Ce qui fonctionne** :
- Webhook URL : ✅ https://sgdf-notes-de-frais-lovat.vercel.app/api/whatsapp
- Token nouveau : ✅ Configuré sur Vercel
- Extraction IA : ✅ 123€ parfaitement extrait via curl
- Base Supabase : ✅ Données persistées

## ❌ **Problème** :
Messages WhatsApp réels ne déclenchent pas le webhook

## 🔍 **Points critiques à vérifier** :

### **1. Configuration webhook dans Meta Business**
Dans votre app Meta → **WhatsApp** → **Configuration** → **Webhooks** :

**URL webhook** doit être exactement :
```
https://sgdf-notes-de-frais-lovat.vercel.app/api/whatsapp
```

**Verify token** : `test123` (ou n'importe quoi)

**Champs abonnés** - VÉRIFIEZ que `messages` est coché ✅

### **2. Statut de votre app Meta**
- **Mode développement** : Seuls les numéros de test peuvent envoyer
- **Mode production** : Tous les numéros peuvent envoyer

### **3. Numéro WhatsApp utilisé**
- Quel numéro utilisez-vous pour envoyer ?
- Est-il ajouté comme "testeur" dans Meta Business ?
- Avez-vous vérifié ce numéro dans Meta ?

### **4. Format du message**
- Message exact envoyé ?
- Simple texte ou avec émojis ?

## 🧪 **Tests de diagnostic** :

1. **Logs Meta en temps réel** : Meta Business → Webhooks → Voir activité
2. **Test avec numéro de test officiel** (+1 555 612 5061)
3. **Vérification permissions app**

---
**URGENT : Vérifiez ces 4 points et dites-moi ce que vous voyez !**