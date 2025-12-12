# 📱 Guide Complet - Configuration Meta WhatsApp Business

## 🎯 **Objectif**
Connecter SmartExpense à un vrai numéro WhatsApp Business pour recevoir les messages de dépenses automatiquement.

## 📋 **Ce dont vous avez besoin**
- ✅ Un numéro de téléphone (pas encore utilisé sur WhatsApp)
- ✅ Un compte Facebook/Meta
- ✅ 15-20 minutes de configuration

## 🚀 **Étapes de Configuration**

### **Étape 1: Créer l'App Meta (5 min)**

1. **Allez sur** : https://developers.facebook.com/
2. **Créez un compte développeur** (gratuit)
3. **"Mes Apps" → "Créer une app"**
4. **Type** : "Entreprise"
5. **Nom** : "SmartExpense WhatsApp"
6. **Email** : votre email

### **Étape 2: Ajouter WhatsApp (3 min)**

1. Dans votre app → **"Ajouter un produit"**
2. **Sélectionnez "WhatsApp"** → "Configuration"
3. **Phone Number** : Ajoutez votre numéro
4. **Vérification** : Code SMS reçu

### **Étape 3: Récupérer les Tokens (2 min)**

Dans la section WhatsApp :

```
📱 Phone Number ID : 1234567890123456
🔑 Access Token : EAAxxxxxxxxxxxxxxx (temporaire 24h)
🔐 Permanent Token : À générer pour production
```

### **Étape 4: Configuration Webhook (5 min)**

1. **URL Webhook** : 
   ```
   https://sgdf-notes-de-frais-lovat.vercel.app/api/whatsapp
   ```

2. **Verify Token** :
   ```
   sgdf_webhook_verify_2024
   ```

3. **Événements à souscrire** :
   - ✅ messages
   - ✅ message_deliveries

### **Étape 5: Test de Configuration (5 min)**

1. **Message test** depuis votre WhatsApp :
   ```
   "Restaurant test 25€"
   ```

2. **Vérification Dashboard** :
   ```
   https://sgdf-notes-de-frais-lovat.vercel.app/whatsapp
   ```

## ⚙️ **Configuration Vercel**

**Variables à ajouter dans Vercel** :
```env
WHATSAPP_PHONE_NUMBER_ID=votre_phone_id_meta
WHATSAPP_ACCESS_TOKEN=votre_access_token_meta
WHATSAPP_VERIFY_TOKEN=sgdf_webhook_verify_2024
```

## 🔄 **Workflow Final**

```
Votre WhatsApp → "Taxi 30€" + 📸
     ↓
Meta API → Webhook SmartExpense
     ↓
🤖 Gemini IA → Extraction données
     ↓
📊 Dashboard → Affichage temps réel
     ↓
📧 Email trésorerie
```

## 🛠️ **Commandes de Test**

**Test webhook local** :
```bash
curl -X POST http://localhost:3000/api/whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "entry": [{
      "changes": [{
        "value": {
          "messages": [{
            "from": "votre_numero",
            "text": {"body": "Restaurant 25€"},
            "timestamp": "1640995200"
          }]
        }
      }]
    }]
  }'
```

**Test webhook production** :
```bash
curl -X GET "https://sgdf-notes-de-frais-lovat.vercel.app/api/whatsapp?hub.mode=subscribe&hub.verify_token=sgdf_webhook_verify_2024&hub.challenge=test123"
```

## ✅ **Checklist de Validation**

- [ ] App Meta créée
- [ ] Numéro WhatsApp ajouté et vérifié  
- [ ] Tokens récupérés (Phone ID + Access Token)
- [ ] Variables Vercel configurées
- [ ] Webhook URL validé par Meta
- [ ] Test message envoyé
- [ ] Dashboard mis à jour

## 🆘 **Support**

**Problèmes courants** :
- **"Webhook failed"** → Vérifier l'URL et le verify token
- **"Invalid token"** → Régénérer l'access token
- **"Phone not verified"** → Refaire la vérification SMS

**URLs importantes** :
- Meta Developers : https://developers.facebook.com/
- Documentation WhatsApp : https://developers.facebook.com/docs/whatsapp/
- Votre app : https://sgdf-notes-de-frais-lovat.vercel.app

---

**⏰ Temps total estimé : 15-20 minutes**
**💰 Coût : 100% GRATUIT pour les tests**