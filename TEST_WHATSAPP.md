# 🧪 Test WhatsApp Bot - Guide de Debug

## Vérifications étape par étape

### 1. Vérifier que le bot est connecté
Dans le terminal du bot, vous devriez voir:
```
✅ Bot WhatsApp connecté et prêt!
📱 Informations de connexion:
   Nom: [Votre nom]
   Numéro: [Votre numéro]
```

### 2. Vérifier que les messages sont reçus
Quand vous envoyez un message, vous devriez voir dans le terminal:
```
📨 Message reçu:
   De: [numéro]
   Type: image ou text
   Texte: [texte ou (aucun)]
   Média: Oui ou Non
   Groupe: Non
   Statut: Non
   FromMe: Oui ou Non
```

### 3. Problèmes courants

#### Le bot ne reçoit AUCUN message
- **Cause**: Le QR code n'a pas été scanné correctement
- **Solution**: 
  1. Arrêtez le bot (Ctrl+C)
  2. Supprimez le dossier `.wwebjs_auth`
  3. Redémarrez le bot
  4. Scannez le QR code à nouveau

#### Les messages sont reçus mais pas détectés comme dépenses
- **Cause**: Le message ne contient pas de média ni de mots-clés
- **Solution**: Envoyez une **photo** (pas juste du texte) OU ajoutez un mot-clé comme "ticket", "dépense", "€"

#### Les messages sont détectés mais l'API ne répond pas
- **Cause**: Next.js n'est pas démarré ou tourne sur un autre port
- **Solution**: 
  1. Vérifiez que `npm run dev` tourne
  2. Vérifiez le port (3000 ou 3001)
  3. Si port 3001, créez `.env.local` avec `API_URL=http://localhost:3001`

#### L'image ne se télécharge pas
- **Cause**: Problème de connexion ou format d'image
- **Solution**: Vérifiez les logs pour voir l'erreur exacte

### 4. Test manuel de l'API
Pour tester si l'API fonctionne sans WhatsApp:
```bash
curl -X POST http://localhost:3000/api/whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "from": "test",
    "text": "test dépense",
    "imageBase64": "data:image/jpeg;base64,..."
  }'
```

### 5. Vérifier les logs Next.js
Dans le terminal de `npm run dev`, vous devriez voir:
```
📱 Webhook WhatsApp reçu
📋 Données reçues: ...
💰 Message de dépense détecté, traitement...
```

## Messages de debug à chercher

✅ **Bon signe**: "📨 Message reçu", "✅ Image téléchargée", "✅ Dépense traitée avec succès!"
❌ **Mauvais signe**: "⏭️ Ignoré", "❌ Erreur", "Pas de réponse de l'API"


