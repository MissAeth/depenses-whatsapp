# ⚡ Configuration rapide de l'IA (5 minutes)

## Le problème actuel

Actuellement, l'application utilise l'OCR classique (Tesseract.js) qui n'est pas très précis :
- ❌ Montant souvent non détecté
- ❌ Nom du restaurant mal lu ("Br 2" au lieu du vrai nom)
- ✅ Catégorie détectée (mais pas toujours)

## Solution : Configurer une vraie IA

### Option 1 : Google Gemini (GRATUIT et RAPIDE) ⭐ Recommandé

1. **Allez sur** : https://aistudio.google.com/app/apikey
2. **Cliquez sur** "Create API Key"
3. **Copiez la clé** (commence par `AIza...`)

4. **Ajoutez dans `.env.local`** (pour test local) :
   ```bash
   GEMINI_API_KEY=AIza-votre-cle-ici
   ```

5. **Ou sur Vercel** (pour production) :
   - Projet → Settings → Environment Variables
   - Ajoutez : `GEMINI_API_KEY` = votre clé

6. **Redémarrez le serveur** :
   ```bash
   # Arrêtez avec Ctrl+C puis
   npm run dev
   ```

✅ **C'est tout !** L'IA sera utilisée automatiquement.

### Option 2 : OpenAI (Payant mais très précis)

1. **Allez sur** : https://platform.openai.com/api-keys
2. **Créez un compte** et ajoutez des crédits ($5 minimum)
3. **Créez une clé API** (commence par `sk-...`)

4. **Ajoutez dans `.env.local`** :
   ```bash
   OPENAI_API_KEY=sk-votre-cle-ici
   OPENAI_MODEL=gpt-4o-mini  # Optionnel
   ```

5. **Redémarrez le serveur**

## Vérification

Après configuration, quand vous uploadez une image :
- ✅ Vous verrez "✨ IA Vision (GPT-4/Gemini)" au lieu de "📖 OCR classique"
- ✅ Le montant sera correctement détecté
- ✅ Le nom du restaurant sera correct
- ✅ La confiance sera plus élevée (90%+)

## Coûts

- **Google Gemini** : **GRATUIT** jusqu'à 60 requêtes/minute
- **OpenAI** : ~$0.01-0.02 par image (très économique)

## Besoin d'aide ?

Voir le guide complet : `CONFIGURATION_IA.md`


