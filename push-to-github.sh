#!/bin/bash

echo "🚀 Push SmartExpense vers GitHub"
echo "=================================="

# Vérifier qu'on est dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo "❌ Erreur: Exécutez ce script depuis le dossier sgdf-notes-de-frais/"
    exit 1
fi

echo "📋 Statut Git actuel:"
git status --short

echo ""
echo "📤 Push en cours..."

# Push du code principal
echo "1️⃣ Push branch main..."
git push origin main

if [ $? -eq 0 ]; then
    echo "✅ Branch main pushée avec succès!"
else
    echo "❌ Erreur push main - Vérifiez votre authentification GitHub"
    exit 1
fi

# Push des tags
echo "2️⃣ Push des tags..."
git push origin --tags

if [ $? -eq 0 ]; then
    echo "✅ Tags pushés avec succès!"
else
    echo "⚠️ Erreur push tags (non critique)"
fi

echo ""
echo "🎉 SmartExpense pushé sur GitHub avec succès!"
echo "🌐 URL: https://github.com/vanessaaloui-ux/depense-whatsapp"
echo ""
echo "📋 Prochaines étapes:"
echo "1. Allez sur GitHub.com → votre repo"
echo "2. Settings → Collaborators → Add people"
echo "3. Invitez vos collaborateurs!"
echo ""
echo "🎯 34+ commits avec toutes les fonctionnalités sont maintenant sur GitHub!"