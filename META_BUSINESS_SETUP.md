# 📱 Configuration Meta Business - SmartExpense WhatsApp

## 🎯 Objectif
Connecter SmartExpense à WhatsApp Business pour que les utilisateurs puissent envoyer leurs tickets directement via WhatsApp.

## ✅ État Actuel
- ✅ **Infrastructure prête** : Webhook configuré
- ✅ **Token de vérification** : `WHATSAPP_VERIFY_TOKEN` configuré
- ✅ **IA Gemini active** : Traitement automatique opérationnel
- ✅ **Dashboard** : Interface `/whatsapp` fonctionnelle

---

## 🚀 ÉTAPE 1 : Création Compte Meta Business

### 1️⃣ Aller sur Meta for Developers
**URL** : https://developers.facebook.com/

### 2️⃣ Se connecter
- **Option 1** : Utiliser votre compte Facebook existant (recommandé)
- **Option 2** : Créer un nouveau compte

### 3️⃣ Accepter les conditions
- ✅ Conditions développeur Meta
- ✅ Type de compte : **Business**

### 4️⃣ Vérifications
- ✅ **Email** : Confirmer par email
- ✅ **Téléphone** : SMS de vérification

---

## 🚀 ÉTAPE 2 : Créer l'App WhatsApp

### 1️⃣ Créer une nouvelle app
1. **Cliquez** "Create App"
2. **Type d'app** : Sélectionnez **"Business"**
3. **Nom de l'app** : `SmartExpense WhatsApp`
4. **Email de contact** : Votre email
5. **Cliquez** "Create App"

### 2️⃣ Ajouter WhatsApp Business
1. Dans le dashboard de votre app
2. **Cherchez** "WhatsApp" dans la liste des produits
3. **Cliquez** "Set up" sur WhatsApp

### 3️⃣ Configuration initiale WhatsApp
Une fois WhatsApp ajouté, vous verrez :
- 📞 **Phone Number ID** (ex: `123456789012`)
- 🔑 **Access Token** temporaire (ex: `EAA...`)
- 📱 **Test Phone Number** (ex: `+1 555-0199`)

---

## 🚀 ÉTAPE 3 : Configurer le Webhook

### 1️⃣ Aller dans Configuration
1. Dans votre app WhatsApp
2. **Menu latéral** → "Configuration"
3. **Section** "Webhook"

### 2️⃣ Configurer l'URL du webhook
```
Webhook URL: https://sgdf-notes-de-frais-lovat.vercel.app/api/whatsapp
Verify Token: sgdf_webhook_token_123
```

### 3️⃣ Souscrire aux événements
☑️ **messages** (pour recevoir les messages)
☑️ **message_deliveries** (optionnel)

### 4️⃣ Vérifier et sauvegarder
- **Cliquez** "Verify and Save"
- ✅ Meta va tester votre webhook automatiquement

---

## 🚀 ÉTAPE 4 : Récupérer les Tokens

### Dans le dashboard Meta, notez :

1. **Phone Number ID** :
   ```
   Exemple : 123456789012345
   ```

2. **Access Token** :
   ```
   Exemple : EAA123...xyz
   ```

3. **App ID** (optionnel) :
   ```
   Exemple : 1234567890123456
   ```

---

## 🚀 ÉTAPE 5 : Configurer les Variables Vercel

Une fois que vous avez les tokens, configurons Vercel :

```bash
cd sgdf-notes-de-frais

# Access Token de Meta
echo "VOTRE_ACCESS_TOKEN" | vercel env add WHATSAPP_ACCESS_TOKEN production

# Phone Number ID de Meta  
echo "VOTRE_PHONE_NUMBER_ID" | vercel env add WHATSAPP_PHONE_NUMBER_ID production

# Redéployer pour prendre en compte les variables
vercel --prod
```

---

## 🚀 ÉTAPE 6 : Ajouter votre Numéro de Test

### 1️⃣ Dans Meta Dashboard
1. **API Setup** → **To field**
2. **Cliquez** "Manage phone number list"

### 2️⃣ Ajouter votre numéro
1. **Cliquez** "Add phone number"
2. **Format** : `+33612345678` (votre vrai numéro)
3. **Confirmer** par SMS

### 3️⃣ Vérifier
✅ Votre numéro apparaît dans la liste des destinataires autorisés

---

## 🧪 ÉTAPE 7 : Tests Progressifs

### Test 1 : Vérification Webhook ✅
**Automatique** lors de la configuration

### Test 2 : Message texte simple
1. **Envoyez** au numéro de test Meta : `+1 555-0199`
2. **Message** : `Restaurant Le Bistrot 23.50€`
3. **Vérifiez** : https://sgdf-notes-de-frais-lovat.vercel.app/whatsapp

### Test 3 : Message avec image
1. **Envoyez** au numéro de test Meta
2. **Photo** : Ticket de restaurant
3. **Message** : `Déjeuner d'affaires`
4. **Vérifiez** : Extraction automatique par Gemini

### Test 4 : Workflow complet
```
📱 WhatsApp → 🌐 Meta API → ⚡ Webhook SmartExpense → 
🤖 Gemini IA → 📊 Dashboard → 📧 Email Trésorerie
```

---

## 🔍 URLs de Debug

### **Vérifier les logs** :
```bash
vercel logs --prod
```

### **Tester l'API** :
```bash
curl https://sgdf-notes-de-frais-lovat.vercel.app/api/test-ai
```

### **Dashboard WhatsApp** :
https://sgdf-notes-de-frais-lovat.vercel.app/whatsapp

---

## ⚠️ Points d'Attention

### **Sandbox vs Production**
- **Sandbox** : Gratuit, 1000 messages/mois, 5 numéros max
- **Production** : Payant après validation Meta

### **Validation d'App**
- **Développement** : Immédiatement fonctionnel
- **Production** : Nécessite validation Meta (48-72h)

### **Limites Sandbox**
- ✅ 5 numéros de test maximum
- ✅ 1000 messages par mois
- ✅ Toutes les fonctionnalités disponibles

---

## 🎯 Checklist de Configuration

```
☐ 1. Compte Meta Business créé
☐ 2. App WhatsApp Business créée  
☐ 3. Webhook configuré et vérifié
☐ 4. Tokens récupérés (Phone ID + Access Token)
☐ 5. Variables Vercel configurées
☐ 6. App redéployée
☐ 7. Numéro de test ajouté
☐ 8. Premier test message envoyé
☐ 9. Dashboard vérifié
☐ 10. Workflow complet testé
```

---

## 🚀 Prêt à Commencer ?

**Étapes à suivre maintenant :**

1. **Ouvrez** : https://developers.facebook.com/
2. **Créez** votre compte/app
3. **Partagez** avec moi vos tokens (Phone ID + Access Token)
4. **Je configure** immédiatement les variables Vercel
5. **On teste** ensemble le workflow complet

**Temps estimé : 20-30 minutes pour tout configurer ! 📱✨**