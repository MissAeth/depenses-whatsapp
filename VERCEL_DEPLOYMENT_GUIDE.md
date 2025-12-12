# 🚀 Guide de Déploiement Vercel - SGDF Notes de Frais

## 📋 Prérequis

### 1. Compte Vercel
- Créer un compte sur [vercel.com](https://vercel.com)
- Lier votre compte GitHub

### 2. Configuration Clerk (Authentification)
- Créer un projet sur [clerk.com](https://clerk.com)
- Récupérer les clés `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` et `CLERK_SECRET_KEY`
- Configurer les URLs de redirection dans Clerk Dashboard

### 3. Configuration Email (Optionnel pour démarrer)
- Configurer un compte SMTP (Gmail, SendGrid, etc.)
- Ou désactiver temporairement l'envoi d'emails

## 🛠️ Étapes de Déploiement

### Étape 1 : Authentification Vercel
```bash
cd sgdf-notes-de-frais
vercel login
# Suivre le lien affiché pour s'authentifier
```

### Étape 2 : Configuration du projet
```bash
vercel
# Répondre aux questions :
# - Link to existing project? No
# - Project name: sgdf-notes-de-frais
# - Directory: ./
# - Override settings? No
```

### Étape 3 : Configuration des variables d'environnement
Dans le dashboard Vercel, ajouter ces variables :

#### Variables Obligatoires :
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
TREASURY_EMAIL=tresorerie@sgdf.fr
NEXT_PUBLIC_BASE_URL=https://votre-app.vercel.app
```

#### Variables Optionnelles (pour plus tard) :
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASSWORD=votre-mot-de-passe-app
OLLAMA_API_URL=https://votre-ollama-instance.com
```

### Étape 4 : Déploiement
```bash
vercel --prod
```

## 🚨 Points d'Attention

### 1. IA Ollama
- **Problème** : Ollama fonctionne en local, pas sur Vercel
- **Solutions** :
  1. **Temporaire** : Désactiver l'IA, utiliser seulement OCR
  2. **Recommandé** : Héberger Ollama sur un VPS séparé
  3. **Alternative** : Utiliser OpenAI API (payant)

### 2. Base de Données
- Actuellement : Pas de persistance
- **À faire** : Intégrer une base de données cloud (Supabase, PlanetScale)

### 3. WhatsApp Business API
- Nécessite une configuration Meta Developers
- Webhook URL : `https://votre-app.vercel.app/api/whatsapp`

## 🔧 Configuration Post-Déploiement

### 1. Tester l'application
- Vérifier que l'interface fonctionne
- Tester l'upload d'images
- Vérifier les formulaires

### 2. Configurer le domaine personnalisé (optionnel)
- Dans Vercel Dashboard > Domains
- Ajouter votre domaine SGDF

### 3. Monitoring
- Activer Vercel Analytics
- Configurer les alertes d'erreur

## 📱 Configuration WhatsApp (Plus tard)

### 1. Meta Developers
- Créer une app WhatsApp Business
- Configurer le webhook : `https://votre-app.vercel.app/api/whatsapp`

### 2. Tests
- Utiliser le numéro de test WhatsApp
- Envoyer des messages avec images

## 🚀 Commandes Rapides

```bash
# Déploiement rapide
cd sgdf-notes-de-frais
vercel --prod

# Voir les logs
vercel logs

# Variables d'environnement
vercel env add VARIABLE_NAME
vercel env ls

# Preview deployment
vercel
```

## 🎯 État Actuel du Projet

### ✅ Prêt pour le déploiement :
- Interface Next.js complète
- PhotoCapture fonctionnel
- ExpenseForm avec validation
- API routes configurées
- Build optimisé

### 🔄 À configurer après déploiement :
- Authentification Clerk réelle
- IA cloud (Ollama hébergé ou OpenAI)
- Base de données persistante
- WhatsApp Business API

### 📊 Fonctionnalités disponibles immédiatement :
- Upload et analyse d'images (OCR Tesseract)
- Formulaire de saisie de dépenses
- Interface responsive
- Exportation basique

## 🆘 Dépannage

### Build fail
```bash
npm run build  # Tester localement
vercel logs    # Voir les erreurs Vercel
```

### Variables d'environnement
```bash
vercel env ls  # Lister les variables
vercel env add VAR_NAME  # Ajouter une variable
```

### Rollback
```bash
vercel rollback  # Revenir à la version précédente
```

---

**Prochaine étape** : Une fois authentifié, exécuter `vercel` dans le dossier du projet.