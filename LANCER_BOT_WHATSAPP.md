# 📱 Comment lancer le bot WhatsApp

## Méthode 1 : Nouveau terminal (Recommandé)

1. **Ouvrez un nouveau terminal PowerShell**
   - Appuyez sur `Windows + X` puis choisissez "Terminal" ou "PowerShell"
   - OU ouvrez PowerShell depuis le menu Démarrer

2. **Allez dans le dossier du projet**
   ```powershell
   cd "C:\Users\User\Downloads\depense-whatsapp-code par Vanessa"
   ```

3. **Lancez le bot**
   ```powershell
   npm run whatsapp-bot
   ```

4. **Scannez le QR code**
   - Le QR code s'affichera dans le terminal
   - Ouvrez WhatsApp sur votre téléphone
   - Menu (⋮) → **Appareils liés** → **Lier un appareil**
   - Scannez le QR code

## Méthode 2 : Depuis ce terminal

Si vous voulez lancer depuis ici, dites-moi et je le ferai. Mais le QR code s'affichera dans ce terminal.

## Vérifier que ça fonctionne

Une fois connecté, vous devriez voir :
```
✅ Bot WhatsApp connecté et prêt!
✅ Envoyez une photo de ticket pour traitement automatique
```

## Arrêter le bot

Appuyez sur `Ctrl + C` dans le terminal du bot.

## Redémarrer le bot

1. Arrêtez avec `Ctrl + C`
2. Relancez avec `npm run whatsapp-bot`


