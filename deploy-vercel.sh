#!/bin/bash

echo "🚀 Script de déploiement automatique Vercel - SGDF Notes de Frais"
echo "================================================================="

# Vérifier si on est dans le bon dossier
if [ ! -f "package.json" ]; then
    echo "❌ Erreur: Exécutez ce script depuis le dossier sgdf-notes-de-frais"
    exit 1
fi

# Vérifier l'authentification Vercel
echo "🔐 Vérification de l'authentification Vercel..."
if ! vercel whoami > /dev/null 2>&1; then
    echo "❌ Vous n'êtes pas connecté à Vercel."
    echo "🔑 Connectez-vous avec: vercel login"
    echo "📖 Suivez le guide: cat VERCEL_DEPLOYMENT_GUIDE.md"
    exit 1
fi

echo "✅ Authentification Vercel OK"

# Build local pour vérifier
echo "🏗️  Test du build local..."
if ! npm run build; then
    echo "❌ Erreur de build local. Corrigez les erreurs avant de déployer."
    exit 1
fi

echo "✅ Build local réussi"

# Première fois : configurer le projet
echo "🔧 Configuration du projet Vercel..."
if [ ! -f ".vercel/project.json" ]; then
    echo "📦 Première configuration du projet..."
    vercel --yes --prod
else
    echo "📈 Mise à jour du projet existant..."
    vercel --prod
fi

echo ""
echo "🎉 Déploiement terminé !"
echo ""
echo "📋 Prochaines étapes :"
echo "1. 🔗 Ouvrir l'URL fournie par Vercel"
echo "2. ⚙️  Configurer les variables d'environnement dans le dashboard Vercel"
echo "3. 🧪 Tester l'application déployée"
echo "4. 🔐 Configurer Clerk avec la vraie URL de production"
echo ""
echo "📖 Guide complet : VERCEL_DEPLOYMENT_GUIDE.md"