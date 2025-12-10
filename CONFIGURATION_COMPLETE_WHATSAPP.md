# 🚀 Configuration Complète WhatsApp - Guide Final

## ✅ Informations de Configuration

- **Token d'accès WhatsApp** : `EAAqwi435ZAxABQLd1BXw6StaNs8vTvFx8ZB0xZCDPBaiGbeZCZAATkKZAThNpQYdGb2bT2GafzuqCXZBjnNgtAaNkYAJ7UjtZAZBtLttnDNLdc4ACfy1xrlnF24KoDPQ2M3uM5IvZBygCP0Ta3e5G7cEJ3OiO08yFUzE5H9jqvycCNEmY5Xht6AuTZAZB2xtAeQcbCANbUKZANmkOnu0DEHdd65Jg7RuL5c01OVbKRVUZAe6XYIkRn4SNFZC2fanlFvdMfdz0XKN6b5boSOHPDPNM7tqyvtRAZDZD`
- **ID Compte WhatsApp Business** : `2253133005182328`
- **ID Numéro** : `927016477160571`

## 📋 Étape 1: Configurer les Variables sur Vercel

### 1.1 Accéder aux Variables d'Environnement

1. Allez sur **https://vercel.com/dashboard**
2. Cliquez sur votre projet
3. **Settings** → **Environment Variables**

### 1.2 Ajouter/Modifier les Variables

Ajoutez ou modifiez ces variables **une par une** :

#### Variable 1: WHATSAPP_ACCESS_TOKEN
- **Key** : `WHATSAPP_ACCESS_TOKEN`
- **Value** : `EAAqwi435ZAxABQLd1BXw6StaNs8vTvFx8ZB0xZCDPBaiGbeZCZAATkKZAThNpQYdGb2bT2GafzuqCXZBjnNgtAaNkYAJ7UjtZAZBtLttnDNLdc4ACfy1xrlnF24KoDPQ2M3uM5IvZBygCP0Ta3e5G7cEJ3OiO08yFUzE5H9jqvycCNEmY5Xht6AuTZAZB2xtAeQcbCANbUKZANmkOnu0DEHdd65Jg7RuL5c01OVbKRVUZAe6XYIkRn4SNFZC2fanlFvdMfdz0XKN6b5boSOHPDPNM7tqyvtRAZDZD`
- **Environments** : ✅ Production, ✅ Preview, ✅ Development

#### Variable 2: WHATSAPP_PHONE_NUMBER_ID
- **Key** : `WHATSAPP_PHONE_NUMBER_ID`
- **Value** : `927016477160571`
- **Environments** : ✅ Production, ✅ Preview, ✅ Development

#### Variable 3: WHATSAPP_VERIFY_TOKEN
- **Key** : `WHATSAPP_VERIFY_TOKEN`
- **Value** : `sgdf_whatsapp_2024_secret`
- **Environments** : ✅ Production, ✅ Preview, ✅ Development

#### Variable 4: GEMINI_API_KEY (OBLIGATOIRE pour l'analyse IA)
- **Key** : `GEMINI_API_KEY`
- **Value** : Votre clé API Gemini (à obtenir sur https://aistudio.google.com/apikey)
- **Environments** : ✅ Production, ✅ Preview, ✅ Development

> ⚠️ **IMPORTANT** : Sans `GEMINI_API_KEY`, les images ne seront pas analysées automatiquement !

### 1.3 Redéployer

1. **Deployments** → Cliquez sur les **3 points** (⋯) du dernier déploiement
2. **Redeploy**
3. Attendez 2-3 minutes

## 🔗 Étape 2: Configurer le Webhook dans Meta Dashboard

### 2.1 Accéder aux Webhooks

1. Allez sur **https://developers.facebook.com/**
2. Sélectionnez votre app **Billz App**
3. Menu de gauche → **WhatsApp** → **Configuration** → **Webhooks**

### 2.2 Configurer le Webhook

1. Cliquez sur **"Edit"** ou **"Configure"**
2. Remplissez :
   - **Callback URL** : `https://votre-app.vercel.app/api/whatsapp`
     - ⚠️ Remplacez `votre-app.vercel.app` par votre vraie URL Vercel
   - **Verify token** : `sgdf_whatsapp_2024_secret`
3. Cliquez sur **"Verify and Save"**
   - ✅ Si ça fonctionne, vous verrez un message de succès
   - ❌ Si ça échoue, vérifiez que l'URL est correcte et que Vercel est déployé

### 2.3 S'abonner aux Événements

1. Dans la section **Webhooks**, cliquez sur **"Manage"**
2. Cochez :
   - ✅ **messages** (obligatoire)
   - ✅ **message_status** (optionnel)
3. Cliquez sur **"Save"**

## 🧪 Étape 3: Tester le Système Complet

### Test 1: Vérifier l'Endpoint

Ouvrez dans votre navigateur :
```
https://votre-app.vercel.app/api/whatsapp
```

Vous devriez voir :
```json
{
  "success": true,
  "expenses": [],
  "total": 0
}
```

### Test 2: Envoyer un Message Texte

1. **Envoyez un message texte** au numéro WhatsApp Business (`927016477160571`)
   - Exemple : "J'ai dépensé 25€ chez Carrefour pour le déjeuner"
2. **Attendez 5-10 secondes**
3. **Allez sur** : `https://votre-app.vercel.app/whatsapp`
4. **Vérifiez** que le message apparaît dans la liste
5. **Vérifiez** que les champs sont remplis automatiquement :
   - Montant : 25€
   - Marchand : Carrefour
   - Description : déjeuner

### Test 3: Envoyer une Photo de Ticket

1. **Prenez une photo d'un ticket de caisse** (ou utilisez une photo existante)
2. **Envoyez-la** au numéro WhatsApp Business avec une légende
   - Exemple : "Ticket Carrefour"
3. **Attendez 10-15 secondes** (temps d'analyse par Gemini)
4. **Allez sur** : `https://votre-app.vercel.app/whatsapp`
5. **Vérifiez** que :
   - La photo apparaît dans la liste
   - Les champs sont remplis automatiquement :
     - Montant
     - Marchand
     - Description
     - Catégorie
   - La confiance est affichée (ex: 95%)

### Test 4: Vérifier les Logs Vercel

1. Vercel Dashboard → **Deployments** → Votre déploiement
2. **Functions** → **View Function Logs**
3. Cherchez les logs avec `[WhatsApp]` ou `[API]`
4. Vérifiez qu'il n'y a pas d'erreurs

## 🔍 Dépannage

### Les messages n'apparaissent pas

**Vérifications :**
1. ✅ Webhook configuré dans Meta Dashboard
2. ✅ Événements "messages" abonnés
3. ✅ Variables d'environnement correctes sur Vercel
4. ✅ Application redéployée après modification des variables
5. ✅ URL du webhook correcte dans Meta

**Solution :**
- Vérifiez les logs Vercel pour voir les erreurs
- Testez l'endpoint `/api/whatsapp` directement

### Les images ne sont pas analysées

**Vérifications :**
1. ✅ `GEMINI_API_KEY` configurée sur Vercel
2. ✅ Clé API Gemini valide
3. ✅ Application redéployée

**Solution :**
- Obtenez une clé API Gemini : https://aistudio.google.com/apikey
- Ajoutez-la comme variable `GEMINI_API_KEY` sur Vercel
- Redéployez

### Les champs ne sont pas remplis automatiquement

**Causes possibles :**
- L'analyse Gemini n'a pas fonctionné
- Le message ne contient pas assez d'informations
- La clé API Gemini n'est pas configurée

**Solution :**
- Vérifiez les logs Vercel pour voir les erreurs Gemini
- Vérifiez que `GEMINI_API_KEY` est bien configurée
- Testez avec une photo de ticket claire et lisible

## ✅ Checklist Finale

- [ ] `WHATSAPP_ACCESS_TOKEN` configuré sur Vercel
- [ ] `WHATSAPP_PHONE_NUMBER_ID` configuré sur Vercel
- [ ] `WHATSAPP_VERIFY_TOKEN` configuré sur Vercel
- [ ] `GEMINI_API_KEY` configuré sur Vercel (OBLIGATOIRE)
- [ ] Application redéployée sur Vercel
- [ ] Webhook configuré dans Meta Dashboard
- [ ] Callback URL correcte dans Meta
- [ ] Verify token identique sur Vercel et Meta
- [ ] Événements "messages" abonnés dans Meta
- [ ] Test message texte réussi
- [ ] Test photo avec analyse réussi
- [ ] Champs remplis automatiquement

## 🎉 C'est Prêt !

Une fois toutes ces étapes complétées, votre système WhatsApp est opérationnel :

1. ✅ **Réception automatique** des messages WhatsApp
2. ✅ **Analyse IA** des photos avec Gemini
3. ✅ **Remplissage automatique** des champs
4. ✅ **Affichage** sur la page Billz WhatsApp

**Pour tester :**
- Envoyez un message ou une photo au numéro WhatsApp Business
- Le message apparaîtra automatiquement sur `https://votre-app.vercel.app/whatsapp`
- Les champs seront remplis automatiquement grâce à Gemini

