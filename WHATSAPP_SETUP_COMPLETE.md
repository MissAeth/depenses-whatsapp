# 📱 Configuration WhatsApp Business - Guide Complet 2024

## 🎯 Objectif
Permettre aux utilisateurs d'envoyer leurs tickets/factures directement via WhatsApp et avoir l'extraction automatique des données dans votre app.

## 🚀 Plan d'Action
```
📱 WhatsApp Business API → 🌐 Webhook Vercel → 🤖 IA Gemini → 📊 Dashboard
```

---

## 📋 ÉTAPE 1 : Créer un Compte Meta for Developers (GRATUIT)

### 1.1 Création du compte
1. **Allez sur** : https://developers.facebook.com/
2. **Cliquez** sur "Get Started"
3. **Options** :
   - Utiliser votre compte Facebook personnel (recommandé)
   - Ou créer un nouveau compte
4. **Acceptez** les conditions développeur Meta

### 1.2 Vérification du compte
1. **Vérification email** : Confirmez votre email
2. **Vérification téléphone** : SMS de confirmation
3. **Type de compte** : Sélectionnez "Business"

### 1.3 Première connexion
Une fois connecté, vous verrez le dashboard développeur Meta.

---

## 📋 ÉTAPE 2 : Créer une App WhatsApp Business

### 2.1 Nouvelle Application
1. **Cliquez** sur "Create App"
2. **Type** : Sélectionnez "Business"
3. **Nom de l'app** : "SGDF Notes de Frais"
4. **Email** : Votre email
5. **Cliquez** "Create App"

### 2.2 Ajouter WhatsApp
1. Dans le dashboard de votre app
2. **Trouvez** "WhatsApp" dans les produits
3. **Cliquez** "Set up"

### 2.3 Configuration initiale
Vous obtiendrez :
- ✅ **Phone Number ID** (pour envoyer/recevoir)
- ✅ **Access Token** (temporaire pour tests)
- ✅ **Webhook** (à configurer)

---

## 📋 ÉTAPE 3 : Configuration des Variables Vercel

Avant de configurer le webhook, ajoutons les variables nécessaires :

```bash
cd sgdf-notes-de-frais

# Token de vérification (vous le choisissez)
echo "mon_token_secret_123" | vercel env add WHATSAPP_VERIFY_TOKEN production

# Access Token (vous le recevrez de Meta)
echo "VOTRE_ACCESS_TOKEN_ICI" | vercel env add WHATSAPP_ACCESS_TOKEN production

# Phone Number ID (vous le recevrez de Meta)
echo "VOTRE_PHONE_NUMBER_ID" | vercel env add WHATSAPP_PHONE_NUMBER_ID production

# URL de base (déjà configuré normalement)
vercel env ls | grep NEXT_PUBLIC_BASE_URL
```

---

## 📋 ÉTAPE 4 : Mettre à Jour le Webhook

### 4.1 Mise à jour du code webhook
Le webhook doit gérer la vérification Meta et recevoir les vraies images WhatsApp.

### 4.2 URL du webhook final
```
https://sgdf-notes-de-frais-lovat.vercel.app/api/whatsapp
```

### 4.3 Configuration dans Meta
1. Dans votre app WhatsApp → Configuration
2. **Webhook URL** : URL ci-dessus
3. **Verify Token** : `mon_token_secret_123` (ou votre token choisi)
4. **Subscribe to** : `messages` (pour recevoir les messages)

---

## 📋 ÉTAPE 5 : Test du Système Complet

### 5.1 Test de vérification
Meta va envoyer une requête de vérification à votre webhook.

### 5.2 Ajouter votre numéro de test
1. Dans Meta Dashboard → WhatsApp → API Setup
2. **To field** : Ajoutez votre numéro de téléphone
3. **Format** : +33612345678 (remplacez par votre vrai numéro)

### 5.3 Premier test
1. **Envoyez** un message au numéro de test Meta
2. **Contenu** : "Restaurant Le Bistrot 23.50€" + photo du ticket
3. **Vérification** : Logs Vercel pour voir si le webhook reçoit

---

## 🔧 Code Amélioré du Webhook

Je vais mettre à jour le webhook pour gérer :
- ✅ Vérification Meta
- ✅ Téléchargement des vraies images WhatsApp
- ✅ Gestion des erreurs
- ✅ Logging complet

---

## 📊 Dashboard des Messages WhatsApp

Créons également une page pour voir les messages reçus :
```
https://sgdf-notes-de-frais-lovat.vercel.app/whatsapp
```

---

## 🧪 Tests Progressifs

### Test 1 : Vérification
- ✅ Webhook répond aux vérifications Meta

### Test 2 : Message texte
- 📱 "Taxi 25€"
- ✅ Détection automatique + traitement IA

### Test 3 : Message + Image
- 📱 Photo de ticket + "Restaurant"
- ✅ Téléchargement image + analyse Gemini + extraction

### Test 4 : Workflow complet
- 📱 WhatsApp → ⚡ Webhook → 🤖 IA → 📧 Email → 📊 Dashboard

---

## ⏱️ Timeline de Mise en Place

### Maintenant (15 min)
1. Créer compte Meta Developer
2. Créer app WhatsApp Business
3. Noter les tokens/IDs

### Ensuite (15 min)
4. Configurer variables Vercel
5. Mettre à jour webhook
6. Déployer

### Test (15 min)
7. Configuration webhook Meta
8. Ajouter numéro de test
9. Premier test message

### Total : ~45 minutes pour un système complet fonctionnel

---

## 🎯 Résultat Final

**Workflow utilisateur :**
```
📱 User envoie "Resto 25€" + photo → 
⚡ Webhook reçoit → 
🤖 Gemini analyse → 
📊 Dépense dans l'app → 
📧 Email trésorerie
```

**Prêt à commencer ? On fait ça étape par étape ! 🚀**