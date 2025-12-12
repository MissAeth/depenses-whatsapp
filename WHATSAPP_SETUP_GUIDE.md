# 📱 Guide Complet - Configuration WhatsApp pour SmartExpense

## ✅ DIAGNOSTIC : Webhook Local Fonctionne !

Le test local a réussi :
```
✅ Webhook: http://localhost:3000/api/whatsapp
✅ IA Extraction: 90% confiance
✅ Données extraites: Restaurant Le Bistrot 23.50€
```

## 🚨 PROBLÈME IDENTIFIÉ

1. **Variables WhatsApp manquantes sur Vercel**
2. **Meta Business API non connecté**
3. **Webhook URL non configuré dans Meta**

## 🔧 SOLUTION - 3 Étapes

### **Étape 1: Configurer Vercel Variables**

Allez sur : https://vercel.com/dashboard → Votre projet → Settings → Environment Variables

Ajoutez ces variables :

```env
WHATSAPP_VERIFY_TOKEN=sgdf_webhook_verify_2024
WHATSAPP_ACCESS_TOKEN=VOTRE_TOKEN_META_ICI
WHATSAPP_PHONE_NUMBER_ID=VOTRE_PHONE_ID_ICI
GOOGLE_AI_API_KEY=AIzaSyA7LQMgjDMFk52rOHenGpOKHNFbuVVI5Bg
```

### **Étape 2: Configuration Meta Business**

1. **Créer App WhatsApp** : https://developers.facebook.com/
2. **WhatsApp Business Platform** → Nouvelle App
3. **Récupérer les tokens** :
   - Phone Number ID
   - Access Token (temporaire)
4. **Configurer Webhook** :
   ```
   URL: https://sgdf-notes-de-frais-lovat.vercel.app/api/whatsapp
   Verify Token: sgdf_webhook_verify_2024
   ```

### **Étape 3: Test Production**

1. **Redéployer** après config variables
2. **Vérifier webhook** Meta
3. **Envoyer message test** au numéro sandbox

## 🎯 URLs Importantes

- **App déployée**: https://sgdf-notes-de-frais-lovat.vercel.app
- **Webhook endpoint**: /api/whatsapp  
- **Dashboard**: /whatsapp
- **Meta Business**: https://developers.facebook.com/

## ⚡ Test Rapide

**Message WhatsApp test** :
```
"Restaurant test 25€"
```

**Vérification** :
1. Dashboard → https://sgdf-notes-de-frais-lovat.vercel.app/whatsapp
2. Logs Vercel → Voir si webhook reçu
3. Console Meta → Vérifier envoi

---

**⏰ Temps estimé : 15 minutes pour corriger !**