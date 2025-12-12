# 🔍 Trouver les Permissions Meta WhatsApp

## 📍 **Emplacements possibles des permissions**

### **1. Dans votre App Meta (le plus probable)**
1. **https://developers.facebook.com/apps/**
2. **Sélectionnez votre app** "SmartExpense WhatsApp"
3. **Sidebar gauche** → **"WhatsApp"** → **"Configuration"**
4. **Scroll vers le bas** → Section **"Permissions"** ou **"App Review"**

### **2. Dans WhatsApp Business Manager**
1. **https://business.facebook.com/wa/manage/**
2. **Comptes WhatsApp Business** → Votre compte
3. **Paramètres** → **Permissions d'app**

### **3. Dans App Review (si app en mode développement)**
1. **Votre app** → **App Review** → **Permissions et fonctionnalités**
2. **Rechercher** : `whatsapp_business_messaging`

## 🔍 **Que chercher exactement**

**Permissions requises** :
- ✅ `whatsapp_business_messaging` (envoyer/recevoir messages)
- ✅ `whatsapp_business_management` (gérer compte)

**Statut requis** :
- ✅ **"Approved"** ou **"Active"**  
- ❌ Si **"Pending"** → En attente d'approbation

## ⚡ **Alternative rapide - Tester le token directement**

Testons d'abord si votre token fonctionne pour les médias :

```bash
# Test 1: Vérifier que le token est valide
curl -X GET "https://graph.facebook.com/v18.0/me" \
  -H "Authorization: Bearer EAFif7arHaYMBQLQ1fLpJrf5Ev9dps8E4cZB1Dazn0EDbtDxigQfwEMhnMEY3U5lxvXmxulf4jqlUEx2v0pAkZADx6ik9Sk2loOwNdMlhHUtsJ6FRMfU5EDxFyTWEouc1Rlc44ljMx3JJOLlMqBQg2GIuqC2rMup8eld2KEz6YqnEk5i8aGwbgFBZBhPq1yCNWO1ZAyoA8HmD7pbnD56K8DIY31tLRNl6537ik2csrDFmNfSEzvNDUs9GLZBdmgkRMSrIWpkOPlNTSttpv0zRsGqoArwZDZD"
```

Si ce test échoue → Le token a expiré/est invalide

## 🎯 **Actions en parallèle**

**Pendant que vous cherchez** :
1. **Testez avec des captions** (fonctionne déjà ✅)
2. **Je peux ajouter upload web direct** pour les images
3. **Ou créer un token permanent** Meta

**Que préférez-vous que je fasse maintenant ?**