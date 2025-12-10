# 🆓 Configuration WhatsApp Gratuit (Pour Concours)

## Solution 100% Gratuite

Cette solution utilise **whatsapp-web.js** qui est **100% gratuit** et fonctionne avec WhatsApp Web. Parfait pour un concours!

## 🚀 Démarrage Rapide

### 1. Installer les dépendances (déjà fait)
```bash
npm install
```

### 2. Démarrer l'application Next.js
```bash
npm run dev
```

### 3. Dans un autre terminal, démarrer le bot WhatsApp
```bash
npm run whatsapp-bot
```

### 4. Scanner le QR Code
1. Le QR code s'affichera dans le terminal
2. Ouvrez WhatsApp sur votre téléphone
3. Menu → **Appareils liés** → **Lier un appareil**
4. Scannez le QR code affiché dans le terminal

### 5. Tester!
Envoyez une photo de ticket sur WhatsApp au numéro connecté. La dépense sera automatiquement traitée!

## 📱 Comment ça fonctionne

1. **Vous envoyez une photo de ticket** sur WhatsApp
2. **Le bot reçoit le message** automatiquement
3. **L'image est téléchargée** et convertie en base64
4. **Gemini analyse l'image** et extrait les données
5. **La dépense apparaît** sur `/whatsapp`
6. **Vous pouvez l'importer** dans le formulaire principal

## ⚙️ Configuration

### Variables d'environnement (optionnel)
Créez un fichier `.env.local`:
```env
# URL de votre API (par défaut: http://localhost:3000)
API_URL=http://localhost:3000
```

## 🎯 Utilisation

### Envoyer une dépense
1. Ouvrez WhatsApp
2. Envoyez une **photo de ticket** au numéro connecté
3. Optionnel: Ajoutez un message comme "dépense restaurant"

### Voir les dépenses
1. Allez sur `http://localhost:3000/whatsapp`
2. Les dépenses apparaissent automatiquement
3. Cliquez sur **"Importer dans le formulaire"** pour remplir le formulaire

## 🔧 Dépannage

### Le bot ne se connecte pas
- Vérifiez que WhatsApp Web n'est pas déjà connecté ailleurs
- Supprimez le dossier `.wwebjs_auth` et réessayez
- Assurez-vous que le port 3000 est libre

### Les messages ne sont pas traités
- Vérifiez que l'application Next.js est démarrée (`npm run dev`)
- Vérifiez les logs du bot pour voir les erreurs
- Assurez-vous que Gemini API est configurée (`.env.local`)

### Le QR code ne s'affiche pas
- Vérifiez que `qrcode-terminal` est installé
- Essayez de redémarrer le bot

## 📝 Notes importantes

- **100% gratuit** - Aucun coût, fonctionne avec WhatsApp Web
- **Parfait pour concours** - Pas besoin d'API payante
- **Fonctionne en local** - Idéal pour démo
- **Sécurisé** - Les données restent sur votre machine

## 🎉 Pour la démo du concours

1. Démarrez l'app: `npm run dev`
2. Démarrez le bot: `npm run whatsapp-bot` (dans un autre terminal)
3. Scannez le QR code avec votre téléphone
4. Envoyez une photo de ticket
5. Montrez que ça fonctionne! 🚀

