# 🚀 Configuration Gemini - Guide Express

## 🎯 Objectif
Intégrer l'IA Google Gemini pour une extraction de données **GRATUITE** et plus précise que l'OCR.

## ⚡ Configuration Rapide (2 minutes)

### Étape 1 : Obtenir une clé API Gemini
1. Allez sur : **https://aistudio.google.com/app/apikey**
2. Connectez-vous avec votre compte Google
3. Cliquez sur **"Create API Key"**
4. Copiez la clé (commence par `AIza...`)

### Étape 2 : Configurer sur Vercel
```bash
cd sgdf-notes-de-frais
echo "VOTRE_CLE_ICI" | vercel env add GEMINI_API_KEY production
```

### Étape 3 : Redéployer
```bash
vercel --prod
```

## ✅ Vérification
Après déploiement, testez avec une image de ticket :
- Vous verrez **"🧠 IA Vision (Gemini)"** au lieu d'OCR
- Extraction plus précise du montant et du marchand
- Confiance élevée (80-95%)

## 🆓 Avantages Gemini
- **GRATUIT** jusqu'à 60 requêtes/minute  
- **Précision supérieure** à l'OCR classique
- **Compréhension du contexte** des tickets
- **Support multilingue** français/anglais

## 🔄 Ordre de Priorité (Auto)
1. **Gemini Vision** ⭐ (si clé configurée)
2. **OpenAI Vision** (si clé configurée) 
3. **OCR Tesseract** (fallback gratuit)

## 🌟 Résultat Attendu
**Avant (OCR)** : "Br 2" → Montant: 0€ → Confiance: 30%
**Après (Gemini)** : "Brasserie du Port" → Montant: 23.50€ → Confiance: 95%