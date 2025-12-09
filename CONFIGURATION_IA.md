# 🤖 Configuration de l'IA Vision

L'application supporte maintenant l'utilisation d'une vraie IA pour analyser les tickets de caisse. Deux options sont disponibles :

## Options disponibles

### 1. OpenAI GPT-4 Vision (Recommandé)
- **Précision** : Très élevée
- **Vitesse** : Rapide
- **Coût** : ~$0.01-0.02 par image (gpt-4o-mini)
- **Modèle recommandé** : `gpt-4o-mini` (économique) ou `gpt-4o` (plus précis)

### 2. Google Gemini Vision
- **Précision** : Élevée
- **Vitesse** : Rapide
- **Coût** : Gratuit jusqu'à 60 requêtes/minute
- **Modèle recommandé** : `gemini-1.5-flash` (rapide) ou `gemini-1.5-pro` (plus précis)

### 3. OCR classique (Tesseract.js)
- **Précision** : Moyenne
- **Vitesse** : Lente
- **Coût** : Gratuit
- **Utilisé automatiquement** si aucune API d'IA n'est configurée

## Configuration

### Option 1 : OpenAI GPT-4 Vision

1. **Créer un compte OpenAI**
   - Allez sur [https://platform.openai.com/signup](https://platform.openai.com/signup)
   - Créez un compte et ajoutez des crédits

2. **Obtenir une clé API**
   - Allez sur [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
   - Cliquez sur "Create new secret key"
   - Copiez la clé (commence par `sk-...`)

3. **Configurer les variables d'environnement**

   **En local (`.env.local`) :**
   ```bash
   OPENAI_API_KEY=sk-votre-cle-api-ici
   OPENAI_MODEL=gpt-4o-mini  # Optionnel, par défaut: gpt-4o-mini
   ```

   **Sur Vercel :**
   - Allez dans votre projet → Settings → Environment Variables
   - Ajoutez :
     - `OPENAI_API_KEY` = votre clé API
     - `OPENAI_MODEL` = `gpt-4o-mini` (optionnel)

### Option 2 : Google Gemini Vision

1. **Créer un compte Google Cloud**
   - Allez sur [https://console.cloud.google.com/](https://console.cloud.google.com/)
   - Créez un projet (ou utilisez un existant)

2. **Activer l'API Gemini**
   - Allez dans "APIs & Services" → "Library"
   - Cherchez "Generative Language API"
   - Cliquez sur "Enable"

3. **Obtenir une clé API**
   - Allez dans "APIs & Services" → "Credentials"
   - Cliquez sur "Create Credentials" → "API Key"
   - Copiez la clé

4. **Configurer les variables d'environnement**

   **En local (`.env.local`) :**
   ```bash
   GEMINI_API_KEY=votre-cle-api-ici
   GEMINI_MODEL=gemini-1.5-flash  # Optionnel, par défaut: gemini-1.5-flash
   ```

   **Sur Vercel :**
   - Allez dans votre projet → Settings → Environment Variables
   - Ajoutez :
     - `GEMINI_API_KEY` = votre clé API
     - `GEMINI_MODEL` = `gemini-1.5-flash` (optionnel)

## Priorité d'utilisation

L'application utilise les APIs dans cet ordre :
1. **OpenAI** (si `OPENAI_API_KEY` est configuré)
2. **Gemini** (si `GEMINI_API_KEY` est configuré et OpenAI n'est pas disponible)
3. **OCR classique** (Tesseract.js) si aucune API n'est configurée

## Avantages de l'IA Vision

✅ **Précision supérieure** : L'IA comprend le contexte et la structure des tickets
✅ **Extraction intelligente** : Détecte automatiquement le montant, le restaurant, la date
✅ **Catégorisation automatique** : Classe intelligemment les dépenses
✅ **Gestion des erreurs OCR** : Comprend même si l'OCR fait des erreurs
✅ **Support multi-langues** : Fonctionne avec différents formats de tickets

## Coûts estimés

### OpenAI GPT-4o-mini
- **Par image** : ~$0.01-0.02
- **100 images/mois** : ~$1-2
- **1000 images/mois** : ~$10-20

### Google Gemini 1.5 Flash
- **Gratuit** jusqu'à 60 requêtes/minute
- **Au-delà** : Tarifs très bas

## Test de la configuration

1. **Vérifier que l'IA est configurée**
   - Uploadez une image de ticket
   - Regardez la console du navigateur
   - Vous devriez voir : `✅ Données extraites par IA Vision`

2. **Si l'OCR classique est utilisé**
   - Vérifiez que les variables d'environnement sont bien configurées
   - Redémarrez le serveur après avoir ajouté les variables
   - Vérifiez les logs pour voir quelle méthode est utilisée

## Dépannage

### "Aucune clé API d'IA configurée"
- Vérifiez que vous avez bien ajouté `OPENAI_API_KEY` ou `GEMINI_API_KEY`
- Redémarrez le serveur après avoir ajouté les variables
- Vérifiez qu'il n'y a pas d'espaces dans la clé API

### "Erreur API OpenAI/Gemini"
- Vérifiez que votre clé API est valide
- Vérifiez que vous avez des crédits (OpenAI) ou que l'API est activée (Gemini)
- Vérifiez les logs pour plus de détails

### L'OCR classique est toujours utilisé
- Vérifiez que les variables d'environnement sont bien définies
- Sur Vercel, assurez-vous d'avoir redéployé après avoir ajouté les variables
- Vérifiez que vous n'avez pas de typo dans les noms des variables

## Recommandation

Pour une utilisation en production, nous recommandons :
- **OpenAI GPT-4o-mini** : Meilleur rapport qualité/prix
- **Google Gemini 1.5 Flash** : Si vous voulez rester gratuit

L'OCR classique reste disponible comme fallback gratuit si aucune API n'est configurée.

