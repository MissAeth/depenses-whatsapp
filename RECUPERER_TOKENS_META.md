# 🔑 Comment Récupérer les Tokens Meta WhatsApp

## 📍 Cas 1 : Vous N'avez Pas Encore de Compte Meta

### **👉 Créer le Compte et Récupérer les Tokens**

#### **Étape 1 : Aller sur Meta for Developers**
```
🔗 URL : https://developers.facebook.com/
```

#### **Étape 2 : Se connecter**
- **Option A** : Compte Facebook existant (recommandé)
- **Option B** : Créer un nouveau compte

#### **Étape 3 : Créer une App**
1. **Cliquez** "Get Started" ou "My Apps"
2. **"Create App"** → Sélectionnez **"Business"**
3. **Nom de l'app** : `SmartExpense WhatsApp`
4. **Email** : Votre email
5. **"Create App"**

#### **Étape 4 : Ajouter WhatsApp**
1. Dans le dashboard de votre app
2. **"Add Product"** → Cherchez **"WhatsApp"**
3. **"Set Up"** sur WhatsApp

#### **Étape 5 : Récupérer les Tokens** ⭐
Une fois WhatsApp ajouté, vous verrez une page avec :

```
🔑 TOKENS À COPIER :

1. 📞 Phone Number ID : 
   Exemple : 123456789012345
   
2. 🔐 Access Token (temporaire) :
   Exemple : EAAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   
3. 📱 Test Phone Number :
   Exemple : +1 555-0199
```

---

## 📍 Cas 2 : Vous Avez Déjà une App Meta

### **👉 Retrouver les Tokens dans une App Existante**

#### **Étape 1 : Aller dans votre Dashboard**
```
🔗 URL : https://developers.facebook.com/apps/
```

#### **Étape 2 : Sélectionner votre App**
- **Cliquez** sur votre app WhatsApp dans la liste

#### **Étape 3 : Aller dans WhatsApp**
- **Menu latéral** → **"WhatsApp"** → **"API Setup"**

#### **Étape 4 : Localiser les Tokens** ⭐

**🔍 Où les trouver :**

1. **Phone Number ID** :
   ```
   📍 Section : "From phone number ID"
   📋 Format : Nombre à 15 chiffres
   📝 Exemple : 123456789012345
   ```

2. **Access Token** :
   ```
   📍 Section : "Access tokens" 
   🔐 Format : Commence par "EAA"
   📝 Exemple : EAAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ⚠️  Peut être temporaire (24h)
   ```

3. **Test Phone Number** :
   ```
   📍 Section : "To"
   📱 Format : +1 555-XXXX
   📝 Exemple : +1 555-0199
   ```

---

## 📱 Cas 3 : Générer un Token Permanent

### **👉 Token Temporaire vs Permanent**

#### **Token Temporaire** (par défaut) :
- ⏰ **Durée** : 24 heures
- 🎯 **Usage** : Tests de développement
- 🔄 **Renouvellement** : Automatique pendant les tests

#### **Token Permanent** (recommandé pour production) :
- ⏰ **Durée** : Illimitée
- 🎯 **Usage** : Application en production
- 🔐 **Sécurité** : Plus stable

### **Comment Générer un Token Permanent :**

1. **Dans votre app Meta** → **"WhatsApp"** → **"API Setup"**
2. **Section "Access tokens"**
3. **Cliquez** "Generate new token"
4. **Sélectionnez** les permissions :
   - ✅ `whatsapp_business_messaging`
   - ✅ `whatsapp_business_management`
5. **Durée** : Sélectionnez "Never expires"
6. **Copier** le token généré

---

## 🖼️ Guide Visuel - Où Chercher

### **Dashboard Meta - Navigation :**
```
developers.facebook.com
    ↓
My Apps
    ↓
[Votre App WhatsApp]
    ↓
Menu latéral : WhatsApp > API Setup
    ↓
📞 Phone Number ID    [Copier]
🔐 Access Token       [Generate/Copy] 
📱 Test Number        [Noter]
```

### **Screenshot des Sections :**
```
┌─────────────────────────────────────────┐
│ 📞 From phone number ID                 │
│ ┌─────────────────────────────────────┐ │
│ │ 123456789012345           [Copy]    │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ 🔐 Access tokens                        │
│ ┌─────────────────────────────────────┐ │
│ │ EAAxxxxxxxxxxxxxxxxxxxx   [Copy]    │ │
│ │ [Generate new token]                │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ 📱 To                                   │
│ ┌─────────────────────────────────────┐ │
│ │ +1 555-0199                         │ │
│ │ [Manage phone number list]          │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

## 🔍 Cas 4 : Dépannage - Tokens Introuvables

### **Si vous ne voyez pas les tokens :**

#### **Problème 1 : WhatsApp pas ajouté**
- **Solution** : Ajouter le produit WhatsApp à votre app
- **Étapes** : App Dashboard → Add Product → WhatsApp → Set Up

#### **Problème 2 : Permissions insuffisantes**
- **Solution** : Vérifier les rôles dans l'app
- **Vérification** : App Dashboard → App Roles → Votre rôle

#### **Problème 3 : App en mode développement**
- **Normal** : Les tokens de test sont disponibles immédiatement
- **Production** : Nécessite validation Meta (48-72h)

#### **Problème 4 : Token expiré**
- **Solution** : Générer un nouveau token
- **Étapes** : API Setup → Access tokens → Generate new token

---

## ✅ **Checklist de Récupération**

```
☐ 1. Compte Meta Business créé/accessible
☐ 2. App WhatsApp créée  
☐ 3. Produit WhatsApp ajouté à l'app
☐ 4. Phone Number ID copié (15 chiffres)
☐ 5. Access Token copié (commence par EAA)
☐ 6. Test Phone Number noté (+1 555-XXXX)
☐ 7. Tokens partagés pour configuration Vercel
```

---

## 🚀 **Une Fois les Tokens Récupérés**

**Partagez-moi :**
```
📞 Phone Number ID : 123456789012345
🔐 Access Token : EAAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
📱 Test Number : +1 555-0199
```

**Je configure immédiatement :**
1. ⚡ Variables Vercel (30 secondes)
2. 🚀 Redéploiement automatique
3. 🧪 Test webhook complet
4. 📱 Premier message WhatsApp test

**📖 Besoin d'aide ? Suivez le guide étape par étape ou dites-moi où vous en êtes ! 🤝**