# 🧪 Test Extraction Image - Debug WhatsApp

## 🔍 **Problème identifié**
Les images WhatsApp ne s'extraient pas correctement. Probable problème :
- Token WhatsApp invalide/expiré
- Permissions manquantes sur l'image
- Erreur API Meta

## ⚡ **Solutions de debug**

### **1. Test direct IA avec image web**
```bash
curl -X POST https://sgdf-notes-de-frais-lovat.vercel.app/api/process-image \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://example.com/ticket.jpg"
  }'
```

### **2. Vérification token WhatsApp**
```bash
# Test si le token fonctionne
curl -X GET "https://graph.facebook.com/v18.0/me" \
  -H "Authorization: Bearer VOTRE_TOKEN"
```

### **3. Test avec caption seulement**
Envoyez une image avec caption : **"Restaurant 45€"**
→ Devrait au moins extraire le caption même si l'image échoue

## 🔧 **Correctifs appliqués**

✅ **Fallback caption** : Si l'image échoue, traite le texte du caption
✅ **Logs détaillés** : Pour identifier l'erreur exacte  
✅ **Continuation traitement** : N'arrête plus le processus

## 🧪 **Test maintenant**

**Envoyez une image avec caption** depuis WhatsApp :
```
Image: [photo ticket]
Caption: "Restaurant test 25€"
```

**Résultat attendu** :
- Image échoue (logs d'erreur)
- Caption extrait → 25€ détecté
- Dépense créée avec les infos du caption

## 📋 **Prochaines étapes**

1. **Regarder les logs Vercel** pour voir l'erreur exacte
2. **Vérifier token WhatsApp** dans Meta Business
3. **Tester permissions** sur les médias
4. **Alternative** : Utiliser upload web direct