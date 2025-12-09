# Guide d'utilisation en local

## 🚀 Démarrer l'application

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:3000`

## 📱 Interface utilisateur

### Page d'accueil (`/`)

L'interface moderne comprend :

1. **Header avec navigation**
   - Logo et titre de l'application
   - Indicateur de statut en ligne/hors ligne
   - Bouton pour accéder à la page WhatsApp
   - Avatar utilisateur (mode démo)

2. **Section de capture photo**
   - Bouton "Prendre photo" (appareil photo)
   - Bouton "Importer fichier" (galerie/fichiers)
   - Optimisation automatique des images

3. **Formulaire de dépense**
   - Apparaît après la capture d'une image
   - Traitement automatique par IA (OCR + extraction)
   - Champs : Type, Date, Catégorie, Montant, Description
   - Validation en temps réel

4. **Section d'aide**
   - Informations sur l'IA automatique
   - Informations sur WhatsApp

### Page WhatsApp (`/whatsapp`)

1. **Simulateur WhatsApp**
   - Zone de test pour simuler des messages
   - Exemples de messages prêts à tester
   - Résultats en temps réel

2. **Liste des dépenses**
   - Affichage des dépenses reçues via WhatsApp
   - Détails : montant, marchand, catégorie, confiance
   - Message original et expéditeur

## 🎨 Caractéristiques UI/UX

### Design moderne
- **Gradients** : Utilisation de dégradés subtils pour les boutons et icônes
- **Ombres** : Ombres douces pour la profondeur
- **Bordures arrondies** : Coins arrondis (rounded-xl, rounded-2xl)
- **Espacement** : Espacement généreux pour la lisibilité

### Animations
- **Fade-in** : Apparition en fondu des éléments
- **Slide-up** : Animation de glissement vers le haut
- **Scale-in** : Animation d'agrandissement
- **Hover effects** : Effets au survol (scale, shadow)

### Responsive
- Design adaptatif pour mobile et desktop
- Grilles flexibles (grid-cols-1 md:grid-cols-2)
- Navigation optimisée pour tous les écrans

### Accessibilité
- Labels clairs pour tous les champs
- Indicateurs visuels pour les champs obligatoires (*)
- Messages d'erreur explicites
- Focus states pour la navigation au clavier

## 🧪 Tester les fonctionnalités

### 1. Capture de photo
- Cliquez sur "Prendre photo" ou "Importer fichier"
- Sélectionnez une image de facture/ticket
- L'IA traitera automatiquement l'image

### 2. Formulaire de dépense
- Vérifiez les données extraites par l'IA
- Complétez/modifiez les champs si nécessaire
- Soumettez le formulaire

### 3. Simulateur WhatsApp
- Allez sur `/whatsapp`
- Utilisez le simulateur pour tester des messages
- Vérifiez les dépenses reçues dans la liste

## 📝 Notes

- **Mode démo** : L'application fonctionne en mode démo (sans authentification Clerk)
- **Email de test** : `demo@example.com`
- **Branche par défaut** : "Groupe"
- **Hors ligne** : L'application détecte automatiquement le statut de connexion

## 🛠️ Commandes utiles

```bash
# Démarrer le serveur de développement
npm run dev

# Vérifier les erreurs de linting
npm run lint

# Construire pour la production
npm run build

# Démarrer le serveur de production
npm start
```

## 🎯 Prochaines étapes

Pour utiliser l'application en production :
1. Configurer Clerk pour l'authentification
2. Configurer les variables d'environnement (email SMTP, etc.)
3. Déployer sur Vercel ou votre plateforme préférée

---

**Interface créée avec ❤️ pour une expérience utilisateur optimale**

