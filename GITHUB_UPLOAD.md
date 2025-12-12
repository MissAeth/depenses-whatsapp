# 📤 Upload sur GitHub - 2 Méthodes

## Méthode 1: Upload Direct (Plus Simple)

### 1. Archive créée
Le fichier `depense-whatsapp-code.zip` contient tout votre code.

### 2. Upload sur GitHub
1. **Allez sur** : https://github.com/vanessaaloui-ux/depense-whatsapp
2. **Cliquez "uploading an existing file"** ou **"Add file" > "Upload files"**
3. **Glissez-déposez** le fichier `depense-whatsapp-code.zip`
4. **Commit** : "Initial commit - Application dépenses WhatsApp"
5. **Commit changes**

## Méthode 2: GitHub CLI (Si vous avez gh installé)

```bash
# Installer GitHub CLI
brew install gh  # macOS
# ou télécharger depuis cli.github.com

# Login
gh auth login

# Push
git push origin main
```

## Méthode 3: Token Personnel

### 1. Créer un token
- GitHub → Settings → Developer settings → Personal access tokens
- Generate new token (classic)
- Cochez "repo" permissions

### 2. Utiliser le token
```bash
git remote set-url origin https://YOUR_TOKEN@github.com/vanessaaloui-ux/depense-whatsapp.git
git push origin main
```

## APRÈS UPLOAD → DÉPLOIEMENT IMMÉDIAT

### 1. Vercel
- vercel.com → Import Git Repository
- Sélectionnez votre repo "depense-whatsapp"
- Deploy automatique !

### 2. Votre webhook sera
`https://depense-whatsapp.vercel.app/api/whatsapp`

## 🎉 PRÊT POUR PRODUCTION !