# 🎨 Instructions pour ajouter le logo Billz

## ✅ Modifications effectuées

J'ai mis à jour tous les fichiers pour utiliser le nouveau logo "B" stylisé :
- ✅ `src/app/page.tsx` - Header de la page principale
- ✅ `src/app/layout.tsx` - Favicon et icônes
- ✅ `public/manifest.json` - Icônes PWA
- ✅ `public/sw.js` - Service Worker (cache)

## 📋 Action requise : Ajouter l'image du logo

### Étape 1: Préparer l'image

1. **Nom du fichier** : `billz-logo.png` (ou `billz-logo.svg` si c'est un SVG)
2. **Taille recommandée** : 
   - Minimum : 512x512 pixels (pour les icônes PWA)
   - Format : PNG avec transparence (ou SVG)
   - Fond transparent de préférence

### Étape 2: Placer l'image

1. Copiez votre image du logo "B"
2. Collez-la dans le dossier `public/`
3. Renommez-la en `billz-logo.png` (ou gardez l'extension si c'est un SVG)

**Chemin final** : `public/billz-logo.png`

### Étape 3: Vérifier

1. Redémarrez le serveur : `npm run dev`
2. Allez sur `http://localhost:3000`
3. Le logo devrait apparaître dans le header à la place de l'emoji 💰

## 🔄 Si vous utilisez un SVG

Si votre logo est un fichier SVG (`billz-logo.svg`), modifiez les références :

1. Dans `src/app/page.tsx`, changez :
   ```tsx
   src="/billz-logo.png"
   ```
   en :
   ```tsx
   src="/billz-logo.svg"
   ```

2. Dans `src/app/layout.tsx`, changez :
   ```tsx
   href="/billz-logo.png"
   ```
   en :
   ```tsx
   href="/billz-logo.svg"
   ```

3. Dans `public/manifest.json`, changez :
   ```json
   "src": "/billz-logo.png"
   ```
   en :
   ```json
   "src": "/billz-logo.svg",
   "type": "image/svg+xml"
   ```

## 📱 Où le logo apparaît

Le logo apparaîtra dans :
- ✅ **Header de la page principale** (à la place de l'emoji 💰)
- ✅ **Onglet du navigateur** (favicon)
- ✅ **Écran d'accueil mobile** (icône PWA)
- ✅ **Barre de recherche mobile** (icône de l'app)

## 🆘 Dépannage

### Le logo ne s'affiche pas

1. Vérifiez que le fichier est bien dans `public/billz-logo.png`
2. Vérifiez le nom du fichier (sensible à la casse)
3. Videz le cache du navigateur (Ctrl+Shift+R)
4. Vérifiez la console du navigateur pour les erreurs 404

### Le logo est trop grand/petit

Modifiez la taille dans `src/app/page.tsx` :
```tsx
<div className="w-10 h-10 ...">  // Changez w-10 h-10 pour w-12 h-12 (plus grand) ou w-8 h-8 (plus petit)
```

### Format d'image non supporté

Assurez-vous que l'image est en :
- PNG (recommandé)
- SVG (pour les logos vectoriels)
- JPG (moins recommandé, pas de transparence)

## ✅ C'est prêt !

Une fois l'image placée dans `public/billz-logo.png`, le logo apparaîtra automatiquement partout dans l'application ! 🎉

