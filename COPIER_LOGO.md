# 📋 Comment copier le logo Billz dans le projet

## 📍 Où placer l'image

L'image doit être placée dans le dossier **`public`** à la racine du projet.

**Chemin complet** : `C:\Users\User\Downloads\depense-whatsapp-code par Vanessa\public\billz-logo.png`

## 📝 Étapes à suivre

### Option 1: Copier-coller manuel (Recommandé)

1. **Ouvrez l'Explorateur de fichiers Windows**
2. **Naviguez vers** : `C:\Users\User\Downloads\depense-whatsapp-code par Vanessa\public`
3. **Copiez votre image du logo "B"**
4. **Collez-la dans le dossier `public`**
5. **Renommez-la en** : `billz-logo.png`
   - Si c'est un SVG, renommez en `billz-logo.svg`

### Option 2: Via PowerShell

Si vous connaissez le chemin exact de votre image, exécutez :

```powershell
Copy-Item "CHEMIN_VERS_VOTRE_IMAGE\votre-logo.png" -Destination "public\billz-logo.png"
```

## ✅ Vérification

Une fois l'image copiée, vérifiez qu'elle existe :

```powershell
Test-Path "public\billz-logo.png"
```

Si ça retourne `True`, c'est bon ! ✅

## 🔄 Redémarrer le serveur

Après avoir copié l'image :

1. **Arrêtez le serveur** (Ctrl+C dans le terminal)
2. **Redémarrez** : `npm run dev`
3. **Actualisez la page** dans le navigateur (Ctrl+Shift+R pour vider le cache)

## 🆘 Si ça ne fonctionne toujours pas

### Vérifier le nom du fichier

Le nom doit être **exactement** : `billz-logo.png` (ou `.svg`)

- ✅ `billz-logo.png` - Correct
- ❌ `Billz-logo.png` - Incorrect (majuscule)
- ❌ `billz_logo.png` - Incorrect (underscore)
- ❌ `logo-billz.png` - Incorrect (ordre inversé)

### Vérifier l'emplacement

Le fichier doit être directement dans `public/`, pas dans un sous-dossier :

- ✅ `public/billz-logo.png` - Correct
- ❌ `public/images/billz-logo.png` - Incorrect
- ❌ `public/logos/billz-logo.png` - Incorrect

### Vérifier le format

- ✅ PNG avec transparence - Recommandé
- ✅ SVG - Fonctionne aussi
- ⚠️ JPG - Fonctionne mais pas de transparence

### Vider le cache du navigateur

1. Appuyez sur **Ctrl+Shift+R** (ou Cmd+Shift+R sur Mac)
2. Ou ouvrez les outils développeur (F12) → Onglet Network → Cochez "Disable cache"

## 📞 Besoin d'aide ?

Si vous avez l'image mais ne savez pas où elle est, dites-moi :
- Le nom exact du fichier
- Où vous pensez qu'il se trouve

Je pourrai vous aider à le trouver et le copier au bon endroit !

