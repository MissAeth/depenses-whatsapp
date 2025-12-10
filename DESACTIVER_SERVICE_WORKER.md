# 🔧 Désactiver le Service Worker (si problème de page hors ligne)

Si vous voyez toujours la page "Mode Hors Ligne" alors que le serveur tourne, c'est que le service worker est trop agressif.

## 🚀 Solution rapide : Désactiver le Service Worker

### Méthode 1 : Via les outils développeur (Recommandé)

1. **Ouvrez les outils développeur** : Appuyez sur **F12**
2. Allez dans l'onglet **"Application"** (ou **"Storage"**)
3. Dans le menu de gauche, cliquez sur **"Service Workers"**
4. Vous verrez le service worker actif
5. Cliquez sur **"Unregister"** ou **"Désinscrire"**
6. **Actualisez la page** (Ctrl+Shift+R)

### Méthode 2 : Vider le cache

1. **Ouvrez les outils développeur** : **F12**
2. **Clic droit** sur le bouton d'actualisation (🔄)
3. Choisissez **"Vider le cache et actualiser en force"** (ou **"Empty Cache and Hard Reload"**)

### Méthode 3 : Mode navigation privée

Ouvrez `http://localhost:3000` dans une **fenêtre de navigation privée** (Ctrl+Shift+N) pour éviter le service worker.

## 🔄 Réactiver le Service Worker plus tard

Une fois que tout fonctionne, vous pouvez réactiver le service worker en actualisant simplement la page. Il se réinscrira automatiquement.

## ✅ Vérification

Après avoir désactivé le service worker, vous devriez voir :
- ✅ La page principale avec le logo Billz
- ✅ Pas de redirection vers `/offline`
- ✅ Toutes les fonctionnalités disponibles

