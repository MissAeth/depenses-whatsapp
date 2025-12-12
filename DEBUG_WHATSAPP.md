# 🐛 Debug WhatsApp Bot

## Vérifier que tout fonctionne

### 1. Vérifier que le bot est connecté
Dans le terminal où tourne `npm run whatsapp-bot`, vous devriez voir:
```
✅ Bot WhatsApp connecté et prêt!
✅ Envoyez une photo de ticket pour traitement automatique
```

### 2. Vérifier que l'API Next.js fonctionne
Dans le terminal où tourne `npm run dev`, vous devriez voir:
```
✓ Ready in Xms
```

### 3. Envoyer un message de test
1. Envoyez-vous une photo de ticket sur WhatsApp
2. Regardez les logs du bot - vous devriez voir:
   ```
   📨 Message reçu de [votre numéro]
      Texte: (aucun) ou votre message
      Média: Oui
      Détecté comme dépense: OUI ✅
   📥 Téléchargement de l'image...
   ✅ Image téléchargée
   🤖 Envoi à l'API pour traitement avec Gemini...
   ```

### 4. Vérifier les logs de l'API
Dans les logs de `npm run dev`, vous devriez voir:
```
📱 Webhook WhatsApp reçu
📋 Données reçues: ...
💰 Message de dépense détecté, traitement...
🖼️ Traitement image WhatsApp...
🤖 Traitement image avec Gemini...
✅ Données extraites par Gemini: ...
```

### 5. Vérifier dans l'application
Allez sur `http://localhost:3000/whatsapp` et vérifiez que la dépense apparaît.

## Problèmes courants

### Le bot ne reçoit pas les messages
- Vérifiez que le QR code a bien été scanné
- Vérifiez que vous voyez "✅ Bot WhatsApp connecté et prêt!"
- Essayez de redémarrer le bot

### Les messages ne sont pas détectés comme dépenses
- Le message doit contenir une image OU un des mots-clés: dépense, ticket, facture, €, restaurant, taxi
- Vérifiez les logs: "Détecté comme dépense: OUI ✅" ou "NON ❌"

### L'API ne reçoit pas les données
- Vérifiez que l'URL de l'API est correcte (par défaut: http://localhost:3000)
- Vérifiez les logs du bot pour voir les erreurs
- Vérifiez que Next.js est bien démarré

### Gemini ne traite pas l'image
- Vérifiez que GEMINI_API_KEY est configurée dans .env.local
- Vérifiez les logs pour voir les erreurs Gemini
- Testez avec `/api/test-ai` pour vérifier la configuration


